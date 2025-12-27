'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Stack,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
} from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { KeyMetricsCard } from '../components/key-metrics-card';
import { AIInsightsSection } from '../components/ai-insights-section';
import { MonthlyComparisonChart } from '../components/monthly-comparison-chart';
import { ForecastChart } from '../components/forecast-chart';
import { SummarySection } from '../components/summary-section';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`forecasting-tabpanel-${index}`}
            aria-labelledby={`forecasting-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export default function ForecastingView() {
    const { selectedCompany } = useAuthContext();
    const [selectedTab, setSelectedTab] = useState(0);
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchForecastData();
    }, []);

    const fetchForecastData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get(endpoints.forcast.get(selectedCompany._id));

            console.log('Forecast API Response:', response.data);

            // Handle API response - check the actual response structure
            if (response.data?.success === true && response.data?.data) {
                console.log('Setting forecast data:', response.data.data);
                setForecastData(response.data.data);
            } else if (response.data?.success === false) {
                // API returned success: false
                console.warn('API returned failure:', response.data.message);
                setError(response.data.message || 'No forecast data available');
                setForecastData(null);
            } else {
                // Unexpected response format
                console.error('Unexpected response format:', response.data);
                setError('Unexpected response format from server');
                setForecastData(null);
            }
        } catch (err) {
            console.error('Error fetching forecast data:', err);

            // Handle different error types
            if (err.response) {
                // Server responded with error status
                const errorMessage = err.response.data?.message || err.response.data?.error || 'Failed to load forecast data';
                setError(errorMessage);
            } else if (err.request) {
                // Request was made but no response received
                setError('Unable to connect to server. Please check your connection.');
            } else {
                // Something else happened
                setError(err.message || 'Failed to load forecast data');
            }

            setForecastData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
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

    if (error) {
        const isNoData =
            error.includes('No forecast') ||
            error.includes('not found') ||
            error.includes('No data') ||
            error.includes('empty');

        return (
            <DashboardContent maxWidth="xl">
                <Stack spacing={3}>
                    <Typography variant="h4">AI Forecasting</Typography>
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
                                        onClick={fetchForecastData}
                                    >
                                        Retry
                                    </button>
                                </Box>
                            )
                        }
                    >
                        {isNoData
                            ? 'No forecast data available. Please check back later or contact support if you believe this is an error.'
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
                                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                        No Forecast Data Available
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Forecast data will appear here once generated by the forecasting system.
                                        <br />
                                        Please check back later or contact support if you believe this is an error.
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </Stack>
            </DashboardContent>
        );
    }

    if (!forecastData) {
        return (
            <DashboardContent maxWidth="xl">
                <Stack spacing={3}>
                    <Typography variant="h4">AI Forecasting</Typography>
                    <Card>
                        <CardContent>
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                    No Forecast Data Available
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Forecast data will appear here once generated by the forecasting system.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Stack>
            </DashboardContent>
        );
    }

    const { key_metrics, ai_insights, monthly_comparison, forecasts, summary } = forecastData;

    // Check if we have any meaningful data to display
    const hasKeyMetrics = key_metrics && Object.keys(key_metrics).length > 0;
    const hasInsights = ai_insights && ai_insights.length > 0;
    const hasMonthlyComparison = monthly_comparison && monthly_comparison.length > 0;
    const hasForecasts = forecasts && Object.keys(forecasts).length > 0;
    const hasSummary = summary && Object.keys(summary).length > 0;

    return (
        <DashboardContent maxWidth="xl">
            <Stack spacing={3}>
                {/* Page Title */}
                <Box>
                    <Typography variant="h4">AI Forecasting</Typography>
                    {forecastData.date_range && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {forecastData.date_range}
                        </Typography>
                    )}
                </Box>

                {/* Key Metrics */}
                {hasKeyMetrics && (
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 2,
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                        }}
                    >
                        {key_metrics?.monthly_revenue && (
                            <KeyMetricsCard
                                title="Monthly Revenue"
                                value={key_metrics.monthly_revenue.value || 0}
                                change={
                                    key_metrics.monthly_revenue.change_pct !== undefined
                                        ? `${key_metrics.monthly_revenue.change_pct > 0 ? '+' : ''}${key_metrics.monthly_revenue.change_pct.toFixed(1)}% vs last month`
                                        : null
                                }
                                trend={key_metrics.monthly_revenue.trend}
                                icon="mdi:currency-usd"
                                iconColor="success.main"
                                iconBg="success.lighter"
                            />
                        )}

                        {key_metrics?.monthly_burn_rate && (
                            <KeyMetricsCard
                                title="Monthly Burn Rate"
                                value={key_metrics.monthly_burn_rate.value || 0}
                                change={
                                    key_metrics.monthly_burn_rate.change_pct !== undefined
                                        ? `${key_metrics.monthly_burn_rate.change_pct > 0 ? '+' : ''}${key_metrics.monthly_burn_rate.change_pct.toFixed(1)}% vs avg`
                                        : null
                                }
                                trend={key_metrics.monthly_burn_rate.trend}
                                icon="mdi:trending-down"
                                iconColor="warning.main"
                                iconBg="warning.lighter"
                            />
                        )}

                        {key_metrics?.cash_runway && (
                            <KeyMetricsCard
                                title="Cash Runway"
                                value={key_metrics.cash_runway.months || 0}
                                change={
                                    key_metrics.cash_runway.is_infinite
                                        ? 'Infinite runway'
                                        : 'at current burn rate'
                                }
                                icon="mdi:calendar-month"
                                iconColor="primary.main"
                                iconBg="primary.lighter"
                            />
                        )}

                        {key_metrics?.net_profit_mtd && (
                            <KeyMetricsCard
                                title="Net Profit (MTD)"
                                value={key_metrics.net_profit_mtd.value || 0}
                                change={
                                    key_metrics.net_profit_mtd.margin_pct !== undefined
                                        ? `${key_metrics.net_profit_mtd.margin_pct.toFixed(1)}% margin`
                                        : null
                                }
                                trend={key_metrics.net_profit_mtd.value >= 0 ? 'up' : 'down'}
                                icon="mdi:lightning-bolt"
                                iconColor="success.main"
                                iconBg="success.lighter"
                            />
                        )}
                    </Box>
                )}

                {/* AI Insights */}
                {hasInsights && <AIInsightsSection insights={ai_insights} />}

                {/* Charts Tabs */}
                {(hasMonthlyComparison || hasForecasts) && (
                    <Card>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', pl: 2 }}>
                            <Tabs value={selectedTab} onChange={handleTabChange} aria-label="forecasting charts tabs">
                                <Tab label="Revenue & Expenses" />
                                <Tab label="Income Forecast" />
                                <Tab label="Expenses Forecast" />
                                <Tab label="Cash Flow Forecast" />
                            </Tabs>
                        </Box>

                        <CardContent>
                            {/* Revenue & Expenses Tab */}
                            <TabPanel value={selectedTab} index={0}>
                                {hasMonthlyComparison ? (
                                    <MonthlyComparisonChart data={monthly_comparison} />
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No monthly comparison data available. More transaction history is needed to generate this chart.
                                        </Typography>
                                    </Box>
                                )}
                            </TabPanel>

                            {/* Income Forecast Tab */}
                            <TabPanel value={selectedTab} index={1}>
                                {forecasts?.income && !forecasts.income.error && forecasts.income.forecast?.length > 0 ? (
                                    <ForecastChart forecastData={forecasts.income} type="income" />
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {forecasts?.income?.error || 'No income forecast data available'}
                                        </Typography>
                                        {forecasts?.income?.error && (
                                            <Typography variant="caption" color="text.secondary">
                                                More historical data is required for accurate forecasting.
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </TabPanel>

                            {/* Expenses Forecast Tab */}
                            <TabPanel value={selectedTab} index={2}>
                                {forecasts?.expenses && !forecasts.expenses.error && forecasts.expenses.forecast?.length > 0 ? (
                                    <ForecastChart forecastData={forecasts.expenses} type="expenses" />
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {forecasts?.expenses?.error || 'No expenses forecast data available'}
                                        </Typography>
                                        {forecasts?.expenses?.error && (
                                            <Typography variant="caption" color="text.secondary">
                                                More historical data is required for accurate forecasting.
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </TabPanel>

                            {/* Cash Flow Forecast Tab */}
                            <TabPanel value={selectedTab} index={3}>
                                {forecasts?.net_cash_flow && !forecasts.net_cash_flow.error && forecasts.net_cash_flow.forecast?.length > 0 ? (
                                    <ForecastChart forecastData={forecasts.net_cash_flow} type="net_cash_flow" />
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {forecasts?.net_cash_flow?.error || 'No cash flow forecast data available'}
                                        </Typography>
                                        {forecasts?.net_cash_flow?.error && (
                                            <Typography variant="caption" color="text.secondary">
                                                More historical data is required for accurate forecasting.
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </TabPanel>
                        </CardContent>
                    </Card>
                )}

                {/* Summary Section */}
                {hasSummary && <SummarySection summary={summary} />}
            </Stack>
        </DashboardContent>
    );
}
