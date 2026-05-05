import admin from 'firebase-admin';

let initialized = false;

export function getFirebaseAdmin() {
  if (!initialized) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON env var is not set');
    }
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
  }
  return admin;
}

export async function verifyFirebaseToken(idToken) {
  const adminInstance = getFirebaseAdmin();
  const decoded = await adminInstance.auth().verifyIdToken(idToken);
  return decoded;
}
