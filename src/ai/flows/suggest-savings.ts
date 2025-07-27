// src/ai/flows/suggest-savings.ts
'use server';
/**
 * @fileOverview A flow to analyze spending habits and suggest potential savings opportunities.
 *
 * - suggestSavings - A function that takes a user's spending data and returns savings suggestions.
 * - SuggestSavingsInput - The input type for the suggestSavings function.
 * - SuggestSavingsOutput - The return type for the suggestSavings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSavingsInputSchema = z.object({
  spendingData: z
    .string()
    .describe(
      'A string containing the user spending data in JSON format, including categories, amounts, and time periods.'
    ),
});
export type SuggestSavingsInput = z.infer<typeof SuggestSavingsInputSchema>;

const SuggestSavingsOutputSchema = z.object({
  savingsSuggestions: z
    .string()
    .describe(
      'A string containing suggestions for potential savings opportunities.'
    ),
});
export type SuggestSavingsOutput = z.infer<typeof SuggestSavingsOutputSchema>;

export async function suggestSavings(input: SuggestSavingsInput): Promise<SuggestSavingsOutput> {
  return suggestSavingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSavingsPrompt',
  input: {schema: SuggestSavingsInputSchema},
  output: {schema: SuggestSavingsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's spending data and suggest potential savings opportunities.

Spending Data: {{{spendingData}}}

Provide clear and actionable suggestions for the user to cut costs and save money.
`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const suggestSavingsFlow = ai.defineFlow(
  {
    name: 'suggestSavingsFlow',
    inputSchema: SuggestSavingsInputSchema,
    outputSchema: SuggestSavingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
