'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating shopping lists based on ingredients extracted from analyzed receipts.
 *
 * The flow takes receipt data as input and returns a shopping list as output.
 * - generateShoppingList - A function that generates a shopping list.
 * - GenerateShoppingListInput - The input type for the generateShoppingList function.
 * - GenerateShoppingListOutput - The return type for the generateShoppingList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateShoppingListInputSchema = z.object({
  receiptData: z.array(
    z.object({
      items: z.array(z.string()).describe('List of items from the receipt.'),
    })
  ).describe('Array of receipt data objects, each containing a list of items.'),
});

export type GenerateShoppingListInput = z.infer<typeof GenerateShoppingListInputSchema>;

const GenerateShoppingListOutputSchema = z.object({
  shoppingList: z.array(z.string()).describe('The generated shopping list.'),
});

export type GenerateShoppingListOutput = z.infer<typeof GenerateShoppingListOutputSchema>;

export async function generateShoppingList(input: GenerateShoppingListInput): Promise<GenerateShoppingListOutput> {
  return generateShoppingListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShoppingListPrompt',
  input: {schema: GenerateShoppingListInputSchema},
  output: {schema: GenerateShoppingListOutputSchema},
  prompt: `You are a helpful assistant that generates shopping lists based on receipt data.

  Given the following receipt data, create a consolidated shopping list of all the unique items.

  Receipt Data:
  {{#each receiptData}}
  Items: {{#each items}}- {{{this}}}{{/each}}
  {{/each}}

  Shopping List:`, // Ensure this is valid Handlebars
});

const generateShoppingListFlow = ai.defineFlow(
  {
    name: 'generateShoppingListFlow',
    inputSchema: GenerateShoppingListInputSchema,
    outputSchema: GenerateShoppingListOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
