// eslint-disable-next-line no-unused-vars
import { ScreamLike } from './like';
// eslint-disable-next-line no-unused-vars
import { NotificationData } from './notification';
// eslint-disable-next-line no-unused-vars
import { Scream } from './scream';
// eslint-disable-next-line no-unused-vars
import { CopyWithPartial } from './typeUtil';

interface User {
	userId: string;
	email: string;
	password: string;
	confirmPassword: string;
	createdAt: string;
	handle: string;
	imageUrl: string;
	bio: string;
	website: string;
	location: string;
}

// USER DATA THAT IS STORED IN THE DB
export type DBUser = CopyWithPartial<
	User,
	'bio' | 'website' | 'location' | 'password' | 'confirmPassword'
>;

// USER DATA IT TAKES TO REGISTER NEW USER
export type UserRegister = Pick<
	User,
	'email' | 'handle' | 'createdAt' | 'password' | 'confirmPassword'
>;

// USER INFO TO INSERT INTO USERS TABLE UPON REGISTRATION
export type UserToInsert = Pick<User, 'userId' | 'email' | 'handle' | 'createdAt' | 'imageUrl'>;

// USER DATA FOR LOGIN
export type UserLogin = Pick<User, 'email' | 'password'>;

// EXTRA USER DETAILS THAT CAN BE ADDED/UPDATED
export type UserDetails = Pick<User, 'bio' | 'location' | 'website'>;

// USER DATA TO SEND BACK, NO CREDENTIALS REQUIRED
export type UserData = {
	user: DBUser;
	screams: Scream[] | [];
};

// USER DATA TO SEND BACK TO AN AUTHENTICATED USER
export type AuthenticatedUserData = {
	credentials: DBUser;
	likes: ScreamLike[] | [];
	notifications: NotificationData[] | [];
};
