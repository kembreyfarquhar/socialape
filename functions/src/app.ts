import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
import * as firebase from 'firebase';

const firebaseConfig = {
	apiKey: 'AIzaSyDWmMHHw-H9jtOu-lghP59BcHsHh_aZH1c',
	authDomain: 'socialape-e6983.firebaseapp.com',
	databaseURL: 'https://socialape-e6983-default-rtdb.firebaseio.com',
	projectId: 'socialape-e6983',
	storageBucket: 'socialape-e6983.appspot.com',
	messagingSenderId: '741708240191',
	appId: '1:741708240191:web:80470ab94e4ea16d8e2f8a',
	measurementId: 'G-GDJFQT3CTG',
};

// ======== IMPORT ROUTERS ========= //
import { screamsRouter } from './routers/screams.route';
import { authRouter } from './routers/auth.route';

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

// ========= USE ROUTERS ========== //
app.use('/screams', screamsRouter);
app.use('/auth', authRouter);

// ===== EXPORT EXPRESS APP ======= //
export { app };
