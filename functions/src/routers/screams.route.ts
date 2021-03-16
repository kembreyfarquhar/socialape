// IMPORT EXTERNAL PACKAGES
import * as express from 'express';

// IMPORT NEEDED VARIABLES FROM WITHIN REPO
import { commentsCollection, db, likesCollection, screamCollection } from '../app';
import { ScreamErrors } from '../errorService/scream.error';
import { ApiError } from '../errorService/apiError';

// IMPORT MIDDLEWARE
import {
	validateScream,
	validateComment,
	isExistingScream,
} from '../middleware/screams.middleware';
import { authorization } from '../middleware/authorization.middleware';

// IMPORT TYPES, DISABLE ESLINT TO AVOID ERRORS
// eslint-disable-next-line no-unused-vars
import { DBScream, ScreamData, ScreamObject } from '../types/scream';
// eslint-disable-next-line no-unused-vars
import { ScreamComment, ScreamCommentData } from '../types/comment';

const screamsRouter = express.Router();

//                              |*| GET ALL SCREAMS |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
screamsRouter.get('/', async (_, res, next) => {
	try {
		// GRAB ALL SCREAM DOCUMENTS FROM COLLECTION
		const screamDocs = await db.collection(screamCollection).orderBy('createdAt', 'desc').get();
		// CREATE ARRAY TO FILL WITH SCREAM OBJECTS
		const screams: ScreamObject[] = [];
		// LOOP THROUGH DOCUMENTS AND TYPE CAST DATA TO PUSH INTO SCREAMS ARRAY
		screamDocs.forEach(screamDoc => {
			const screamData = screamDoc.data() as Omit<ScreamObject, 'id'>;
			screams.push({ id: screamDoc.id, ...screamData });
		});
		// SEND BACK SCREAMS ARRAY
		res.json(screams);
	} catch (err) {
		next(err);
	}
});

//                            |*| GET SCREAM BY ID |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
screamsRouter.get('/:screamId', isExistingScream, async (req, res, next) => {
	try {
		const { screamDoc } = req;
		const screamId = req.params.screamId;
		// GRAB COMMENT DOCUMENTS  ASSOCIATED WITH SCREAM
		const commentsDoc = await db
			.collection(commentsCollection)
			.orderBy('createdAt', 'desc')
			.where('screamId', '==', screamId)
			.get();
		// CREATE ARRAY TO ADD SCREAM COMMENTS TO
		const comments: ScreamComment[] = [];
		// LOOP THROUGH AND TYPE CAST DOC DATA AS SCREAM COMMENT TO PUSH TO CREATED ARRAY
		commentsDoc.forEach(commentDoc => comments.push(commentDoc.data() as ScreamComment));
		// TYPE CAST DESCTRUCTURED DOC DATA AS SCREAM DATA
		const { userHandle, body, createdAt } = screamDoc.data() as ScreamData;
		// TYPE CAST NECESSARY PROPERTIES INSIDE OBJECT AS SCREAM COMMENT DATA TO SEND BACK IN RESPONSE
		const screamData: ScreamCommentData = { userHandle, body, createdAt, screamId, comments };
		res.json(screamData);
	} catch (err) {
		next(err);
	}
});

//                               |*| POST NEW SCREAM |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
screamsRouter.post('/', authorization, validateScream, async (req, res, next) => {
	try {
		const newScream = req.scream;
		// ADD NEW SCREAM TO COLLECTION
		const screamDoc = await db.collection(screamCollection).add(newScream);
		// SEND BACK SCREAM INFO PLUS SCREAM ID
		res.status(201).json({ ...newScream, screamId: screamDoc.id });
	} catch (err) {
		next(err);
	}
});

//                               |*| POST NEW COMMENT |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
screamsRouter.post(
	'/:screamId/comment',
	authorization,
	validateComment,
	isExistingScream,
	async (req, res, next) => {
		try {
			const newComment = req.comment;
			const { screamDoc } = req;
			// TYPE CASE DATA AS DBSCREAM
			const data = screamDoc.data() as DBScream;
			// INCREASE THE COMMENTCOUNT FOR SCREAM DOCUMENT
			await screamDoc.ref.update({ commentCount: data.commentCount + 1 });
			// ADD NEW COMMENT TO COMMENTS COLLECTION
			await db.collection(commentsCollection).add(newComment);
			// SEND RESPONSE WITH UPDATED NEW COMMENT DATA, COMMENTCOUNT, AND LIKECOUNT
			res
				.status(201)
				.json({ ...newComment, commentCount: data.commentCount + 1, likeCount: data.likeCount });
		} catch (err) {
			next(err);
		}
	}
);

