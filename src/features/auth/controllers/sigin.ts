
import HTTP_STATUS  from 'http-status-codes';
import { config } from './../../../config';
import  JWT  from 'jsonwebtoken';
import { Request , Response  } from "express";
import { loginSchema } from "../schemes/signin";
import { joiValidation } from '../../../shared/globals/decorators/joi-validation.decorators';
import { IAuthDocument } from "../interfaces/auth.interface";
import { authService } from "../../../shared/services/db/auth.service";
import { BadRequestError } from "../../../shared/globals/helpers/error-handler";
import { IUserDocument } from '../../../features/user/interfaces/user.interface';
import { userService } from '../../../shared/services/db/user.service';

export class SignIn {
	@joiValidation(loginSchema)
	public async read(req: Request, res: Response): Promise<void> {
		//console.log('Request Body', req.body);
		const { username , password } = req.body; //|| {};

		const exsistingUser : IAuthDocument = await authService.getAuthuserByUsername(username);
		if (!exsistingUser){
			throw new BadRequestError('Invalid username or password')
		}

		const passwordmatch : boolean= await exsistingUser.comparePassword(password);
		if (!passwordmatch){
			throw new BadRequestError('Invalid password');
		}

		const user : IUserDocument = await userService.getUserByAuthId(`${exsistingUser.id}`);

		const userJwt : string = JWT.sign(
			{
				userId : user?._id,
				uId: exsistingUser?.uId,
				email: exsistingUser?.email,
				username: exsistingUser?.username,
				avatarColor: exsistingUser?.avatarColor
			},
			config.JWT_TOKEN!
		);
		req.session={jwt : userJwt};

		const userDocumnet : IUserDocument = {
			...user,
			authId : exsistingUser?._id,
			username : exsistingUser?.username,
			email : exsistingUser?.email,
			avatarColor : exsistingUser?.avatarColor,
			uId : exsistingUser?.uId,
			createdAt: exsistingUser?.createdAt
		} as IUserDocument;

		res.status(HTTP_STATUS.OK).json({message: 'User login successfull' , user: userDocumnet , token : userJwt });
	}
}
