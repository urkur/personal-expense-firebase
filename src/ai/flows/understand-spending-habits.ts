'use server';

/**
 * @fileOverview A flow that allows users to ask questions about their spending habits and receive AI-powered insights.
 *
 * - understandSpendingHabits - A function that handles the process of understanding spending habits.
 * - UnderstandSpendingHabitsInput - The input type for the understandSpendingHabits function.
 * - UnderstandSpendingHabitsOutput - The return type for the understandSpendingHabits function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ExtractReceiptDataOutput } from './extract-receipt-data';

const UnderstandSpendingHabitsInputSchema = z.object({
  question: z.string().describe('The question about spending habits.'),
  receipts: z.array(z.any()).describe('A list of receipts to analyze.'),
  currentDate: z.string().describe('The current date in YYYY-MM-DD format.'),
});
export type UnderstandSpendingHabitsInput = z.infer<typeof UnderstandSpendingHabitsInputSchema>;

const UnderstandSpendingHabitsOutputSchema = z.object({
  insight: z.string().describe('The AI-powered insight about spending habits.'),
});
export type UnderstandSpendingHabitsOutput = z.infer<typeof UnderstandSpendingHabitsOutputSchema>;

export async function understandSpendingHabits(input: UnderstandSpendingHabitsInput): Promise<UnderstandSpendingHabitsOutput> {
  return understandSpendingHabitsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'understandSpendingHabitsPrompt',
  input: {schema: UnderstandSpendingHabitsInputSchema},
  output: {schema: UnderstandSpendingHabitsOutputSchema},
  prompt: `You are a personal finance advisor. A user has asked the following question about their spending habits: {{{question}}}.

The current date is {{{currentDate}}}. Please use this to answer any time-relative questions (e.g., "last month", "this week").

Here is all the receipt data you have access to:
\`\`\`json
{{{json receipts}}}
\`\`\`

Based ONLY on the provided receipt data, provide a concise and helpful insight to answer the user's question.
It is very important that you do not make up information or provide data from other periods.
If you do not have any data for the requested period, you MUST clearly state that you do not have the information for that period and nothing else. For example, if asked about "last month" and there is no data, say "I do not have any spending data for last month." Do not mention other dates or spending.
`,
});

const understandSpendingHabitsFlow = ai.defineFlow(
  {
    name: 'understandSpendingHabitsFlow',
    inputSchema: UnderstandSpendingHabitsInputSchema,
    outputSchema: UnderstandSpendingHabitsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
