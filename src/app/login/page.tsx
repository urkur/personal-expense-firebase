'use client';

import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };
  
  if (loading || user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
            <div className='flex items-center justify-center gap-4 mb-4'>
                <Logo />
                <h1 className="text-2xl font-bold font-headline text-foreground">
                    Raseed Lite
                </h1>
            </div>
          <p className="text-muted-foreground">
            Sign in to continue to your account
          </p>
        </div>
        <Button onClick={signInWithGoogle}>
          Sign In with Google
        </Button>
      </div>
    </div>
  );
}
