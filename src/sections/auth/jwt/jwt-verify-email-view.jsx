'use client';

import { useState, useEffect } from 'react';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { verifyEmail } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export function JwtVerifyEmailView({ token }) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                setLoading(true);
                await verifyEmail({ token });
                setSuccessMsg('Email verified successfully! You can now sign in to your account.');
            } catch (error) {
                console.error(error);
                setErrorMsg(
                    typeof error === 'string'
                        ? error
                        : error?.message
                            ? error.message
                            : 'Failed to verify email'
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            verify();
        } else {
            setErrorMsg('Invalid verification link');
            setLoading(false);
        }
    }, [token]);

    const handleSignIn = () => {
        router.push(paths.auth.jwt.signIn);
    };

    const renderHead = (
        <Stack spacing={1.5} sx={{ mb: 5 }}>
            <Typography variant="h5">Email verification</Typography>
        </Stack>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <Stack spacing={3} sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Verifying your email address...
                    </Typography>
                </Stack>
            );
        }

        if (successMsg) {
            return (
                <Stack spacing={3}>
                    <Alert severity="success">
                        {successMsg}
                    </Alert>

                    <Button
                        fullWidth
                        color="inherit"
                        size="large"
                        variant="contained"
                        onClick={handleSignIn}
                    >
                        Sign in to your account
                    </Button>
                </Stack>
            );
        }

        return (
            <Stack spacing={3}>
                <Alert severity="error">
                    {errorMsg}
                </Alert>

                <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center' }}>
                    <Iconify icon="eva:arrow-ios-back-fill" width={16} />
                    <Link
                        component={RouterLink}
                        href={paths.auth.jwt.signIn}
                        variant="subtitle2"
                        sx={{ alignItems: 'center', display: 'inline-flex' }}
                    >
                        Return to sign in
                    </Link>
                </Stack>
            </Stack>
        );
    };

    return (
        <>
            {renderHead}
            {renderContent()}
        </>
    );
}
