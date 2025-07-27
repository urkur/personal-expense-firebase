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

const UnderstandSpendingHabitsInputSchema = z.object({
  userId: z.string().describe('The ID of the user asking the question.'),
  question: z.string().describe('The question about spending habits.'),
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
  prompt: `You are a personal finance advisor. A user with ID {{{userId}}} has asked the following question about their spending habits: {{{question}}}. Based on their past spending data, provide a concise and helpful insight.`,
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
