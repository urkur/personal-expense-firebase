import * as admin from 'firebase-admin';

const firebaseAdminConfig = {
    projectId: "raseed-lite-u6e5l",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig)
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
