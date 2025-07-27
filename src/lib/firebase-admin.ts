import * as admin from 'firebase-admin';

const firebaseAdminConfig = {
    "projectId": "raseed-lite-u6e5l",
    "privateKey": "-----BEGIN PRIVATE KEY-----\\nMIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAKt2xO7sC2p4xUCj\\n5g2mN/pD06pqK23A5bne2LhN0ggSNTs9Xs4yCg+gEaWd3Xm2x3gXGzVbs4oBJWZ2\\n/uLdCC0hIsQJXSf5AnPsLwX2pxtDMi1gYImXmDnrFc59E9FweImhKRiVeyyitx58\\n9sZshGMXsFmGBA8316EuK/nxzU+9AgMBAAECgYBGgJcW2vMh/MwqTPy6rDqUDJ+I\\nrJbWq4c33Gj5zuy5gDPCkwpC0hpn5VAmS9tJEoI25DAKzbj40EWdWk+cZ61DcrgP\\n6XJx4VjzhqGtsSYkM22/33gQcHKeSg2nE0rW3i5eDoYvADWzjd88x44a2sH3eQJz\\nYUqP/VzPZ3d/f9zBwQJBAPdD5lOqG9sOq1tG4V2D5pPZ6VvA/1vM2BvcuA8yvj8A\\n2S6uQfA4i8qjS44a3X5c2Q3yP5g6n3X1sZ7g8f7h8fCQQC0q7Z7A8e8lX2qX2b8\\nZ2c2e6N2mZ5f2Z5f2Z5f2Z5f2Z5f2Z5f2Z5f2Z5f2Z5f2Z5f2Z5f2Z5f2Z5f2Z5f\\nAkEA1i6n4x6B3e7d4Z8f6g8g6h6g8g6h6g8g6h6g8g6h6g8g6h6g8g6h6g8g6h6g\\n8g6h6g8g6h6g8g6h6g8g6hAkA0d7d3e6f5d5f5d5f5d5f5d5f5d5f5d5f5d5f5d5f\\n5d5f5d5f5d5f5d5f5d5f5d5f5d5f5d5f5d5f5d5fAkEAx8Z7Z6x8Z6x8Z6x8Z6x8\\nZ6x8Z6x8Z6x8Z6x8Z6x8Z6x8Z6x8Z6x8Z6x8Z6x8Z6x8Z6x8Z6x8Z6x8Z6x8Z6x\\n-----END PRIVATE KEY-----\\n",
    "clientEmail": "firebase-adminsdk-q5h5e@raseed-lite-u6e5l.iam.gserviceaccount.com"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig)
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
