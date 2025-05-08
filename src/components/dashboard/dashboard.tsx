"use client";

import { PageTitle } from '@/components/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NetWorthChart } from './net-worth-chart';
import { SpendingChart } from './spending-chart';
import { StatCard } from './stat-card';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp, Wallet, ReceiptText, ArrowRightLeft } from 'lucide-react';
import Image from 'next/image';

// Mock data - replace with actual data fetching
const mockNetWorthData = [
  { date: 'Jan', value: 10000 },
  { date: 'Feb', value: 12000 },
  { date: 'Mar', value: 11500 },
  { date: 'Apr', value: 13000 },
  { date: 'May', value: 15000 },
  { date: 'Jun', value: 14500 },
];

const mockSpendingData = [
  { name: 'Groceries', value: 400 },
  { name: 'Utilities', value: 150 },
  { name: 'Transport', value: 100 },
  { name: 'Entertainment', value: 200 },
  { name: 'Other', value: 50 },
];

const mockAccounts = [
  { id: '1', name: 'Main Checking', balance: 5230.50, type: 'Checking' },
  { id: '2', name: 'High-Yield Savings', balance: 12750.00, type: 'Savings' },
  { id: '3', name: 'Vacation Fund', balance: 850.25, type: 'Savings Goal' },
];

export function Dashboard() {
  return (
    <>
      <PageTitle title="Dashboard" subtitle="Your financial overview at a glance." />

      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Net Worth</CardTitle>
          <CardDescription>Your total assets minus liabilities over time.</CardDescription>
        </CardHeader>
        <CardContent className="h-[360px] p-2 md:p-6">
          {/* Placeholder for NetWorthChart component */}
          <NetWorthChart data={mockNetWorthData} />
           {/* <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
            <Image src="https://picsum.photos/800/360" alt="Net worth chart placeholder" width={800} height={360} data-ai-hint="line chart" className="object-cover rounded-md" />
          </div> */}
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            <StatCard title="Total Balance" value="$18,830.75" icon={<Wallet className="text-primary" />} trend="up" trendValue="+ $250 last month" />
            <StatCard title="Monthly Income" value="$5,500.00" icon={<TrendingUp className="text-green-500" />} />
            <StatCard title="Monthly Expenses" value="$2,300.00" icon={<TrendingUp className="text-red-500 transform rotate-180" />} />
          </div>
        </TabsContent>
        <TabsContent value="transactions">
          <Card className="mt-6 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <Button size="sm" variant="outline" className="ml-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Transaction list will appear here.</p>
               <div className="w-full h-48 flex items-center justify-center bg-muted rounded-md">
                 <Image src="https://picsum.photos/600/200" alt="Transactions placeholder" width={600} height={200} data-ai-hint="data table" className="object-cover rounded-md" />
               </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
           <Card className="mt-6 shadow-lg">
            <CardHeader>
              <CardTitle>Spending Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] p-2 md:p-6">
              {/* Placeholder for SpendingChart component */}
              <SpendingChart data={mockSpendingData} />
              {/* <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
                <Image src="https://picsum.photos/600/300" alt="Spending chart placeholder" width={600} height={300} data-ai-hint="bar chart" className="object-cover rounded-md" />
              </div> */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Accounts Overview</CardTitle>
            <Button size="sm" variant="outline" className="ml-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Account
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {mockAccounts.map(account => (
                <li key={account.id} className="flex justify-between items-center p-3 hover:bg-accent/50 rounded-md transition-colors">
                  <div>
                    <p className="font-semibold">{account.name}</p>
                    <p className="text-sm text-muted-foreground">{account.type}</p>
                  </div>
                  <p className="font-semibold text-lg">${account.balance.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> New Savings Goal</Button>
            <Button className="w-full justify-start" variant="outline"><ReceiptText className="mr-2 h-4 w-4" /> Log an Expense</Button>
            <Button className="w-full justify-start" variant="outline"><ArrowRightLeft className="mr-2 h-4 w-4" /> Make a Transfer</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

