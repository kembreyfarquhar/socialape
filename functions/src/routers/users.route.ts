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
import { NotificationData } from '../types/notification';
// eslint-disable-next-line no-unused-vars
import { ApiErrorType } from '../types/apiError';

const usersRouter = express.Router();

//                                  |*| GET ANY USER |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {get} /users/handle/:handle Get any user
 * @apiName GetAnyUser
 * @apiGroup Users
 *
 * @apiParam (Query String Param) {String} handle User's unique handle.
 *
 * @apiSuccess (200 OK) {Object} user
 * @apiSuccess (200 OK) {String} user.userId ID of user.
 * @apiSuccess (200 OK) {String} user.email User email.
 * @apiSuccess (200 OK) {String} user.handle User handle.
 * @apiSuccess (200 OK) {String} user.createdAt ISO Timestamp of user creation.
 * @apiSuccess (200 OK) {String} user.imageUrl URL to user's profile image.
 * @apiSuccess (200 OK) {String} user.bio User bio.
 * @apiSuccess (200 OK) {String} user.website User's website.
 * @apiSuccess (200 OK) {String} user.location User's location.
 * @apiSuccess (200 OK) {Object[]} screams List of all screams user has made.
 * @apiSuccess (200 OK) {String} screams.userHandle Handle of user.
 * @apiSuccess (200 OK) {String} screams.screamId Sream's unique ID.
 * @apiSuccess (200 OK) {String} screams.body Scream's body/content.
 * @apiSuccess (200 OK) {String} screams.createdAt ISO String of scream creation.
 * @apiSuccess (200 OK) {String} screams.userImage User profile image URL.
 * @apiSuccess (200 OK) {Number} screams.likeCount Number of likes scream has.
 * @apiSuccess (200 OK) {Number} screams.commentCount Number of comments scream has.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		HTTP/1.1 200 OK
 * 		{
 * 			"user": {
 *   			"bio": "Hello, nice to meet you!",
 *   			"userId": "AM89AAaud5e0ii2oijfZoPRC2",
 *   			"handle": "user",
 *   			"website": "https://user.com",
 *   			"email": "user@gmail.com",
 *   			"createdAt": "2021-03-07T23:40:05.580Z",
 * 				"location": "St. Louis, MO",
 *   			"imageUrl": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/02375.jpg?alt=media"
 * 			},
 * 			"screams": [
 *   			{
 *     				"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/57882232665.png?alt=media&token=23be2613-41aa-407d-9ba4-8casdfasde",
 *     				"body": "It's a beautiful day today. :D",
 *     				"userHandle": "me",
 *     				"commentCount": 0,
 *     				"likeCount": 0,
 *     				"createdAt": "2021-03-11T11:21:10.581Z",
 *     				"screamId": "xWrYsFvVqsmpCjtjDLiV"
 *   			},
 *   			{
 *     				"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/534534465.png?alt=media&token=23be2613-41aa-407d-9ba4-8c0asdfsd6e",
 *     				"createdAt": "2021-03-11T11:08:16.534Z",
 *     				"body": "Hi this is my first scream!",
 *     				"likeCount": 0,
 *     				"commentCount": 0,
 *     				"userHandle": "me",
 *     				"screamId": "eEQjB9xxx78e4iuzNRLc"
 *   			}
 * 			]
 *		}
 *
 * @apiUse ApiErrorNotFound
 *
 * @apiErrorExample {json} User-Not-Found-Error-Response:
 * 		HTTP/1.1 404 NOT FOUND
 * 		{
 * 			"error_type": "NETWORK",
 * 			"message": "There is no user record corresponding to this identifier. The user may have been deleted."
 * 		}
 */
