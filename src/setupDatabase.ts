import mongoose from "mongoose";
import {config} from "./config";
import Logger from "bunyan";
import { redisConnection } from "./shared/services/redis/redis.connection";

const log: Logger = config.createLogger('database');


export default()=>{
    const connect = ()=>{
        mongoose.connect(`${config.DATABASE_URL}`)
        .then(()=>{
            log.info("Successfully connected to database");
						redisConnection.connect();

        })
        .catch((error)=>{
            log.error("Failed to connect to database", error);
						return process.exit(1);
        });
    };
    connect();

    mongoose.connection.on("disconnect", connect);
}
