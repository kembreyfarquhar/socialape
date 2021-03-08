// eslint-disable-next-line no-unused-vars
import { RequestHandler } from 'express';
import { isEmpty, isEmail } from '../utils/user.util';

export const validateNewUser: RequestHandler = (req, res, next) => {
	const { email, password, confirmPassword, handle } = req.body;
	const keys = Object.keys(req.body);
	let errors: Record<string, string> = {};

	if (!keys.length) {
		res.status(400).json({ body: 'Must contain a json body' });
	} else if (!email || !password || !confirmPassword || !handle) {
		res.status(400).json({ body: 'Must contain email, password, confirmPassword, and handle' });
	} else {
		if (isEmpty(email)) errors.email = 'Must not be empty';
		if (isEmpty(handle)) errors.handle = 'Must not be empty';
		if (isEmpty(password)) errors.password = 'Must not be empty';
		if (!isEmail(email)) errors.email = 'Must be a valid email address';
		if (password !== confirmPassword) errors.confirmPassword = 'Passwords must match';
		if (Object.keys(errors).length > 0) res.status(400).json(errors);
		else next();
	}
};

export const validateUserLogin: RequestHandler = (req, res, next) => {
	const { email, password } = req.body;
	const keys = Object.keys(req.body);
	let errors: Record<string, string> = {};

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
	let userDetails: UserDetails = {};
	const { bio, website, location } = req.body;
	const keys = Object.keys(req.body);

	if (!keys.length) {
		res.status(400).json({ body: 'Must contain a json body' });
	} else if (!bio && !website && !location) {
		res.status(400).json({ body: 'Must contain a bio, website, or location' });
	} else {
		if (bio && !isEmpty(bio)) userDetails.bio = bio;
		if (website && !isEmpty(website)) {
			if (website.trim().substring(0, 4) !== 'http') {
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
