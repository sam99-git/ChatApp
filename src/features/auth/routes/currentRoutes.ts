import { authMiddelware } from './../../../shared/globals/helpers/auth.middleware';
import { CurrentUser } from './../controllers/current-user';
import express , { Router}  from "express";



class CurrentRoutes{
	private router : Router;

	constructor(){
		this.router = express.Router();
		this.router.use(express.json());
	}


	public routes():Router{
		this.router.use(express.json());
		this.router.post('/currentuser', authMiddelware.checkAuthentication, CurrentUser.prototype.read);

		return this.router;
	}

};

export const currentUserRoutes : CurrentRoutes = new CurrentRoutes();
