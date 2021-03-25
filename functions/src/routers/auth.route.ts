// IMPORT EXTERNAL PACKAGES
import * as express from 'express';

// IMPORT NEEDED VARIABLES FROM WITHIN REPO
import { firebase, db, firebaseConfig } from '../app';
import { ApiError } from '../errorService/apiError';
import { Errors } from '../errorService/auth.error';
import { UserErrors } from '../errorService/user.error';

// IMPORT MIDDLEWARE
import { validateNewUser, validateUserLogin } from '../middleware/users.middleware';

// IMPORT TYPES, DISABLE ESLINT TO AVOID ERRORS
// eslint-disable-next-line no-unused-vars
import { UserLogin, UserToInsert } from '../types/user';
// eslint-disable-next-line no-unused-vars
import { ApiErrorType } from '../types/apiError';

const authRouter = express.Router();

//                                |*| REGISTER USER |*|
// ====================================================================================|
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv|
/**
 * @api {post} /auth/register Register new user
 * @apiName RegisterUser
 * @apiGroup Users
 *
 * @apiParam {String} email Mandatory unique email.
 * @apiParam {String} password Mandatory password, must be at least 8 characters long.
 * @apiParam {String} confirmPassword Mandatory field, must match password.
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
 * @apiSuccess (201 CREATED) {String} token Firebase authorization token.
 *
 * @apiSuccessExample {json} Success-Response:
 * 		HTTP/1.1 201 CREATED
 *      {
 *          "token": "nf8urn2802nf2309j2fmgn2209j3rfsdfasgadfghsdfadfgn30f29hjf2n30f2n30jf"
 *      }
 *
 * @apiUse ApiErrorBadRequest
 *
 * @apiErrorExample {json} Missing-Fields-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "VALIDATION",
 * 			"message": "4 errors occurred",
 * 			"errors": [
 * 				"email is a required field",
 * 				"handle is a required field",
 * 				"password is a required field",
 * 				"confirmPassword is a required field"
 * 			]
 * 		}
 *
 * @apiErrorExample {json} Handle-Taken-Error-Response:
 * 		HTTP/1.1 400 Bad Request
 * 		{
 * 			"error_type": "AUTHENTICATION",
 * 			"message": "This handle is already in use by another account."
 * 		}
 *
 * @apiErrorExample {json} Email-Taken-Error-Response:
 * 		HTTP/1.1 400 Bad Request
 * 		{
 * 			"error_type": "AUTHENTICATION",
 * 			"message": "This email address is already in use by another account.",
 * 			"errors": [
 * 				"auth/email-already-in-use"
 * 			]
 * 		}
 *
 * @apiErrorExample {json} Password-Length-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "VALIDATION",
 * 			"message": "Password must be at least 8 characters long",
 * 			"errors": [
 *   			"Password must be at least 8 characters long"
 * 			]
 * 		}
 *
 * @apiErrorExample {json} Passwords-Don't-Match-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "VALIDATION",
 * 			"message": "Passwords must match",
 * 			"errors": [
 *   			"Passwords must match"
 * 			]
 * 		}
 *
 * @apiErrorExample {json} Email-Not-Valid-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "VALIDATION",
 * 			"message": "email must be a valid email",
 * 			"errors": [
 * 			  "email must be a valid email"
 * 			]
 * 		}
 */
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
/**
 * @api {post} /auth/login Login existing user
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
 * @apiSuccessExample {json} Success-Response:
 * 		HTTP/1.1 200 OK
 *      {
 *          "token": "nf8urn2802nOIJIINPINDj2fmgn2209j3rfsdfasgadfghsdfadfgn30f29hjf2n30f2n30jf"
 *      }
 *
 * @apiUse ApiErrorBadRequest
 *
 * @apiErrorExample {json} Missing-Fields-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "VALIDATION",
 * 			"message": "2 errors occurred",
 * 			"errors": [
 * 				"email is a required field",
 * 				"password is a required field"
 * 			]
 * 		}
 *
 * @apiErrorExample {json} Wrong-Password-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "AUTHENTICATION",
 * 			"message": "The password is invalid or the user does not have a password.",
 * 			"errors": [
 *   			"auth/wrong-password"
 * 			]
 * 		}
 *
 * @apiErrorExample {json} Email-Not-Valid-Error-Response:
 * 		HTTP/1.1 400 BAD REQUEST
 * 		{
 * 			"error_type": "VALIDATION",
 * 			"message": "email must be a valid email",
 * 			"errors": [
 * 		  		"email must be a valid email"
 * 			]
 * 		}
 *
 * @apiUse ApiErrorNotFound
 *
 * @apiErrorExample {json} User-Not-Found-Error-Response:
 * 		HTTP/1.1 404 NOT FOUND
 * 		{
 * 			"error_type": "NETWORK",
 * 			"message": "There is no user record corresponding to this identifier. The user may have been deleted.",
 * 			"errors": [
 * 		  		"auth/user-not-found"
 * 			]
 * 		}
 */
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
		if (typeof err.code === 'string' && err.code.includes('not-found')) {
			const error: ApiErrorType = UserErrors.USER_DOESNT_EXIST;
			next(new ApiError(error.code, error.message, error.type, error.errors));
		} else {
			next(err);
		}
	}
});

export { authRouter };
