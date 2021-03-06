import * as express from 'express';
import { firebase } from '../app';

const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
	try {
		const newUser: User = {
			email: req.body.email,
			password: req.body.password,
			confirmPassword: req.body.confirmPassword,
			handle: req.body.handle,
		};

		const data = await firebase.default
			.auth()
			.createUserWithEmailAndPassword(newUser.email, newUser.password);
		res.status(201).json(`user ${data?.user?.uid} signed up successfully`);
	} catch (err) {
		res.status(500).json({ error: err.toString() });
	}
});

export { authRouter };
