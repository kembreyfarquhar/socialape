// eslint-disable-next-line no-unused-vars
import { admin } from '../app';
// eslint-disable-next-line no-unused-vars
import { ScreamComment } from './comment';
// eslint-disable-next-line no-unused-vars
import { DBScream } from './scream';
// eslint-disable-next-line no-unused-vars
import { UserDetails, UserLogin, UserRegister } from './user';

declare global {
	namespace Express {
		export interface Request {
			user: admin.auth.DecodedIdToken;
			rawBody: any;
			userDetails: UserDetails;
			comment: ScreamComment;
			scream: DBScream;
			screamDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>;
			newUser: UserRegister;
			userLogin: UserLogin;
		}
	}
}
