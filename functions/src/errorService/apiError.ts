import { CustomError } from 'ts-custom-error';

// new ApiError (400, 'User Handle is already in use.', ApiError.type.NETWORK, ['auth/handle-already-in-use'])
export class ApiError extends CustomError {
	static type = {
		APP_NAME: 'APP_NAME',
		AUTHENTICATION: 'AUTHENTICATION',
		AUTHORIZATION: 'AUTHORIZATION',
		VALIDATION: 'VALIDATION',
		INTERNAL: 'INTERNAL',
		NETWORK: 'NETWORK',
		UNKNOWN: 'UNKNOWN',
	};
	errors?: string[] | undefined | [];

	constructor(
		public code: number,
		public message: string,
		public type: string,
		errors?: string[] | []
	) {
		super();
		Object.defineProperty(this, 'name', { value: 'ApiError' });

		this.code = code;
		this.message = message;
		this.type = type;
		this.errors = errors || [];
	}
}
