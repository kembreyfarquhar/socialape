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
export const region = 'us-central1';
export const db = admin.firestore();
export const screamCollection = 'screams';
export const usersCollection = 'users';
export const likesCollection = 'likes';
export const commentsCollection = 'comments';
export const notificationCollection = 'notifications';

// ========= ROUTERS ========== //
// TOKEN = TOKEN AUTH REQUIRED

// post('/auth/register') Register User
// post('/auth/login') Login User
app.use('/auth', authRouter);

// get('/users/handle/:handle') Get Any User
// get('/users/logged-in-user') TOKEN Get Logged-In User Info
// post('/users/image') TOKEN Post User Image
// put('/users/details') TOKEN Update/Add User Details
// put('/users/mark-notification-read') TOKEN Mark Notifications Read
app.use('/users', usersRouter);

// get('/screams/') Get All Screams
// get('/screams/:screamId') Get Scream By ID
// post('/screams/') TOKEN Post New Scream
// post('/screams/:screamId/comment') TOKEN Post Comment on Scream
// post('/screams/:screamId/like') TOKEN Like a Scream
// delete('/screams/:screamId/unlike') TOKEN Unlike a Scream
// delete('/screams/:screamId') TOKEN Delete a Scream
app.use('/screams', screamsRouter);

// ===== EXPORT EXPRESS APP ======= //
export { app };
