// eslint-disable-next-line no-unused-vars
import { ScreamLike } from './like.type';

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
	credentials: User;
	likes?: ScreamLike[];
};
