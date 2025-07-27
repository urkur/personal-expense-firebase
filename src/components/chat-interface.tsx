'use client';
import { useState, useEffect, useRef } from 'react';
import { understandSpendingHabits } from '@/ai/flows/understand-spending-habits';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type ExtractReceiptDataOutput } from '@/ai/flows/extract-receipt-data';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [receipts, setReceipts] = useState<ExtractReceiptDataOutput[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load receipts from local storage
    const storedReceipts = localStorage.getItem('receipts');
    if (storedReceipts) {
      setReceipts(JSON.parse(storedReceipts));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  async function handleSend() {
    if (!input.trim() || isSending) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const result = await understandSpendingHabits({
        question: input,
        receipts: receipts,
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
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isSending}
          />
          <Button onClick={handleSend} disabled={isSending}>
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
