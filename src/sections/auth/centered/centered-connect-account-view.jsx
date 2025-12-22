'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { AnimateLogo2 } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function CenteredConnectAccountView() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [connectedAccounts, setConnectedAccounts] = useState([]);
    const [linkToken, setLinkToken] = useState(null);
    const [companyId, setCompanyId] = useState(null);

    // Fetch user and company info to get company ID
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(endpoints.auth.me);
                if (response.data.user && response.data.company) {
                    setCompanyId(response.data.company._id);
                }
            } catch (error) {
                console.error('Failed to fetch user info:', error);
            }
        };

        if (email) {
            fetchUserInfo();
        }
    }, [email]);

    // Handle Plaid Link success
    const onPlaidSuccess = useCallback(async (publicToken, metadata) => {
        try {
            setLoading(true);
            setErrorMsg('');

            // Exchange public token
            const response = await axios.post(endpoints.plaid.exchangeToken, {
                publicToken,
                companyId,
                metadata,
            });

            if (response.data.success) {
                setConnectedAccounts(response.data.accounts || []);
            }

            setLoading(false);
        } catch (error) {
            console.error('Plaid connection error:', error);
            setErrorMsg(error.message || 'Failed to connect accounts');
            setLoading(false);
        }
    }, [companyId]);

    // Initialize Plaid Link
    const config = {
        token: linkToken,
        onSuccess: onPlaidSuccess,
    };

    const { open, ready } = usePlaidLink(config);

    // Create link token and open Plaid Link
    const handleConnectPlaid = async () => {
        try {
            setLoading(true);
            setErrorMsg('');

            if (!companyId) {
                setErrorMsg('Company information not found. Please try again.');
                setLoading(false);
                return;
            }

            // Create link token
            const response = await axios.post(endpoints.plaid.createLinkToken, {
                companyId,
            });

            if (response.data.success && response.data.linkToken) {
                setLinkToken(response.data.linkToken);
                // Wait a bit for token to be set, then open Plaid Link
                setTimeout(() => {
                    setLoading(false);
                }, 500);
            }
        } catch (error) {
            console.error('Failed to create link token:', error);
            setErrorMsg(error.message || 'Failed to initialize Plaid connection');
            setLoading(false);
        }
    };

    // Open Plaid Link when token is ready
    useEffect(() => {
        if (linkToken && ready) {
            open();
        }
    }, [linkToken, ready, open]);


    // Handle continue to dashboard
    const handleContinue = () => {
        router.push(paths.dashboard.root);
    };

    // Handle skip
    const handleSkip = () => {
        router.push(paths.dashboard.root);
    };

    const renderLogo = <AnimateLogo2 sx={{ mb: 3, mx: 'auto' }} />;

    const renderHead = (
        <Stack alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
            <Typography variant="h5">Connect Your Accounts</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                Link your checking accounts, credit cards, or loan accounts to get started. You can also skip this step
                and add accounts later.
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center', mt: 1 }}>
                Supported: Checking accounts, Credit cards, All loan types (auto, mortgage, student, etc.)
            </Typography>
        </Stack>
    );

    const renderConnectedAccounts = connectedAccounts.length > 0 && (
        <Stack spacing={2} sx={{ mb: 3 }}>
            <Typography variant="subtitle2">Connected Accounts</Typography>
            {connectedAccounts.map((account) => (
                <Card key={account._id} variant="outlined">
                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Iconify
                                    icon={
                                        account.accountType === 'bank_account'
                                            ? 'mdi:bank'
                                            : account.accountType === 'credit_line'
                                                ? 'mdi:credit-card'
                                                : 'mdi:cash'
                                    }
                                    width={32}
                                />
                                <Stack>
                                    <Typography variant="subtitle2">{account.accountName}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {account.institutionName}
                                        {account.accountNumber && ` • ****${account.accountNumber.slice(-4)}`}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main' }} width={24} />
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );

    const renderActions = (
        <Stack spacing={2}>
            {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

            {renderConnectedAccounts}

            <LoadingButton
                fullWidth
                size="large"
                variant="contained"
                onClick={handleConnectPlaid}
                loading={loading}
                disabled={!companyId}
                startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="simple-icons:plaid" />}
            >
                {loading ? 'Initializing...' : 'Connect with Plaid'}
            </LoadingButton>

            {connectedAccounts.length > 0 && (
                <LoadingButton
                    fullWidth
                    size="large"
                    variant="contained"
                    color="primary"
                    onClick={handleContinue}
                    loading={loading}
                >
                    Continue to Dashboard
                </LoadingButton>
            )}

            <Button
                fullWidth
                size="large"
                variant="text"
                color="inherit"
                onClick={handleSkip}
                sx={{ color: 'text.secondary' }}
            >
                Skip for now
            </Button>
        </Stack>
    );

    return (
        <>
            {renderLogo}
            {renderHead}
            {renderActions}
        </>
    );
}
