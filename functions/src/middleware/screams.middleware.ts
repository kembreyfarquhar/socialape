// IMPORT EXTERNAL PACKAGES
import * as Yup from 'yup';

// IMPORT NEEDED VARIABLES FROM WITHIN REPO
import { db } from '../app';
import { ScreamErrors } from '../errorService/scream.error';
import { ApiError } from '../errorService/apiError';

// IMPORT TYPES, DISABLE ESLINT TO AVOID ERRORS
// eslint-disable-next-line no-unused-vars
import { RequestHandler } from 'express';
// eslint-disable-next-line no-unused-vars
import { DBScream } from '../types/scream';

// SCREAM BODY SCHEMA
function screamSchema() {
	return Yup.object().shape({
		body: Yup.string().strict(false).trim().required(),
	});
}

// VALIDATE REQUEST BODY WITH SCREAM SCHEMA RULES
// SEND VALIDATED VALUES VIA REQ.SCREAM OR CATCH ERR
export const validateScream: RequestHandler = async (req, _res, next) => {
	try {
		const screamToCheck = { body: req.body.body };
		// CAPTURE VALIDATED REQUEST BODY
		const result = await screamSchema().validate(screamToCheck, { abortEarly: false });
		const body = result.body,
			commentCount = 0,
			likeCount = 0,
			createdAt = new Date().toISOString(),
			userHandle = req.user.handle,
			userImage = req.user.imageUrl;
		// CONSTRUCT NEWSCREAM OBJECT THAT FITS NEWSCREAM TYPE TO SEND VIA REQ.SCREAM
		const newScream: DBScream = { body, userHandle, userImage, createdAt, commentCount, likeCount };
		req.scream = newScream;
		next();
	} catch (err) {
		next(err);
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
		} else if (!body) {
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

// CHECK IF SCREAM EXISTS MIDDLEWARE
export const isExistingScream: RequestHandler = async (req, _res, next) => {
	try {
		// GRAB SCREAM DOC USING SCREAMID
		const doc = await db.doc(`/screams/${req.params.screamId}`).get();
		if (doc.exists) {
			// SEND DOC VIA REQ.SCREAMDOC
			req.screamDoc = doc;
			next();
		} else {
			// THROW ERROR TO BE HANDLED IF SCREAM DOESN'T EXIST
			const error = ScreamErrors.SCREAM_DOESNT_EXIST;
			next(new ApiError(error.code, error.message, error.type));
		}
	} catch (err) {
		next(err);
	}
};
