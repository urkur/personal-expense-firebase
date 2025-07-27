'use client';

import { useState, useEffect } from 'react';
import {
  extractReceiptData,
  type ExtractReceiptDataOutput,
} from '@/ai/flows/extract-receipt-data';
import { Logo } from '@/components/logo';
import { ReceiptUploader } from '@/components/receipt-uploader';
import { ReceiptDisplay } from '@/components/receipt-display';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, FileText, MessageSquare, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/user-nav';

type ReceiptWithId = ExtractReceiptDataOutput & { id: string };

export default function Home() {
  const [receipts, setReceipts] = useState<ReceiptWithId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  async function processReceipt(photoDataUri: string) {
    if (isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await extractReceiptData({ photoDataUri });
      const newReceipt: ReceiptWithId = {
        ...result,
        id: new Date().toISOString(),
      };
      setReceipts((prevReceipts) => [newReceipt, ...prevReceipts]);
      // Store receipts in local storage to be accessible by the chat page
      localStorage.setItem('receipts', JSON.stringify([newReceipt, ...receipts]));

      toast({
        title: "Success!",
        description: `Receipt from ${result.storeName} processed.`,
      })
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to process receipt. Please try again. Error: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: "There was an error extracting data from your receipt.",
      })
    } finally {
      setIsProcessing(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b bg-card">
        <div className="container mx-auto flex items-center justify-between">
            <div className='flex items-center gap-4'>
                <Logo />
                <h1 className="text-2xl font-bold font-headline text-foreground">
                    Raseed Lite
                </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                  <Link href="/chat">
                      <MessageSquare />
                      <span className='ml-2'>Chat with AI</span>
                  </Link>
              </Button>
              <UserNav user={user} />
            </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid gap-8 max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Upload a Receipt</h2>
              <p className="text-muted-foreground mb-4">
                Upload an image of your receipt to automatically extract the details.
              </p>
              <ReceiptUploader
                onUpload={processReceipt}
                isProcessing={isProcessing}
              />
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-headline text-center">Receipt History</h2>

            {receipts.length > 0 ? (
              <Accordion type="single" collapsible defaultValue={receipts[0]?.id}>
                {receipts.map((receipt) => (
                  <AccordionItem value={receipt.id} key={receipt.id}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-4">
                        <FileText className="text-primary" />
                        <div className="text-left">
                          <p className="font-semibold">{receipt.storeName}</p>
                          <p className="text-sm text-muted-foreground">{new Date(receipt.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ReceiptDisplay receipt={receipt} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <FileText size={48} className="mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No receipts yet</h3>
                <p>Upload your first receipt to get started.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="p-4 border-t text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Raseed Lite. All rights reserved.</p>
      </footer>
    </div>
  );
}
