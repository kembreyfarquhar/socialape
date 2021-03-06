// eslint-disable-next-line no-unused-vars
import { RequestHandler } from 'express';

export const validateScream: RequestHandler = (req, res, next) => {
	const { body, userHandle } = req.body;
	const keys = Object.keys(req.body);

	if (!keys.length) {
		res.status(400).json('must contain a json body');
	} else if (!body || !userHandle) {
		res.status(400).json('must include scream body and userHandle');
	} else if (typeof body !== 'string' || typeof userHandle !== 'string') {
		res.status(400).json('body and userHandle must be strings');
	} else next();
};
