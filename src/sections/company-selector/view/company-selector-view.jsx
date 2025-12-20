'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useAuthContext, useSignOut } from 'src/auth/hooks';
import { switchCompany } from 'src/auth/context/jwt';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function CompanySelectorView() {
    const router = useRouter();
    const signOut = useSignOut();
    const { companies, checkUserSession, user } = useAuthContext();

    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCompanySelect = useCallback((company) => {
        setSelectedCompany(company);
    }, []);

    const handleContinue = useCallback(async () => {
        if (!selectedCompany) return;

        try {
            setIsLoading(true);
            await switchCompany({ companyId: selectedCompany._id });
            await checkUserSession?.();
            router.push(paths.dashboard.root);
        } catch (error) {
            console.error('Failed to switch company:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCompany, checkUserSession, router]);

    const handleSignOut = useCallback(() => {
        signOut();
    }, [signOut]);

    // If user has no companies, show a message
    if (!companies || companies.length === 0) {
        return (
            <DashboardContent>
                <Container maxWidth="md">
                    <Stack spacing={4} sx={{ py: 8, textAlign: 'center' }}>
                        <Box>
                            <Iconify
                                icon="solar:buildings-3-bold-duotone"
                                width={80}
                                sx={{ color: 'text.disabled', mb: 3 }}
                            />
                            <Typography variant="h4" sx={{ mb: 2 }}>
                                No Companies Found
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                You don't have access to any companies yet. Contact your administrator or create a new company to get started.
                            </Typography>
                        </Box>

                        <Alert severity="info">
                            If you believe this is an error, please contact support or try signing out and signing in again.
                        </Alert>

                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button variant="outlined" onClick={handleSignOut}>
                                Sign Out
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => router.push(paths.dashboard.settings + '?tab=companies')}
                            >
                                Create Company
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </DashboardContent>
        );
    }

    const renderCompanyCard = (company) => {
        const userInCompany = company.users?.find(u => u.userId === user?._id);
        const isSelected = selectedCompany?._id === company._id;

        return (
            <Grid item xs={12} sm={6} md={4} key={company._id}>
                <Card
                    sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        border: 2,
                        borderColor: isSelected ? 'primary.main' : 'transparent',
                        '&:hover': {
                            boxShadow: (theme) => theme.customShadows.z12,
                            transform: 'translateY(-4px)',
                        },
                        ...(isSelected && {
                            boxShadow: (theme) => theme.customShadows.z8,
                        }),
                    }}
                >
                    <CardActionArea onClick={() => handleCompanySelect(company)}>
                        <CardContent sx={{ p: 3 }}>
                            <Stack spacing={2} alignItems="center">
                                <Avatar
                                    src={company.logo}
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        bgcolor: company.logo ? 'transparent' : 'primary.main',
                                        fontSize: '1.5rem',
                                    }}
                                >
                                    {!company.logo && company.name?.charAt(0)}
                                </Avatar>

                                <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" noWrap>
                                        {company.name}
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Role: {userInCompany?.role || 'Member'}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: 1,
                                            color: company.status === 'active' ? 'success.main' : 'warning.main',
                                            bgcolor: company.status === 'active' ? 'success.lighter' : 'warning.lighter',
                                        }}
                                    >
                                        {company.status}
                                    </Typography>
                                </Stack>

                                {isSelected && (
                                    <Iconify
                                        icon="eva:checkmark-circle-fill"
                                        color="primary.main"
                                        width={24}
                                    />
                                )}
                            </Stack>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Grid>
        );
    };

    return (
        <DashboardContent>
            <Container maxWidth="md">
                <Stack spacing={4} sx={{ py: 8 }}>
                    <Stack spacing={2} sx={{ textAlign: 'center' }}>
                        <Typography variant="h4">
                            Welcome, {user?.firstName} {user?.lastName}
                        </Typography>
                        <Typography variant="h5">Select a company</Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            Choose the company you want to work with
                        </Typography>
                    </Stack>

                    <Grid container spacing={3}>
                        {companies?.map(renderCompanyCard)}
                    </Grid>

                    <Stack direction="row" justifyContent="center" spacing={2}>
                        <Button
                            variant="outlined"
                            onClick={handleSignOut}
                        >
                            Sign out
                        </Button>

                        <Button
                            size="large"
                            variant="contained"
                            disabled={!selectedCompany || isLoading}
                            onClick={handleContinue}
                            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
                            sx={{ minWidth: 200 }}
                        >
                            {isLoading ? 'Switching...' : 'Continue'}
                        </Button>
                    </Stack>
                </Stack>
            </Container>
        </DashboardContent>
    );
}
