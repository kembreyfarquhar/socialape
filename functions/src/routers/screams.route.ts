import * as express from 'express';
import { commentsCollection, db, screamCollection } from '../app';
import { validateScream } from '../middleware/screams.middleware';
import { authorization } from '../middleware/authorization.middleware';

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
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "id": "KJHndjhDKJhdnDHjd",
 *          "createdAt": "2021-03-06T16:04:36.298Z",
 *          "body": "This is a scream!",
 *          "userHandle": "exampleuser"
 *      }
 *
 * @apiUse InternalServerError
 *
 */
screamsRouter.get('/', async (_, res) => {
	try {
		const data = await db.collection(screamCollection).orderBy('createdAt', 'desc').get();
		const screams: FirebaseFirestore.DocumentData[] = [];
		data.forEach(doc => {
			screams.push({
				id: doc.id,
				...doc.data(),
			});
		});
		res.json(screams);
	} catch (err) {
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
 * @apiQuery {String} screamId Scream's unique ID.
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
 *		      		"screamId": "DThsMg40sdofjsd8j",
 *		      		"body": "nice scream, dude!"
 *		    	}
 *		  	]
 *		}
 *
 * @apiError (404 NOT FOUND) {String} error Scream not found.
 * @apiUse InternalServerError
 */
screamsRouter.get('/:screamId', async (req, res) => {
	let screamData: ScreamData = {};

	try {
		const doc = await db.doc(`/screams/${req.params.screamId}`).get();

		if (!doc.exists) {
			res.status(404).json({ error: 'Scream not found' });
		} else {
			const data = doc.data() as FirebaseFirestore.DocumentData;
			screamData.userHandle = data['userHandle'];
			screamData.body = data['body'];
			screamData.createdAt = data['createdAt'];
			screamData.screamId = doc.id;

			const commentsData = await db
				.collection(commentsCollection)
				.where('screamId', '==', req.params.screamId)
				.get();

			const comments: FirebaseFirestore.DocumentData[] = [];
			commentsData.forEach(doc => comments.push(doc.data()));
			screamData.comments = comments;

			res.json(screamData);
		}
	} catch (err) {
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
 * @apiSuccess (201 CREATED) {String} message Document <code>doc.id</code> created.
 *
 * @apiUse BodyValidationError
 * @apiUse InternalServerError
 */
screamsRouter.post('/', validateScream, authorization, async (req, res) => {
	try {
		const newScream: Scream = {
			body: req.body.body,
			userHandle: req.user.handle,
			createdAt: new Date().toISOString(),
		};
		const doc = await db.collection(screamCollection).add(newScream);
		res.status(201).json({ message: `Document "${doc.id}" created.` });
	} catch (err) {
		res.status(500).json({ error: err.code, message: err.toString() });
	}
});

export { screamsRouter };
