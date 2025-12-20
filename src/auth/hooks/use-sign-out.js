'use client';

import { signOut } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export function useSignOut() {
    const handleSignOut = async () => {
        try {
            await signOut();
            window.location.href = '/auth/sign-in';
        } catch (error) {
            console.error('Sign out error:', error);
            // Force redirect even if sign out fails
            window.location.href = '/auth/sign-in';
        }
    };

    return handleSignOut;
}
