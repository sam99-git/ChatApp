import { AuthPayload } from './../../../features/auth/interfaces/auth.interface';
import { Request, Response , NextFunction} from 'express';
import  JWT from 'jsonwebtoken';
import { config } from './../../../config';
import { NotAuthorizedError } from './error-handler';

export class AuthMiddleware{
	public verifyUser(req: Request, _res: Response , next: NextFunction): void{
		if (!req.session?.jwt){
			throw new NotAuthorizedError('Token is not available . Please login again');

		}
		try{
			const payload : AuthPayload = JWT.verify(req.session?.jwt , config.JWT_TOKEN!) as AuthPayload;
			req.currentUser = payload;
		}catch(error){
			throw new NotAuthorizedError('Token is not available . Please login again');
		}
		next();
	}

	public checkAuthentication(req: Request, _res: Response , next: NextFunction):void{
		if (!req.currentUser){
			throw new NotAuthorizedError('Authentication is required ')
		}
		next();
	}
}

export const authMiddelware: AuthMiddleware = new AuthMiddleware();
