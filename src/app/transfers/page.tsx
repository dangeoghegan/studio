"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/src/hooks/use-toast';
import {
    PageTitle,
    PageWrapper,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components"; // Adjust your import paths
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// ====================================================================================================================
//  Interfaces
// ====================================================================================================================

interface Transfer {
    id: string;
    goal: string;
    fromAccount: string;
    toAccount: string;
    amount: number;
}

const transferSchema = z.object({
    id: z.string().optional(),
    goal: z.string().min(1, "Goal is required"),
    fromAccount: z.string().min(1, "From Account is required"),
    toAccount: z.string().min(1, "To Account is required"),
    amount: z.coerce.number().min(0, "Amount must be positive"),
});

type TransferFormData = z.infer<typeof transferSchema>;

// ====================================================================================================================
//  Transfers Page Component
// ====================================================================================================================

const TransfersPage = () => {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [transferFrequency, setTransferFrequency] = useState<string>('Bi-weekly'); // Default
    const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
    const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
    const { toast } = useToast();
    const isInitialRender = useRef(true);

    const transferForm = useForm<TransferFormData>({
        resolver: zodResolver(transferSchema),
        defaultValues: { goal: '', fromAccount: '', toAccount: '', amount: 0 },
    });

    // --- Load Data ---
    useEffect(() => {
        const loadTransfers = async () => {
            try {
                const storedData = localStorage.getItem('financeflow_transfers'); // Use a consistent key
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    setTransfers(parsedData.transfers || []); // Use an empty array as default
                    setTransferFrequency(parsedData.transferFrequency || 'Bi-weekly'); // Use default frequency
                }
            } catch (error) {
                console.error('Error loading transfers:', error);
                toast({ title: 'Error', description: 'Could not load saved transfers.', variant: 'destructive' });
                setTransfers([]);
                setTransferFrequency('Bi-weekly');
            } finally {
                isInitialRender.current = false;
            }
        };

        loadTransfers();
    }, [toast]);

    // --- Save Data ---
    useEffect(() => {
        if (isInitialRender.current) return; // Prevent saving on initial render

        try {
            localStorage.setItem('financeflow_transfers', JSON.stringify({
                transfers: transfers,
                transferFrequency: transferFrequency,
            })); // Use a consistent key
        } catch (error) {
            console.error('Error saving transfers:', error);
            toast({ title: 'Error', description: 'Could not save transfers.', variant: 'destructive' });
        }
    }, [transfers, transferFrequency, toast]);

    // --- Transfer Modification Functions ---
    const onTransferSubmit: SubmitHandler<TransferFormData> = (data) => {
        if (editingTransfer) {
            setTransfers(transfers.map(transfer => transfer.id === editingTransfer.id ? { ...editingTransfer, ...data } : transfer));
        } else {
            setTransfers([...transfers, { ...data, id: