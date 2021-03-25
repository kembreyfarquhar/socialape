// IMPORT EXTERNAL PACKAGES
import * as express from 'express';

// IMPORT NEEDED VARIABLES FROM WITHIN REPO
import { commentsCollection, db, likesCollection, screamCollection } from '../app';
import { ScreamErrors } from '../errorService/scream.error';
import { ApiError } from '../errorService/apiError';

// IMPORT MIDDLEWARE
import {
	validateScream,
	validateComment,
	isExistingScream,
} from '../middleware/screams.middleware';
import { authorization } from '../middleware/authorization.middleware';

// IMPORT TYPES, DISABLE ESLINT TO AVOID ERRORS
// eslint-disable-next-line no-unused-vars
import { DBScream, ScreamData, ScreamObject } from '../types/scream';
// eslint-disable-next-line no-unused-vars
import { ScreamComment, ScreamCommentData } from '../types/comment';
// eslint-disable-next-line no-unused-vars
import { ApiErrorType } from '../types/apiError';

const screamsRouter = express.Router();

//                              |*| GET ALL SCREAMS |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {get} /screams Get all Scream Documents
 * @apiName GetAllScreams
 * @apiGroup Screams
 *
 * @apiSuccess (200 OK) {String} id Unique ID of Scream document
 * @apiSuccess (200 OK) {String} createdAt ISO string of Scream creation.
 * @apiSuccess (200 OK) {String} body Scream body/content.
 * @apiSuccess (200 OK) {String} userHandle Scream creator's unique user handle.
 * @apiSuccess (200 OK) {String} userImage Scream creator's profile image URL.
 * @apiSuccess (200 OK) {Number} likeCount Number of likes the scream has.
 * @apiSuccess (200 OK) {Number} commentCount Number of comments the scream has.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		HTTP/1.1 200 OK
 * 		[
 *      	{
 *          	"id": "KJHndjhDKJhdnDHjd",
 *          	"createdAt": "2021-03-06T16:04:36.298Z",
 *          	"body": "This is a scream!",
 *          	"userHandle": "exampleuser",
 * 				"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/0293342.png?alt=media",
 * 				"likeCount": 23,
 * 				"commentCount": 4
 *      	},
 *      	{
 *          	"id": "LKJds09gsPIHJDFLugj",
 *          	"createdAt": "2021-03-06T16:04:36.298Z",
 *          	"body": "This is another scream!",
 *          	"userHandle": "user",
 * 				"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/924754.png?alt=media",
 * 				"likeCount": 5,
 * 				"commentCount": 0
 *      	},
 * 		]
 *
 */
screamsRouter.get('/', async (_, res, next) => {
	try {
		// GRAB ALL SCREAM DOCUMENTS FROM COLLECTION
		const screamDocs = await db.collection(screamCollection).orderBy('createdAt', 'desc').get();
		// CREATE ARRAY TO FILL WITH SCREAM OBJECTS
		const screams: ScreamObject[] = [];
		// LOOP THROUGH DOCUMENTS AND TYPE CAST DATA TO PUSH INTO SCREAMS ARRAY
		screamDocs.forEach(screamDoc => {
			const screamData = screamDoc.data() as Omit<ScreamObject, 'id'>;
			screams.push({ id: screamDoc.id, ...screamData });
		});
		// SEND BACK SCREAMS ARRAY
		res.json(screams);
	} catch (err) {
		next(err);
	}
});

