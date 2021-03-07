import * as express from 'express';
import { db, screamCollection } from '../app';
import { validateScream } from '../middleware/screams.middleware';
import { authorization } from '../middleware/authorization.middleware';

const screamsRouter = express.Router();

/**
 * @api {get} /screams Get all Scream Documents
 * @apiName GetAllScreams
 * @apiGroup Screams
 *
 * @apiSuccess (200) {String} id ID of the document
 * @apiSuccess (200) {String} createdAt Timestamp string.
 * @apiSuccess (200) {String} body Scream body/content.
 * @apiSuccess (200) {String} userHandle Handle for scream's creator.
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
 * @apiSuccess (201) {String} message Document <code>doc.id</code> created.
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
