// eslint-disable-next-line no-unused-vars
import { admin } from '../app';
// eslint-disable-next-line no-unused-vars
import { ScreamComment } from './comment.type';
// eslint-disable-next-line no-unused-vars
import { Scream } from './scream.type';
// eslint-disable-next-line no-unused-vars
import { User, UserDetails } from './user.type';

declare global {
	namespace Express {
		export interface Request {
			user: admin.auth.DecodedIdToken;
			rawBody: any;
			userDetails: UserDetails;
			comment: ScreamComment;
			scream: Scream;
			screamDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>;
			newUser: User;
		}
	}
}