//                            |*| GET SCREAM BY ID |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {get} /screams/:screamId Get scream by ID
 * @apiName GetScreamByID
 * @apiGroup Screams
 *
 * @apiParam (Query String Param) {String} screamId Scream's unique ID.
 *
 * @apiSuccess (200 OK) {String} userHandle Scream creator's unique user handle.
 * @apiSuccess (200 OK) {String} body Scream body/content.
 * @apiSuccess (200 OK) {String} createdAt ISO String of scream creation.
 * @apiSuccess (200 OK) {String} screamId Unique ID of scream.
 * @apiSuccess (200 OK) {Object[]} comments List of comments for this scream.
 * @apiSuccess (200 OK) {String} comments.createdAt ISO String of comment creation.
 * @apiSuccess (200 OK) {String} comments.userHandle User handle of scream creator.
 * @apiSuccess (200 OK) {String} comments.userImage Profile image URL of comment creator.
 * @apiSuccess (200 OK) {String} comments.screamId ID of scream the comment belongs to.
 * @apiSuccess (200 OK) {String} comments.body Comment body/content.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		HTTP/1.1 200 OK
 * 		{
 *			"userHandle": "user",
 *			"body": "This is my scream!",
 *			"createdAt": "2021-03-07T23:42:07.990Z",
 *			"screamId": "DThsMg40sdofjsd8j",
 *			"comments": [
 *		    	{
 *		      		"createdAt": "2021-03-07T23:45:07.990Z",
 *		      		"userHandle": "otheruser",
 *					"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/7237339.jpg?alt=media",
 *		      		"screamId": "DThsMg40sdofjsd8j",
 *		      		"body": "nice scream, dude!"
 *		    	}
 *		  	]
 *		}
 *
 * @apiUse ApiErrorNotFound
 *
 * @apiErrorExample {json} Scream-Not-Found-Error-Response:
 * 		HTTP/1.1 404 NOT FOUND
 * 		{
 * 			"error_type": "NETWORK",
 * 			"message": "Scream not found."
 * 		}
 */
screamsRouter.get('/:screamId', isExistingScream, async (req, res, next) => {
	try {
		const { screamDoc } = req;
		const screamId = req.params.screamId;
		// GRAB COMMENT DOCUMENTS  ASSOCIATED WITH SCREAM
		const commentsDoc = await db
			.collection(commentsCollection)
			.orderBy('createdAt', 'desc')
			.where('screamId', '==', screamId)
			.get();
		// CREATE ARRAY TO ADD SCREAM COMMENTS TO
		const comments: ScreamComment[] = [];
		// LOOP THROUGH AND TYPE CAST DOC DATA AS SCREAM COMMENT TO PUSH TO CREATED ARRAY
		commentsDoc.forEach(commentDoc => comments.push(commentDoc.data() as ScreamComment));
		// TYPE CAST DESCTRUCTURED DOC DATA AS SCREAM DATA
		const { userHandle, body, createdAt } = screamDoc.data() as ScreamData;
		// TYPE CAST NECESSARY PROPERTIES INSIDE OBJECT AS SCREAM COMMENT DATA TO SEND BACK IN RESPONSE
		const screamData: ScreamCommentData = { userHandle, body, createdAt, screamId, comments };
		res.json(screamData);
	} catch (err) {
		next(err);
	}
});

//                               |*| POST NEW SCREAM |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /screams Post new Scream Document
 * @apiName PostScream
 * @apiGroup Screams
 *
 * @apiUse AuthToken
 *
 * @apiParam {String} body Mandatory Scream body/content.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "body": "This is my scream!"
 *      }
 *
 * @apiSuccess (201 CREATED) {String} userHandle User's unique handle.
 * @apiSuccess (201 CREATED) {String} createdAt ISO String of scream creation.
 * @apiSuccess (201 CREATED) {String} body Scream body/content.
 * @apiSuccess (201 CREATED) {Number} likeCount Number of likes the scream has.
 * @apiSuccess (201 CREATED) {Number} commentCount Number of comments the scream has.
 * @apiSuccess (201 CREATED) {String} userImage User's profile image URL.
 * @apiSuccess (201 CREATED) {String} screamId Scream's unique ID.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		HTTP/1.1 201 CREATED
 * 		{
 * 			"userHandle": "user",
 * 			"createdAt": "2021-03-09T20:48:35.498Z",
 * 			"body": "Hi this is my first scream!",
 * 			"likeCount": 0,
 * 			"commentCount": 0,
 * 			"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/757209389.jpg?alt=media",
 * 			"screamId": "S9I7vZBYi9s09fu0n0jd4G"
 *		}
 *
 * @apiUse ApiErrorBadRequest
 *
 * @apiErrorExample {json} Missing-Required-Fields-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "VALIDATION",
 * 			"message": "body is a required field",
 * 			"errors": [
 * 		  		"body is a required field"
 * 			]
 * 		}
 */
