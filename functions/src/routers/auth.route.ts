import * as express from 'express';
import { firebase, db, firebaseConfig } from '../app';
import { validateNewUser, validateUserLogin } from '../middleware/users.middleware';
// eslint-disable-next-line no-unused-vars
import { User } from '../types/user.type';

const authRouter = express.Router();

//                                |*| REGISTER USER |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /auth/register Register new user.
 * @apiName RegusterUser
 * @apiGroup Users
 *
 * @apiParam {String} email Mandatory unique email.
 * @apiParam {String} password Mandatory password.
 * @apiParam {String} confirmPassword Mandatory field to match password.
 * @apiParam {String} handle Mandatory unique user handle.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "email": "myexample@email.com",
 *          "password": "verysecurepassword",
 *          "confirmPassword": "verysecurepassword",
 *          "handle": "myhandle"
 *      }
 *
 * @apiUse AuthSuccess
 *
 * @apiUse BodyValidationError
 * @apiError (400 BAD REQUEST) {String} handle This handle is already in use.
 * @apiError (400 BAD REQUEST) {String} email This email is already in use.
 * @apiUse InternalServerError
 */
authRouter.post('/register', validateNewUser, async (req, res) => {
	try {
		const newUser = req.newUser;
		const noImg = 'no-img.png';

		// CHECK FOR AN EXISTING USER W/ SAME HANDLE
		const existingUser = await db.doc(`/users/${newUser.handle}`).get();
		// IF USER EXISTS, STATUS 400
		if (existingUser.exists) {
			res.status(400).json({ handle: 'This handle is already in use' });
		} else {
			// ADD USER TO AUTHENTICATION
			const data = await firebase.default
				.auth()
				.createUserWithEmailAndPassword(newUser.email, newUser.password as string);
			// GATHER INFORMATION FROM CREATED USER
			const token = await data.user?.getIdToken();
			const userId = data.user?.uid;
			const userToInsert = { ...(newUser as Record<string, any>) };
			delete userToInsert.password;
			delete userToInsert.confirmPassword;
			// CONSTRUCT OBJECT TO INSERT INTO USERS COLLECTION
			const userCredentials = {
				userId,
				...userToInsert,
				createdAt: new Date().toISOString(),
				imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
			};
			// ADD NEW USER TO COLLECTION
			await db.doc(`/users/${newUser.handle}`).set(userCredentials);
			res.status(201).json({ token });
		}
	} catch (err) {
		if (err.code === 'auth/email-already-in-use') {
			res.status(400).json({ email: 'Email is already in use' });
		} else res.status(500).json({ error: err.code, message: err.toString() });
	}
});

//                                  |*| LOGIN USER |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /auth/login Login existing user.
 * @apiName LoginUser
 * @apiGroup Users
 *
 * @apiParam {String} email Mandatory email.
 * @apiParam {String} password Mandatory password.
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "email": "myexample@email.com",
 *          "password": "verysecurepassword"
 *      }
 *
 * @apiUse AuthSuccess
 *
 * @apiUse BodyValidationError
 * @apiError (403 FORBIDDEN) {String} general Wrong credentials.
 * @apiUse InternalServerError
 */
authRouter.post('/login', validateUserLogin, async (req, res) => {
	try {
		const user: Partial<User> = {
			email: req.body.email,
			password: req.body.password,
		};

		const data = await firebase.default
			.auth()
			.signInWithEmailAndPassword(user.email as string, user.password as string);
		const token = await data.user?.getIdToken();
		res.json({ token });
	} catch (err) {
		if (err.code === 'auth/wrong-password') {
			res.status(403).json({ general: 'Wrong credentials' });
		} else res.status(500).json({ error: err.code, message: err.toString() });
	}
});

export { authRouter };
