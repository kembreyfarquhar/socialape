interface Scream {
	body: string;
	userHandle: string;
	createdAt: string;
	commentCount?: number;
	likeCount?: number;
}

interface ScreamData {
	body?: string;
	userHandle?: string;
	createdAt?: string;
	commentCount?: number;
	likeCount?: number;
	screamId?: string;
	comments?: FirebaseFirestore.DocumentData[];
}
