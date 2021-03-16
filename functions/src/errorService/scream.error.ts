// eslint-disable-next-line no-unused-vars
import { ApiErrorType } from '../types/apiError';
import { ApiError } from './apiError';

export const ScreamErrors: Record<string, ApiErrorType> = {
	SCREAM_ALREADY_LIKED: {
		type: ApiError.type.NETWORK,
		code: 400,
		message: 'Scream already liked. Cannot like again.',
	},
	SCREAM_NOT_LIKED: {
		type: ApiError.type.NETWORK,
		code: 400,
		message: 'Scream not yet liked. Cannot unlike.',
	},
	UNAUTHORIZED_USER: {
		type: ApiError.type.NETWORK,
		code: 403,
		message: 'Unauthorized user. Must be owner of Scream to delete.',
	},
	SCREAM_DOESNT_EXIST: {
		type: ApiError.type.NETWORK,
		code: 404,
		message: 'Scream not found.',
	},
};
