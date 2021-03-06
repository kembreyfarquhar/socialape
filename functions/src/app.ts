import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
import * as firebase from 'firebase';
import * as dotenv from 'dotenv';
dotenv.config();

export const firebaseConfig = {
	apiKey: process.env.apiKey,
	authDomain: process.env.authDomain,
	databaseURL: process.env.databaseURL,
	projectId: process.env.projectId,
	storageBucket: process.env.storageBucket,
	messagingSenderId: process.env.messagingSenderId,
	appId: process.env.appId,
	measurementId: process.env.measurementId,
};

// ======== IMPORT ROUTERS ========= //
import { screamsRouter } from './routers/screams.route';
import { authRouter } from './routers/auth.route';
import { usersRouter } from './routers/users.route';

// ========== INITIALIZE =========== //
admin.initializeApp();

// ====== CREATE EXPRESS APP ======= //
const app = express();

// ===== INIT FIREBASE APP ========= //
firebase.default.initializeApp(firebaseConfig);

app.use(express.json());
app.use(cors({ origin: true }));

// ======== EXPORT VALUES ========= //
export { admin };
export { firebase };
export const db = admin.firestore();
export const screamCollection = 'screams';
export const usersCollection = 'users';

// ========= USE ROUTERS ========== //
app.use('/screams', screamsRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);

// ===== EXPORT EXPRESS APP ======= //
export { app };
