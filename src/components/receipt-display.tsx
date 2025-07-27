import type { ExtractReceiptDataOutput } from '@/ai/flows/extract-receipt-data';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Loader2, Wallet } from 'lucide-react';
import { generateWalletPass } from '@/ai/flows/generate-wallet-pass';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ReceiptDisplayProps {
  receipt: ExtractReceiptDataOutput;
}

export function ReceiptDisplay({ receipt }: ReceiptDisplayProps) {
  const [isAddingToWallet, setIsAddingToWallet] = useState(false);
  const { toast } = useToast();

  const formattedDate = new Date(receipt.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currencyFormatter = new Intl.NumberFormat(receipt.language || 'en-US', {
    style: 'currency',
    currency: receipt.currency || 'USD',
  });

  const handleAddToWallet = async () => {
    setIsAddingToWallet(true);
    try {
      // In a real application, the returned passUrl would be a signed JWT
      // that you would redirect the user to.
      const { passUrl } = await generateWalletPass(receipt);
      
      // For this prototype, we'll show a toast and log the placeholder.
      console.log('Wallet Pass URL:', passUrl);
      toast({
        title: 'Add to Wallet (Prototype)',
        description: 'In a real app, you would be redirected to add this to your Google Wallet.',
      });
      // In a production app, you might do:
      window.open(passUrl, '_blank');

    } catch (error) {
      console.error('Error generating wallet pass:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create a Google Wallet pass.',
      });
    } finally {
      setIsAddingToWallet(false);
    }
  };


  return (
    <Card className="border-accent shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="font-headline text-2xl">{receipt.storeName}</CardTitle>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
        <Badge variant="outline" className="text-lg">
          {currencyFormatter.format(receipt.total)}
        </Badge>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-center">Category</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipt.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-center">
                    {item.category && <Badge variant="secondary">{item.category}</Badge>}
                </TableCell>
                <TableCell className="text-center">{item.quantity ?? 1}</TableCell>
                <TableCell className="text-right">
                  {currencyFormatter.format(item.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className='flex-col items-stretch gap-4'>
        <div className="flex-grow space-y-2 text-sm">
            {receipt.tax != null && (
                <div className="flex justify-between">
                    <p className="text-muted-foreground">Tax</p>
                    <p>{currencyFormatter.format(receipt.tax)}</p>
                </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>{currencyFormatter.format(receipt.total)}</p>
            </div>
        </div>
        <Button onClick={handleAddToWallet} disabled={isAddingToWallet}>
          {isAddingToWallet ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="mr-2 h-4 w-4" />
          )}
          {isAddingToWallet ? 'Generating...' : 'Add to Google Wallet'}
        </Button>
      </CardFooter>
    </Card>
  );
}
