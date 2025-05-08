"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

// Imports based on your src/components/ structure
import { PageWrapper } from "@/components/page-wrapper";
import { PageTitle } from "@/components/page-title";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label"; // Uncomment if Label is directly used and exists
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { PlusCircle, Edit3, Trash2, Landmark as LandmarkIcon, CalendarDays, RefreshCw } from 'lucide-react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addWeeks, addMonths } from 'date-fns';

// ====================================================================================================================
//  Interfaces
// ====================================================================================================================

const accountSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Account name is required"),
    type: z.string().min(1, "Account type is required"),
    balance: z.coerce.number().min(0, "Balance cannot be negative").optional().default(0),
    institution: z.string().optional().default(''),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface Account extends AccountFormData {
    id: string;
}

const mockAccountTypes = ['Checking', 'Savings', 'Credit Card', 'Investment', 'Loan', 'Other'];

const payCycleSchema = z.object({
    lastPayDate: z.date().nullable(),
    frequency: z.enum(['Weekly', 'Bi-weekly', 'Monthly']),
});

type PayCycleFormData = z.infer<typeof payCycleSchema>;

interface PayCycleData { // For storing in localStorage
    lastPayDate: string | null;
    frequency: string;
}

// ====================================================================================================================
//  Accounts Page Component
// ====================================================================================================================

