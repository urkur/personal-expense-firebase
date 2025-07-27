'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a Google Wallet pass from receipt data.
 *
 * - generateWalletPass - A function that generates a Google Wallet pass.
 * - GenerateWalletPassInput - The input type for the generateWalletPass function.
 * - GenerateWalletPassOutput - The return type for the generateWalletPass function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { v4 as uuidv4 } from 'uuid';
import type { ExtractReceiptDataOutput } from './extract-receipt-data';

export type GenerateWalletPassInput = ExtractReceiptDataOutput;

// This is a placeholder. In a real implementation, this would be a signed JWT.
const GenerateWalletPassOutputSchema = z.object({
  passUrl: z.string().describe('The URL to add the pass to Google Wallet.'),
});

export type GenerateWalletPassOutput = z.infer<
  typeof GenerateWalletPassOutputSchema
>;

// In a real application, these would be managed securely, likely in environment variables.
const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000022956210';
const PASS_CLASS_SUFFIX = 'Offer'; // The suffix you defined in the Google Wallet Console

function createReceiptObject(receipt: GenerateWalletPassInput, objectId: string) {
  const lineItems = receipt.items.map(item => ({
    description: item.name,
    unitPrice: {
      micros: item.amount * 1000000,
      currencyCode: receipt.currency || 'USD',
    },
    quantity: item.quantity || 1,
  }));
  
  // The date is now expected to be in YYYY-MM-DD format from the extraction flow.
  // The Date constructor handles this format reliably.
  const receiptDate = new Date(receipt.date);

  const passObject = {
    id: `${ISSUER_ID}.${objectId}`,
    classId: `${ISSUER_ID}.${PASS_CLASS_SUFFIX}`,
    state: 'active',
    heroImage: {
      sourceUri: {
        uri: 'https://placehold.co/1032x336.png', // A generic hero image
      },
      contentDescription: {
        defaultValue: {
          language: 'en-US',
          value: `Receipt from ${receipt.storeName}`,
        },
      },
    },
    textModulesData: [
      {
        id: 'store_name',
        header: 'Store',
        body: receipt.storeName,
      },
      {
        id: 'date',
        header: 'Date',
        body: receiptDate.toLocaleDateString(),
      }
    ],
    lineItems: lineItems,
    linksModuleData: {
      uris: [],
    },
    barcode: {
      type: 'QR_CODE',
      value: objectId, // Use the unique ID for the QR code
      alternateText: 'Receipt ID',
    },
    locations: [],
    currencyCode: receipt.currency || 'USD',
    totalPrice: {
      micros: receipt.total * 1000000,
      currencyCode: receipt.currency || 'USD',
    },
    merchantName: receipt.storeName,
  };

  return passObject;
}

export async function generateWalletPass(
  input: GenerateWalletPassInput
): Promise<GenerateWalletPassOutput> {
  return generateWalletPassFlow(input);
}

const generateWalletPassFlow = ai.defineFlow(
  {
    name: 'generateWalletPassFlow',
    inputSchema: z.any(), // Using z.any() because the input is complex
    outputSchema: GenerateWalletPassOutputSchema,
  },
  async (receipt) => {
    // This is where you would call the Google Wallet API to create a pass.
    // This requires setting up a service account and using OAuth2 to sign a JWT.
    // For this prototype, we'll simulate the process.

    const objectId = uuidv4();
    const passObject = createReceiptObject(receipt, objectId);

    // In a real app, you would sign this 'passObject' into a JWT.
    // This is a placeholder for the signed JWT.
    const signedJwt = Buffer.from(JSON.stringify(passObject)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');


    // The user would be redirected to this URL to save the pass.
    const passUrl = `https://pay.google.com/gp/v/object/${signedJwt}`;
    
    console.log("Generated Google Wallet Pass URL:", passUrl);
    console.log("Pass Object:", JSON.stringify(passObject, null, 2));


    // For the prototype, we can't generate a real, savable pass without proper credentials.
    // To make this work, you would need to:
    // 1. Go to the Google Wallet Business Console (https://wallet.google.com/business/console)
    // 2. Create an "Offer" class for your receipts.
    // 3. Set up a service account and get its credentials (JSON key).
    // 4. Use a library like 'google-auth-library' to sign the JWT.
    // 5. Replace the dummy JWT creation above with real signing logic.

    return {
      passUrl: passUrl,
    };
  }
);
