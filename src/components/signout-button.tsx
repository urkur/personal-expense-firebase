'use client';

import { auth } from '@/lib/firebase';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        await auth.signOut();
        router.push('/login');
    };

    return (
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut />
            <span className="sr-only">Sign Out</span>
        </Button>
    );
}
