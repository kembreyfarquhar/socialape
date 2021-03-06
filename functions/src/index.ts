import * as functions from 'firebase-functions';
import { app } from './app';

// ====== EXPORT FIREBASE FUNCTION ======== //
export const api = functions.region('us-central1').https.onRequest(app);
