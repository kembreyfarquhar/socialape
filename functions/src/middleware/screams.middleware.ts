// eslint-disable-next-line no-unused-vars
import { RequestHandler } from 'express';
// eslint-disable-next-line no-unused-vars
import { Scream } from '../types/scream.type';
import { isEmpty } from '../utils/user.util';
import { db } from '../app';

export const validateScream: RequestHandler = (req, res, next) => {
	const { body } = req.body;
	const keys = Object.keys(req.body);

	if (!keys.length) {
		res.status(400).json({ body: 'Must contain a json body' });
	} else if (!body) {
		res.status(400).json({ body: 'Must include scream body' });
	} else {
		if (typeof body !== 'string') {
			res.status(400).json({ body: 'Body must be a string' });
		} else if (isEmpty(body)) {
			res.status(400).json({ body: 'Must not be empty' });
		} else {
			const userHandle = req.user.handle,
				createdAt = new Date().toISOString(),
				userImage = req.user.imageUrl,
				likeCount = 0,
				commentCount = 0;
			const newScream: Scream = { userHandle, createdAt, body, likeCount, commentCount, userImage };
			req.scream = newScream;
			next();
		}
	}
};

export const validateComment: RequestHandler = (req, res, next) => {
	const { body } = req.body;
	const keys = Object.keys(req.body);

	if (!keys.length) {
		res.status(400).json({ body: 'Must contain a json body' });
	} else if (!body) {
		res.status(400).json({ body: 'Must include comment body' });
	} else {
		if (typeof body !== 'string') {
			res.status(400).json({ body: 'Body must be a string' });
		} else if (isEmpty(body)) {
			res.status(400).json({ body: 'Must not be empty' });
		} else {
			const userHandle = req.user.handle,
				screamId = req.params.screamId,
				createdAt = new Date().toISOString(),
				userImage = req.user.imageUrl;
			const newComment = { userHandle, screamId, createdAt, body, userImage };
			req.comment = newComment;
			next();
		}
	}
};

export const isExistingScream: RequestHandler = async (req, res, next) => {
	try {
		const doc = await db.doc(`/screams/${req.params.screamId}`).get();
		if (doc.exists) {
			req.screamDoc = doc;
			next();
		} else {
			res.status(404).json({ error: 'Scream not found' });
		}
	} catch (err) {
		res.status(500).json({ error: err.code, message: err.toString() });
	}
};