//                                 |*| LIKE A SCREAM |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
screamsRouter.post('/:screamId/like', authorization, isExistingScream, async (req, res, next) => {
	try {
		const screamId = req.params.screamId;
		const userHandle = req.user.handle;
		const { screamDoc } = req;
		const screamDocPath = db.doc(`/screams/${screamId}`);
		// TYPE CAST SCREAM DATA AS DBSCREAM
		const screamData: DBScream = screamDoc.data() as DBScream;

		const likeDoc = await db
			.collection(likesCollection)
			.where('userHandle', '==', userHandle)
			.where('screamId', '==', screamId)
			.limit(1)
			.get();
		if (likeDoc.empty) {
			// ADD DOCUMENT TO LIKES COLLECTION FOR USER AND SCREAM
			await db.collection(likesCollection).add({ screamId, userHandle });
			// INCREASE LIKECOUNT FOR SCREAM DOCUMENT
			screamData.likeCount = screamData.likeCount + 1;
			await screamDocPath.update({ likeCount: screamData.likeCount });
			// SEND RESPONSE WITH UPDATED SCREAMDATA AND SCREAMID
			res.status(201).json({ ...screamData, screamId });
		} else {
			// LIKE DOCUMENT FOUND FOR USER AND SCREAM, SEND ERROR
			const error = ScreamErrors.SCREAM_ALREADY_LIKED;
			next(new ApiError(error.code, error.message, error.type));
		}
	} catch (err) {
		next(err);
	}
});

//                                 |*| UNLIKE A SCREAM |*|
// ====================================================================================|
//vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
screamsRouter.delete(
	'/:screamId/unlike',
	authorization,
	isExistingScream,
	async (req, res, next) => {
		try {
			const screamId = req.params.screamId;
			const { screamDoc } = req;
			const screamDocPath = db.doc(`/screams/${screamId}`);
			// TYPE CAST SCREAM DOCUMENT DATA AS DBSCREAM
			const screamData: DBScream = screamDoc.data() as DBScream;
			const likeDoc = await db
				.collection(likesCollection)
				.where('userHandle', '==', req.user.handle)
				.where('screamId', '==', screamId)
				.limit(1)
				.get();

			if (!likeDoc.empty) {
				// DELETE LIKE FROM LIKES COLLECTION
				await db.doc(`/likes/${likeDoc.docs[0].id}`).delete();
				// REDUCE LIKECOUNT FOR SCREAM DOCUMENT
				screamData.likeCount = screamData.likeCount - 1;
				await screamDocPath.update({ likeCount: screamData.likeCount });
				// SEND RESPONSE WITH UPDTATED SCREAMDATA AND SCREAMID
				res.json({ ...screamData, screamId });
			} else {
				// NO LIKE FOUND FOR SCREAM DOC, SEND ERROR
				const error = ScreamErrors.SCREAM_NOT_LIKED;
				next(new ApiError(error.code, error.message, error.type));
			}
		} catch (err) {
			next(err);
		}
	}
);

//                                 |*| DELETE SCREAM |*|
// ====================================================================================|
//vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
screamsRouter.delete('/:screamId', authorization, isExistingScream, async (req, res, next) => {
	try {
		const { screamDoc } = req;
		// GRAB DBSCREAM FROM DOC DATA
		const data = screamDoc.data() as DBScream;
		// IF DATA USER HANDLE DOESN'T EQUAL REQUEST USER HANDLE, UNAUTHORIZED
		if (data.userHandle !== req.user.handle) {
			const error = ScreamErrors.UNAUTHORIZED_USER;
			next(new ApiError(error.code, error.message, error.type));
		} else {
			// GRAB SCREAM DOC AND DELETE
			const doc = db.doc(`/screams/${req.params.screamId}`);
			await doc.delete();
			res.json({ message: 'Scream deleted' });
		}
	} catch (err) {
		next(err);
	}
});

export { screamsRouter };
