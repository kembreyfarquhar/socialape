// eslint-disable-next-line no-unused-vars
import { ApiError } from '../errorService/apiError';
// eslint-disable-next-line no-unused-vars
import { CopyWithPartial } from './typeUtil';

export type ApiErrorType = CopyWithPartial<ApiError, 'errors' | 'name'>;
