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

interface ReceiptDisplayProps {
  receipt: ExtractReceiptDataOutput;
}

export function ReceiptDisplay({ receipt }: ReceiptDisplayProps) {
  const formattedDate = new Date(receipt.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: receipt.currency || 'USD',
  });

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
      <CardFooter>
        <div className="flex-grow space-y-2 text-sm">
            {receipt.tax && (
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
      </CardFooter>
    </Card>
  );
}
