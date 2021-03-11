export type UserNotification = {
	recipient: string;
	sender: string;
	read: boolean;
	screamId: string;
	type: string;
	createdAt: string;
	notificationId?: string;
};
