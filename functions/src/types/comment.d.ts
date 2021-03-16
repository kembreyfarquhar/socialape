// eslint-disable-next-line no-unused-vars
import { Scream } from './scream';

export interface ScreamComment {
	userHandle: string;
	screamId: string;
	body: string;
	createdAt: string;
	userImage: string;
}

// DATA FROM SCREAM TO INCLUDE
export type ScreamCommentData = Pick<
	Scream,
	'userHandle' | 'body' | 'createdAt' | 'screamId' | 'comments'
>;
