"use client";

import { useState } from 'react';
import { PageTitle } from '@/components/page-title';
import { PageWrapper } from '@/components/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Brain, MessageSquare } from 'lucide-react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getSavingsRecommendations, type SavingsRecommendationsInput, type SavingsRecommendationsOutput } from '@/ai/flows/savings-recommendation';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const advisorSchema = z.object({
  income: z.coerce.number().min(0, "Income must be a positive number"),
  expenses: z.coerce.number().min(0, "Expenses must be a positive number"),
  financialGoals: z.string().min(10, "Please describe your financial goals in at least 10 characters."),
});

type AdvisorFormData = z.infer<typeof advisorSchema>;

export default function AiAdvisorPage() {
  const [recommendations, setRecommendations] = useState<SavingsRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AdvisorFormData>({
    resolver: zodResolver(advisorSchema),
    defaultValues: {
      income: undefined, // Use undefined for number inputs to show placeholder correctly
      expenses: undefined,
      financialGoals: '',
    },
  });

  const onSubmit: SubmitHandler<AdvisorFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);
    try {
      const result = await getSavingsRecommendations(data);
      setRecommendations(result);
    } catch (e) {
      console.error("AI Advisor Error:", e);
      setError("Sorry, I couldn't generate recommendations at this time. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <PageTitle title="AI Savings Advisor" subtitle="Get personalized savings recommendations powered by AI." />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Sparkles className="mr-3 h-6 w-6 text-primary" /> Your Financial Details</CardTitle>
          <CardDescription>
            Provide your current financial situation and goals. The more details you give, the better the advice.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="income"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="income">Monthly Income ($)</FormLabel>
                      <FormControl>
                        <Input id="income" type="number" placeholder="e.g., 5000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="expenses">Monthly Expenses ($)</FormLabel>
                      <FormControl>
                        <Input id="expenses" type="number" placeholder="e.g., 3000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="financialGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="financialGoals">Financial Goals</FormLabel>
                    <FormControl>
                      <Textarea
                        id="financialGoals"
                        placeholder="e.g., Save for a house down payment, pay off debt, invest for retirement..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <>
                    <Brain className="mr-2 h-5 w-5 animate-pulse" /> Generating Advice...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" /> Get Savings Advice
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><MessageSquare className="mr-3 h-6 w-6 text-primary animate-pulse" /> Your Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive" className="mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recommendations && !isLoading && (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><MessageSquare className="mr-3 h-6 w-6 text-primary" /> Your Personalized Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert text-foreground">
              {recommendations.recommendations.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}
