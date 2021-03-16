// IMPORT EXTERNAL PACKAGES
import * as express from 'express';
import * as BusBoy from 'busboy';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// IMPORT NEEDED VARIABLES FROM WITHIN REPO
import {
	db,
	admin,
	firebaseConfig,
	likesCollection,
	screamCollection,
	notificationCollection,
} from '../app';
import { UserErrors } from '../errorService/user.error';
import { ApiError } from '../errorService/apiError';

// IMPORT MIDDLEWARE
import { authorization } from '../middleware/authorization.middleware';
import { validateUserDetails } from '../middleware/users.middleware';

// IMPORT TYPES, DISABLE ESLINT TO AVOID ERRORS
// eslint-disable-next-line no-unused-vars
import { AuthenticatedUserData, DBUser, UserData } from '../types/user';
// eslint-disable-next-line no-unused-vars
import { ScreamLike } from '../types/like';
// eslint-disable-next-line no-unused-vars
import { Scream } from '../types/scream';
// eslint-disable-next-line no-unused-vars
import { UserNotification } from '../types/notification';

const usersRouter = express.Router();

//                                  |*| GET ANY USER |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
usersRouter.get('/handle/:handle', async (req, res, next) => {
	try {
		const { handle } = req.params;
		// GET USER DOCUMENT AND CHECK IF IT EXISTS
		const userDoc = await db.doc(`/users/${handle}`).get();
		if (!userDoc.exists) {
			const error = UserErrors.USER_DOESNT_EXIST;
			next(new ApiError(error.code, error.message, error.type));
		} else {
			// TYPE CAST DOCUMENT DATA AS DBUSER
			const user = userDoc.data() as DBUser;
			// GET SCREAM DOCUMENTS ASSOCIATED WITH USER AND ORDER THEM BY CREATION
			const screamDocs = await db
				.collection(screamCollection)
				.where('userHandle', '==', handle)
				.orderBy('createdAt', 'desc')
				.get();
			// CREATE EMPTY ARRAY TO HOLD SCREAM DOC DATA
			const screams: Scream[] = [];
			screamDocs.forEach(screamDoc => {
				// TYPE CAST SCREAM DOCUMENT DATA AS SCREAM
				const screamData = screamDoc.data() as Scream;
				// PUSH DATA ALONG WITH SCREAMID INTO SCREAMS ARRAY
				screams.push({
					...screamData,
					screamId: screamDoc.id,
				});
			});
			// CREATE USERDATA OBJECT WITH USER AND SCREAMS
			const userData: UserData = { user, screams };
			res.json(userData);
		}
	} catch (err) {
		next(err);
	}
});

//                             |*| GET AUTHENTICATED USER |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
usersRouter.get('/logged-in-user', authorization, async (req, res, next) => {
	try {
		const handle = req.user.handle;
		// GET USER DOCUMENT AND CHECK IF IT EXISTS
		const userDoc = await db.doc(`/users/${handle}`).get();
		if (!userDoc.exists) {
			const error = UserErrors.USER_DOESNT_EXIST;
			next(new ApiError(error.code, error.message, error.type));
		} else {
			// TYPE CAST USER DOCUMENT DATA AS USER
			const credentials = userDoc.data() as DBUser;
			// GET LIKE DOCUMENTS ASSOCIATED WITH USER
			const likeDocs = await db.collection(likesCollection).where('userHandle', '==', handle).get();
			// GET NOTIFICATION DOCUMENTS WHERE USER IS RECIPIENT AND ORDER THEM BY CREATION
			const notificationDocs = await db
				.collection(notificationCollection)
				.where('recipient', '==', handle)
				.orderBy('createdAt', 'desc')
				.limit(10)
				.get();
			// CREATE EMPTY ARRAY TO HOLD LIKE DOCUMENT DATA
			const likes: ScreamLike[] = [];
			likeDocs.forEach(likeDoc => {
				// TYPE CAST LIKE DATA AS SCREAMLIKE
				const likeData = likeDoc.data() as ScreamLike;
				likes.push(likeData);
			});
			// CREATE EMPTY ARRAY TO HOLD NOTIFICATION DATA
			const notifications: UserNotification[] = [];
			notificationDocs.forEach(notificationDoc => {
				// TYPE CAST NOTIFICATION DATA AS USER NOTIFICATION
				const notificationData = notificationDoc.data() as UserNotification;
				notifications.push({ ...notificationData, notificationId: notificationDoc.id });
			});
			// CREATE AUTHENTICATED USER DATA OBJECT THAT FITS AUTHENTICATEDUSERDATA TYPE
			const authenticatedUserData: AuthenticatedUserData = { credentials, likes, notifications };
			// SEND DATA TO CLIENT
			res.json(authenticatedUserData);
		}
	} catch (err) {
		next(err);
	}
});

