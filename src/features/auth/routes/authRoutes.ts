import { SignIn } from '../controllers/sigin';
import express , { Router}  from "express";
import { SignUp } from "../controllers/signup";
import { SignOut } from '../controllers/signout';


class AuthRoutes{
	private router : Router;

	constructor(){
		this.router = express.Router();
		this.router.use(express.json());
	}

	public routes(): Router{
		this.router.use(express.json());
		this.router.post('/signup' , SignUp.prototype.create);
		this.router.post('/signin', SignIn.prototype.read);
		return this.router;
	}

	public signoutRoute():Router{
		this.router.use(express.json());
		this.router.post('/signout', SignOut.prototype.update);

		return this.router;
	}

};

export const authRoutes : AuthRoutes = new AuthRoutes();
