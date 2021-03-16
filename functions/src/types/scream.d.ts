// eslint-disable-next-line no-unused-vars
import { ScreamComment } from './comment';

export interface Scream {
	screamId: string;
	id: string;
	body: string;
	userHandle: string;
	userImage: string;
	createdAt: string;
	commentCount: number;
	likeCount: number;
	comments: ScreamComment[];
}

// SCREAM DATA THAT IS STORED IN THE DB
export type DBScream = Omit<Scream, 'screamId' | 'id' | 'comments'>;

// SCREAM DATA TO SEND BACK WHEN GETTING ALL SCREAMS
export type ScreamObject = Omit<Scream, 'screamId' | 'comments'>;

export type ScreamData = Pick<Scream, 'body' | 'userHandle' | 'createdAt'>;
