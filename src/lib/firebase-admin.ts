import * as admin from 'firebase-admin';

const firebaseAdminConfig = {
    "projectId": "raseed-lite-u6e5l",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQClg1B/X8xT\n8/L6gZ1fCo3u3j/d4X2Yd2b8b9jA2f4p6g8a6f8b3d1c9e8g3h6f4g7i9k1l3m2n\n5o7p8q9r/s+t/u+v/w/x/y+z/A+B+C+D+E+F+G+H+I+J+K+L+M+N+O+P+Q+R+S+T\n+U+V+W+X+Y+Z+a+b+c+d+e+f+g+h+i+j+k+l+m+n+o+p+q+r+s+t+u+v+w+x+y+z\n0123456789\n-----END PRIVATE KEY-----\n",
    "clientEmail": "firebase-adminsdk-q5h5e@raseed-lite-u6e5l.iam.gserviceaccount.com"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig)
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
