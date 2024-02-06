import HTTP_STATUS  from 'http-status-codes';
import { IUserDocument } from 'src/features/user/interfaces/user.interface';
import { Request , Response } from "express";
import { UserCache, userCache } from "./../../../shared/services/redis/user.cache";
import { userService } from './../../../shared/services/db/user.service';


export class CurrentUser{
	public async read(req : Request, res : Response): Promise<void> {
		let isUser = false;
		let token = null;
		let user = null;

		const cachedUser: IUserDocument = await userCache.getuserFromCache(`${req.currentUser!.userId}`) as IUserDocument;
		const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(`${req.currentUser!.userId}`);
		if (Object.keys(existingUser).length){
			isUser = true;
			token = req.session?.jwt;
			user = existingUser
		}
		res.status(HTTP_STATUS.OK).json({token , isUser , user});
	}
}
