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
    Chip,
    Paper,
} from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { OpportunityCard } from '../components/opportunity-card';
import { StatsCards } from '../components/stats-cards';
import { FilterButtons } from '../components/filter-buttons';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

const formatCurrency = (value) => {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export function SavingsScanView() {
    const { selectedCompany } = useAuthContext();
    const [filter, setFilter] = useState('all');
    const [savingsData, setSavingsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (selectedCompany?._id) {
            fetchSavingsData();
        }
    }, [selectedCompany?._id]);

    const fetchSavingsData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get(endpoints.savingScan.get(selectedCompany._id));

            if (response.data?.success === true && response.data?.data) {
                setSavingsData(response.data.data);
            } else if (response.data?.success === false) {
                setError(response.data.message || 'No savings scan data available');
                setSavingsData(null);
            } else {
                setError('Unexpected response format from server');
                setSavingsData(null);
            }
        } catch (err) {
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
    const opportunities = savingsData?.opportunities || [];
    const filteredOpportunities = opportunities.filter(
        (opp) => filter === 'all' || opp.status === filter
    );

    // Calculate stats — prefer dashboard_summary, fall back to summary, then compute from opportunities
    const dashSummary = savingsData?.dashboard_summary;
    const summaryData = savingsData?.summary;

    const totalPotentialSavings =
        dashSummary?.potential_savings_per_year ??
        summaryData?.total_estimated_annual_savings ??
        opportunities.reduce((sum, o) => sum + (o.estimated_annual_savings || 0), 0);

    const implementedSavings =
        dashSummary?.already_saved ??
        opportunities
            .filter((o) => o.status === 'implemented')
            .reduce((sum, o) => sum + (o.estimated_annual_savings || 0), 0);

    const opportunitiesCount =
        dashSummary?.opportunities_found ?? opportunities.length;

    const categoriesCount =
        dashSummary?.categories_count ??
        new Set(opportunities.map((o) => o.category).filter(Boolean)).size;

    // Top spending categories from summary
    const topSpendingCategories = summaryData?.top_spending_categories || [];

    // Opportunities by category from dashboard_summary
    const opportunitiesByCategory = dashSummary?.opportunities_by_category;
    const hasOppsByCategory = opportunitiesByCategory && (
        (opportunitiesByCategory instanceof Map && opportunitiesByCategory.size > 0) ||
        (typeof opportunitiesByCategory === 'object' && Object.keys(opportunitiesByCategory).length > 0)
    );

    // Convert Map or object to entries
    const oppsByCategoryEntries = hasOppsByCategory
        ? (opportunitiesByCategory instanceof Map
            ? Array.from(opportunitiesByCategory.entries())
            : Object.entries(opportunitiesByCategory))
        : [];

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
                                <MuiButton color="inherit" size="small" onClick={fetchSavingsData}>
                                    Retry
                                </MuiButton>
                            )
                        }
                    >
                        {isNoData
                            ? 'No savings scan data available yet. The AI needs transaction history to identify cost-saving opportunities.'
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

    // Check if we have any meaningful data at all
    const hasOpportunities = opportunities.length > 0;
    const hasStats = totalPotentialSavings > 0 || implementedSavings > 0 || opportunitiesCount > 0;
    const hasAnyContent = hasOpportunities || hasStats || topSpendingCategories.length > 0;

    if (!savingsData || !hasAnyContent) {
        return (
            <DashboardContent maxWidth="xl">
                <Stack spacing={3}>
                    <Typography variant="h4">Savings Scan</Typography>
                    <Card>
                        <CardContent>
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <Iconify icon="mdi:sparkles" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                    No Savings Opportunities Found Yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    The AI savings scan hasn&apos;t found enough data to identify cost-saving opportunities. Continue adding transactions and check back later.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
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
                                We&apos;ve analyzed your expenses to find cost-saving opportunities across
                                subscriptions, vendors, and operations.
                            </Typography>
                            {(savingsData?.analysis_period || savingsData?.total_transactions_analyzed > 0) && (
                                <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
                                    {savingsData.analysis_period && (
                                        <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Iconify icon="mdi:calendar-range" width={16} />
                                            {savingsData.analysis_period}
                                        </Typography>
                                    )}
                                    {savingsData.total_transactions_analyzed > 0 && (
                                        <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Iconify icon="mdi:receipt-text-outline" width={16} />
                                            {savingsData.total_transactions_analyzed} transactions analyzed
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Card>

                {/* Stats Cards */}
                {hasStats && (
                    <Grid container spacing={3}>
                        <StatsCards
                            totalPotentialSavings={totalPotentialSavings}
                            implementedSavings={implementedSavings}
                            opportunitiesCount={opportunitiesCount}
                            categoriesCount={categoriesCount}
                        />
                    </Grid>
                )}

                {/* Top Spending Categories */}
                {topSpendingCategories.length > 0 && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Top Spending Categories</Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {topSpendingCategories.map((cat, idx) => (
                                    <Paper
                                        key={cat.category || idx}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            minWidth: 160,
                                            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
                                            border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                            {cat.category || 'Unknown'}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            {formatCurrency(cat.amount)}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Opportunities by Category Breakdown */}
                {oppsByCategoryEntries.length > 0 && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Savings by Category</Typography>
                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                {oppsByCategoryEntries.map(([catName, catData]) => (
                                    <Chip
                                        key={catName}
                                        label={`${catName}: ${formatCurrency(catData?.total_savings)} (${catData?.count || 0})`}
                                        variant="outlined"
                                        color="success"
                                        sx={{ fontWeight: 600 }}
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                {hasOpportunities && (
                    <FilterButtons filter={filter} onFilterChange={setFilter} />
                )}

                {/* Opportunities Grid */}
                {hasOpportunities ? (
                    filteredOpportunities.length > 0 ? (
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
                            <CardContent sx={{ py: 8, textAlign: 'center' }}>
                                <Iconify icon="mdi:filter-off-outline" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
                                <Typography color="text.secondary">
                                    No opportunities match the &quot;{filter}&quot; filter.
                                </Typography>
                                <MuiButton size="small" onClick={() => setFilter('all')} sx={{ mt: 1 }}>
                                    Show all
                                </MuiButton>
                            </CardContent>
                        </Card>
                    )
                ) : null}
            </Stack>
        </DashboardContent>
    );
}
