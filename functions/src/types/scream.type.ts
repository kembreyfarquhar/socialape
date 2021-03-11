// eslint-disable-next-line no-unused-vars
import { ScreamComment } from './comment.type';

export type Scream = {
	id?: string;
	screamId?: string;
	body: string;
	userHandle: string;
	userImage: string;
	createdAt: string;
	commentCount?: number;
	likeCount?: number;
};

export type ScreamData = {
	body?: string;
	userHandle?: string;
	createdAt?: string;
	commentCount?: number;
	likeCount?: number;
	screamId?: string;
	comments?: ScreamComment[];
};
