'use server';

/**
 * @fileOverview A receipt data extraction AI agent.
 *
 * - extractReceiptData - A function that handles the receipt data extraction process.
 * - ExtractReceiptDataInput - The input type for the extractReceiptData function.
 * - ExtractReceiptDataOutput - The return type for the extractReceiptData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractReceiptDataInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractReceiptDataInput = z.infer<typeof ExtractReceiptDataInputSchema>;

const ExtractReceiptDataOutputSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().describe('The name of the item.'),
      amount: z.number().describe('The amount of the item.'),
      quantity: z.number().optional().describe('The quantity of the item.'),
      category: z.string().optional().describe('The category of the item (e.g., kitchen, grocery, sports, home, electronics, clothing).'),
    })
  ).describe('The items on the receipt.'),
  date: z.string().describe('The date of the receipt in YYYY-MM-DD format.'),
  storeName: z.string().describe('The name of the store.'),
  total: z.number().describe('The total amount of the receipt.'),
  tax: z.number().optional().describe('The total tax amount of the receipt.'),
  currency: z.string().optional().describe('The currency of the receipt (e.g., USD, EUR).'),
  language: z.string().optional().describe('The language of the receipt (e.g., en, es).'),
});
export type ExtractReceiptDataOutput = z.infer<typeof ExtractReceiptDataOutputSchema>;

export async function extractReceiptData(input: ExtractReceiptDataInput): Promise<ExtractReceiptDataOutput> {
  return extractReceiptDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractReceiptDataPrompt',
  input: {schema: ExtractReceiptDataInputSchema},
  output: {schema: ExtractReceiptDataOutputSchema},
  prompt: `You are an expert AI assistant specializing in extracting data from receipts.

You will use this information to extract the items, amounts, date, store name, total, tax, currency, and language from the receipt.

The date must be in YYYY-MM-DD format.

For each item, categorize it into one of the following: "kitchen", "grocery", "sports", "home", "electronics", "clothing", or other relevant categories.

Make sure to only extract valid data. If you are unsure, leave the field blank.

Here is the receipt:

{{media url=photoDataUri}}`,
});

const extractReceiptDataFlow = ai.defineFlow(
  {
    name: 'extractReceiptDataFlow',
    inputSchema: ExtractReceiptDataInputSchema,
    outputSchema: ExtractReceiptDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
