import * as express from 'express';
import * as BusBoy from 'busboy';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { db, admin, firebaseConfig } from '../app';
import { authorization } from '../middleware/authorization.middleware';

const usersRouter = express.Router();

usersRouter.post('/image', authorization, (req, res) => {
	const busboy = new BusBoy({ headers: req.headers });
	let imageFileName: string = '';
	let imageToBeUploaded: Record<string, any> = {};

	busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
		const imageExtension = filename.split('.')[filename.split('.').length - 1];
		imageFileName = `${Math.round(Math.random() * 1000000)}.${imageExtension}`;
		const filePath = path.join(os.tmpdir(), imageFileName);
		imageToBeUploaded.filename = filename;
		imageToBeUploaded.mimetype = mimetype;
		file.pipe(fs.createWriteStream(filePath));
	});

	busboy.on('finish', async () => {
		try {
			await admin
				.storage()
				.bucket()
				.upload(imageToBeUploaded.filePath, {
					resumable: false,
					metadata: {
						contentType: imageToBeUploaded.mimetype,
					},
				});
			const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
			await db.doc(`/users/${req.user.handle}`).update({ imageUrl });
			res.status(201).json('Image uploaded');
		} catch (err) {
			res.status(500).json({ error: err.code });
		}
	});

	busboy.end(req.rawBody);
});

export { usersRouter };
