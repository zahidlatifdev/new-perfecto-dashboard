import { Box, Typography } from '@mui/material';
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

    // Transform forecast data to chart format
    // Handles both new format ({date, forecast, lower_bound, upper_bound}) and legacy format (number)
    const chartData = (forecastData.forecast || []).map((point, index) => {
        const isObject = typeof point === 'object' && point !== null;
        const value = isObject ? point.forecast : point;
        const confidenceInterval = isObject ? null : (forecastData.confidence_intervals?.[index] || {});

        return {
            period: isObject ? point.date : `Period ${index + 1}`,
            projected: value,
            lower: isObject ? point.lower_bound : (confidenceInterval?.lower || value * 0.9),
            upper: isObject ? point.upper_bound : (confidenceInterval?.upper || value * 1.1),
        };
    });

    if (forecastData.error || chartData.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                    {forecastData.error || 'No forecast data available'}
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6">{getTitle()}</Typography>
                <Typography variant="body2" color="text.secondary">
                    AI-powered projections with confidence intervals
                </Typography>
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
