import { Box, Typography } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CustomTooltip } from './custom-tooltip';

export function MonthlyComparisonChart({ data = [] }) {
    const formatChartCurrency = (value) => `$${(value / 1000).toFixed(0)}K`;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Transform data to match chart format
    const chartData = data.map((item) => ({
        month: item.month,
        revenue: item.revenue,
        expenses: item.expenses,
    }));

    return (
        <Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6">Revenue vs Expenses</Typography>
                <Typography variant="body2" color="text.secondary">
                    Monthly comparison over time
                </Typography>
            </Box>
            <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="month" style={{ fontSize: 11 }} />
                        <YAxis tickFormatter={formatChartCurrency} style={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#22c55e"
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            name="Revenue"
                        />
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="#ef4444"
                            fillOpacity={1}
                            fill="url(#colorExpenses)"
                            name="Expenses"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}
