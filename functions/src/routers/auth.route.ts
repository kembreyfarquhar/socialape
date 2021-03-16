// IMPORT EXTERNAL PACKAGES
import * as express from 'express';

// IMPORT NEEDED VARIABLES FROM WITHIN REPO
import { firebase, db, firebaseConfig } from '../app';
import { ApiError } from '../errorService/apiError';
import { Errors } from '../errorService/auth.error';

// IMPORT MIDDLEWARE
import { validateNewUser, validateUserLogin } from '../middleware/users.middleware';

// IMPORT TYPES, DISABLE ESLINT TO AVOID ERRORS
// eslint-disable-next-line no-unused-vars
import { UserLogin, UserToInsert } from '../types/user';

const authRouter = express.Router();

//                                |*| REGISTER USER |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
authRouter.post('/register', validateNewUser, async (req, res, next) => {
	try {
		const newUser = req.newUser;
		const noImg = 'no-img.png';

		// CHECK FOR AN EXISTING USER W/ SAME HANDLE
		const existingUser = await db.doc(`/users/${newUser.handle}`).get();
		// IF USER EXISTS, THROW NEW APIERROR TO BE HANDLED
		if (existingUser.exists) {
			const { type, message, code, errors } = Errors.HANDLE_ALREADY_TAKEN;
			throw new ApiError(code as number, message as string, type as string, errors);
		} else {
			// ADD USER TO AUTHENTICATION
			const data = await firebase.default
				.auth()
				.createUserWithEmailAndPassword(newUser.email, newUser.password);
			// GATHER INFORMATION FROM CREATED USER
			const token = await data.user?.getIdToken();
			const userId = data.user?.uid;
			// CONSTRUCT OBJECT TO INSERT INTO USERS COLLECTION
			const userToInsert: UserToInsert = {
				userId: userId as string,
				email: newUser.email,
				handle: newUser.handle,
				createdAt: newUser.createdAt,
				imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
			};
			// ADD NEW USER TO COLLECTION
			await db.doc(`/users/${newUser.handle}`).set(userToInsert);
			res.status(201).json({ token });
		}
	} catch (err) {
		next(err);
	}
});

//                                  |*| LOGIN USER |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
authRouter.post('/login', validateUserLogin, async (req, res, next) => {
	try {
		const user: UserLogin = req.userLogin;
		// GRAB USER DATA VIA SIGN IN (EMAIL, PASSWORD)
		const data = await firebase.default
			.auth()
			.signInWithEmailAndPassword(user.email, user.password);
		// GET USER ID TOKEN TO SEND IN RESPONSE
		const token = await data.user?.getIdToken();
		res.json({ token });
	} catch (err) {
		next(err);
	}
});

export { authRouter };
