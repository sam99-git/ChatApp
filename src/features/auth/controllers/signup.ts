
import { authQueue } from './../../../shared/services/queues/auth.queue';
import { UserCache } from './../../../shared/services/redis/user.cache';
import { IUserDocument } from './../../user/interfaces/user.interface';
import { authService } from '../../../shared/services/db/auth.service';
import HTTP_STATUS  from 'http-status-codes';
import {ObjectId} from 'mongodb';
import { Request , Response } from 'express';
import { joiValidation } from '../../../shared/globals/decorators/joi-validation.decorators'
import { signupSchema } from '../schemes/signup';
import { IAuthDocument, ISignUpData } from '../interfaces/auth.interface';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '../../../shared/globals/helpers/cloudinary-upload';
import { BadRequestError } from '../../../shared/globals/helpers/error-handler';
import { Helpers } from '../../../shared/globals/helpers/helpers';
import { omit } from 'lodash';
import { userQueue } from './../../../shared/services/queues/user.queue';
import JWT from 'jsonwebtoken';
import { config } from './../../../config';
import { data } from 'jquery';

const userCache : UserCache = new UserCache();

export class SignUp {
	@joiValidation(signupSchema)
	public async create(req: Request , res: Response ): Promise<void> {
		console.log("Request Body:" , req.body);
		const { username, email, password, avatarColor, avatarImage } = req.body;
		const checkIfUserExist : IAuthDocument = await authService.getUserByUsernameOrEmail(username , email);
		if (checkIfUserExist){
			throw new BadRequestError('User Already Exists');
		}
		const authObjectId: ObjectId = new ObjectId();
		const userObjectId : ObjectId = new ObjectId();
		const uId = `${Helpers.generateRandomIntegers(12)}`;
		const authData : IAuthDocument = SignUp.prototype.signupData({
			_id: authObjectId,
			uId,
			username,
			email ,
			password,
			avatarColor,
		});
		const result: UploadApiResponse= await uploads(avatarImage , `${userObjectId}`, true , true ) as UploadApiResponse;
		if (!result?.public_id){
			throw new BadRequestError('File upload : Error occurred. Please try again');
		}
		//Add to redis cache

		const userDataForCache: IUserDocument = SignUp.prototype.userData(authData , userObjectId);
		userDataForCache.profilePicture = `https://res.cloudinary.com/dw66ipdcx/image/upload/v${result.version}/${userObjectId}`;
		await userCache.saveUserToCache(`${userObjectId}` , uId , userDataForCache)

		//Add to Database

		omit(userDataForCache , ['uId', 'username' ,'email' ,'password' ,'avatarColor']);
		authQueue.addAuthUserJob('addAuthUserToDb' , {value: userDataForCache});
		userQueue.addUserJob('addUserToDB', {value: userDataForCache} );

		const userJwt : string = SignUp.prototype.signToken(authData , userObjectId);
		req.session= {jwt : userJwt};


		res.status(HTTP_STATUS.CREATED).json({message : 'User created successfully' , user: userDataForCache , token : userJwt});
	}


	private signToken(data : IAuthDocument , userObjectId : ObjectId) : string{
		return JWT.sign(
		{
			userId : userObjectId,
			uId: data.uId,
			email: data.email,
			username: data.username,
			avatarColor: data.avatarColor
		},
		config.JWT_TOKEN!
		);
	}

	private signupData(data: ISignUpData): IAuthDocument{
		const { _id , username , email , password , uId , avatarColor } = data;
		return {
			_id,
			uId,
			username : Helpers.firstLetterUpperCase(username),
			email : Helpers.lowerCase(email),
			password,
			avatarColor,
			createdAt : new Date()
		} as unknown as IAuthDocument;
	}

	private userData(data : IAuthDocument, userObjectId: object): IUserDocument{
		const { _id , username , email , password , uId , avatarColor} = data;
		return{
			_id : userObjectId,
			authId: _id,
			uId,
			username: Helpers.firstLetterUpperCase(username),
			email,
			password,
			avatarColor,
			profilePicture: '',
			blocked:[],
			blockedBy: [],
			work : '',
			location: '',
			school: '',
			quote: '',
			bgImageId:'',
			bgImageVersion:'',
			followersCount:0,
			followingCount:0,
			postsCount:0,
			notifications:{
				messages:true,
				reactions:true,
				comments:true,
				follows:true
			},
			socia:{
				facebook:'',
				instagram:'',
				twitter:'',
				youtube:''
			}
		}as unknown as IUserDocument;
	}
}
