import { IUserDocument } from 'src/features/user/interfaces/user.interface';
import { ServerError } from './../../globals/helpers/error-handler';
import { config } from './../../../config';
import { BaseCache } from "./base.cache";
import Logger from "bunyan";
import { Helpers } from './../../globals/helpers/helpers';


const log : Logger = config.createLogger('userCache');

export class UserCache extends BaseCache {
	constructor(){
		super('userCache');
	}

	public async saveUserToCache(key : string , userUId: string , createdUser : IUserDocument) : Promise<void> {
		const createdAt = new Date();
		const {
			_id,
			uId,
			username,
			email,
			avatarColor,
			blocked,
			blockedBy,
			postsCount,
			profilePicture,
			followersCount,
			followingCount,
			notifications,
			work,
			location,
			school,
			quote,
			bgImageId,
			bgImageVersion,
			social
		} = createdUser;

		const dataToSave= {
			'_id':`${_id}`,
			'uId': `${uId}`,
			'username': `${username}`,
			'email': `${email}`,
			'avatarColor':`${avatarColor}`,
			'createdAt' : `${createdAt}`,
			'postsCount': `${postsCount}`,
			'blocked': JSON.stringify(blocked),
			'blockedBy': JSON.stringify(blockedBy),
			'profilePicture': `${profilePicture}`,
			'followersCount': `${followersCount}`,
			'followingCount': `${followingCount}`,
			'notifications': JSON.stringify(notifications),
			'social': JSON.stringify(social),
			'work': `${work}`,
			'location': `${location}`,
			'school': `${school}`,
			'quote': `${quote}`,
			'bgImageId': `${bgImageId}`,
			'bgImageVersion': `${bgImageVersion}`
		};

		try {
			if (!this.client.isOpen){
				await this.client.connect();
			}
			await this.client.ZADD('user', {score : parseInt(userUId, 10),  value: `${key}`});
			for(const [itemkey, itemvalue] of Object.entries(dataToSave)){
				await this.client.HSET(`users:${key}`, `${itemkey}`, `${itemvalue}` )
			}
		}catch (error) {
			log.error(`Failed to save user data for key: ${key}, user ID: ${userUId}`, error);
      throw new ServerError(`Server error. Failed to save user data for key: ${key}`);
		}
	}

	public async getuserFromCache(userId : string): Promise<IUserDocument |null > {
		try {
			if (!this.client.isOpen){
				await this.client.connect();
			}
			const response : IUserDocument= await this.client.HGETALL(`users:${userId}`) as unknown as IUserDocument;
			response.createdAt = new Date(Helpers.parseJson(`${response.createdAt}`));
			response.postsCount = Helpers.parseJson(`${response.postsCount}`);
			response.blocked = Helpers.parseJson(`${response.blocked}`);
			response.blockedBy = Helpers.parseJson(`${response.blockedBy}`);
			response.notifications = Helpers.parseJson(`${response.notifications}`);
			response.social = Helpers.parseJson(`${response.social}`);
			response.followersCount = Helpers.parseJson(`${response.followersCount}`);
			response.followingCount = Helpers.parseJson(`${response.followingCount}`);

			return response;
		} catch (error) {
			log.error(error);
      throw new ServerError(`Server error. try again`);
		}
	}
}


export const userCache: UserCache = new UserCache();
