"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/src/hooks/use-toast'; // Adjust path
import {
    PageTitle,
    PageWrapper,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Label,
    PlusCircle,
    Edit3,
    Trash2,
    Landmark as LandmarkIcon,
    CalendarDays,
    RefreshCw,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    DatePicker,
} from "@/components"; // Adjust your import paths!
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays, addWeeks, addMonths } from 'date-fns';

// ====================================================================================================================
//  Interfaces (Define your data structures precisely!)
// ====================================================================================================================

interface BankAccount {
    id: string;
    name: string;
    type: string;
    institution: string;
    balance: number;
}

interface PayCycleData {
    lastPayDate: string | null; // Store as string to handle null and dates
    frequency: string;
}

const accountSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Account name is required"),
    type: z.string().min(1, "Account type is required"),
    balance: z.coerce.number().min(0, "Balance cannot be negative").optional().default(0),
    institution: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface Account extends AccountFormData {
    id: string;
}

const mockAccountTypes = ['Checking', 'Savings', 'Credit Card', 'Investment', 'Loan', 'Other'];

const payCycleSchema = z.object({
    lastPayDate: z.string().nullable(), // Store as string
    frequency: z.enum(['Weekly', 'Bi-weekly', 'Monthly']),
});

type PayCycleFormData = z.infer<typeof payCycleSchema>;

// ====================================================================================================================
//  Accounts Page Component
// ====================================================================================================================

const ACCOUNTS_STORAGE_KEY = 'financeflow_accounts';
const PAY_CYCLE_STORAGE_KEY = 'financeflow_payCycle';

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [payCycleData, setPayCycleData] = useState<PayCycleData>({ lastPayDate: null, frequency: 'Bi-weekly' });
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
        defaultValues: { frequency: 'Bi-weekly' },
    });

    const isInitialRender = useRef(true);

    // --- Load Data ---
    useEffect(() => {
        const loadData = () => {
            try {
                const storedAccounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
                if (storedAccounts) {
                    setAccounts(JSON.parse(storedAccounts));
                }

                const storedPayCycle = localStorage.getItem(PAY_CYCLE_STORAGE_KEY);
                if (storedPayCycle) {
                    setPayCycleData(JSON.parse(storedPayCycle));
                }
            } catch (error) {
                console.error('Error loading data from LocalStorage:', error);
                toast({
                    title: 'Error',
                    description: 'Could not load saved data.',
                    variant: 'destructive',
                });
                setAccounts([]);
                setPayCycleData({ lastPayDate: null, frequency: 'Bi-weekly' });
            } finally {
                isInitialRender.current = false;
            }
        };

        loadData();
    }, [toast]);

    // --- Save Data ---
    useEffect(() => {
        if (isInitialRender.current) return;

        try {
            localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
            localStorage.setItem(PAY_CYCLE_STORAGE_KEY, JSON.stringify(payCycleData));
        } catch (error) {
            console.error('Error saving data to LocalStorage:', error);
            toast({
                title: 'Error',
                description: 'Could not save data.',
                variant: 'destructive',
            });
        }
    }, [accounts, payCycleData, toast]);

    // --- Account Modification Functions ---
    const onAccountSubmit: SubmitHandler<AccountFormData> = (data) => {
        if (editingAccount) {
            setAccounts(accounts.map(acc => acc.id === editingAccount.id ? { ...editingAccount, ...data } : acc));
        } else {
            setAccounts([...accounts, { ...data, id: String(Date.now()) }]);
        }
        accountForm.reset();
        setIsAccountDialogOpen(false);
        setEditingAccount(null);
    };

    const handleEditAccount = (account: Account) => {
        setEditingAccount(account);
        accountForm.reset(account);
        setIsAccountDialogOpen(true);
    };

    const handleDeleteAccount = (accountId: string) => {
        setAccounts(accounts.filter(acc => acc.id !== accountId));
    };

    const openNewAccountDialog = () => {
        setEditingAccount(null);
        accountForm.reset({ name: '', type: '', balance: 0, institution: '' });
        setIsAccountDialogOpen(true);
    };

    // --- Pay Cycle Modification Functions ---
    const onPayCycleSubmit: SubmitHandler<PayCycleFormData> = (data) => {
        let calcNextPayDate: Date | null = null;
        if (data.lastPayDate) {
            const lastPayDateObj = new Date(data.lastPayDate);
            switch (data.frequency) {
                case 'Weekly':
                    calcNextPayDate = addWeeks(lastPayDateObj, 1);
                    break;
                case 'Bi-weekly':
                    calcNextPayDate = addWeeks(lastPayDateObj, 2);
                    break;
                case 'Monthly':
                    calcNextPayDate = addMonths(lastPayDateObj, 1);
                    break;
            }
        }
        setNextPayDate(calcNextPayDate);
    };

    return (
        <PageWrapper>
            <PageTitle title="Bank Accounts & Pay Cycle" subtitle="Manage your accounts and track your pay schedule." />

            <div className="grid gap-6 lg:grid-cols-3">
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
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                                        <SelectContent>{mockAccountTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                                    </Select><FormMessage />
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

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Pay Cycle Calculator</CardTitle>
                    <CardDescription>Estimate your next payday.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...payCycleForm}>
                        <form onSubmit={payCycleForm.handleSubmit(onPayCycleSubmit)} className="space-y-4">
                            <FormField control={payCycleForm.control} name="lastPayDate" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Last Pay Date</FormLabel>
                                    <DatePicker date={field.value ? new Date(field.value) : undefined} onDateChange={field.onChange} />
                                    <FormMessage /></FormItem>
                            )} />
                            <FormField control={payCycleForm.control} name="frequency" render={({ field }) => (
                                <FormItem><FormLabel>Pay Frequency</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Weekly">Weekly</SelectItem>
                                            <SelectItem value="Bi-weekly">Bi-weekly (Every 2 weeks)</SelectItem>
                                            <SelectItem value="Monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select><FormMessage />
                            )} />
                            <Button type="submit" className="w-full"><RefreshCw className="mr-2 h-4 w-4" /> Calculate Next Payday</Button>
                        </form>
                    </Form>
                    {nextPayDate && (
                        <div className="mt-6 p-4 bg-accent/20 border border-accent rounded-md text-center">
                            <CalendarDays className="mx-auto h-8 w-8 text-accent mb-2" />
                            <p className="text-sm text-muted-foreground">Your estimated next payday is:</p>
                            <p className="text-xl font-semibold text-accent">{format(nextPayDate, 'EEEE, MMMM do,