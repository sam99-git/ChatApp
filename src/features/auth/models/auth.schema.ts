import { IAuthDocument } from "../interfaces/auth.interface";
import { model , Model , Schema } from 'mongoose';
import { hash , compare } from 'bcryptjs';

const SALT_ROUND = 10;

const authSchema : Schema = new Schema(
	{
		username: { type: String},
		uId: { type: String},
		email : { type: String},
		password: { type: String},
		avatorColor: { type: String},
		createdAt:{ type: String , default: Date.now() }
	},
	{
		toJSON:{
			transform(_doc ,ret){
				delete ret.password;
				return ret;
			}
		}
	}
);

authSchema.pre('save' , async function (this: IAuthDocument ,next :()=> void) {
	const hashPassword: string = await hash(this.password as string , SALT_ROUND);
	this.password = hashPassword;
	next();
});

authSchema.methods.comparePassword =async function(password: string): Promise <boolean> {
	const hashedPassword : string =(this as unknown as IAuthDocument).password!;
	return compare(password, hashedPassword);
};

authSchema.methods.hashPassword = async function (password : string): Promise <string> {
	return hash(password , SALT_ROUND);
};

const AuthModel : Model<IAuthDocument> =  model<IAuthDocument>( 'Auth' , authSchema , 'Auth');
export { AuthModel };
