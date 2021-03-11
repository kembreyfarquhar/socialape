import * as express from 'express';
import { commentsCollection, db, likesCollection, screamCollection } from '../app';
import {
	validateScream,
	validateComment,
	isExistingScream,
} from '../middleware/screams.middleware';
import { authorization } from '../middleware/authorization.middleware';
// eslint-disable-next-line no-unused-vars
import { Scream, ScreamData } from '../types/scream.type';
// eslint-disable-next-line no-unused-vars
import { ScreamComment } from '../types/comment.type';

const screamsRouter = express.Router();

//                              |*| GET ALL SCREAMS |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {get} /screams Get all Scream Documents
 * @apiName GetAllScreams
 * @apiGroup Screams
 *
 * @apiSuccess (200 OK) {String} id ID of the document
 * @apiSuccess (200 OK) {String} createdAt Timestamp string.
 * @apiSuccess (200 OK) {String} body Scream body/content.
 * @apiSuccess (200 OK) {String} userHandle Handle for scream's creator.
 * @apiSuccess (200 OK) {String} userImage User's profile image URL.
 * @apiSuccess (200 OK) {Number} likeCount Number of likes the scream has.
 * @apiSuccess (200 OK) {Number} commentCount Number of comments the scream has.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		[
 *      	{
 *          	"id": "KJHndjhDKJhdnDHjd",
 *          	"createdAt": "2021-03-06T16:04:36.298Z",
 *          	"body": "This is a scream!",
 *          	"userHandle": "exampleuser",
 * 				"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/0293342.png?alt=media"
 * 				"likeCount": 23,
 * 				"commentCount": 4
 *      	},
 *      	{
 *          	"id": "LKJds09gsPIHJDFLugj",
 *          	"createdAt": "2021-03-06T16:04:36.298Z",
 *          	"body": "This is another scream!",
 *          	"userHandle": "user",
 * 				"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/924754.png?alt=media"
 * 				"likeCount": 5,
 * 				"commentCount": 0
 *      	},
 * 		]
 *
 * @apiUse InternalServerError
 *
 */
screamsRouter.get('/', async (_, res) => {
	try {
		const screamDocs = await db.collection(screamCollection).orderBy('createdAt', 'desc').get();
		const screams: Scream[] = [];
		screamDocs.forEach(screamDoc => {
			const screamData = screamDoc.data() as Scream;
			screams.push({ id: screamDoc.id, ...screamData });
		});
		res.json(screams);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.code, message: err.toString() });
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
 * @apiSuccess (200 OK) {String} userHandle Handle of user that created scream.
 * @apiSuccess (200 OK) {String} body Body/content of scream.
 * @apiSuccess (200 OK) {String} createdAt ISO String of scream creation.
 * @apiSuccess (200 OK) {String} screamId ID of scream.
 * @apiSuccess (200 OK) {Object[]} comments List of comments for this scream.
 * @apiSuccess (200 OK) {String} comments.createdAt ISO String of comment creation.
 * @apiSuccess (200 OK) {String} comments.userHandle Handle of user whose comment it is.
 * @apiSuccess (200 OK) {String} comments.screamId ID of scream the comment belongs to.
 * @apiSuccess (200 OK) {String} comments.body Body/content of comment.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		{
 *			"userHandle": "user",
 *			"body": "This is my scream!",
 *			"createdAt": "2021-03-07T23:42:07.990Z",
 *			"screamId": "DThsMg40sdofjsd8j",
 *			"comments": [
 *		    	{
 *		      		"createdAt": "2021-03-07T23:45:07.990Z",
 *		      		"userHandle": "otheruser",
 *					"userImage": "https://firebasestorage.googleapis.com/v0/b/appname.appspot.com/o/7237339.jpg?alt=media"
 *		      		"screamId": "DThsMg40sdofjsd8j",
 *		      		"body": "nice scream, dude!"
 *		    	}
 *		  	]
 *		}
 *
 * @apiError (404 NOT FOUND) {String} error Scream not found.
 * @apiUse InternalServerError
 */
screamsRouter.get('/:screamId', isExistingScream, async (req, res) => {
	const { screamDoc } = req;
	const screamId = req.params.screamId;

	try {
		const commentsDoc = await db
			.collection(commentsCollection)
			.orderBy('createdAt', 'desc')
			.where('screamId', '==', req.params.screamId)
			.get();

		const comments: ScreamComment[] = [];
		commentsDoc.forEach(commentDoc => comments.push(commentDoc.data() as ScreamComment));
		const { userHandle, body, createdAt } = screamDoc.data() as Scream;
		const screamData: ScreamData = { userHandle, body, createdAt, screamId, comments };
		res.json(screamData);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.code, message: err.toString() });
	}
});

//                               |*| POST NEW SCREAM |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /screams Create a new Scream Document
 * @apiName PostScream
 * @apiGroup Screams
 *
 * @apiUse AuthHeader
 *
 * @apiParam {String} body Mandatory scream body/content.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "body": "This is my scream!"
 *      }
 *
 * @apiSuccess (201 CREATED) {String} userHandle User's unique handle.
 * @apiSuccess (201 CREATED) {String} createdAt ISO String of scream creation.
 * @apiSuccess (201 CREATED) {String} body String's body/content.
 * @apiSuccess (201 CREATED) {Number} likeCount Number of likes the scream has.
 * @apiSuccess (201 CREATED) {Number} commentCount Number of comments the scream has.
 * @apiSuccess (201 CREATED) {String} userImage User's profile image URL.
 * @apiSuccess (201 CREATED) {String} screamId Scream's unique ID.
 *
 * @apiSuccessExample {json} Success-Response:
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
 * @apiUse BodyValidationError
 * @apiUse InternalServerError
 */
