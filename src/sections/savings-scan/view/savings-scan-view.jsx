'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Stack,
    Grid,
    CircularProgress,
    Alert,
    Button as MuiButton,
    alpha,
} from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { OpportunityCard } from '../components/opportunity-card';
import { StatsCards } from '../components/stats-cards';
import { FilterButtons } from '../components/filter-buttons';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

export function SavingsScanView() {
    const { selectedCompany } = useAuthContext();
    const [filter, setFilter] = useState('all');
    const [savingsData, setSavingsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log('Selected Company in SavingsScanView:', selectedCompany);
    useEffect(() => {
        fetchSavingsData();
    }, []);

    const fetchSavingsData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get(endpoints.savingScan.get(selectedCompany._id));

            console.log('Savings Scan API Response:', response.data);

            // Handle API response
            if (response.data?.success === true && response.data?.data) {
                console.log('Setting savings scan data:', response.data.data);
                setSavingsData(response.data.data);
            } else if (response.data?.success === false) {
                console.warn('API returned failure:', response.data.message);
                setError(response.data.message || 'No savings scan data available');
                setSavingsData(null);
            } else {
                console.error('Unexpected response format:', response.data);
                setError('Unexpected response format from server');
                setSavingsData(null);
            }
        } catch (err) {
            console.error('Error fetching savings scan data:', err);

            if (err.response) {
                const errorMessage = err.response.data?.message || err.response.data?.error || 'Failed to load savings scan data';
                setError(errorMessage);
            } else if (err.request) {
                setError('Unable to connect to server. Please check your connection.');
            } else {
                setError(err.message || 'Failed to load savings scan data');
            }

            setSavingsData(null);
        } finally {
            setLoading(false);
        }
    };

    // Filter opportunities
    const filteredOpportunities = savingsData?.opportunities?.filter(
        (opp) => filter === 'all' || opp.status === filter
    ) || [];

    // Calculate stats
    const totalPotentialSavings = savingsData?.dashboard_summary?.potential_savings_per_year || 0;
    const implementedSavings = savingsData?.dashboard_summary?.already_saved || 0;
    const opportunitiesCount = savingsData?.dashboard_summary?.opportunities_found || 0;
    const categoriesCount = savingsData?.dashboard_summary?.categories_count || 0;

    if (loading) {
        return (
            <DashboardContent maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Box>
            </DashboardContent>
        );
    }

    if (error) {
        const isNoData =
            error.includes('No savings') ||
            error.includes('not found') ||
            error.includes('No data') ||
            error.includes('empty');

        return (
            <DashboardContent maxWidth="xl">
                <Stack spacing={3}>
                    <Typography variant="h4">Savings Scan</Typography>
                    <Alert
                        severity={isNoData ? 'info' : 'error'}
                        action={
                            !isNoData && (
                                <MuiButton
                                    color="inherit"
                                    size="small"
                                    onClick={fetchSavingsData}
                                >
                                    Retry
                                </MuiButton>
                            )
                        }
                    >
                        {isNoData
                            ? 'No savings scan data available. Please check back later or contact support if you believe this is an error.'
                            : (
                                <>
                                    {error}
                                    <br />
                                    Please check your internet connection or try again later.
                                </>
                            )
                        }
                    </Alert>
                </Stack>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent maxWidth="xl">
            <Stack spacing={3}>
                {/* Hero Section */}
                <Card
                    sx={{
                        background: (theme) =>
                            `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.12)} 0%, ${alpha(theme.palette.success.main, 0.04)} 100%)`,
                        border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        p: 4,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: (theme) => alpha(theme.palette.common.white, 0.2),
                                        backdropFilter: 'blur(6px)',
                                    }}
                                >
                                    <Iconify icon="mdi:sparkles" width={32} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        Savings Scan
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        AI-Powered Cost Optimization
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 600, mt: 2 }}>
                                We've analyzed your expenses to find cost-saving opportunities across
                                subscriptions, vendors, and operations.
                            </Typography>
                        </Box>
                        {/* <MuiButton
                            variant="contained"
                            startIcon={<Iconify icon="mdi:sparkles" />}
                            sx={{
                                bgcolor: (theme) => alpha(theme.palette.common.white, 0.2),
                                backdropFilter: 'blur(6px)',
                                color: 'inherit',
                                boxShadow: (theme) => theme.shadows[8],
                                '&:hover': {
                                    bgcolor: (theme) => alpha(theme.palette.common.white, 0.3),
                                },
                            }}
                            onClick={fetchSavingsData}
                        >
                            Run New Scan
                        </MuiButton> */}
                    </Box>
                </Card>

                {/* Stats Cards */}
                <Grid container spacing={3}>
                    <StatsCards
                        totalPotentialSavings={totalPotentialSavings}
                        implementedSavings={implementedSavings}
                        opportunitiesCount={opportunitiesCount}
                        categoriesCount={categoriesCount}
                    />
                </Grid>

                {/* Filters */}
                <FilterButtons filter={filter} onFilterChange={setFilter} />

                {/* Opportunities Grid */}
                {filteredOpportunities.length > 0 ? (
                    <Grid container spacing={3}>
                        {filteredOpportunities.map((opportunity, index) => (
                            <Grid item xs={12} md={6} lg={4} key={opportunity.title || index}>
                                <OpportunityCard opportunity={opportunity} index={index} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Card
                        sx={{
                            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                            border: (theme) => `2px dashed ${theme.palette.divider}`,
                        }}
                    >
                        <CardContent sx={{ py: 12, textAlign: 'center' }}>
                            <Iconify
                                icon="mdi:sparkles"
                                width={64}
                                sx={{ color: 'text.disabled', mb: 2 }}
                            />
                            <Typography color="text.secondary">
                                No opportunities found with this filter.
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </Stack>
        </DashboardContent>
    );
}
