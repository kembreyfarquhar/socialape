import * as functions from 'firebase-functions';
import { app } from './app';

// ====== EXPORT FIREBASE FUNCTION ======== //
export const api = functions.https.onRequest(app);