//                                |*| POST PROFILE IMAGE |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
usersRouter.post('/image', authorization, async (req, res, next) => {
	const contentType = req.headers['content-type'];
	// IF CONTENT TYPE HEADER IS INCORRECT, SEND ERROR
	if (!contentType || (contentType && !contentType.includes('multipart/form-data'))) {
		const error = UserErrors.INCORRECT_CONTENT_TYPE;
		next(new ApiError(error.code, error.message, error.type));
	}
	// CREATE A NEW BUSBOY INSTANCE WITH HEADERS AND LIMITS
	const busboy = new BusBoy({ headers: req.headers, limits: { fileSize: 1024 * 1024 } });

	// INITIALIZE NEEDED VARIABLES
	let imageFileName: string = '';
	const imageToBeUploaded: Record<string, any> = {};
	// STRING FOR IMAGE TOKEN
	const generatedToken = uuidv4();

	try {
		// CREATE NEW PATH TO IMAGE
		busboy.on('file', async (_fieldname, file, filename, _encoding, mimetype) => {
			try {
				// VALIDATE THAT IT IS OF IMAGE TYPE JPEG OR PNG
				if (mimetype !== 'image/png' && mimetype !== 'image/jpeg') {
					const error = UserErrors.WRONG_FILE_TYPE;
					next(new ApiError(error.code, error.message, error.type));
					return;
				}

				// my.image.png => ['my', 'image', 'png']
				const imageExtension = filename.split('.')[filename.split('.').length - 1];
				// 32756238461724837.png
				imageFileName = `${Math.round(Math.random() * 1000000000000).toString()}.${imageExtension}`;
				const filepath = path.join(os.tmpdir(), imageFileName);
				imageToBeUploaded.filepath = filepath;
				imageToBeUploaded.mimetype = mimetype;
				file.pipe(fs.createWriteStream(filepath));

				// IF FILE IS TOO LARGE, UNLINK AND SEND ERROR
				file.on('limit', () => {
					fs.unlink(filepath, () => {
						imageFileName = '';
						const error = UserErrors.IMAGE_TOO_LARGE;
						next(new ApiError(error.code, error.message, error.type));
						return;
					});
				});
			} catch (err) {
				next(err);
			}
		});

		// STORE NEW IMAGE IN USER'S IMAGEURL FIELD
		busboy.on('finish', async () => {
			try {
				if (!imageFileName.length) return;
				await admin
					.storage()
					.bucket()
					.upload(imageToBeUploaded.filepath, {
						resumable: false,
						metadata: {
							metadata: {
								contentType: imageToBeUploaded.mimetype,
								firebaseStorageDownloadTokens: generatedToken,
							},
						},
					});
				// GENERATE IMAGE URL USING CONFIG STORAGE BUCKET, GENERATED IMAGE FILE NAME, & GENERATED TOKEN
				const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media&token=${generatedToken}`;
				// ADD IMAGE URL TO USER COLLECTION
				await db.doc(`/users/${req.user.handle}`).update({ imageUrl });
				res.json({ message: 'Image uploaded' });
			} catch (err) {
				next(err);
			}
		});
	} catch (err) {
		next(err);
	}
	// END
	busboy.end(req.rawBody);
});

//                                |*| UPDATE USER DETAILS |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
usersRouter.put('/details', authorization, validateUserDetails, async (req, res, next) => {
	try {
		const userDetails = req.userDetails;
		// SEND USERDETAILS TO UPDATE USER DOCUMENT
		await db.doc(`/users/${req.user.handle}`).update(userDetails);
		res.json({ message: 'User details updated' });
	} catch (err) {
		next(err);
	}
});

//                          |*| MARK NOTIFICATIONS READ |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
usersRouter.put('/mark-notifications-read', authorization, async (req, res, next) => {
	try {
		let batch = db.batch();
		// GRAB UNREAD NOTIFICATION DOCUMENTS FOR USER
		const notificationDocs = await db
			.collection(notificationCollection)
			.where('recipient', '==', req.user.handle)
			.where('read', '==', false)
			.get();

		// IF NO UNREAD NOTIFIFACTIONS, STOP REQUEST HERE, SEND BACK MESSAGE
		if (notificationDocs.empty) {
			res.json({ message: 'All notifications already read.' });
		} else {
			// LOOP THROUGH THEM, GRAB THE ID, UPDATE EACH FIELD TO BE {read: true}
			notificationDocs.forEach(notificationDoc => {
				const notificationId = notificationDoc.id;
				const notification = db.doc(`/notifications/${notificationId}`);
				batch.update(notification, { read: true });
			});
			// COMMIT THE CHANGES
			await batch.commit();
			res.json({ message: 'Notifications marked as read' });
		}
	} catch (err) {
		next(err);
	}
});

export { usersRouter };
