// IMPORT EXTERNAL PACKAGES
import * as Yup from 'yup';

// IMPORT NEEDED VARIABLES FROM WITHIN REPO
import { ApiError } from '../errorService/apiError';

// eslint-disable-next-line no-unused-vars
import { ErrorRequestHandler } from 'express';

// ============= ERROR LOGGER ============== //
function logError(err: ApiError | Yup.ValidationError | Error): void {
	console.error(err);
}

// ========= DECIPHER TYPE OF ERROR ========= //
function decipherType(str: string) {
	if (str.includes('auth')) return ApiError.type.AUTHENTICATION;
	return ApiError.type.UNKNOWN;
}

// ============ HANDLER FOR ERRORS =========== //
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	// CREATE PLACEHOLDER ERROR MESSAGE AND EMPTY JSON RESPONSE VARIABLE
	const message = err.message || 'Something went wrong';
	let jsonResponse;

	// ==== IF ERROR COMING IN IS API ERROR ==== //
	if (err instanceof ApiError) {
		// SET ERROR PROPERTIES
		const code = err.code || 500,
			errors = err.errors || [],
			error_type = err.type || ApiError.type.APP_NAME;
		// USE ERROR LOGGER
		logError(err);
		// CREATE JSON RESPONSE
		if (errors.length === 0) jsonResponse = { error_type, message };
		else jsonResponse = { error_type, message, errors };
		// SEND ERROR RESPONSE TO CLIENT
		return res.status(code).json(jsonResponse);
	}

	// ==== IF ERROR COMING IN IS YUP VALIDATION ERROR ==== //
	if (err instanceof Yup.ValidationError) {
		// SET ERROR PROPERTIES
		const code = 400,
			errors = err.errors || [],
			type = ApiError.type.VALIDATION;
		// CREATE NEW APIERROR USING PROPERTIES ABOVE
		const validationError = new ApiError(code, message, type, errors);
		// USE ERROR LOGGER
		logError(err);
		// SET VARIABLES TO POPULATE JSON RESPONSE
		const error_type = validationError.type,
			res_message = validationError.message,
			res_errors = validationError.errors;
		// CREATE JSON RESPONSE
		if (res_errors && res_errors.length === 0) jsonResponse = { error_type, message: res_message };
		else jsonResponse = { error_type, message: res_message, errors: res_errors };
		// SEND ERROR RESPONSE TO CLIENT
		return res.status(code).json(jsonResponse);
	}

	// ==== IF ERROR COMING IN HAS STRING AS CODE (FIREBASE ERROR) ==== //
	if (typeof err.code === 'string') {
		// SET ERROR PROPERTIES
		const code = 400,
			errors = [err.code],
			type = decipherType(err.code);
		// CREATE NEW APIERROR USING ABOVE PROPERTIES
		const firebaseError = new ApiError(code, message, type, errors);
		// USE ERROR LOGGER
		logError(firebaseError);
		// SET VARIABLES TO POPULATE JSON RESPONSE
		const error_type = firebaseError.type,
			res_message = firebaseError.message,
			res_errors = firebaseError.errors;
		// CREATE JSON RESPONSE
		if (res_errors && res_errors.length === 0) jsonResponse = { error_type, message: res_message };
		else jsonResponse = { error_type, message: res_message, errors: res_errors };
		// SEND ERROR RESPONSE TO CLIENT
		return res.status(code).json(jsonResponse);
	}

	// ==== ALL OTHER ERRORS ==== //
	// SET ERROR PROPERTIES
	let code: number;
	let type: string;
	// GET ERROR CODE NUMBER
	if (err.code && typeof err.code === 'number') code = err.code;
	else if (err.statusCode && typeof err.statusCode === 'number') code = err.statusCode;
	else code = 500;
	// GET ERROR TYPE
	if (code >= 500) type = ApiError.type.INTERNAL;
	else if (code < 500 && code >= 400) type = ApiError.type.NETWORK;
	else type = ApiError.type.UNKNOWN;
	// GET ERRORS
	const errors = typeof err.code === 'string' ? [err.code] : [];
	// CREATE NEW API ERROR USING ABOVE PROPERTIES
	const unknownError = new ApiError(code, message, type, errors);
	// USE ERROR LOGGER
	logError(unknownError);
	const error_type = unknownError.type,
		res_message = unknownError.message,
		res_errors = unknownError.errors;
	// CREATE JSON RESPONSE
	if (errors.length === 0) jsonResponse = { error_type, message: res_message };
	else jsonResponse = { error_type, message: res_message, res_errors };
	return res.status(unknownError.code).json(jsonResponse);
};
