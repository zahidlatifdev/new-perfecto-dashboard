'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Stack,
    CircularProgress,
    Alert,
    Button,
    Grid,
    Chip,
} from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { Iconify } from 'src/components/iconify';

// Insight Card Component
function InsightCard({ insight }) {
    const getInsightIcon = (type) => {
        switch (type) {
            case 'spending_insight':
                return 'mdi:cash-multiple';
            case 'milestone':
                return 'mdi:trophy-outline';
            case 'trend':
                return 'mdi:trending-up';
            case 'alert':
                return 'mdi:alert-circle-outline';
            default:
                return 'mdi:lightbulb-outline';
        }
    };

    const getInsightColor = (type) => {
        switch (type) {
            case 'spending_insight':
                return 'primary';
            case 'milestone':
                return 'success';
            case 'trend':
                return 'info';
            case 'alert':
                return 'warning';
            default:
                return 'default';
        }
    };

    return (
        <Card
            sx={{
                height: '100%',
                borderLeft: (theme) => `4px solid ${theme.palette[getInsightColor(insight.type)]?.main || theme.palette.primary.main}`,
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[8],
                }
            }}
        >
            {insight.is_new && (
                <Chip
                    label="NEW"
                    size="small"
                    color="error"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 700,
                        fontSize: '0.65rem'
                    }}
                />
            )}
            <CardContent>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: (theme) => theme.palette[getInsightColor(insight.type)]?.lighter || theme.palette.grey[200],
                                color: (theme) => theme.palette[getInsightColor(insight.type)]?.main || theme.palette.primary.main,
                                flexShrink: 0,
                            }}
                        >
                            <Iconify icon={getInsightIcon(insight.type)} width={28} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ mb: 0.5 }}>
                                {insight.title}
                            </Typography>
                            {insight.category && (
                                <Chip
                                    label={insight.category}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 22 }}
                                />
                            )}
                        </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                        {insight.description}
                    </Typography>

                    {insight.metric && (
                        <Box
                            sx={{
                                bgcolor: (theme) => theme.palette.grey[100],
                                borderRadius: 1,
                                p: 2,
                                textAlign: 'center'
                            }}
                        >
                            <Typography
                                variant="h4"
                                color={getInsightColor(insight.type) + '.main'}
                                sx={{ fontWeight: 700 }}
                            >
                                {insight.metric}
                            </Typography>
                        </Box>
                    )}

                    {insight.vendor && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Iconify icon="mdi:store" width={16} sx={{ color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                                {insight.vendor}
                            </Typography>
                        </Box>
                    )}

                    {insight.additional_info && (
                        <Alert severity="info" sx={{ py: 0.5 }}>
                            <Typography variant="caption">
                                {insight.additional_info}
                            </Typography>
                        </Alert>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

export function FunFactsView() {
    const { selectedCompany } = useAuthContext();
    const [funFactsData, setFunFactsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [triggering, setTriggering] = useState(false);

    useEffect(() => {
        fetchFunFacts();
    }, []);

    const fetchFunFacts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get(endpoints.funFacts.get(selectedCompany._id));

            console.log('Fun Facts API Response:', response.data);

            if (response.data?.success === true && response.data?.data) {
                const data = response.data.data;

                // Check if we have valid insights
                if (data.insights && data.insights.length > 0) {
                    console.log('Setting fun facts data:', data);
                    setFunFactsData(data);
                } else {
                    console.warn('No insights available');
                    setError('No fun facts available yet');
                    setFunFactsData(null);
                }
            } else if (response.data?.success === false) {
                console.warn('API returned failure:', response.data.message);
                setError(response.data.message || 'No fun facts data available');
                setFunFactsData(null);
            } else {
                console.error('Unexpected response format:', response.data);
                setError('Unexpected response format from server');
                setFunFactsData(null);
            }
        } catch (err) {
            console.error('Error fetching fun facts:', err);

            if (err.response) {
                const errorMessage = err.response.data?.message || err.response.data?.error || 'Failed to load fun facts';
                setError(errorMessage);
            } else if (err.request) {
                setError('Unable to connect to server. Please check your connection.');
            } else {
                setError(err.message || 'Failed to load fun facts');
            }

            setFunFactsData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleTriggerFunFacts = async () => {
        try {
            setTriggering(true);
            setError(null);

            await axiosInstance.post(endpoints.funFacts.trigger(selectedCompany._id), {
                analysis_period_days: 30
            });

            // Show success message
            alert('Fun Facts generation triggered! Results will be available shortly.');

            // Refresh after a short delay
            setTimeout(() => {
                fetchFunFacts();
            }, 2000);
        } catch (err) {
            console.error('Error triggering fun facts:', err);
            const errorMessage = err.response?.data?.message || 'Failed to trigger fun facts generation';
            setError(errorMessage);
        } finally {
            setTriggering(false);
        }
    };

    if (loading) {
        return (
            <DashboardContent maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Box>
            </DashboardContent>
        );
    }

    if (error && !funFactsData) {
        const isNoData =
            error.includes('No fun facts') ||
            error.includes('not found') ||
            error.includes('No data') ||
            error.includes('empty');

        return (
            <DashboardContent maxWidth="xl">
                <Stack spacing={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4">Fun Facts</Typography>
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="mdi:sparkles" />}
                            onClick={handleTriggerFunFacts}
                            disabled={triggering}
                        >
                            {triggering ? 'Generating...' : 'Generate Fun Facts'}
                        </Button>
                    </Box>

                    <Alert
                        severity={isNoData ? 'info' : 'error'}
                        action={
                            !isNoData && (
                                <Box>
                                    <button
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#1976d2',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            padding: 0,
                                        }}
                                        onClick={fetchFunFacts}
                                    >
                                        Retry
                                    </button>
                                </Box>
                            )
                        }
                    >
                        {isNoData
                            ? 'No fun facts generated yet. Click the button above to generate insights about your spending!'
                            : (
                                <>
                                    {error}
                                    <br />
                                    Please check your internet connection or try again later.
                                </>
                            )
                        }
                    </Alert>

                    {isNoData && (
                        <Card>
                            <CardContent>
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <Iconify
                                        icon="mdi:lightbulb-on-outline"
                                        width={64}
                                        sx={{ color: 'text.disabled', mb: 2 }}
                                    />
                                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                        Discover Interesting Insights
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        Fun Facts analyzes your spending patterns to reveal interesting insights, milestones, and trends.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<Iconify icon="mdi:sparkles" />}
                                        onClick={handleTriggerFunFacts}
                                        disabled={triggering}
                                    >
                                        {triggering ? 'Generating Fun Facts...' : 'Generate Your First Fun Facts'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </Stack>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent maxWidth="xl">
            <Stack spacing={3}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4">Fun Facts</Typography>
                        {funFactsData?.analysis_period && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Analysis Period: {new Date(funFactsData.analysis_period.start_date).toLocaleDateString()} - {new Date(funFactsData.analysis_period.end_date).toLocaleDateString()} ({funFactsData.analysis_period.days} days)
                            </Typography>
                        )}
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Iconify icon="mdi:refresh" />}
                        onClick={handleTriggerFunFacts}
                        disabled={triggering}
                    >
                        {triggering ? 'Generating...' : 'Refresh Fun Facts'}
                    </Button>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert severity="warning" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Summary Stats */}
                {funFactsData?.summary && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'primary.lighter',
                                                color: 'primary.main',
                                            }}
                                        >
                                            <Iconify icon="mdi:format-list-bulleted" width={32} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                                {funFactsData.summary.total_insights}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Insights
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'success.lighter',
                                                color: 'success.main',
                                            }}
                                        >
                                            <Iconify icon="mdi:star-outline" width={32} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                Insights by Type
                                            </Typography>
                                            <Stack direction="row" spacing={2} flexWrap="wrap">
                                                {Object.entries(funFactsData.summary.insights_by_type || {}).map(([type, count]) => (
                                                    <Chip
                                                        key={type}
                                                        label={`${type}: ${count}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Stack>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Insights Grid */}
                {funFactsData?.insights && funFactsData.insights.length > 0 && (
                    <Box>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Your Insights
                        </Typography>
                        <Grid container spacing={3}>
                            {funFactsData.insights.map((insight) => (
                                <Grid item xs={12} md={6} lg={4} key={insight.id}>
                                    <InsightCard insight={insight} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* No Insights */}
                {(!funFactsData?.insights || funFactsData.insights.length === 0) && !error && (
                    <Card>
                        <CardContent>
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <Typography variant="h6" color="text.secondary">
                                    No insights available
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Stack>
        </DashboardContent>
    );
}
