import authRoute from './routes';
import express, { Express} from 'express';
import { ChattyServer } from './setupServer';
import databaseconnection from './setupDatabase';
import {config} from './config';

class Application{
    public initialize(): void{
        this.loadConfig();
        databaseconnection();
        const app : Express = express();
        const server: ChattyServer = new ChattyServer(app);
				authRoute(app);
        server.start();
    }
    private loadConfig(): void{
        config.validateConfig();
				config.cloudinaryConfig();
    }
}


const application : Application = new Application();
application.initialize();
