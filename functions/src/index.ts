// IMPORT EXTERNAL PACKAGES
import * as functions from 'firebase-functions';

// IMPORT NEEDED VARIABLES FROM WITHIN REPO
import {
	app,
	commentsCollection,
	db,
	likesCollection,
	region,
	notificationCollection,
	screamCollection,
} from './app';

// IMPORT TYPES, DISABLE ESLINT TO AVOID ERRORS
// eslint-disable-next-line no-unused-vars
import { ScreamComment } from './types/comment';
// // eslint-disable-next-line no-unused-vars
import { UserNotification } from './types/notification';
// // eslint-disable-next-line no-unused-vars
import { Scream } from './types/scream';

// ====== EXPORT FIREBASE FUNCTION RESPONSIBLE FOR RESTFUL API ======== //
export const api = functions.region(region).https.onRequest(app);

// ========== DATABASE TRIGGERS =========== //

// Creates a Notification when a User's Scream is Liked
export const createNotificationOnLike = functions
	.region(region)
	.firestore.document('likes/{id}')
	.onCreate(async snapshot => {
		try {
			// GET SCREAM DOC AND SCREAM DOC DATA
			const screamDoc = await db.doc(`/screams/${snapshot.data().screamId}`).get();
			const screamData = screamDoc.data() as Scream;
			// CHECK IF IT EXISTS AND THE HANDLE DIFFERS FROM THE SNAPSHOT (NO NOTIFICATION FOR LIKING YOUR OWN SCREAM)
			if (screamDoc.exists && screamData.userHandle !== snapshot.data().userHandle) {
				// CREATE USERNOTIFICATION OBJECT TO BE SET
				const notification: UserNotification = {
					createdAt: new Date().toISOString(),
					recipient: screamData.userHandle,
					sender: snapshot.data().userHandle,
					type: 'like',
					read: false,
					screamId: screamDoc.id,
				};
				// RETURN PROMISE TO SET NOTIFICATION OBJECT
				return db.doc(`/notifications/${snapshot.id}`).set(notification);
			} else return null;
		} catch (err) {
			console.error(err);
			return null;
		}
	});

// Deletes a Notification when a User's Scream is Unliked
export const deleteNotificationOnUnlike = functions
	.region(region)
	.firestore.document('likes/{id}')
	.onDelete(snapshot => {
		// RETURN PROMISE TO DELETE NOTIFICATION
		return db
			.doc(`/notifications/${snapshot.id}`)
			.delete()
			.catch(err => {
				console.error(err);
				return;
			});
	});

// Creates a Notification when a User's Scream receives a comment
export const createNotificationOnComment = functions
	.region(region)
	.firestore.document('comments/{id}')
	.onCreate(async snapshot => {
		try {
			// GET COMMENT DATA, SCREAM DOC, AND SCREAM DOC DATA
			const commentData = snapshot.data() as ScreamComment;
			const screamDoc = await db.doc(`/screams/${commentData.screamId}`).get();
			const screamData = screamDoc.data() as Scream;
			// CHECK IF SCREAM EXISTS AND SNAPSHOT USER HANDLE DIFFERS FROM SCREAMDATA USERHANDLE
			// (NO NOTIFICATION FOR COMMENTING ON YOUR OWN POST)
			if (screamDoc.exists && commentData.userHandle !== screamData.userHandle) {
				// CREATE USERNOTIFICATION OBJECT TO BE SET
				const notification: UserNotification = {
					createdAt: new Date().toISOString(),
					recipient: screamData.userHandle,
					sender: commentData.userHandle,
					type: 'comment',
					read: false,
					screamId: screamDoc.id,
				};
				// RETURN PROMISE TO SET USERNOTIFICATION OBJECT
				return db.doc(`/notifications/${snapshot.id}`).set(notification);
			} else return null;
		} catch (err) {
			console.error(err);
			return null;
		}
	});

// Updates imageUrl in Scream and Comment when User changes Profile Photo
export const onUserImageChange = functions
	.region(region)
	.firestore.document('/users/{userId}')
	.onUpdate(async change => {
		// DECLARE BEFORE AND AFTER CHANGE VARIABLES
		const changeBefore = change.before.data();
		const changeAfter = change.after.data();
		// IF BEFORE AND AFTER ARE DIFFERENT, RUN CODE
		if (changeBefore.imageUrl !== changeAfter.imageUrl) {
			// CREATE A DB BATCH
			const batch = db.batch();
			// GET SCREAM DOCUMENTS ASSOCIATED WITH USER HANDLE
			const screamDocs = await db
				.collection(screamCollection)
				.where('userHandle', '==', changeBefore.handle)
				.get();
			// LOOP THROUGH SCREAMS AND UPDATE USERIMAGE TO CHANGE AFTER
			screamDocs.forEach(screamDoc => {
				const scream = db.doc(`/screams/${screamDoc.id}`);
				batch.update(scream, { userImage: changeAfter.imageUrl });
			});
			// GET COMMENT DOCUMENTS ASSOCIATED WITH USER HANDLE
			const commentDocs = await db
				.collection(commentsCollection)
				.where('userHandle', '==', changeBefore.handle)
				.get();
			// LOOP THROUGH COMMENTS AND UPDATE USERIMAGE TO CHANGE AFTER
			commentDocs.forEach(commentDoc => {
				const comment = db.doc(`/comments/${commentDoc.id}`);
				batch.update(comment, { userImage: changeAfter.imageUrl });
			});
			// RETURN PROMISE TO COMMIT CHANGES TO BATCH
			return batch.commit();
		} else return null;
	});

// Deletes Comments, Likes, and Notifications associated with a Scream when it is deleted
export const onScreamDelete = functions
	.region(region)
	.firestore.document('/screams/{screamId}')
	.onDelete(async (_snapshot, context) => {
		const screamId = context.params.screamId;
		// CREATE A DB BATCH
		const batch = db.batch();
		try {
			// GET COMMENT DOCUMENTS ASSOCIATED WITH SCREAMID
			const commentDocs = await db
				.collection(commentsCollection)
				.where('screamId', '==', screamId)
				.get();
			// GET LIKE DOCUMENTS ASSOCIATED WITH SCREAMID
			const likeDocs = await db.collection(likesCollection).where('screamId', '==', screamId).get();
			// GET NOTIFICATION DOCUMENTS ASSOCIATED WITH SCREAMID
			const notificationDocs = await db
				.collection(notificationCollection)
				.where('screamId', '==', screamId)
				.get();
			// LOOP THROUGH EACH ONE AND DELETE FROM BATCH
			commentDocs.forEach(commentDoc => {
				batch.delete(db.doc(`/comments/${commentDoc.id}`));
			});
			likeDocs.forEach(likeDoc => {
				batch.delete(db.doc(`/likes/${likeDoc.id}`));
			});
			notificationDocs.forEach(notificationDoc => {
				batch.delete(db.doc(`/notifications/${notificationDoc.id}`));
			});
			// RETURN PROMISE TO COMMIT CHANGES TO BATCH
			return batch.commit();
		} catch (err) {
			console.error(err);
			return null;
		}
	});
