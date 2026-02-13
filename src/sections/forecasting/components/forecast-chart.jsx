import { Box, Typography, Stack } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CustomTooltip } from './custom-tooltip';

export function ForecastChart({ forecastData, type = 'income' }) {
    const formatChartCurrency = (value) => `$${(value / 1000).toFixed(0)}K`;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getTitle = () => {
        if (type === 'income') return 'Income Forecast';
        if (type === 'expenses') return 'Expenses Forecast';
        return 'Net Cash Flow Forecast';
    };

    // Handle error state
    if (forecastData?.error) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {forecastData.error}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    More historical data is required for accurate forecasting.
                </Typography>
            </Box>
        );
    }

    // Handle success: false
    if (forecastData?.success === false) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                    {forecastData.error || `${getTitle()} could not be generated. Insufficient data.`}
                </Typography>
            </Box>
        );
    }

    // Transform forecast data to chart format
    const forecastPoints = forecastData?.forecast || [];
    const chartData = forecastPoints.map((point, index) => {
        const isObject = typeof point === 'object' && point !== null;
        const value = isObject ? point.forecast : point;
        const confidenceInterval = isObject ? null : (forecastData.confidence_intervals?.[index] || {});

        return {
            period: isObject ? (point.date || `Period ${index + 1}`) : `Period ${index + 1}`,
            projected: value ?? 0,
            lower: isObject ? (point.lower_bound ?? value * 0.9) : (confidenceInterval?.lower ?? value * 0.9),
            upper: isObject ? (point.upper_bound ?? value * 1.1) : (confidenceInterval?.upper ?? value * 1.1),
        };
    });

    if (chartData.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                    No {type.replace('_', ' ')} forecast data available yet.
                </Typography>
            </Box>
        );
    }

    // Show model info if available
    const modelInfo = forecastData?.model_components;

    return (
        <Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6">{getTitle()}</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        AI-powered projections with confidence intervals
                    </Typography>
                    {modelInfo?.trend && (
                        <Typography variant="caption" color="text.secondary">
                            Trend: {modelInfo.trend}
                        </Typography>
                    )}
                    {modelInfo?.seasonality_detected && (
                        <Typography variant="caption" color="info.main">
                            Seasonality detected
                        </Typography>
                    )}
                </Stack>
            </Box>
            <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="period" style={{ fontSize: 11 }} />
                        <YAxis tickFormatter={formatChartCurrency} style={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="upper"
                            stroke="#22c55e"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Upper Bound"
                        />
                        <Line
                            type="monotone"
                            dataKey="projected"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', r: 4 }}
                            name="Projected"
                        />
                        <Line
                            type="monotone"
                            dataKey="lower"
                            stroke="#64748b"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Lower Bound"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}
