// eslint-disable-next-line no-unused-vars
import { ApiErrorType } from '../types/apiError';
import { ApiError } from './apiError';

export const Errors: Record<string, ApiErrorType> = {
	WEAK_PASSWORD: {
		type: ApiError.type.AUTHENTICATION,
		message: 'Password is too easy to guess. Please enter a stronger password.',
		code: 400,
	},
	HANDLE_ALREADY_TAKEN: {
		type: ApiError.type.AUTHENTICATION,
		message: 'This handle is already in use by another account.',
		code: 400,
	},
	NO_TOKEN: {
		type: ApiError.type.AUTHORIZATION,
		message: 'Unauthorized. Please provide a token.',
		code: 403,
	},
	TOKEN_VERIFY_FAILURE: {
		type: ApiError.type.AUTHORIZATION,
		message: 'Error while verifying token',
		code: 401,
	},
};
