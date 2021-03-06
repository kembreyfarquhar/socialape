// eslint-disable-next-line no-unused-vars
import { RequestHandler } from 'express';
import { isEmpty } from '../utils/user.util';

export const validateScream: RequestHandler = (req, res, next) => {
	const { body } = req.body;
	const keys = Object.keys(req.body);

	if (!keys.length) {
		res.status(400).json('Must contain a json body');
	} else if (!body) {
		res.status(400).json('Must include scream body');
	} else if (typeof body !== 'string') {
		res.status(400).json('Body must be a string');
	} else if (isEmpty(body)) {
		res.status(400).json({ body: 'Must not be empty' });
	} else next();
};
