import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

// ======== IMPORT ROUTERS ========= //
import { screamsRouter } from './routers/screams.route';

// ========== INITIALIZE =========== //
admin.initializeApp();

// ====== CREATE EXPRESS APP ======= //
const app = express();

app.use(express.json());
app.use(cors({ origin: true }));

// ========= EXPORT VALUES ========= //
export { admin };
export const db = admin.firestore();
export const screamCollection = 'screams';

// ========= USE ROUTERS ========== //
app.use('/screams', screamsRouter);

// ===== EXPORT EXPRESS APP ====== //
export { app };
