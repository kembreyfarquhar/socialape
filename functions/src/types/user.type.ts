interface User {
	email: string;
	password?: string;
	confirmPassword?: string;
	handle: string;
	imageUrl?: string;
	bio?: string;
	website?: string;
	location?: string;
}

interface UserDetails {
	bio?: string;
	website?: string;
	location?: string;
}

interface UserData {
	credentials?: FirebaseFirestore.DocumentData | undefined;
	likes?: FirebaseFirestore.DocumentData[];
}