const ACCOUNTS_STORAGE_KEY = 'financeflow_accounts';
const PAY_CYCLE_STORAGE_KEY = 'financeflow_payCycle';

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [nextPayDate, setNextPayDate] = useState<Date | null>(null);
    const { toast } = useToast();

    const accountForm = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
        defaultValues: { name: '', type: '', balance: 0, institution: '' },
    });

    const payCycleForm = useForm<PayCycleFormData>({
        resolver: zodResolver(payCycleSchema),
        defaultValues: { lastPayDate: null, frequency: 'Bi-weekly' },
    });

    // --- Load Data ---
    useEffect(() => {
        try {
            const storedAccounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
            if (storedAccounts) {
                setAccounts(JSON.parse(storedAccounts));
            }

            const storedPayCycle = localStorage.getItem(PAY_CYCLE_STORAGE_KEY);
            if (storedPayCycle) {
                const parsedPayCycle: PayCycleData = JSON.parse(storedPayCycle);
                const formFrequency = parsedPayCycle.frequency as 'Weekly' | 'Bi-weekly' | 'Monthly' || 'Bi-weekly';
                const formLastPayDate = parsedPayCycle.lastPayDate ? new Date(parsedPayCycle.lastPayDate) : null;
                
                payCycleForm.reset({
                    lastPayDate: formLastPayDate,
                    frequency: formFrequency,
                });
                if (formLastPayDate) {
                    // Defined calculateNextPayDay later, so ensure it's callable or handle initialization differently
                    // For simplicity here, assuming calculateNextPayDay is hoisted or we handle its call appropriately
                    // This might be an area to check if calculateNextPayDay isn't defined yet
                }
            }
        } catch (error) {
            console.error('Error loading data from LocalStorage:', error);
            toast({ title: 'Error', description: 'Could not load saved data.', variant: 'destructive' });
        }
    }, [toast, payCycleForm]); // payCycleForm added

    // --- Calculate Next Pay Day (defined before use in useEffect or ensure hoisting) ---
    const calculateNextPayDay = (lastPay: Date | null, freq: 'Weekly' | 'Bi-weekly' | 'Monthly') => {
        if (!lastPay) {
            setNextPayDate(null);
            return;
        }
        let calcNextPayDate: Date;
        switch (freq) {
            case 'Weekly':
                calcNextPayDate = addWeeks(lastPay, 1);
                break;
            case 'Bi-weekly':
                calcNextPayDate = addWeeks(lastPay, 2);
                break;
            case 'Monthly':
                calcNextPayDate = addMonths(lastPay, 1);
                break;
            default:
                setNextPayDate(null); 
                return;
        }
        setNextPayDate(calcNextPayDate);
    };
    
    // Re-run calculation if form values change after initial load
    useEffect(() => {
        const subscription = payCycleForm.watch((value) => {
            if (value.lastPayDate && value.frequency) {
                 calculateNextPayDay(value.lastPayDate, value.frequency as 'Weekly' | 'Bi-weekly' | 'Monthly');
            } else {
                setNextPayDate(null);
            }
        });
        return () => subscription.unsubscribe();
    }, [payCycleForm.watch, calculateNextPayDay]); // Added calculateNextPayDay dependency

    // --- Save Accounts ---
    useEffect(() => {
        // Avoid saving on initial mount if accounts are empty
        if (accounts.length > 0 || localStorage.getItem(ACCOUNTS_STORAGE_KEY) !== null) { // Check if key exists even if empty array
             try {
                localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
            } catch (error) {
                console.error('Error saving accounts to LocalStorage:', error);
                toast({ title: 'Error', description: 'Could not save accounts.', variant: 'destructive' });
            }
        }
    }, [accounts, toast]);

    // --- Account Modification Functions ---
    const onAccountSubmit: SubmitHandler<AccountFormData> = (data) => {
        try {
            if (editingAccount) {
                setAccounts(accounts.map(acc => acc.id === editingAccount.id ? { ...acc, ...data } : acc));
                toast({ title: 'Success', description: 'Account updated.' });
            } else {
                setAccounts([...accounts, { ...data, id: String(Date.now()) }]);
                toast({ title: 'Success', description: 'Account added.' });
            }
            accountForm.reset({ name: '', type: '', balance: 0, institution: '' });
            setIsAccountDialogOpen(false);
            setEditingAccount(null);
        } catch (error) {
             toast({ title: 'Error', description: 'Failed to save account.', variant: 'destructive' });
        }
    }; // Ensure this function is properly closed

    const handleEditAccount = (account: Account) => {
        setEditingAccount(account);
        accountForm.reset(account);
        setIsAccountDialogOpen(true);
    }; // Ensure this function is properly closed

    const handleDeleteAccount = (accountId: string) => {
        setAccounts(accounts.filter(acc => acc.id !== accountId));
        toast({ title: 'Success', description: 'Account deleted.' });
    }; // Ensure this function is properly closed

    const openNewAccountDialog = () => {
        setEditingAccount(null);
        accountForm.reset({ name: '', type: '', balance: 0, institution: '' });
        setIsAccountDialogOpen(true);
    }; // Ensure this function is properly closed


    // --- Pay Cycle Submit & Save ---
    // This is the function just before the main return statement, line 214 in error was likely the end of this
    const onPayCycleSubmit: SubmitHandler<PayCycleFormData> = (data) => {
        try {
            const dataToStore: PayCycleData = {
                lastPayDate: data.lastPayDate ? data.lastPayDate.toISOString() : null,
                frequency: data.frequency,
            };
            localStorage.setItem(PAY_CYCLE_STORAGE_KEY, JSON.stringify(dataToStore));
            // calculateNextPayDay is already called by the watch effect, 
            // but calling it here ensures it's calculated immediately on submit too.
            if (data.lastPayDate) {
                 calculateNextPayDay(data.lastPayDate, data.frequency);
            } else {
                setNextPayDate(null);
            }
            toast({ title: 'Success', description: 'Pay cycle updated.' });
        } catch (error) {
            console.error('Error saving pay cycle data:', error);
            toast({ title: 'Error', description: 'Could not save pay cycle.', variant: 'destructive' });
        }
    }; // <<< THIS IS LIKELY WHERE A SYNTAX ERROR MIGHT HAVE BEEN (e.g., missing semicolon, or an extra brace)

    // Line 216 in your error log
    return ( 
        // Line 217 in your error log
        <PageWrapper> 
            <PageTitle title="Bank Accounts & Pay Cycle" subtitle="Manage your accounts and track your pay schedule." />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Accounts Section */}
                <Card className="lg:col-span-2 shadow-lg">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <div>
                            <CardTitle>Your Accounts</CardTitle>
                            <CardDescription>Overview of all your financial accounts.</CardDescription>
                        </div>
                        <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={openNewAccountDialog} className="whitespace-nowrap">
                                    <PlusCircle className="mr-2 h-5 w-5" /> Add Account
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[480px]">
                                <DialogHeader>
                                    <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
                                    <DialogDescription>
                                        {editingAccount ? 'Update account details.' : 'Add a new bank account, credit card, or other financial account.'}
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...accountForm}>
                                    <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4 py-4">
                                        <FormField control={accountForm.control} name="name" render={({ field }) => (
                                            <FormItem><FormLabel>Account Name</FormLabel><FormControl><Input placeholder="e.g., Main Checking" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={accountForm.control} name="type" render={({ field }) => (
                                                <FormItem><FormLabel>Account Type</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                                        <SelectContent>{mockAccountTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                                    </Select><FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={accountForm.control} name="balance" render={({ field }) => (
                                                <FormItem><FormLabel>Current Balance ($)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="1000.00" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                        <FormField control={accountForm.control} name="institution" render={({ field }) => (
                                            <FormItem><FormLabel>Financial Institution (Optional)</FormLabel><FormControl><Input placeholder="e.g., Bank of America" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <DialogFooter>
                                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                            <Button type="submit">{editingAccount ? 'Save Changes' : 'Add Account'}</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {accounts.length === 0 ? (
                            <div className="text-center py-8">
                                <LandmarkIcon className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground">No accounts added yet.</p>
                                <Button onClick={openNewAccountDialog} variant="link" className="mt-2">Add your first account</Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Institution</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {accounts.map((account) => (
                                        <TableRow key={account.id} className="hover:bg-accent/50">
                                            <TableCell className="font-medium">{account.name}</TableCell>
                                            <TableCell>{account.type}</TableCell>
                                            <TableCell>{account.institution || 'N/A'}</TableCell>
                                            <TableCell className={`text-right font-semibold ${account.balance && account.balance < 0 ? 'text-destructive' : ''}`}>
                                                ${account.balance?.toFixed(2) ?? '0.00'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditAccount(account)} className="h-8 w-8 mr-1">
                                                    <Edit3 className="h-4 w-4" />
                                                    <span className="sr-only">Edit account</span>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteAccount(account.id)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete account</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Pay Cycle Calculator Section */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Pay Cycle Calculator</CardTitle>
                        <CardDescription>Estimate your next payday.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...payCycleForm}>
                            <form onSubmit={payCycleForm.handleSubmit(onPayCycleSubmit)} className="space-y-4">
                                <FormField control={payCycleForm.control} name="lastPayDate" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Last Pay Date</FormLabel>
                                        <DatePicker
                                            date={field.value}
                                            onDateChange={(date) => field.onChange(date)}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={payCycleForm.control} name="frequency" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pay Frequency</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Weekly">Weekly</SelectItem>
                                                <SelectItem value="Bi-weekly">Bi-weekly (Every 2 weeks)</SelectItem>
                                                <SelectItem value="Monthly">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" className="w-full"><RefreshCw className="mr-2 h-4 w-4" /> Calculate & Save</Button>
                            </form>
                        </Form>
                        {nextPayDate && (
                            <div className="mt-6 p-4 bg-primary/10 border border-primary rounded-md text-center">
                                <CalendarDays className="mx-auto h-8 w-8 text-primary mb-2" />
                                <p className="text-sm text-muted-foreground">Your estimated next payday is:</p>
                                <p className="text-xl font-semibold text-primary">{format(nextPayDate, 'EEEE, MMMM do, yyyy')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageWrapper>
    );
}