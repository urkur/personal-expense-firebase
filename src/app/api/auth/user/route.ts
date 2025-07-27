import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  if (!adminAuth || !adminDb) {
    console.warn("Firebase Admin not initialized. Skipping user sync.");
    // Return a success response so the client doesn't show an error.
    return new NextResponse(JSON.stringify({ status: 'success', message: 'Admin not initialized' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const authorization = req.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        email,
        createdAt: Timestamp.now(),
      });
    }
    
    return new NextResponse(JSON.stringify({ status: 'success' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error verifying token or creating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