screamsRouter.post('/', authorization, validateScream, async (req, res) => {
	const newScream = req.scream;

	try {
		const screamDoc = await db.collection(screamCollection).add(newScream);
		res.status(201).json({ ...newScream, screamId: screamDoc.id });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.code, message: err.toString() });
	}
});

//                               |*| POST NEW COMMENT |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /screams/:screamId/comment Create a new comment
 * @apiName PostNewComment
 * @apiGroup Screams
 *
 * @apiUse AuthHeader
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
 * @apiSuccess (201 CREATED) {String} body Body/content of comment.
 * @apiSuccess (201 CREATED) {String} userImage User's profile image URL.
 * @apiSuccess (201 CREATED) {Number} likeCount Number of likes scream has.
 * @apiSuccess (201 CREATED) {Number} commentCount Number of comments a scream has.
 *
 * @apiSuccessExample {json} Success-Response:
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
 * @apiError (404 NOT FOUND) {String} error Scream not found
 *
 * @apiUse BodyValidationError
 * @apiUse InternalServerError
 */
screamsRouter.post(
	'/:screamId/comment',
	authorization,
	validateComment,
	isExistingScream,
	async (req, res) => {
		const newComment = req.comment;
		const { screamDoc } = req;
		const data = screamDoc.data() as Scream;
		try {
			await screamDoc.ref.update({ commentCount: (data.commentCount as number) + 1 });
			await db.collection(commentsCollection).add(newComment);
			res
				.status(201)
				.json({ ...newComment, commentCount: data.commentCount, likeCount: data.likeCount });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: err.code, message: err.toString() });
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
 * @apiUse AuthHeader
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
 * @apiError (404 NOT FOUND) {String} error Scream not found.
 *
 * @apiError (400 BAD REQUEST) {String} error Scream already liked.
 *
 * @apiUse InternalServerError
 */
screamsRouter.post('/:screamId/like', authorization, isExistingScream, async (req, res) => {
	const screamId = req.params.screamId;
	const userHandle = req.user.handle;
	const { screamDoc } = req;

	try {
		const screamDocPath = db.doc(`/screams/${screamId}`);
		const screamData: Scream = screamDoc.data() as Scream;

		const likeDoc = await db
			.collection(likesCollection)
			.where('userHandle', '==', userHandle)
			.where('screamId', '==', screamId)
			.limit(1)
			.get();
		if (likeDoc.empty) {
			await db.collection(likesCollection).add({ screamId, userHandle });
			screamData.likeCount = (screamData.likeCount as number) + 1;
			await screamDocPath.update({ likeCount: screamData.likeCount });
			res.status(201).json({ ...screamData, screamId });
		} else {
			res.status(400).json({ error: 'Scream already liked' });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.code, message: err.toString() });
	}
});

//                                 |*| UNLIKE A SCREAM |*|
// ====================================================================================|
//vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {DELETE} /screams/:screamId/unlike Delete a like from a Scream
 * @apiName DeleteScreamLike
 * @apiGroup Screams
 *
 * @apiUse AuthHeader
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
 * @apiError (404 NOT FOUND) {String} error Scream not found.
 *
 * @apiError (400 BAD REQUEST) {String} error Scream not liked.
 *
 * @apiUse InternalServerError
 */
screamsRouter.delete('/:screamId/unlike', authorization, isExistingScream, async (req, res) => {
	const screamId = req.params.screamId;
	const { screamDoc } = req;

	try {
		const screamDocPath = db.doc(`/screams/${screamId}`);
		const screamData: Scream = screamDoc.data() as Scream;
		const likeDoc = await db
			.collection(likesCollection)
			.where('userHandle', '==', req.user.handle)
			.where('screamId', '==', screamId)
			.limit(1)
			.get();

		if (!likeDoc.empty) {
			await db.doc(`/likes/${likeDoc.docs[0].id}`).delete();
			screamData.likeCount = (screamData.likeCount as number) - 1;
			await screamDocPath.update({ likeCount: screamData.likeCount });
			res.json({ ...screamData, screamId });
		} else {
			res.status(400).json({ error: 'Scream not liked' });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.code, message: err.toString() });
	}
});

//                                 |*| DELETE SCREAM |*|
// ====================================================================================|
//vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
screamsRouter.delete('/:screamId', authorization, isExistingScream, async (req, res) => {
	const { screamDoc } = req;
	const data = screamDoc.data() as Scream;
	try {
		if (data.userHandle !== req.user.handle) {
			res.status(403).json({ error: 'Unauthorized' });
		} else {
			const doc = db.doc(`/screams/${req.params.screamId}`);
			await doc.delete();
			res.json({ message: 'Scream deleted' });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.code, message: err.toString() });
	}
});

export { screamsRouter };

/*
			// CHECK IF THERE ARE LIKE DOCS ASSOCIATED WITH THIS SCREAM
			const likeDocs = await db
				.collection(likesCollection)
				.where('screamId', '==', req.params.screamId)
				.get();
			// DELETE ANY LIKE DOCS FOUND
			if (likeDocs.size > 0) {
				likeDocs.forEach(async likeDoc => {
					await likeDoc.ref.delete();
				});
			}
			// CHECK IF THERE ARE COMMENT DOCS ASSOCIATED WITH SCREAM
			const commentDocs = await db
				.collection(commentsCollection)
				.where('screamId', '==', req.params.screamId)
				.get();
			// DELETE ANY COMMENT DOCS FOUND
			if (commentDocs.size > 0) {
				commentDocs.forEach(async commentDoc => {
					await commentDoc.ref.delete();
				});
			}
*/
