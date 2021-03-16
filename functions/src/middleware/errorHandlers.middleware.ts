// eslint-disable-next-line no-unused-vars
import { ErrorRequestHandler } from 'express';
import { ApiError } from '../errorService/apiError';
import * as Yup from 'yup';

// ERROR LOGGER
function logError(err: ApiError | Yup.ValidationError | Error): void {
	console.error(err);
}

// DECIPHER TYPE OF ERROR
function decipherType(str: string) {
	if (str.includes('auth')) return ApiError.type.AUTHENTICATION;
	return ApiError.type.UNKNOWN;
}

// HANDLER FOR ERRORS
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	const message = err.message || 'Something went wrong';
	let jsonResponse;

	// IF ERROR COMING IN IS API ERROR
	if (err instanceof ApiError) {
		const code = err.code || 500,
			errors = err.errors || [],
			error_type = err.type || ApiError.type.APP_NAME;
		logError(err);
		if (errors.length === 0) jsonResponse = { error_type, message };
		else jsonResponse = { error_type, message, errors };
		return res.status(code).json(jsonResponse);
	}

	// IF ERROR COMING IN IS YUP VALIDATION ERROR
	if (err instanceof Yup.ValidationError) {
		const code = 400,
			errors = err.errors || [],
			type = ApiError.type.VALIDATION;
		const validationError = new ApiError(code, message, type, errors);
		logError(err);
		const error_type = validationError.type,
			res_message = validationError.message,
			res_errors = validationError.errors;
		if (res_errors && res_errors.length === 0) jsonResponse = { error_type, message: res_message };
		else jsonResponse = { error_type, message: res_message, errors: res_errors };
		return res.status(code).json(jsonResponse);
	}

	// IF ERROR COMING IN HAS STRING AS CODE (FIREBASE ERROR)
	if (typeof err.code === 'string') {
		const code = 400,
			errors = [err.code],
			type = decipherType(err.code);
		const firebaseError = new ApiError(code, message, type, errors);
		logError(firebaseError);
		const error_type = firebaseError.type,
			res_message = firebaseError.message,
			res_errors = firebaseError.errors;

		if (res_errors && res_errors.length === 0) jsonResponse = { error_type, message: res_message };
		else jsonResponse = { error_type, message: res_message, errors: res_errors };
		return res.status(code).json(jsonResponse);
	}

	// ALL OTHER ERRORS
	let code: number;
	let type: string;
	if (err.code && typeof err.code === 'number') code = err.code;
	else if (err.statusCode && typeof err.statusCode === 'number') code = err.statusCode;
	else code = 500;

	if (code >= 500) type = ApiError.type.INTERNAL;
	else if (code < 500 && code >= 400) type = ApiError.type.NETWORK;
	else type = ApiError.type.UNKNOWN;

	const errors = typeof err.code === 'string' ? [err.code] : [];
	const unknownError = new ApiError(code, message, type, errors);

	logError(unknownError);
	const error_type = unknownError.type,
		res_message = unknownError.message;

	if (errors.length === 0) jsonResponse = { error_type, message: res_message };
	else jsonResponse = { error_type, message: res_message, errors };
	return res.status(unknownError.code).json(jsonResponse);
};
