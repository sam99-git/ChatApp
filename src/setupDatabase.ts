import mongoose from "mongoose";
import {config} from "./config";
import Logger from "bunyan";

const log: Logger = config.createLogger('database');


export default()=>{
    const connect = ()=>{
        mongoose.connect(`${config.DATABASE_URL}`)
        .then(()=>{
            log.info("Successfully connected to database");
        })
        .catch((error)=>{
            log.error("Failed to connect to database", error);
        });
    };
    connect();
    
    mongoose.connection.on("disconnect", connect);
}
