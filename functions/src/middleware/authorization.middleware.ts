// IMPORT NEEDED VARIABLES FROM WITHIN REPO
import { admin, db, usersCollection } from '../app';
import { ApiError } from '../errorService/apiError';
import { Errors } from '../errorService/auth.error';

// IMPORT TYPES, DISABLE ESLINT TO AVOID ERRORS
// eslint-disable-next-line no-unused-vars
import { RequestHandler } from 'express';
// eslint-disable-next-line no-unused-vars
import { ApiErrorType } from '../types/apiError';

// VALIDATE TOKEN MIDDLEWARE (FOR AUTHORIZATION ENDPOINTS)
export const authorization: RequestHandler = async (req, _res, next) => {
	// GRAB TOKEN FROM AUTHORIZATION HEADER
	const token = req.headers.authorization;
	if (!token) {
		const error: ApiErrorType = Errors.NO_TOKEN;
		next(new ApiError(error.code, error.message, error.type, error.errors));
	}

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
		const errors = [];
		if (typeof err.code === 'string') errors.push(err.code);
		else errors.push(err.message);

		const error: ApiErrorType = Errors.TOKEN_VERIFY_FAILURE;
		next(new ApiError(error.code, error.message, error.type, errors));
	}
};
