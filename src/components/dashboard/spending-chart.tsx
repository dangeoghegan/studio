"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface SpendingDataPoint {
  name: string;
  value: number;
}

interface SpendingChartProps {
  data: SpendingDataPoint[];
}

const chartConfig = {
  spending: {
    label: "Spending",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig

export function SpendingChart({ data }: SpendingChartProps) {
   if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available for Spending chart.
      </div>
    );
  }
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <BarChart 
        accessibilityLayer 
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value}`} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar dataKey="value" fill="var(--color-spending)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

