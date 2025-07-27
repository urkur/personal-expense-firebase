import * as admin from 'firebase-admin';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    // Check if user already exists in Firestore
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // User is new, create a document for them and populate with sample data
      const batch = adminDb.batch();
      
      batch.set(userRef, {
        email,
        createdAt: Timestamp.now(),
      });
      
      await addSampleData(uid, batch);
      await batch.commit();
      console.log("Sample data added for new user:", uid);
    }
    
    return new NextResponse(JSON.stringify({ status: 'success' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error verifying token or creating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


async function addSampleData(userId: string, batch: admin.firestore.WriteBatch) {
    const sampleReceipts = [
      {
        date: '2025-05-10',
        storeName: 'Grocery Mart',
        total: 75.5,
        tax: 5.5,
        currency: 'USD',
        items: [
          { name: 'Milk', amount: 3.5, quantity: 1, category: 'grocery' },
          { name: 'Bread', amount: 2.5, quantity: 1, category: 'grocery' },
          { name: 'Eggs', amount: 4.5, quantity: 1, category: 'grocery' },
          { name: 'Chicken Breast', amount: 15.0, quantity: 2, category: 'grocery' },
          { name: 'Apples', amount: 5.0, quantity: 1, category: 'grocery' },
        ],
      },
      {
        date: '2025-05-22',
        storeName: 'Tech Stop',
        total: 1299.99,
        tax: 99.99,
        currency: 'USD',
        items: [{ name: 'Laptop', amount: 1200.0, quantity: 1, category: 'electronics' }],
      },
      {
        date: '2025-06-05',
        storeName: 'Home Decor',
        total: 145.0,
        tax: 12.0,
        currency: 'USD',
        items: [
          { name: 'Vase', amount: 45.0, quantity: 1, category: 'home' },
          { name: 'Scented Candle', amount: 25.0, quantity: 2, category: 'home' },
          { name: 'Photo Frame', amount: 25.0, quantity: 2, category: 'home' },
        ],
      },
       {
        date: '2025-06-18',
        storeName: 'Book Nook',
        total: 55.75,
        tax: 4.75,
        currency: 'USD',
        items: [
          { name: 'Sci-Fi Novel', amount: 25.0, quantity: 1, category: 'other' },
          { name: 'Bookmark', amount: 5.0, quantity: 1, category: 'other' },
          { name: 'Journal', amount: 20.0, quantity: 1, category: 'other' },
        ],
      },
      {
        date: '2025-07-01',
        storeName: 'The Corner Cafe',
        total: 12.50,
        tax: 1.0,
        currency: 'USD',
        items: [
          { name: 'Latte', amount: 5.5, quantity: 1, category: 'other' },
          { name: 'Croissant', amount: 6.0, quantity: 1, category: 'other' },
        ],
      },
      {
        date: '2025-07-15',
        storeName: 'Grocery Mart',
        total: 95.25,
        tax: 7.25,
        currency: 'USD',
        items: [
          { name: 'Salmon', amount: 22.0, quantity: 1, category: 'grocery' },
          { name: 'Avocado', amount: 4.0, quantity: 2, category: 'grocery' },
          { name: 'Salad Mix', amount: 6.0, quantity: 1, category: 'grocery' },
          { name: 'Olive Oil', amount: 12.0, quantity: 1, category: 'grocery' },
        ],
      },
       {
        date: '2025-07-28',
        storeName: 'Clothing Co',
        total: 180.0,
        tax: 15.0,
        currency: 'USD',
        items: [
          { name: 'T-Shirt', amount: 25.0, quantity: 2, category: 'clothing' },
          { name: 'Jeans', amount: 80.0, quantity: 1, category: 'clothing' },
        ],
      },
    ];

    sampleReceipts.forEach(receipt => {
        const docRef = adminDb.collection('receipts').doc(uuidv4());
        batch.set(docRef, {
            ...receipt,
            userId: userId,
            // Store the date string directly, but also add a proper timestamp for sorting
            createdAt: Timestamp.fromDate(new Date(receipt.date)),
        });
    });
}
