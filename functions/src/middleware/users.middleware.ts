// eslint-disable-next-line no-unused-vars
import { RequestHandler } from 'express';
import { isEmpty, isEmail } from '../utils/user.util';
// eslint-disable-next-line no-unused-vars
import { User, UserDetails } from '../types/user.type';

export const validateNewUser: RequestHandler = (req, res, next) => {
	const { email, password, confirmPassword, handle } = req.body;
	const keys = Object.keys(req.body);
	const errors: Record<string, any> = {};

	if (!keys.length) {
		res.status(400).json({ body: 'Must contain a json body' });
	} else if (!email || !password || !confirmPassword || !handle) {
		res.status(400).json({ body: 'Must contain email, password, confirmPassword, and handle' });
	} else {
		typeof email !== 'string' && (errors.email = 'Must be a string');
		typeof handle !== 'string' && (errors.handle = 'Must be a string');
		typeof password !== 'string' && (errors.password = 'Must be a string');

		if (Object.keys(errors).length > 0) res.status(400).json(errors);

		isEmpty(email) && (errors.email = 'Must not be empty');
		isEmpty(handle) && (errors.handle = 'Must not be empty');
		isEmpty(password) && (errors.password = 'Must not be empty');
		!isEmail(email) && (errors.email = 'Must be a valid email address');
		password !== confirmPassword && (errors.confirmPassword = 'Passwords must match');

		if (Object.keys(errors).length > 0) res.status(400).json(errors);
		else {
			const newUser: User = { email, password, confirmPassword, handle };
			req.newUser = newUser;
			next();
		}
	}
};

export const validateUserLogin: RequestHandler = (req, res, next) => {
	const { email, password } = req.body;
	const keys = Object.keys(req.body);
	const errors: Record<string, string> = {};

	if (!keys.length) {
		res.status(400).json({ body: 'Must contain a json body' });
	} else if (!email || !password) {
		res.status(400).json({ body: 'Must contain email and password' });
	} else {
		if (isEmpty(email)) errors.email = 'Must not be empty';
		if (isEmpty(password)) errors.password = 'Must not be empty';
		if (Object.keys(errors).length > 0) res.status(400).json(errors);
		else next();
	}
};

export const validateUserDetails: RequestHandler = (req, res, next) => {
	const userDetails: UserDetails = {};
	const { bio, website, location } = req.body;
	const keys = Object.keys(req.body);

	if (!keys.length) {
		res.status(400).json({ body: 'Must contain a json body' });
	} else if (!bio && !website && !location) {
		res.status(400).json({ body: 'Must contain a bio, website, or location' });
	} else {
		if (bio && !isEmpty(bio)) userDetails.bio = bio;
		if (website && !isEmpty(website)) {
			if (typeof website !== 'string') {
				res.status(400).json({ website: 'Must be a string' });
			} else if (!website.includes('.')) {
				res.status(400).json({ website: 'Must be a valid URL' });
			} else if (website.trim().substring(0, 4) !== 'http') {
				userDetails.website = `http://${website.trim()}`;
			} else userDetails.website = website;
		}
		if (location && !isEmpty(location)) userDetails.location = location;

		if (Object.keys(userDetails).length > 0) {
			req.userDetails = userDetails;
			next();
		} else {
			res.status(400).json({ body: 'Invalid request body' });
		}
	}
};
