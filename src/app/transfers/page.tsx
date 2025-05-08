"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// ====================================================================================================================
//  Interfaces
// ====================================================================================================================

const transferSchema = z.object({
    id: z.string().optional(),
    goal: z.string().min(1, "Goal/Purpose is required"),
    fromAccount: z.string().min(1, "From Account is required"),
    toAccount: z.string().min(1, "To Account is required"),
    amount: z.coerce.number().positive("Amount must be positive"),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface Transfer extends TransferFormData {
    id: string;
}

// ====================================================================================================================
//  Transfers Page Component
// ====================================================================================================================

const TRANSFERS_STORAGE_KEY = 'financeflow_transfers_data';

export default function TransfersPage() {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [transferFrequency, setTransferFrequency] = useState<string>('Bi-weekly');
    const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
    const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null); // This is the correct variable
    const { toast } = useToast();
    const isInitialRender = useRef(true);

    const transferForm = useForm<TransferFormData>({
        resolver: zodResolver(transferSchema),
        defaultValues: { goal: '', fromAccount: '', toAccount: '', amount: 0 },
    });

    useEffect(() => {
        try {
            const storedData = localStorage.getItem(TRANSFERS_STORAGE_KEY);
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                setTransfers(parsedData.transfers || []);
                setTransferFrequency(parsedData.transferFrequency || 'Bi-weekly');
            }
        } catch (error) {
            console.error('Error loading transfers:', error);
            toast({ title: 'Error', description: 'Could not load saved transfers.', variant: 'destructive' });
        } finally {
            isInitialRender.current = false;
        }
    }, [toast]);

    useEffect(() => {
        if (isInitialRender.current) {
            return;
        }
        try {
            localStorage.setItem(TRANSFERS_STORAGE_KEY, JSON.stringify({
                transfers: transfers,
                transferFrequency: transferFrequency,
            }));
        } catch (error) {
            console.error('Error saving transfers:', error);
            toast({ title: 'Error', description: 'Could not save transfers.', variant: 'destructive' });
        }
    }, [transfers, transferFrequency, toast]);

    const onTransferSubmit: SubmitHandler<TransferFormData> = (data) => {
        try {
            if (editingTransfer) {
                setTransfers(transfers.map(t => t.id === editingTransfer.id ? { ...t, ...data } : t));
                toast({ title: 'Success', description: 'Transfer updated.' });
            } else {
                setTransfers([...transfers, { ...data, id: String(Date.now()) }]);
                toast({ title: 'Success', description: 'Transfer added.' });
            }
            transferForm.reset({ goal: '', fromAccount: '', toAccount: '', amount: 0 });
            setIsTransferDialogOpen(false);
            setEditingTransfer(null);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save transfer.', variant: 'destructive' });
        }
    };

    const handleEditTransfer = (transfer: Transfer) => {
        setEditingTransfer(transfer);
        transferForm.reset(transfer);
        setIsTransferDialogOpen(true);
    };

    const handleDeleteTransfer = (transferId: string) => {
        setTransfers(transfers.filter(transfer => transfer.id !== transferId));
        toast({ title: 'Success', description: 'Transfer deleted.' });
    };

    const openNewTransferDialog = () => {
        setEditingTransfer(null);
        transferForm.reset({ goal: '', fromAccount: '', toAccount: '', amount: 0 });
        setIsTransferDialogOpen(true);
    };

    return (
        <PageWrapper>
            <PageTitle title="Fund Transfers" subtitle="Manage and track your fund transfers between accounts or towards goals." />

            <Card className="mb-6 shadow-lg">
                <CardHeader>
                    <CardTitle>Transfer Settings</CardTitle>
                    <CardDescription>Set your preferred default frequency for transfers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="transferFrequencySelect">Default Transfer Frequency:</Label>
                        <Select value={transferFrequency} onValueChange={setTransferFrequency}>
                            <SelectTrigger id="transferFrequencySelect" className="w-[200px]">
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Daily">Daily</SelectItem>
                                <SelectItem value="Weekly">Weekly</SelectItem>
                                <SelectItem value="Bi-weekly">Bi-weekly (Every 2 Weeks)</SelectItem>
                                <SelectItem value="Monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Note: This is a general display setting. Actual recurring transfers need to be set up with your bank.
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>Your Transfers</CardTitle>
                        <CardDescription>Log of all your scheduled or completed transfers.</CardDescription>
                    </div>
                    <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openNewTransferDialog} className="whitespace-nowrap">
                                <PlusCircle className="mr-2 h-5 w-5" /> Add Transfer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px]">
                            <DialogHeader>
                                <DialogTitle>{editingTransfer ? 'Edit Transfer' : 'Log New Transfer'}</DialogTitle>
                                <DialogDescription>
                                    {/* THIS IS THE CORRECTED LINE: editingTansfer -> editingTransfer */}
                                    {editingTransfer ? 'Update the details of this transfer.' : 'Log a new fund transfer to keep track.'}
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...transferForm}>
                                <form onSubmit={transferForm.handleSubmit(onTransferSubmit)} className="space-y-4 py-4">
                                    <FormField control={transferForm.control} name="goal" render={({ field }) => (
                                        <FormItem><FormLabel>Goal / Purpose</FormLabel><FormControl><Input placeholder="e.g., Savings, Vacation Fund" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={transferForm.control} name="fromAccount" render={({ field }) => (
                                            <FormItem><FormLabel>From Account</FormLabel><FormControl><Input placeholder="e.g., Checking XYZ" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={transferForm.control} name="toAccount" render={({ field }) => (
                                            <FormItem><FormLabel>To Account</FormLabel><FormControl><Input placeholder="e.g., Savings ABC" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <FormField control={transferForm.control} name="amount" render={({ field }) => (
                                        <FormItem><FormLabel>Amount ($)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="100.00" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <DialogFooter>
                                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                        <Button type="submit">{editingTransfer ? 'Save Changes' : 'Log Transfer'}</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {transfers.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No transfers logged yet.</p>
                            <Button onClick={openNewTransferDialog} variant="link" className="mt-2">Log your first transfer</Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Goal/Purpose</TableHead>
                                    <TableHead>From Account</TableHead>
                                    <TableHead>To Account</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transfers.map((transfer) => (
                                    <TableRow key={transfer.id} className="hover:bg-accent/50">
                                        <TableCell className="font-medium">{transfer.goal}</TableCell>
                                        <TableCell>{transfer.fromAccount}</TableCell>
                                        <TableCell>{transfer.toAccount}</TableCell>
                                        <TableCell className="text-right font-semibold">${transfer.amount.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditTransfer(transfer)} className="h-8 w-8 mr-1">
                                                <Edit3 className="h-4 w-4" />
                                                <span className="sr-only">Edit transfer</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTransfer(transfer.id)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete transfer</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </PageWrapper>
    );
}