screamsRouter.post('/', authorization, validateScream, async (req, res, next) => {
	try {
		const newScream = req.scream;
		// ADD NEW SCREAM TO COLLECTION
		const screamDoc = await db.collection(screamCollection).add(newScream);
		// SEND BACK SCREAM INFO PLUS SCREAM ID
		res.status(201).json({ ...newScream, screamId: screamDoc.id });
	} catch (err) {
		next(err);
	}
});

//                               |*| POST NEW COMMENT |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /screams/:screamId/comment Post new comment
 * @apiName PostNewComment
 * @apiGroup Screams
 *
 * @apiUse AuthToken
 *
 * @apiParam (Query String Param) {String} screamId Scream's unique ID.
 *
 * @apiParam {String} body Comment's body/content.
 *
 * @apiParamExample {json} Request-Example:
 * 		{
 * 			"body": "This is my super cool comment!"
 * 		}
 *
 * @apiSuccess (201 CREATED) {String} userHandle User's unique handle.
 * @apiSuccess (201 CREATED) {String} screamId Scream's unique ID.
 * @apiSuccess (201 CREATED) {String} createdAt ISO String of comment's creation.
 * @apiSuccess (201 CREATED) {String} body Comment's body/content.
 * @apiSuccess (201 CREATED) {String} userImage User's profile image URL.
 * @apiSuccess (201 CREATED) {Number} likeCount Number of likes scream has.
 * @apiSuccess (201 CREATED) {Number} commentCount Number of comments scream has.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		HTTP/1.1 201 CREATED
 * 		{
 * 			"userHandle": "user",
 * 			"screamId": "DThsMg42rhXvw9i5WJvj",
 * 			"createdAt": "2021-03-09T20:58:04.154Z",
 * 			"body": "This is my super cool comment!",
 * 			"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/7273339.jpg?alt=media",
 * 			"likeCount": 0,
 * 			"commentCount": 0
 * 		}
 *
 * @apiUse ApiErrorNotFound
 *
 * @apiErrorExample {json} Scream-Not-Found-Error-Response:
 * 		HTTP/1.1 404 NOT FOUND
 * 		{
 * 			"error_type": "NETWORK",
 * 			"message": "Scream not found."
 * 		}
 *
 * @apiUse ApiErrorBadRequest
 *
 * @apiErrorExample {json} Missing-Fields-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "VALIDATION",
 * 			"message": "body is a required field",
 * 			"errors": [
 * 		  		"body is a required field"
 * 			]
 * 		}
 */
screamsRouter.post(
	'/:screamId/comment',
	authorization,
	validateComment,
	isExistingScream,
	async (req, res, next) => {
		try {
			const newComment = req.comment;
			const { screamDoc } = req;
			// TYPE CASE DATA AS DBSCREAM
			const data = screamDoc.data() as DBScream;
			// INCREASE THE COMMENTCOUNT FOR SCREAM DOCUMENT
			await screamDoc.ref.update({ commentCount: data.commentCount + 1 });
			// ADD NEW COMMENT TO COMMENTS COLLECTION
			await db.collection(commentsCollection).add(newComment);
			// SEND RESPONSE WITH UPDATED NEW COMMENT DATA, COMMENTCOUNT, AND LIKECOUNT
			res
				.status(201)
				.json({ ...newComment, commentCount: data.commentCount + 1, likeCount: data.likeCount });
		} catch (err) {
			next(err);
		}
	}
);

