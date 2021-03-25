// eslint-disable-next-line no-unused-vars
import { ApiError } from '../errorService/apiError';
// eslint-disable-next-line no-unused-vars
import { CopyWithPartial } from './typeUtil';

// TYPE FOR ALL API ERRORS
export type ApiErrorType = CopyWithPartial<ApiError, 'errors' | 'name'>;

// JSON RESPONSE TYPE WHEN SENDING BACK ERROR MESSAGE
export type JSONResponse = {
	error_type: string;
	message: string;
	errors?: string[];
};
