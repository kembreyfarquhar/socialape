// eslint-disable-next-line no-unused-vars
import { ScreamComment } from './comment.type';

export type Scream = {
	body: string;
	userHandle: string;
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