//                                 |*| LIKE A SCREAM |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /screams/:screamId/like Post a Like on a Scream
 * @apiName PostScreamLike
 * @apiGroup Screams
 *
 * @apiUse AuthToken
 *
 * @apiParam (Query String Param) {String} screamId Scream's unique ID.
 *
 * @apiSuccess (201 CREATED) {String} userHandle User's unique handle.
 * @apiSuccess (201 CREATED) {String} screamId Scream's unique ID.
 * @apiSuccess (201 CREATED) {String} createdAt ISO String of like's creation.
 * @apiSuccess (201 CREATED) {String} body Body/content of scream.
 * @apiSuccess (201 CREATED) {String} userImage User's profile image URL.
 * @apiSuccess (201 CREATED) {Number} likeCount Number of likes on scream.
 * @apiSuccess (201 CREATED) {Number} commentCount Number of comments on scream.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		HTTP/1.1 201 CREATED
 * 		{
 * 			"userHandle": "user",
 * 			"screamId": "DThsMg42rhXvw9i5WJvj",
 * 			"createdAt": "2021-03-09T20:58:04.154Z",
 * 			"body": "This is my super cool comment!",
 * 			"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/7273339.jpg?alt=media",
 * 			"likeCount": 24,
 * 			"commentCount": 3
 * 		}
 *
 * @apiUse ApiErrorNotFound
 *
 * @apiErrorExample {json} Scream-Not-Found-Error-Response:
 * 		HTTP/1.1 404 NOT FOUND
 * 		{
 * 			"error_type": "NETWORK",
 * 			"message": "Scream not found."
 * 		}
 *
 * @apiUse ApiErrorBadRequest
 *
 * @apiErrorExample {json} Scream-Already-Liked-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "NETWORK",
 * 			"message": "Scream already liked. Cannot like again."
 * 		}
 *
 */
screamsRouter.post('/:screamId/like', authorization, isExistingScream, async (req, res, next) => {
	try {
		const screamId = req.params.screamId;
		const userHandle = req.user.handle;
		const { screamDoc } = req;
		const screamDocPath = db.doc(`/screams/${screamId}`);
		// TYPE CAST SCREAM DATA AS DBSCREAM
		const screamData: DBScream = screamDoc.data() as DBScream;

		const likeDoc = await db
			.collection(likesCollection)
			.where('userHandle', '==', userHandle)
			.where('screamId', '==', screamId)
			.limit(1)
			.get();
		if (likeDoc.empty) {
			// ADD DOCUMENT TO LIKES COLLECTION FOR USER AND SCREAM
			await db.collection(likesCollection).add({ screamId, userHandle });
			// INCREASE LIKECOUNT FOR SCREAM DOCUMENT
			screamData.likeCount = screamData.likeCount + 1;
			await screamDocPath.update({ likeCount: screamData.likeCount });
			// SEND RESPONSE WITH UPDATED SCREAMDATA AND SCREAMID
			res.status(201).json({ ...screamData, screamId });
		} else {
			// LIKE DOCUMENT FOUND FOR USER AND SCREAM, SEND ERROR
			const error: ApiErrorType = ScreamErrors.SCREAM_ALREADY_LIKED;
			next(new ApiError(error.code, error.message, error.type));
		}
	} catch (err) {
		next(err);
	}
});

//                                 |*| UNLIKE A SCREAM |*|
// ====================================================================================|
//vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {delete} /screams/:screamId/unlike Delete a like from a Scream
 * @apiName DeleteScreamLike
 * @apiGroup Screams
 *
 * @apiUse AuthToken
 *
 * @apiParam (Query String Param) {String} screamId Scream's unique ID.
 *
 * @apiSuccess (200 OK) {String} userHandle User's unique handle.
 * @apiSuccess (200 OK) {String} screamId Scream's unique ID.
 * @apiSuccess (200 OK) {String} createdAt ISO String of like's creation.
 * @apiSuccess (200 OK) {String} body Body/content of scream.
 * @apiSuccess (200 OK) {String} userImage User's profile image URL.
 * @apiSuccess (200 OK) {Number} likeCount Number of likes on scream.
 * @apiSuccess (200 OK) {Number} commentCount Number of comments on scream.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		HTTP/1.1 200 OK
 * 		{
 * 			"userHandle": "user",
 * 			"screamId": "DThsMg42rhXvw9i5WJvj",
 * 			"createdAt": "2021-03-09T20:58:04.154Z",
 * 			"body": "This is my super cool comment!",
 * 			"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/7273339.jpg?alt=media",
 * 			"likeCount": 23,
 * 			"commentCount": 3
 * 		}
 *
 * @apiUse ApiErrorNotFound
 *
 * @apiErrorExample {json} Scream-Not-Found-Error-Response:
 * 		HTTP/1.1 404 NOT FOUND
 * 		{
 * 			"error_type": "NETWORK",
 * 			"message": "Scream not found."
 * 		}
 *
 * @apiUse ApiErrorBadRequest
 *
 * @apiErrorExample {json} Scream-Not-Liked-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "NETWORK",
 * 			"message": "Scream not yet liked. Cannot unlike."
 * 		}
 *
 */
