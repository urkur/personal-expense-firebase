'use client';
import { ChatInterface } from '@/components/chat-interface';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 border-b bg-card">
        <div className="container mx-auto flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <Logo />
          <h1 className="text-2xl font-bold font-headline text-foreground">
            Chat with AI
          </h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-8 overflow-y-auto">
        <ChatInterface />
      </main>
    </div>
  );
}
