import * as express from 'express';
import * as BusBoy from 'busboy';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { db, admin, firebaseConfig, likesCollection } from '../app';
import { authorization } from '../middleware/authorization.middleware';
import { validateUserDetails } from '../middleware/users.middleware';
// eslint-disable-next-line no-unused-vars
import { User, UserData } from '../types/user.type';
// eslint-disable-next-line no-unused-vars
import { ScreamLike } from '../types/like.type';

const usersRouter = express.Router();

//                                  |*| GET USER INFO |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {get} /users/userinfo Get all user info.
 * @apiName GetUserInfo
 * @apiGroup Users
 *
 * @apiUse AuthHeader
 *
 * @apiSuccess (200 OK) {Object} credentials
 * @apiSuccess (200 OK) {String} credentials.userId ID of user.
 * @apiSuccess (200 OK) {String} credentials.email User email.
 * @apiSuccess (200 OK) {String} credentials.handle User handle.
 * @apiSuccess (200 OK) {String} credentials.createdAt ISO Timestamp of user creation.
 * @apiSuccess (200 OK) {String} credentials.imageUrl URL to user's profile image.
 * @apiSuccess (200 OK) {String} credentials.bio User bio.
 * @apiSuccess (200 OK) {String} credentials.website User's website.
 * @apiSuccess (200 OK) {String} credentials.location User's location.
 * @apiSuccess (200 OK) {Object[]} likes List of all screams user has liked.
 * @apiSuccess (200 OK) {String} likes.userHandle Handle of user.
 * @apiSuccess (200 OK) {String} likes.screamId ID of scream that was liked.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		{
 * 			"credentials": {
 *   			"bio": "Hello, nice to meet you!",
 *   			"userId": "AM89AAaud5e0ii2oijfZoPRC2",
 *   			"handle": "user",
 *   			"website": "https://user.com",
 *   			"email": "user@gmail.com",
 *   			"createdAt": "2021-03-07T23:40:05.580Z",
 *   			"imageUrl": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/02375.jpg?alt=media"
 * 			},
 * 			"likes": [
 * 				{
 * 					"userHandle": "user",
 * 					"screamId": "02094j0ifjoj0idjfosj02e9j"
 * 				}
 * 			]
 *		}
 *
 * @apiError (404 NOT FOUND) {String} error User not found.
 * @apiUse InternalServerError
 */
usersRouter.get('/userinfo', authorization, async (req, res) => {
	try {
		const doc = await db.doc(`/users/${req.user.handle}`).get();
		if (!doc.exists) {
			res.status(404).json({ error: 'User not found' });
		} else {
			const credentials = doc.data() as User;
			const data = await db
				.collection(likesCollection)
				.where('userHandle', '==', req.user.handle)
				.get();
			const likes: ScreamLike[] = [];
			data.forEach(document => likes.push(document.data()));
			const userData: UserData = { credentials, likes };
			res.json(userData);
		}
	} catch (err) {
		res.status(500).json({ error: err.code, message: err.toString() });
	}
});

//                                |*| UPDATE IMAGE |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /users/image Update user image.
 * @apiName UpdateImage
 * @apiGroup Users
 *
 * @apiUse AuthHeader
 *
 * @apiParam {FormData} image Mandatory image filepath.
 *
 * @apiSuccess (200 OK) {String} message Image uploaded.
 *
 * @apiError (400 BAD REQUEST) {String} error Wrong file type submitted.
 * @apiUse InternalServerError
 */
usersRouter.post('/image', authorization, (req, res) => {
	// CREATE A NEW BUSBOY INSTANCE
	const busboy = new BusBoy({ headers: req.headers });

	// INITIALIZE NEEDED VARIABLES
	let imageFileName: string = '';
	const imageToBeUploaded: Record<string, any> = {};

	// CREATE NEW PATH TO IMAGE
	busboy.on('file', (_fieldname, file, filename, _encoding, mimetype) => {
		// VALIDATE THAT IT IS OF IMAGE TYPE
		if (mimetype !== 'image/png' && mimetype !== 'image/jpeg') {
			res.status(400).json({ error: 'Wrong file type submitted' });
		}
		const imageExtension = filename.split('.')[filename.split('.').length - 1];
		imageFileName = `${Math.round(Math.random() * 1000000).toString()}.${imageExtension}`;
		const filepath = path.join(os.tmpdir(), imageFileName);
		imageToBeUploaded.filepath = filepath;
		imageToBeUploaded.mimetype = mimetype;
		file.pipe(fs.createWriteStream(filepath));
	});

	// STORE NEW IMAGE IN USER'S IMAGEURL FIELD
	busboy.on('finish', async () => {
		try {
			await admin
				.storage()
				.bucket()
				.upload(imageToBeUploaded.filepath, {
					resumable: false,
					metadata: {
						contentType: imageToBeUploaded.mimetype,
					},
				});
			const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
			await db.doc(`/users/${req.user.handle}`).update({ imageUrl });
			res.json({ message: 'Image uploaded' });
		} catch (err) {
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
 * @apiUse BodyValidationError
 * @apiUse InternalServerError
 */
usersRouter.put('/details', authorization, validateUserDetails, async (req, res) => {
	const userDetails = req.userDetails;

	try {
		await db.doc(`/users/${req.user.handle}`).update(userDetails);
		res.json({ message: 'User details updated' });
	} catch (err) {
		res.status(500).json({ error: err.code, message: err.toString() });
	}
});

export { usersRouter };
