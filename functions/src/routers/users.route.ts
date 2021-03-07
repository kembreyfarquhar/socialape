import * as express from 'express';
import * as BusBoy from 'busboy';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { db, admin, firebaseConfig } from '../app';
import { authorization } from '../middleware/authorization.middleware';

const usersRouter = express.Router();

/**
 * @api {post} /users/image Update user image.
 * @apiName UpdateImage
 * @apiGroup Users
 *
 * @apiUse AuthHeader
 *
 * @apiParam {FormData} image Mandatory image filepath.
 *
 * @apiSuccess (200) {String} message Image uploaded.
 *
 * @apiError (400) {String} error Wrong file type submitted.
 * @apiUse InternalServerError
 */
usersRouter.post('/image', authorization, (req, res) => {
	// CREATE A NEW BUSBOY INSTANCE
	const busboy = new BusBoy({ headers: req.headers });

	// INITIALIZE NEEDED VARIABLES
	let imageFileName: string = '';
	let imageToBeUploaded: Record<string, any> = {};

	// CREATE NEW PATH TO IMAGE
	busboy.on('file', (_fieldname, file, filename, _encoding, mimetype) => {
		// VALIDATE THAT IT IS OF IMAGE TYPE
		if (mimetype !== 'image/png' && mimetype !== 'image/jpeg') {
			res.status(400).json({ error: 'Wrong file type submitted' });
		}
		const imageExtension = filename.split('.')[filename.split('.').length - 1];
		imageFileName = `${Math.round(Math.random() * 1000000).toString()}.${imageExtension}`;
		const filepath = path.join(os.tmpdir(), imageFileName);
		imageToBeUploaded.filepath = filepath;
		imageToBeUploaded.mimetype = mimetype;
		file.pipe(fs.createWriteStream(filepath));
	});

	// STORE NEW IMAGE IN USER'S IMAGEURL FIELD
	busboy.on('finish', async () => {
		try {
			await admin
				.storage()
				.bucket()
				.upload(imageToBeUploaded.filepath, {
					resumable: false,
					metadata: {
						contentType: imageToBeUploaded.mimetype,
					},
				});
			const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
			await db.doc(`/users/${req.user.handle}`).update({ imageUrl });
			res.json({ message: 'Image uploaded' });
		} catch (err) {
			res.status(500).json({ error: err.code, message: err.toString() });
		}
	});

	// END
	busboy.end(req.rawBody);
});

export { usersRouter };
