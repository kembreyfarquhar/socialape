// IMPORT EXTERNAL PACKAGES
import * as Yup from 'yup';

// IMPORT NEEDED VARIABLES FROM WITHIN REPO
import { ApiError } from '../errorService/apiError';

// IMPORT TYPES, DISABLE ESLINT TO AVOID ERRORS
// eslint-disable-next-line no-unused-vars
import { ErrorRequestHandler } from 'express';
// eslint-disable-next-line no-unused-vars
import { ApiErrorType, JSONResponse } from '../types/apiError';

// ============================ ERROR LOGGER ================================= //
function logError(err: ApiError | Yup.ValidationError | Error): void {
	console.error(err);
}

// ========================= DECIPHER TYPE OF ERROR =========================== //
function decipherType(str: string) {
	if (str.includes('auth')) return ApiError.type.AUTHENTICATION;
	return ApiError.type.UNKNOWN;
}

// ========================== ERROR HANDLER FUNCTION ========================== //
export const errorHandler: ErrorRequestHandler = (err, _req, res, _) => {
	// CREATE PLACEHOLDER ERROR MESSAGE AND EMPTY JSON RESPONSE VARIABLE
	const message = err.message || 'Something went wrong';
	let jsonResponse: JSONResponse;

	// ==== IF ERROR COMING IN IS API ERROR ==== //
	if (err instanceof ApiError) {
		// SET ERROR PROPERTIES
		const code = err.code || 500,
			errors = err.errors || [],
			error_type = err.type || ApiError.type.APP_NAME;
		// USE ERROR LOGGER
		logError(err);
		// CREATE JSON RESPONSE
		jsonResponse = { error_type, message };
		if (errors.length > 0) jsonResponse.errors = errors;
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
		const validationErrorObj: ApiErrorType = { code, message, type, errors };
		const validationError = new ApiError(
			validationErrorObj.code,
			validationErrorObj.message,
			validationErrorObj.type,
			validationErrorObj.errors
		);
		// USE ERROR LOGGER
		logError(validationError);
		// CREATE JSON RESPONSE
		jsonResponse = { error_type: validationError.type, message: validationError.message };
		if (validationError.errors && validationError.errors.length > 0) {
			jsonResponse.errors = validationError.errors;
		}
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
		const firebaseErrorObj: ApiErrorType = { code, message, type, errors };
		const firebaseError = new ApiError(
			firebaseErrorObj.code,
			firebaseErrorObj.message,
			firebaseErrorObj.type,
			firebaseErrorObj.errors
		);
		// USE ERROR LOGGER
		logError(firebaseError);
		// CREATE JSON RESPONSE
		jsonResponse = { error_type: firebaseError.type, message: firebaseError.message };
		if (firebaseError.errors && firebaseError.errors.length > 0) {
			jsonResponse.errors = firebaseError.errors;
		}
		// SEND ERROR RESPONSE TO CLIENT
		return res.status(code).json(jsonResponse);
	}

	// ==== ALL OTHER ERRORS ==== //
	// SET ERROR PROPERTIES
	let code: number = 500;
	let type: string = ApiError.type.UNKNOWN;
	// GET ERROR CODE NUMBER
	if (err.code && typeof err.code === 'number') code = err.code;
	else if (err.statusCode && typeof err.statusCode === 'number') code = err.statusCode;
	// GET ERROR TYPE
	if (code >= 500) type = ApiError.type.INTERNAL;
	else if (code < 500 && code >= 400) type = ApiError.type.NETWORK;
	// GET ERRORS
	const errors = typeof err.code === 'string' ? [err.code] : [];
	// CREATE NEW API ERROR USING ABOVE PROPERTIES
	const unknownErrorObj: ApiErrorType = { code, message, type, errors };
	const unknownError = new ApiError(
		unknownErrorObj.code,
		unknownErrorObj.message,
		unknownErrorObj.type,
		unknownErrorObj.errors
	);
	// USE ERROR LOGGER
	logError(unknownError);
	// CREATE JSON RESPONSE
	jsonResponse = { error_type: unknownError.type, message: unknownError.message };
	if (unknownError.errors && unknownError.errors.length > 0) {
		jsonResponse.errors = unknownError.errors;
	}
	return res.status(unknownError.code).json(jsonResponse);
};
