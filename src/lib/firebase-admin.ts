import * as admin from 'firebase-admin';

let adminAuth: admin.auth.Auth | null = null;
let adminDb: admin.firestore.Firestore | null = null;

try {
  const firebaseAdminConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  if (
    !admin.apps.length &&
    firebaseAdminConfig.projectId &&
    firebaseAdminConfig.privateKey &&
    firebaseAdminConfig.clientEmail
  ) {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseAdminConfig),
    });
    adminAuth = admin.auth();
    adminDb = admin.firestore();
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

export { adminAuth, adminDb };