usersRouter.get('/handle/:handle', async (req, res, next) => {
	try {
		const { handle } = req.params;
		// GET USER DOCUMENT AND CHECK IF IT EXISTS
		const userDoc = await db.doc(`/users/${handle}`).get();
		if (!userDoc.exists) {
			const error: ApiErrorType = UserErrors.USER_DOESNT_EXIST;
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
/**
 * @api {get} /users/logged-in-user Get Authenticated User Info
 * @apiName GetAuthenticatedUser
 * @apiGroup Users
 *
 * @apiUse AuthToken
 *
 * @apiSuccessExample {json} Success-Response:
 * 		HTTP/1.1 200 OK
 * 		{
 * 			"credentials": {
 *   			"bio": "Hello, nice to meet you!",
 *   			"email": "me@gmail.com",
 *   			"userId": "sEZtRJvsG5TxmktZ7nMngVPz8Sq1",
 *   			"location": "Missouri",
 *   			"handle": "me",
 *   			"createdAt": "2021-03-11T10:19:56.873Z",
 *   			"website": "http://me.com",
 *   			"imageUrl": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/52352665.png?alt=media&token=23be2613-41aa-407d-245245gesb06e"
 * 		},
 * 			"likes": [
 *     			{
 *     				"userHandle": "me",
 *     				"screamId": "eEQjB9xdfhjfsetyhLc"
 *   			}
 * 			],
 * 			"notifications": [
 *   			{
 *     				"screamId": "eEQjB9xxx78e4iuzNRLc",
 *     				"type": "comment",
 *     				"recipient": "me",
 *     				"createdAt": "2021-03-11T11:30:11.582Z",
 *     				"read": false,
 *     				"sender": "me2",
 *     				"notificationId": "rxEgZmikYKvkt9ZmXur9"
 *   			},
 *   			{
 *     				"read": false,
 *     				"recipient": "me",
 *     				"screamId": "eEQjB9xxx78e4iuzNRLc",
 *     				"createdAt": "2021-03-11T11:28:55.691Z",
 *     				"sender": "me2",
 *     				"type": "like",
 *     				"notificationId": "S36S6kDYDNGAFU7Rmqlv"
 *   			}
 * 			]
 * 		}
 *
 */
usersRouter.get('/logged-in-user', authorization, async (req, res, next) => {
	try {
		const handle = req.user.handle;
		// GET USER DOCUMENT AND CHECK IF IT EXISTS
		const userDoc = await db.doc(`/users/${handle}`).get();
		if (!userDoc.exists) {
			const error: ApiErrorType = UserErrors.USER_DOESNT_EXIST;
			next(new ApiError(error.code, error.message, error.type));
			return;
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
			const notifications: NotificationData[] = [];
			notificationDocs.forEach(notificationDoc => {
				// TYPE CAST NOTIFICATION DATA
				const notificationData = notificationDoc.data() as NotificationData;
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
/**
 * @api {post} /users/image Post user profile image
 * @apiName PostUserImage
 * @apiGroup Users
 *
 * @apiUse AuthToken
 *
 * @apiHeader {String} Content-Type multipart/form-data
 *
 * @apiParam {FormData} image Mandatory image filepath.
 *
 * @apiSuccess (200 OK) {String} message Image uploaded.
 *
 * @apiUse ApiErrorBadRequest
 *
 * @apiErrorExample {json} Wrong-Content-Type-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "NETWORK",
 * 			"message": "Request must include Content-Type Header set to multipart/form-data"
 * 		}
 *
 * @apiErrorExample {json} Wrong-File-Type-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "NETWORK",
 * 			"message": "Wrong file type submitted. Please only use JPEG or PNG files for images."
 * 		}
 *
 * @apiErrorExample {json} Image-Too-Large-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "NETWORK",
 * 			"message": "Image is too large."
 * 		}
 */
usersRouter.post('/image', authorization, async (req, res, next) => {
	const contentType = req.headers['content-type'];
	console.log('REQUEST: ', req.headers);
	// IF CONTENT TYPE HEADER IS INCORRECT, SEND ERROR
	if (!contentType || (contentType && !contentType.includes('multipart/form-data'))) {
		const error: ApiErrorType = UserErrors.INCORRECT_CONTENT_TYPE;
		next(new ApiError(error.code, error.message, error.type));
		return;
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
					const error: ApiErrorType = UserErrors.WRONG_FILE_TYPE;
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
						const error: ApiErrorType = UserErrors.IMAGE_TOO_LARGE;
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
/**
 * @api {put} /users/details Update user details
 * @apiName UpdateUserDetails
 * @apiGroup Users
 *
 * @apiUse AuthToken
 *
 * @apiParam {String} bio Optional user bio.
 * @apiParam {String} website Optional user website.
 * @apiParam {String} location Optional user location.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "bio": "Hello, nice to meet you, I'm user.",
 *          "website": "https://user.com",
 *          "location": "St. Louis, MO, USA"
 *      }
 *
 * @apiParamExample {json} Request-Example:
 * 		{
 * 			"bio": "",
 * 			"website": ""
 * 		}
 *
 * @apiSuccess (200 OK) {String} message User details updated
 *
 * @apiUse ApiErrorBadRequest
 *
 * @apiErrorExample {json} No-User-Details-Sent-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "NETWORK",
 * 			"message": "Request must include at lease one of: bio, location, or website."
 * 		}
 *
 * @apiErrorExample {json} Invalid-Website-URL-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "VALIDATION",
 * 			"message": "website must be a valid URL",
 * 			"errors": [
 * 		  		"website must be a valid URL"
 * 			]
 * 		}
 */
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
/**
 * @api {patch} /users/mark-notifications-read Mark all unread notifications as read.
 * @apiName MarkNotificationsRead
 * @apiGroup Users
 *
 * @apiUse AuthToken
 *
 * @apiSuccess (200 OK) {String} message Notifications marked as read.
 *
 * @apiSuccess (200 OK) {String} message All notifications already read.
 */
usersRouter.patch('/mark-notifications-read', authorization, async (req, res, next) => {
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
			return;
		} else {
			// LOOP THROUGH THEM, GRAB THE ID, UPDATE EACH FIELD TO BE {read: true}
			notificationDocs.forEach(notificationDoc => {
				const notificationId = notificationDoc.id;
				const notification = db.doc(`/notifications/${notificationId}`);
				batch.update(notification, { read: true });
			});
			// COMMIT THE CHANGES
			await batch.commit();
			res.json({ message: 'Notifications marked as read.' });
		}
	} catch (err) {
		next(err);
	}
});

export { usersRouter };
