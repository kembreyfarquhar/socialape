import * as express from 'express';
import * as BusBoy from 'busboy';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as uuidv4 from 'uuidv4';
import {
	db,
	admin,
	firebaseConfig,
	likesCollection,
	screamCollection,
	notificationCollection,
} from '../app';
import { authorization } from '../middleware/authorization.middleware';
import { validateUserDetails } from '../middleware/users.middleware';
// eslint-disable-next-line no-unused-vars
import { AuthenticatedUserData, User, UserData } from '../types/user.type';
// eslint-disable-next-line no-unused-vars
import { ScreamLike } from '../types/like.type';
// eslint-disable-next-line no-unused-vars
import { Scream } from '../types/scream.type';
// eslint-disable-next-line no-unused-vars
import { UserNotification } from '../types/notification.type';

const usersRouter = express.Router();

//                                  |*| GET ANY USER |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {get} /users/handle/:handle Get any user.
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
 * @apiError (404 NOT FOUND) {String} error User not found.
 * @apiUse InternalServerError
 */
usersRouter.get('/handle/:handle', async (req, res) => {
	const { handle } = req.params;
	try {
		// GET USER DOCUMENT AND CHECK IF IT EXISTS
		const userDoc = await db.doc(`/users/${handle}`).get();
		if (!userDoc.exists) {
			res.status(404).json({ error: 'User not found' });
		} else {
			// TYPE CAST DOCUMENT DATA AS USER
			const user = userDoc.data() as User;
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
		console.error(err);
		res.status(500).json({ error: err.code, message: err.toString() });
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
 * @apiUse AuthHeader
 *
 * @apiSuccessExample {json} Success-Response:
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
 * @apiError (404 NOT FOUND) {String} error User not found
 * @apiUse InternalServerError
 */
usersRouter.get('/logged-in-user', authorization, async (req, res) => {
	const handle = req.user.handle;
	try {
		// GET USER DOCUMENT AND CHECK IF IT EXISTS
		const userDoc = await db.doc(`/users/${handle}`).get();
		if (!userDoc.exists) {
			res.status(404).json({ error: 'User not found' });
		} else {
			// TYPE CAST USER DOCUMENT DATA AS USER
			const credentials = userDoc.data() as User;
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
			const notifications: UserNotification[] = [];
			notificationDocs.forEach(notificationDoc => {
				const notificationData = notificationDoc.data() as UserNotification;
				notifications.push({ ...notificationData, notificationId: notificationDoc.id });
			});
			const authenticatedUserData: AuthenticatedUserData = { credentials, likes, notifications };
			res.json(authenticatedUserData);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.code, message: err.toString() });
	}
});

//                                |*| POST PROFILE IMAGE |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /users/image Post user profile image.
 * @apiName PostUserImage
 * @apiGroup Users
 *
 * @apiUse AuthHeader
 * @apiHeader {String} Content-Type multipart/form-data
 *
 * @apiParam {FormData} image Mandatory image filepath.
 *
 * @apiSuccess (200 OK) {String} message Image uploaded.
 *
 * @apiError (400 BAD REQUEST) {String} error Wrong file type submitted.
 * @apiError (400 BAD REQUEST) {String} error Image is too large.
 * @apiUse InternalServerError
 */
usersRouter.post('/image', authorization, (req, res) => {
	// CREATE A NEW BUSBOY INSTANCE
	const busboy = new BusBoy({ headers: req.headers, limits: { fileSize: 1024 * 1024 } });

	// INITIALIZE NEEDED VARIABLES
	let imageFileName: string = '';
	const imageToBeUploaded: Record<string, any> = {};
	// STRING FOR IMAGE TOKEN
	const generatedToken = uuidv4.uuid();

	// CREATE NEW PATH TO IMAGE
	busboy.on('file', (_fieldname, file, filename, _encoding, mimetype) => {
		file.on('limit', () => {
			res.status(400).json({ error: 'Image is too large' });
			return;
		});
		// VALIDATE THAT IT IS OF IMAGE TYPE
		if (mimetype !== 'image/png' && mimetype !== 'image/jpeg') {
			res.status(400).json({ error: 'Wrong file type submitted' });
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
			const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media&token=${generatedToken}`;
			await db.doc(`/users/${req.user.handle}`).update({ imageUrl });
			res.json({ message: 'Image uploaded' });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: err.code, message: err.toString() });
		}
	});

	// END
	busboy.end(req.rawBody);
});

//                                |*| UPDATE USER DETAILS |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {put} /users/details Update user details.
 * @apiName UpdateUserDetails
 * @apiGroup Users
 *
 * @apiUse AuthHeader
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
 * 			"website": "user.com"
 * 		}
 *
 * @apiSuccess (200 OK) {String} message User details updated
 *
 * @apiUse BodyValidationError
 * @apiUse InternalServerError
 */
usersRouter.put('/details', authorization, validateUserDetails, async (req, res) => {
	const userDetails = req.userDetails;

	try {
		await db.doc(`/users/${req.user.handle}`).update(userDetails);
		res.json({ message: 'User details updated' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.code, message: err.toString() });
	}
});

//                          |*| MARK NOTIFICATIONS READ |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
usersRouter.put('/mark-notifications-read', authorization, async (req, res) => {
	try {
		let batch = db.batch();
		req.body.forEach((notificationId: string) => {
			const notification = db.doc(`/notifications/${notificationId}`);
			batch.update(notification, { read: true });
		});
		await batch.commit();
		res.json({ message: 'Notifications marked as read' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.code, message: err.toString() });
	}
});

export { usersRouter };
