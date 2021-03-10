// eslint-disable-next-line no-unused-vars
import { RequestHandler } from 'express';
import { admin, db, usersCollection } from '../app';

export const authorization: RequestHandler = async (req, res, next) => {
	// GRAB TOKEN FROM AUTHORIZATION HEADER
	const token = req.headers.authorization;
	if (!token) res.status(403).json({ error: 'Unauthorized, please provide a token' });

	try {
		// DECODE THE TOKEN
		const decodedToken = await admin.auth().verifyIdToken(token as string);
		req.user = decodedToken;

		// GET USER DATA FROM DECODED TOKEN
		const data = await db
			.collection(usersCollection)
			.where('userId', '==', req.user.uid)
			.limit(1)
			.get();
		// SET THE USER HANDLE INSIDE REQ.USER
		req.user.handle = data.docs[0].data().handle;
		req.user.imageUrl = data.docs[0].data().imageUrl;
		next();
	} catch (err) {
		// SEND BACK ERROR FOR FAILED AUTHORIZATION
		console.error('Error while verifying token', err);
		res.status(401).json(err);
	}
};
