'use client';
import { useState, useEffect, useRef } from 'react';
import { understandSpendingHabits } from '@/ai/flows/understand-spending-habits';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type ExtractReceiptDataOutput } from '@/ai/flows/extract-receipt-data';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [receipts, setReceipts] = useState<ExtractReceiptDataOutput[]>([]);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchReceipts() {
      if (!user) return;
      setIsLoadingReceipts(true);
      try {
        const q = query(
          collection(db, 'receipts'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedReceipts: ExtractReceiptDataOutput[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Convert Firestore Timestamp to a plain, serializable object (string).
          const plainData = {
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          }
          fetchedReceipts.push(plainData as ExtractReceiptDataOutput);
        });
        setReceipts(fetchedReceipts);
      } catch (e) {
        console.error('Error fetching receipts for chat:', e);
        // Optionally, set an error message to display to the user
      } finally {
        setIsLoadingReceipts(false);
      }
    }

    if (user) {
      fetchReceipts();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  async function handleSend() {
    if (!input.trim() || isSending || isLoadingReceipts) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      // Get current date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split('T')[0];

      const result = await understandSpendingHabits({
        question: input,
        receipts: receipts,
        currentDate: currentDate,
      });
      const aiMessage: Message = { sender: 'ai', text: result.insight };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting insight:', error);
      const errorMessage: Message = {
        sender: 'ai',
        text: 'Sorry, I had trouble understanding that. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto flex flex-col h-full">
      <CardHeader>
        <CardTitle>Ask about your spending</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
            <div className="text-center text-muted-foreground">
                <p>Ask me anything about your spending habits!</p>
                <p className="text-xs">e.g., "How much did I spend on groceries last month?"</p>
            </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.sender === 'user' ? 'justify-end' : ''
            }`}
          >
            {message.sender === 'ai' && (
              <Avatar>
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`rounded-lg px-4 py-2 max-w-md ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p>{message.text}</p>
            </div>
            {message.sender === 'user' && (
              <Avatar>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
         <div ref={messagesEndRef} />
      </CardContent>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoadingReceipts ? "Loading your receipts..." : "Type your message..."}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isSending || isLoadingReceipts}
          />
          <Button onClick={handleSend} disabled={isSending || isLoadingReceipts}>
            {isSending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
