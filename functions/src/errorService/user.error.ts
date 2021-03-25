// eslint-disable-next-line no-unused-vars
import { ApiErrorType } from '../types/apiError';
import { ApiError } from './apiError';

export const UserErrors: Record<string, ApiErrorType> = {
	USER_DOESNT_EXIST: {
		type: ApiError.type.NETWORK,
		code: 404,
		message:
			'There is no user record corresponding to this identifier. The user may have been deleted.',
		errors: ['auth/user-not-found'],
	},
	IMAGE_TOO_LARGE: {
		type: ApiError.type.NETWORK,
		code: 400,
		message: 'Image is too large.',
	},
	WRONG_FILE_TYPE: {
		type: ApiError.type.NETWORK,
		code: 400,
		message: 'Wrong file type submitted. Please only use JPEG or PNG files for images.',
	},
	INCORRECT_CONTENT_TYPE: {
		type: ApiError.type.NETWORK,
		code: 400,
		message: 'Request must include Content-Type Header set to multipart/form-data',
	},
	NO_USER_DETAILS: {
		type: ApiError.type.NETWORK,
		code: 400,
		message: 'Request must include at lease one of: bio, location, or website.',
	},
};
