// eslint-disable-next-line no-unused-vars
import { admin } from '../app';

declare global {
	namespace Express {
		export interface Request {
			user: admin.auth.DecodedIdToken;
			rawBody: any;
		}
	}
}
