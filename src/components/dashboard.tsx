
'use client';

import { useMemo, useState, useEffect } from 'react';
import type { ExtractReceiptDataOutput } from '@/ai/flows/extract-receipt-data';
import { suggestSavings } from '@/ai/flows/suggest-savings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Legend } from 'recharts';
import { Loader2, TrendingUp, PieChart as PieChartIcon, BarChart2, DollarSign, Lightbulb } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

type Receipt = ExtractReceiptDataOutput & { createdAt: Date };

interface DashboardProps {
  receipts: Receipt[];
  isLoading: boolean;
}

const chartConfig: ChartConfig = {
  total: {
    label: 'Total Spending',
  },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];


export function Dashboard({ receipts, isLoading }: DashboardProps) {
  const [suggestions, setSuggestions] = useState('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { toast } = useToast();

  const { monthlyCategoryData, lastThreeMonthsData, totalThisMonth } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const categorySpending: { [key: string]: number } = {};
    let totalForMonth = 0;

    receipts.forEach(receipt => {
      const receiptDate = new Date(receipt.date);
      if (receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear) {
        totalForMonth += receipt.total;
        receipt.items.forEach(item => {
          const category = item.category || 'Uncategorized';
          categorySpending[category] = (categorySpending[category] || 0) + item.amount;
        });
      }
    });

    const monthlyCategoryData = Object.entries(categorySpending).map(([name, value]) => ({
        name,
        value,
    })).sort((a,b) => b.value - a.value);

    const monthlyTotals: { [key: string]: number } = {};
    for (let i = 2; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const year = d.getFullYear();
        const key = `${monthName} ${year}`;
        monthlyTotals[key] = 0;
    }

    receipts.forEach(receipt => {
        const receiptDate = new Date(receipt.date);
        const monthDiff = (currentYear - receiptDate.getFullYear()) * 12 + (currentMonth - receiptDate.getMonth());

        if(monthDiff >= 0 && monthDiff < 3) {
            const d = new Date(receiptDate.getFullYear(), receiptDate.getMonth(), 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            const year = d.getFullYear();
            const key = `${monthName} ${year}`;
            monthlyTotals[key] = (monthlyTotals[key] || 0) + receipt.total;
        }
    });

    const lastThreeMonthsData = Object.entries(monthlyTotals).map(([month, total]) => ({
      month,
      total,
    }));

    return { monthlyCategoryData, lastThreeMonthsData, totalThisMonth: totalForMonth };
  }, [receipts]);
  
  const getSuggestions = async () => {
    if (!receipts.length) {
        toast({
            variant: "default",
            title: "Not enough data",
            description: "Upload some receipts to get savings suggestions.",
        });
        return;
    }
    setIsLoadingSuggestions(true);
    try {
        const spendingData = JSON.stringify({
            monthlyCategoryData,
            lastThreeMonthsData,
            totalThisMonth
        });
        const result = await suggestSavings({ spendingData });
        setSuggestions(result.savingsSuggestions);
    } catch(e) {
        console.error("Error getting suggestions:", e);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to get savings suggestions."
        })
    } finally {
        setIsLoadingSuggestions(false);
    }
  }
  
  useEffect(() => {
    // Automatically fetch suggestions if there are receipts but no suggestions yet.
    if (receipts.length > 0 && !suggestions && !isLoadingSuggestions) {
        getSuggestions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipts.length]);


  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Loading...</CardTitle></CardHeader>
          <CardContent className="flex h-60 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Loading...</CardTitle></CardHeader>
          <CardContent className="flex h-60 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
        <Card className="shadow-lg">
            <CardHeader className='flex-row items-center justify-between'>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <DollarSign /> Total Spend This Month
                </CardTitle>
                <Badge variant="outline" className="text-2xl font-bold">
                    ${totalThisMonth.toFixed(2)}
                </Badge>
            </CardHeader>
        </Card>

        {receipts.length > 0 && (
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb /> AI Savings Advisor
                    </CardTitle>
                    <CardDescription>
                        Get personalized tips based on your recent spending.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingSuggestions ? (
                        <div className="flex items-center justify-center h-24">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : suggestions ? (
                        <div className="prose prose-sm dark:prose-invert text-card-foreground">
                            <p>{suggestions}</p>
                        </div>
                    ) : (
                         <div className="text-center text-muted-foreground py-4">
                            <p>Click the button to generate savings suggestions.</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={getSuggestions} disabled={isLoadingSuggestions}>
                        {isLoadingSuggestions ? <Loader2 className="mr-2 animate-spin" /> : <Lightbulb />}
                        {isLoadingSuggestions ? 'Analyzing...' : 'Get New Suggestions'}
                    </Button>
                </CardFooter>
            </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <PieChartIcon /> This Month's Spending by Category
            </CardTitle>
            </CardHeader>
            <CardContent>
            {monthlyCategoryData.length > 0 ? (
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-60">
                <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie data={monthlyCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {monthlyCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Legend />
                </PieChart>
                </ChartContainer>
            ) : (
                <div className="flex h-60 flex-col items-center justify-center text-muted-foreground">
                    <PieChartIcon className="h-12 w-12" />
                    <p className="mt-2">No spending data for this month.</p>
                </div>
            )}
            </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BarChart2 /> Spending: Last 3 Months
            </CardTitle>
            </CardHeader>
            <CardContent>
            {lastThreeMonthsData.some(d => d.total > 0) ? (
                <ChartContainer config={chartConfig} className="h-60 w-full">
                <BarChart accessibilityLayer data={lastThreeMonthsData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="total" fill="var(--color-total)" radius={4}>
                        {lastThreeMonthsData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
                </ChartContainer>
            ) : (
                <div className="flex h-60 flex-col items-center justify-center text-muted-foreground">
                    <BarChart2 className="h-12 w-12" />
                    <p className="mt-2">No spending data for the last 3 months.</p>
                </div>
            )}
            </CardContent>
        </Card>
        </div>
    </div>
  );
}
