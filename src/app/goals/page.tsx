"use client";

import { useState } from 'react';
import { PageTitle } from '@/components/page-title';
import { PageWrapper } from '@/components/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Edit3, Trash2, Target as TargetIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker'; // Assuming a DatePicker component exists or will be created

const goalSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.coerce.number().min(1, "Target amount must be greater than 0"),
  currentAmount: z.coerce.number().min(0, "Current amount cannot be negative").optional().default(0),
  deadline: z.date().optional(),
  linkedAccount: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface Goal extends GoalFormData {
  id: string;
}

// Mock accounts for linking
const mockAccounts = [
  { id: 'acc1', name: 'Main Savings' },
  { id: 'acc2', name: 'Vacation Fund Account' },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', name: 'Dream Vacation to Japan', targetAmount: 5000, currentAmount: 1200, deadline: new Date('2025-06-01'), linkedAccount: 'acc2' },
    { id: '2', name: 'New Laptop', targetAmount: 1500, currentAmount: 750 },
    { id: '3', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 9500, deadline: new Date('2024-12-31'), linkedAccount: 'acc1' },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: undefined,
      linkedAccount: undefined,
    },
  });

  const onSubmit: SubmitHandler<GoalFormData> = (data) => {
    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? { ...editingGoal, ...data } : g));
    } else {
      setGoals([...goals, { ...data, id: String(Date.now()) }]);
    }
    form.reset();
    setIsDialogOpen(false);
    setEditingGoal(null);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    form.reset(goal); // Populate form with goal data
    setIsDialogOpen(true);
  };

  const handleDelete = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };
  
  const openNewGoalDialog = () => {
    setEditingGoal(null);
    form.reset({ name: '', targetAmount: 0, currentAmount: 0, deadline: undefined, linkedAccount: undefined });
    setIsDialogOpen(true);
  };

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <PageTitle title="Savings Goals" subtitle="Set, track, and achieve your financial milestones." />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewGoalDialog} className="whitespace-nowrap">
              <PlusCircle className="mr-2 h-5 w-5" /> New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
              <DialogDescription>
                {editingGoal ? 'Update the details of your savings goal.' : 'Define a new financial goal you want to achieve.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., New Car Downpayment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="targetAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Deadline (Optional)</FormLabel>
                       <DatePicker date={field.value} onDateChange={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkedAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Account (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockAccounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">{editingGoal ? 'Save Changes' : 'Create Goal'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <TargetIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">No Savings Goals Yet</CardTitle>
            <CardDescription>Start planning for your future by creating your first savings goal.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openNewGoalDialog}>
              <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            return (
              <Card key={goal.id} className="flex flex-col shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{goal.name}</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)} className="h-8 w-8">
                        <Edit3 className="h-4 w-4" />
                         <span className="sr-only">Edit goal</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                         <span className="sr-only">Delete goal</span>
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Target: ${goal.targetAmount.toLocaleString()}
                    {goal.deadline && ` by ${goal.deadline.toLocaleDateString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <Progress value={progress} aria-label={`${goal.name} progress ${progress.toFixed(0)}%`} />
                    <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(1)}% complete</p>
                  </div>
                  {goal.linkedAccount && (
                    <p className="text-xs text-muted-foreground">
                      Linked to: {mockAccounts.find(acc => acc.id === goal.linkedAccount)?.name || 'Unknown Account'}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Add Contribution</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
