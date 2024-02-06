import { authMiddelware } from './shared/globals/helpers/auth.middleware';
import { currentUserRoutes } from './features/auth/routes/currentRoutes';
import { Application } from "express";
import { authRoutes } from "./features/auth/routes/authRoutes";
import { serverAdapter } from "./shared/services/queues/base.queue";

const BASE_PATH = '/api/v1';

export default (app: Application) =>{
    const routes =() => {
			app.use('/queues', serverAdapter.getRouter());
			app.use(BASE_PATH , authRoutes.routes());
			app.use(BASE_PATH , authRoutes.signoutRoute());
			app.use(BASE_PATH , authMiddelware.verifyUser,  currentUserRoutes.routes());
		};

    routes();
}
