// eslint-disable-next-line no-unused-vars
import { ScreamLike } from './like.type';
// eslint-disable-next-line no-unused-vars
import { UserNotification } from './notification.type';
// eslint-disable-next-line no-unused-vars
import { Scream } from './scream.type';

export type User = {
	email: string;
	createdAt?: string;
	password?: string;
	confirmPassword?: string;
	handle: string;
	imageUrl?: string;
	bio?: string;
	website?: string;
	location?: string;
};

export type UserDetails = {
	bio?: string;
	website?: string;
	location?: string;
};

export type UserData = {
	user: User;
	screams?: Scream[];
};

export type AuthenticatedUserData = {
	credentials: User;
	likes?: ScreamLike[];
	notifications?: UserNotification[];
};
