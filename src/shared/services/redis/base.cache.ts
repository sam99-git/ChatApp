import { createClient } from 'redis';
import Logger from 'bunyan';
import {config} from '../../../config';

export type ResdisClient = ReturnType<typeof createClient>;

export abstract class BaseCache{
	client: ResdisClient;
	log : Logger;

	constructor( cacheName :  string){
		this.client = createClient({url : config.REDIS_HOST});
		this.log = config.createLogger(cacheName);
		this.cacheError();

	}

	private cacheError(): void {
		this.client.on('error', ( error : unknown)=> {
			this.log.error(error);
		});
	}
}
