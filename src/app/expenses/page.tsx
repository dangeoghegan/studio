"use client";

import { useState } from 'react';
import { PageTitle } from '@/components/page-title';
import { PageWrapper } from '@/components/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit3, Trash2, ReceiptText as ReceiptTextIcon, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { DatePicker } from '@/components/ui/date-picker'; 

const expenseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Expense name is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  frequency: z.enum(['Monthly', 'Quarterly', 'Annually', 'One-time']),
  nextDueDate: z.date().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface Expense extends ExpenseFormData {
  id: string;
}

const mockCategories = ['Subscription', 'Utilities', 'Rent/Mortgage', 'Insurance', 'Loan', 'Other'];
const mockFrequencies = ['Monthly', 'Quarterly', 'Annually', 'One-time'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', name: 'Netflix Subscription', amount: 15.99, category: 'Subscription', frequency: 'Monthly', nextDueDate: new Date('2024-08-15') },
    { id: '2', name: 'Gym Membership', amount: 49.00, category: 'Subscription', frequency: 'Monthly', nextDueDate: new Date('2024-08-01') },
    { id: '3', name: 'Car Insurance', amount: 350.00, category: 'Insurance', frequency: 'Quarterly', nextDueDate: new Date('2024-09-01') },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: '',
      amount: 0,
      category: '',
      frequency: 'Monthly',
      nextDueDate: undefined,
    },
  });

  const onSubmit: SubmitHandler<ExpenseFormData> = (data) => {
    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === editingExpense.id ? { ...editingExpense, ...data } : e));
    } else {
      setExpenses([...expenses, { ...data, id: String(Date.now()) }]);
    }
    form.reset();
    setIsDialogOpen(false);
    setEditingExpense(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    form.reset(expense);
    setIsDialogOpen(true);
  };

  const handleDelete = (expenseId: string) => {
    setExpenses(expenses.filter(e => e.id !== expenseId));
  };

  const openNewExpenseDialog = () => {
    setEditingExpense(null);
    form.reset({ name: '', amount: 0, category: '', frequency: 'Monthly', nextDueDate: undefined});
    setIsDialogOpen(true);
  };

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <PageTitle title="Recurring Expenses" subtitle="Manage your regular bills and subscriptions." />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewExpenseDialog} className="whitespace-nowrap">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
              <DialogDescription>
                {editingExpense ? 'Update the details of this recurring expense.' : 'Track a new regular bill or subscription.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Spotify Premium" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="10.99" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockFrequencies.map(freq => (
                              <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nextDueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Next Due Date (Optional)</FormLabel>
                        <DatePicker date={field.value} onDateChange={field.onChange} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                   <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">{editingExpense ? 'Save Changes' : 'Add Expense'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {expenses.length === 0 ? (
         <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <ReceiptTextIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">No Recurring Expenses Tracked</CardTitle>
            <CardDescription>Keep your budget in check by adding your regular expenses.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openNewExpenseDialog}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Expenses</CardTitle>
             <CardDescription className="flex items-center">
              Total of {expenses.length} recurring expenses. 
              <Button variant="outline" size="sm" className="ml-auto"><Filter className="mr-2 h-4 w-4" />Filter</Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-accent/50">
                    <TableCell className="font-medium">{expense.name}</TableCell>
                    <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.frequency}</TableCell>
                    <TableCell>{expense.nextDueDate ? expense.nextDueDate.toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)} className="h-8 w-8 mr-1">
                        <Edit3 className="h-4 w-4" />
                        <span className="sr-only">Edit expense</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                         <span className="sr-only">Delete expense</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}
