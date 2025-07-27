
'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileText, MessageSquare, Loader2, Camera, Upload, Video, VideoOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/user-nav';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dashboard } from '@/components/dashboard';

type ReceiptWithId = ExtractReceiptDataOutput & { id: string, firestoreId?: string, createdAt: any };

export default function Home() {
  const [receipts, setReceipts] = useState<ReceiptWithId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchReceipts();
    }

    // Cleanup camera stream on component unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [user]);

  async function getCameraPermission() {
    if (typeof navigator.mediaDevices === 'undefined' || !navigator.mediaDevices.getUserMedia) {
        toast({
            variant: 'destructive',
            title: 'Camera Not Supported',
            description: 'Your browser does not support camera access.',
        });
        setHasCameraPermission(false);
        return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setHasCameraPermission(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this feature.',
      });
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setHasCameraPermission(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }

  const handleTabChange = (value: string) => {
    if (value === 'camera') {
      getCameraPermission();
    } else {
      stopCamera();
    }
  };
  
  async function fetchReceipts() {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const q = query(
        collection(db, 'receipts'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedReceipts: ReceiptWithId[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedReceipts.push({
          ...(data as ExtractReceiptDataOutput),
          id: doc.id,
          firestoreId: doc.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        });
      });
      setReceipts(fetchedReceipts);
    } catch (e) {
      console.error('Error fetching receipts:', e);
      setError('Failed to fetch receipt history.');
    } finally {
      setIsLoadingHistory(false);
    }
  }


  async function processReceipt(photoDataUri: string) {
    if (isProcessing || !user) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await extractReceiptData({ photoDataUri });
      const creationTimestamp = Timestamp.now();

      // Save to Firestore
      const docRef = await addDoc(collection(db, "receipts"), {
        ...result,
        userId: user.uid,
        createdAt: creationTimestamp,
      });

      const newReceipt: ReceiptWithId = {
        ...result,
        id: docRef.id,
        firestoreId: docRef.id,
        createdAt: creationTimestamp.toDate(),
      };

      setReceipts(prevReceipts => [newReceipt, ...prevReceipts]);

      toast({
        title: "Success!",
        description: `Receipt from ${result.storeName} processed and saved.`,
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
  
  function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      processReceipt(dataUrl);
      stopCamera();
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
              <Button asChild>
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

         <Dashboard receipts={receipts} isLoading={isLoadingHistory} />

          <Card className="shadow-lg">
             <CardHeader>
                <CardTitle className="text-xl font-semibold text-center">Process a Receipt</CardTitle>
             </CardHeader>
            <CardContent>
                <Tabs defaultValue="upload" className="w-full" onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload"><Upload className="mr-2"/>Upload</TabsTrigger>
                        <TabsTrigger value="camera"><Camera className="mr-2"/>Camera</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="mt-4">
                         <p className="text-muted-foreground mb-4 text-center">
                            Upload an image of your receipt to automatically extract the details.
                        </p>
                        <ReceiptUploader
                            onUpload={processReceipt}
                            isProcessing={isProcessing}
                        />
                    </TabsContent>
                    <TabsContent value="camera" className="mt-4">
                        <div className='flex flex-col items-center gap-4'>
                            <div className='w-full relative bg-muted rounded-md aspect-video flex items-center justify-center'>
                                <video ref={videoRef} className="w-full h-full object-cover rounded-md" autoPlay muted playsInline />
                                <canvas ref={canvasRef} className="hidden" />
                                {hasCameraPermission === false && (
                                     <div className='text-center text-muted-foreground p-4'>
                                        <VideoOff size={48} className="mx-auto mb-2" />
                                        <p>Camera access is required.</p>
                                        <Button onClick={getCameraPermission} variant="link">Try Again</Button>
                                    </div>
                                )}
                                {hasCameraPermission === null && (
                                    <div className='text-center text-muted-foreground p-4'>
                                        <Video size={48} className="mx-auto mb-2" />
                                        <p>Requesting camera permission...</p>
                                    </div>
                                )}
                            </div>

                            <Button onClick={handleCapture} disabled={isProcessing || !hasCameraPermission} className="w-full" size="lg">
                                {isProcessing ? (
                                <Loader2 className="animate-spin" />
                                ) : (
                                <Camera />
                                )}
                                <span className="ml-2">
                                {isProcessing ? 'Processing...' : 'Capture Receipt'}
                                </span>
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
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

            {isLoadingHistory ? (
                <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : receipts.length > 0 ? (
              <Accordion type="single" collapsible>
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
