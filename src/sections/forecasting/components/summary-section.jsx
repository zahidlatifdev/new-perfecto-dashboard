import { Card, CardContent, Box, Typography, Paper } from '@mui/material';

export function SummarySection({ summary }) {
    const formatCurrency = (value) => {
        if (value == null) return '—';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatPercentage = (value) => {
        if (value == null) return '—';
        const sign = value > 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    };

    if (!summary) return null;

    const hasHistorical = summary.historical_averages && (
        summary.historical_averages.income != null ||
        summary.historical_averages.expenses != null ||
        summary.historical_averages.net != null
    );
    const hasForecast = summary.forecast_averages && (
        summary.forecast_averages.income != null ||
        summary.forecast_averages.expenses != null ||
        summary.forecast_averages.net != null
    );
    const hasProjected = summary.projected_change && (
        summary.projected_change.income_pct != null ||
        summary.projected_change.expenses_pct != null ||
        summary.projected_change.net_pct != null
    );

    if (!hasHistorical && !hasForecast && !hasProjected) return null;

    return (
        <Card>
            <CardContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6">Summary & Projections</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Historical averages vs forecasted averages
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    }}
                >
                    {/* Historical Averages */}
                    {hasHistorical && (
                        <>
                            <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Historical Average Income
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {formatCurrency(summary.historical_averages?.income)}
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Historical Average Expenses
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {formatCurrency(summary.historical_averages?.expenses)}
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Historical Average Net
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        color: summary.historical_averages?.net == null
                                            ? 'text.primary'
                                            : summary.historical_averages.net >= 0 ? 'success.main' : 'error.main',
                                    }}
                                >
                                    {formatCurrency(summary.historical_averages?.net)}
                                </Typography>
                            </Paper>
                        </>
                    )}

                    {/* Forecast Averages */}
                    {hasForecast && (
                        <>
                            <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Forecast Average Income
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {formatCurrency(summary.forecast_averages?.income)}
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Forecast Average Expenses
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {formatCurrency(summary.forecast_averages?.expenses)}
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Forecast Average Net
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        color: summary.forecast_averages?.net == null
                                            ? 'text.primary'
                                            : summary.forecast_averages.net >= 0 ? 'success.main' : 'error.main',
                                    }}
                                >
                                    {formatCurrency(summary.forecast_averages?.net)}
                                </Typography>
                            </Paper>
                        </>
                    )}

                    {/* Projected Changes */}
                    {hasProjected && (
                        <>
                            <Paper sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Income Change
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        color: summary.projected_change?.income_pct == null
                                            ? 'text.primary'
                                            : summary.projected_change.income_pct >= 0 ? 'success.main' : 'error.main',
                                    }}
                                >
                                    {formatPercentage(summary.projected_change?.income_pct)}
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Expenses Change
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        color: summary.projected_change?.expenses_pct == null
                                            ? 'text.primary'
                                            : summary.projected_change.expenses_pct <= 0 ? 'success.main' : 'error.main',
                                    }}
                                >
                                    {formatPercentage(summary.projected_change?.expenses_pct)}
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Net Change
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        color: summary.projected_change?.net_pct == null
                                            ? 'text.primary'
                                            : summary.projected_change.net_pct >= 0 ? 'success.main' : 'error.main',
                                    }}
                                >
                                    {formatPercentage(summary.projected_change?.net_pct)}
                                </Typography>
                            </Paper>
                        </>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
