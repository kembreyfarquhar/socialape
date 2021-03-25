// IMPORT EXTERNAL PACKAGES
import * as Yup from 'yup';

// IMPORT TYPES, DISABLE ESLINT TO AVOID ERRORS
// eslint-disable-next-line no-unused-vars
import { RequestHandler } from 'express';
// eslint-disable-next-line no-unused-vars
import { UserDetails, UserLogin, UserRegister } from '../types/user';
import { UserErrors } from '../errorService/user.error';
import { ApiError } from '../errorService/apiError';

// USER REGISTRATION BODY SCHEMA
function userRegistrationSchema() {
	return Yup.object().shape({
		email: Yup.string().strict(false).trim().email().required(),
		handle: Yup.string().strict(false).trim().required(),
		password: Yup.string()
			.strict(false)
			.trim()
			.min(8, 'Password must be at least 8 characters long')
			.required(),
		confirmPassword: Yup.string()
			.strict(false)
			.trim()
			.oneOf([Yup.ref('password'), null], 'Passwords must match')
			.required(),
	});
}

// VALIDATE REQUEST BODY WITH REGISTRATION SCHEMA RULES
// SEND VALIDATED VALUES VIA REQ.NEWUSER OR CATCH ERR
export const validateNewUser: RequestHandler = async (req, _res, next) => {
	try {
		const { email, password, confirmPassword, handle } = req.body;
		const userToCheck = { email, password, confirmPassword, handle };
		// CAPTURE VALIDATED REQUEST BODY
		const result = await userRegistrationSchema().validate(userToCheck, { abortEarly: false });
		// CONSTRUCT NEWUSER OBJECT THAT FITS USERREGISTER TYPE TO SEND VIA REQ.NEWUSER
		const newUser: UserRegister = { ...result, createdAt: new Date().toISOString() };
		req.newUser = newUser;
		next();
	} catch (err) {
		next(err);
	}
};

// USER LOGIN BODY SCHEMA
function userLoginSchema() {
	return Yup.object().shape({
		email: Yup.string().strict(false).trim().email().required(),
		password: Yup.string().strict(false).trim().required(),
	});
}

// VALIDATE REQUEST BODY WITH LOGIN SCHEMA RULES
// SEND VALIDATED VALUES VIA REQ.USERLOGIN OR CATCH ERR
export const validateUserLogin: RequestHandler = async (req, _res, next) => {
	try {
		const { email, password } = req.body;
		const userToCheck = { email, password };
		// CAPTURE VALIDATED REQUEST BODY
		const result = await userLoginSchema().validate(userToCheck, { abortEarly: false });
		// ENSURE THAT RESULT FITS THE USERLOGIN TYPE TO SEND VIA REQ.USERLOGIN
		const userLogin: UserLogin = result;
		req.userLogin = userLogin;
		next();
	} catch (err) {
		next(err);
	}
};

// USER DETAILS BODY SCHEMA
// ALL FIELDS OPTIONAL, USER MAY REMOVE TEXT FROM FIELD IF THEY WANT
function userDetailsSchema() {
	return Yup.object().shape({
		bio: Yup.string().strict(false).trim().notRequired(),
		website: Yup.string().strict(false).trim().url().notRequired(),
		location: Yup.string().strict(false).trim().notRequired(),
	});
}

// VALIDATE REQUEST BODY WITH USER DETAILS SCHEMA RULES
export const validateUserDetails: RequestHandler = async (req, _res, next) => {
	try {
		const { bio, website, location } = req.body;
		if (!bio && !website && !location) {
			const error = UserErrors.NO_USER_DETAILS;
			next(new ApiError(error.code, error.message, error.type));
			return;
		}
		const userDetailsToCheck = { bio, website, location };
		// CAPTURE VALIDATED REQUEST BODY
		const result = await userDetailsSchema().validate(userDetailsToCheck, { abortEarly: false });
		// ENSURE THAT RESULT FITS THE USERDETAILS TYPE TO SEND VIA REQ.USERDETAILS
		const userDetails: Partial<UserDetails> = result;
		req.userDetails = userDetails;
		next();
	} catch (err) {
		next(err);
	}
};
