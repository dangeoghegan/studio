'use server';

/**
 * @fileOverview Provides personalized savings recommendations based on user's income, expenses, and financial goals.
 *
 * - getSavingsRecommendations - A function that generates savings recommendations.
 * - SavingsRecommendationsInput - The input type for the getSavingsRecommendations function.
 * - SavingsRecommendationsOutput - The return type for the getSavingsRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SavingsRecommendationsInputSchema = z.object({
  income: z.number().describe('Monthly income of the user.'),
  expenses: z.number().describe('Monthly expenses of the user.'),
  financialGoals: z.string().describe('Description of the financial goals of the user.'),
});
export type SavingsRecommendationsInput = z.infer<typeof SavingsRecommendationsInputSchema>;

const SavingsRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('Personalized savings recommendations for the user.'),
});
export type SavingsRecommendationsOutput = z.infer<typeof SavingsRecommendationsOutputSchema>;

export async function getSavingsRecommendations(input: SavingsRecommendationsInput): Promise<SavingsRecommendationsOutput> {
  return savingsRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'savingsRecommendationsPrompt',
  input: {schema: SavingsRecommendationsInputSchema},
  output: {schema: SavingsRecommendationsOutputSchema},
  prompt: `You are a personal finance advisor. Provide personalized savings recommendations based on the user's income, expenses, and financial goals.

Income: {{income}}
Expenses: {{expenses}}
Financial Goals: {{financialGoals}}

Provide clear and actionable recommendations to help the user manage their finances and achieve their savings targets.`,
});

const savingsRecommendationsFlow = ai.defineFlow(
  {
    name: 'savingsRecommendationsFlow',
    inputSchema: SavingsRecommendationsInputSchema,
    outputSchema: SavingsRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
