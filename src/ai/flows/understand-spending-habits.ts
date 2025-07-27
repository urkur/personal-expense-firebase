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

Here is their receipt data:
\`\`\`json
{{{json receipts}}}
\`\`\`

Based on their past spending data, provide a concise and helpful insight. Answer the user's question. If the user asks for something that is not in the data, say that you do not have that information.
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
