// eslint-disable-next-line no-unused-vars
import { CopyWithPartial } from './typeUtil';

interface UserNotification {
	recipient: string;
	sender: string;
	read: boolean;
	screamId: string;
	type: string;
	createdAt: string;
	notificationId: string;
}

// NOTIFICATION TYPE IN THE DB
export type DBNotification = Omit<UserNotification, 'notificationId'>;

// NOTIFICATION DATA USED WHEN SENDING BACK DATA
export type NotificationData = CopyWithPartial<UserNotification, 'notificationId'>;
