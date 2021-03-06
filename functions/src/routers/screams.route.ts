import * as express from 'express';
import { db, screamCollection } from '../app';
import { validateScream } from '../middleware/screams.middleware';

const screamsRouter = express.Router();

/**
 * @api {get} /screams Get all Scream Documents
 * @apiGroup Scream
 *
 * @apiSuccess (200) {FirebaseFirestore.DocumentData[]}
 * @apiError (500) {error string}
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
		res.status(500).json({ error: err.toString() });
	}
});

/**
 * @api {post} /screams Create a new Scream Document
 * @apiGroup Scream
 *
 * @apiSuccess (201) {success message containing doc.id}
 * @apiError (500) {error string}
 */
screamsRouter.post('/', validateScream, async (req, res) => {
	try {
		const newScream: Scream = {
			body: req.body.body,
			userHandle: req.body.userHandle,
			createdAt: new Date().toISOString(),
		};
		const doc = await db.collection(screamCollection).add(newScream);
		res.status(201).json(`Document "${doc.id}" created.`);
	} catch (err) {
		res.status(500).json({ error: err.toString() });
	}
});

export { screamsRouter };