screamsRouter.delete(
	'/:screamId/unlike',
	authorization,
	isExistingScream,
	async (req, res, next) => {
		try {
			const screamId = req.params.screamId;
			const { screamDoc } = req;
			const screamDocPath = db.doc(`/screams/${screamId}`);
			// TYPE CAST SCREAM DOCUMENT DATA AS DBSCREAM
			const screamData: DBScream = screamDoc.data() as DBScream;
			const likeDoc = await db
				.collection(likesCollection)
				.where('userHandle', '==', req.user.handle)
				.where('screamId', '==', screamId)
				.limit(1)
				.get();

			if (!likeDoc.empty) {
				// DELETE LIKE FROM LIKES COLLECTION
				await db.doc(`/likes/${likeDoc.docs[0].id}`).delete();
				// REDUCE LIKECOUNT FOR SCREAM DOCUMENT
				screamData.likeCount = screamData.likeCount - 1;
				await screamDocPath.update({ likeCount: screamData.likeCount });
				// SEND RESPONSE WITH UPDTATED SCREAMDATA AND SCREAMID
				res.json({ ...screamData, screamId });
			} else {
				// NO LIKE FOUND FOR SCREAM DOC, SEND ERROR
				const error: ApiErrorType = ScreamErrors.SCREAM_NOT_LIKED;
				next(new ApiError(error.code, error.message, error.type));
			}
		} catch (err) {
			next(err);
		}
	}
);

//                                 |*| DELETE SCREAM |*|
// ====================================================================================|
//vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {delete} /screams/:screamId Delete a Scream
 * @apiName DeleteScream
 * @apiGroup Screams
 *
 * @apiUse AuthToken
 *
 * @apiParam (Query String Param) {String} screamId Scream's unique ID.
 *
 * @apiSuccess (200 OK) {String} message Scream deleted.
 *
 * @apiUse ApiErrorNotFound
 *
 * @apiErrorExample {json} Scream-Not-Found-Error-Response:
 * 		HTTP/1.1 404 NOT FOUND
 * 		{
 * 			"error_type": "NETWORK",
 * 			"message": "Scream not found."
 * 		}
 *
 * @apiError (403 FORBIDDEN) {String} error_type Type of error.
 * @apiError (403 FORBIDDEN) {String} message Error message.
 *
 * @apiErrorExample {json} Not-Scream-Creator-Error-Response:
 * 		HTTP/1.1 403 FORBIDDEN
 * 		{
 * 			"error_type": "NETWORK",
 * 			"message": "Unauthorized user. Must be owner of Scream to delete."
 * 		}
 *
 */
screamsRouter.delete('/:screamId', authorization, isExistingScream, async (req, res, next) => {
	try {
		const { screamDoc } = req;
		// GRAB DBSCREAM FROM DOC DATA
		const data = screamDoc.data() as DBScream;
		// IF DATA USER HANDLE DOESN'T EQUAL REQUEST USER HANDLE, UNAUTHORIZED
		if (data.userHandle !== req.user.handle) {
			const error: ApiErrorType = ScreamErrors.UNAUTHORIZED_USER;
			next(new ApiError(error.code, error.message, error.type));
		} else {
			// GRAB SCREAM DOC AND DELETE
			const doc = db.doc(`/screams/${req.params.screamId}`);
			await doc.delete();
			res.json({ message: 'Scream deleted.' });
		}
	} catch (err) {
		next(err);
	}
});

export { screamsRouter };
