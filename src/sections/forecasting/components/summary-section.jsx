import { Card, CardContent, Box, Typography, Paper } from '@mui/material';

export function SummarySection({ summary }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatPercentage = (value) => {
        const sign = value > 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    };

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
                    <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Historical Average Income
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {formatCurrency(summary.historical_averages?.income || 0)}
                        </Typography>
                    </Paper>

                    <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Historical Average Expenses
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {formatCurrency(summary.historical_averages?.expenses || 0)}
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
                                color: (summary.historical_averages?.net || 0) >= 0 ? 'success.main' : 'error.main',
                            }}
                        >
                            {formatCurrency(summary.historical_averages?.net || 0)}
                        </Typography>
                    </Paper>

                    {/* Forecast Averages */}
                    <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Forecast Average Income
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {formatCurrency(summary.forecast_averages?.income || 0)}
                        </Typography>
                    </Paper>

                    <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Forecast Average Expenses
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {formatCurrency(summary.forecast_averages?.expenses || 0)}
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
                                color: (summary.forecast_averages?.net || 0) >= 0 ? 'success.main' : 'error.main',
                            }}
                        >
                            {formatCurrency(summary.forecast_averages?.net || 0)}
                        </Typography>
                    </Paper>

                    {/* Projected Changes */}
                    <Paper sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Income Change
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                color: (summary.projected_change?.income_pct || 0) >= 0 ? 'success.main' : 'error.main',
                            }}
                        >
                            {formatPercentage(summary.projected_change?.income_pct || 0)}
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
                                color: (summary.projected_change?.expenses_pct || 0) <= 0 ? 'success.main' : 'error.main',
                            }}
                        >
                            {formatPercentage(summary.projected_change?.expenses_pct || 0)}
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
                                color: (summary.projected_change?.net_pct || 0) >= 0 ? 'success.main' : 'error.main',
                            }}
                        >
                            {formatPercentage(summary.projected_change?.net_pct || 0)}
                        </Typography>
                    </Paper>
                </Box>
            </CardContent>
        </Card>
    );
}
