import { userWorker} from '../../../shared/workers/user.worker'
import { BaseQueue } from "./base.queue";

class UserQueue extends BaseQueue{
	constructor(){
		super('user');
		this.proccessJob('addUserToDB', 5 , userWorker.addUserToDB);
	}

	public addUserJob(name:string , data: any): void{
		this.addJob(name, data);
	}
}

export const userQueue : UserQueue = new UserQueue();
