'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Stack,
    Button,
    Tabs,
    Tab,
    Collapse,
    IconButton,
    LinearProgress,
    Paper,
    Chip,
} from '@mui/material';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import {
    revenueData,
    forecastData,
    cashFlowData,
    burnRateData,
    salesMetrics,
    expensesByCategory,
    aiInsights,
    getInsightIcon,
    getInsightColor,
} from 'src/_mock/_financialData';

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
        return (
            <Paper
                sx={{
                    p: 1.5,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    boxShadow: 3,
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {label}
                </Typography>
                {payload.map((entry, index) => (
                    <Typography key={index} variant="body2" sx={{ color: entry.color, fontSize: 11 }}>
                        {entry.name}: {formatter ? formatter(entry.value) : entry.value}
                    </Typography>
                ))}
            </Paper>
        );
    }
    return null;
};

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
    const [selectedTab, setSelectedTab] = useState(0);
    const [expandedInsights, setExpandedInsights] = useState([]);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const toggleInsight = (id) => {
        setExpandedInsights((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatChartCurrency = (value) => {
        return `$${value / 1000}K`;
    };

    return (
        <DashboardContent maxWidth="xl">
            <Stack spacing={3}>
                {/* Page Title */}
                <Typography variant="h4">AI Forecasting</Typography>

                {/* Hero Stats */}
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Monthly Revenue
                                    </Typography>
                                    <Typography variant="h4" sx={{ mb: 0.5 }}>
                                        {formatCurrency(89500)}
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <Iconify icon="mdi:trending-up" width={14} sx={{ color: 'success.main' }} />
                                        <Typography variant="caption" color="success.main">
                                            +8.9% vs last month
                                        </Typography>
                                    </Stack>
                                </Box>
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        bgcolor: 'success.lighter',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Iconify icon="mdi:currency-usd" width={24} sx={{ color: 'success.main' }} />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Monthly Burn Rate
                                    </Typography>
                                    <Typography variant="h4" sx={{ mb: 0.5 }}>
                                        {formatCurrency(burnRateData.currentMonthlyBurn)}
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <Iconify icon="mdi:trending-up" width={14} sx={{ color: 'warning.main' }} />
                                        <Typography variant="caption" color="warning.main">
                                            +11% vs avg
                                        </Typography>
                                    </Stack>
                                </Box>
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        bgcolor: 'warning.lighter',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Iconify icon="mdi:trending-down" width={24} sx={{ color: 'warning.main' }} />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Cash Runway
                                    </Typography>
                                    <Typography variant="h4" sx={{ mb: 0.5 }}>
                                        {burnRateData.runwayMonths.toFixed(0)} months
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        at current burn rate
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        bgcolor: 'primary.lighter',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Iconify icon="mdi:calendar-month" width={24} sx={{ color: 'primary.main' }} />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Net Profit (MTD)
                                    </Typography>
                                    <Typography variant="h4" sx={{ mb: 0.5 }}>
                                        {formatCurrency(24700)}
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <Iconify icon="mdi:trending-up" width={14} sx={{ color: 'success.main' }} />
                                        <Typography variant="caption" color="success.main">
                                            27.6% margin
                                        </Typography>
                                    </Stack>
                                </Box>
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        bgcolor: 'success.lighter',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Iconify icon="mdi:lightning-bolt" width={24} sx={{ color: 'success.main' }} />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>

                {/* AI Insights */}
                <Card>
                    <CardContent>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Box>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Iconify icon="mdi:lightning-bolt" width={20} sx={{ color: 'primary.main' }} />
                                    <Typography variant="h6">AI Insights</Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Smart analysis based on your financial data
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                size="small"
                                endIcon={<Iconify icon="mdi:arrow-right" />}
                            >
                                View All
                            </Button>
                        </Stack>

                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
                            {aiInsights.slice(0, 6).map((insight) => {
                                const isExpanded = expandedInsights.includes(insight.id);
                                const colors = getInsightColor(insight.type);
                                const icon = getInsightIcon(insight.type);

                                return (
                                    <Paper
                                        key={insight.id}
                                        sx={{
                                            p: 2,
                                            bgcolor: colors.bg,
                                            border: 1,
                                            borderColor: colors.border,
                                            borderRadius: 2,
                                            transition: 'all 0.2s',
                                            ...(isExpanded && {
                                                boxShadow: 3,
                                                borderColor: 'primary.main',
                                            }),
                                        }}
                                    >
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                                                <Iconify icon={icon} width={20} sx={{ color: colors.text, mt: 0.5, flexShrink: 0 }} />
                                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                                                        <Typography variant="subtitle2" sx={{ color: colors.text }}>
                                                            {insight.title}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => toggleInsight(insight.id)}
                                                            sx={{
                                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.2s',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <Iconify icon="mdi:chevron-down" width={16} />
                                                        </IconButton>
                                                    </Stack>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: isExpanded ? 'unset' : 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            mt: 0.5,
                                                        }}
                                                    >
                                                        {insight.description}
                                                    </Typography>
                                                    {insight.metric && (
                                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                                {insight.metric}
                                                            </Typography>
                                                            {insight.impact && (
                                                                <>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        •
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {insight.impact}
                                                                    </Typography>
                                                                </>
                                                            )}
                                                        </Stack>
                                                    )}
                                                </Box>
                                            </Stack>

                                            <Collapse in={isExpanded}>
                                                <Stack spacing={2} sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                                    {insight.detailedAnalysis && (
                                                        <Box>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                                                                Detailed Analysis
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                                                {insight.detailedAnalysis}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    {insight.recommendations && insight.recommendations.length > 0 && (
                                                        <Box>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
                                                                Recommendations
                                                            </Typography>
                                                            <Stack spacing={1}>
                                                                {insight.recommendations.map((rec, idx) => (
                                                                    <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                                                                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, mt: 0.25 }}>
                                                                            •
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                                                                            {rec}
                                                                        </Typography>
                                                                    </Stack>
                                                                ))}
                                                            </Stack>
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </Collapse>
                                        </Stack>
                                    </Paper>
                                );
                            })}
                        </Box>
                    </CardContent>
                </Card>

                {/* Charts Tabs */}
                <Card>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', pl: 2 }}>
                        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="forecasting charts tabs">
                            <Tab label="Revenue & Expenses" />
                            <Tab label="Forecast" />
                            <Tab label="Cash Flow" />
                            <Tab label="Expense Breakdown" />
                        </Tabs>
                    </Box>

                    <CardContent>
                        {/* Revenue & Expenses Tab */}
                        <TabPanel value={selectedTab} index={0}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6">Revenue vs Expenses</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Monthly comparison over the past 12 months
                                </Typography>
                            </Box>
                            <Box sx={{ height: 400 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
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
                        </TabPanel>

                        {/* Forecast Tab */}
                        <TabPanel value={selectedTab} index={1}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6">Revenue Forecast</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    AI-powered projections for the next 6 months
                                </Typography>
                            </Box>
                            <Box sx={{ height: 400 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={forecastData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="month" style={{ fontSize: 11 }} />
                                        <YAxis tickFormatter={formatChartCurrency} style={{ fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="optimistic"
                                            stroke="#22c55e"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            dot={false}
                                            name="Optimistic"
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
                                            dataKey="conservative"
                                            stroke="#64748b"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            dot={false}
                                            name="Conservative"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </TabPanel>

                        {/* Cash Flow Tab */}
                        <TabPanel value={selectedTab} index={2}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6">Cash Flow</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Monthly inflows, outflows, and running balance
                                </Typography>
                            </Box>
                            <Box sx={{ height: 400 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashFlowData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="month" style={{ fontSize: 11 }} />
                                        <YAxis tickFormatter={formatChartCurrency} style={{ fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                                        <Legend />
                                        <Bar dataKey="inflow" fill="#22c55e" name="Inflow" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="outflow" fill="#ef4444" name="Outflow" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </TabPanel>

                        {/* Expense Breakdown Tab */}
                        <TabPanel value={selectedTab} index={3}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6">Expense Breakdown</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Where your money is going
                                </Typography>
                            </Box>
                            <Stack spacing={3}>
                                {expensesByCategory.map((expense) => (
                                    <Stack key={expense.category} direction="row" alignItems="center" spacing={2}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {expense.category}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatCurrency(expense.amount)} ({expense.percentage}%)
                                                </Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={expense.percentage}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 1,
                                                    bgcolor: 'grey.200',
                                                    '& .MuiLinearProgress-bar': {
                                                        borderRadius: 1,
                                                        bgcolor: 'primary.main',
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Chip
                                            label={expense.trend}
                                            size="small"
                                            sx={{
                                                ...(expense.trend === 'increasing' && {
                                                    bgcolor: 'warning.lighter',
                                                    color: 'warning.dark',
                                                }),
                                                ...(expense.trend === 'decreasing' && {
                                                    bgcolor: 'success.lighter',
                                                    color: 'success.dark',
                                                }),
                                                ...(expense.trend === 'stable' && {
                                                    bgcolor: 'grey.200',
                                                    color: 'text.secondary',
                                                }),
                                            }}
                                        />
                                    </Stack>
                                ))}
                            </Stack>
                        </TabPanel>
                    </CardContent>
                </Card>

                {/* Sales & Marketing Metrics */}
                <Card>
                    <CardContent>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6">Sales & Marketing Metrics</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Key performance indicators from your transaction data
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2,
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
                            }}
                        >
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {formatCurrency(salesMetrics.totalRevenue)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    Total Revenue (YTD)
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                                    +{salesMetrics.monthlyGrowthRate}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    Monthly Growth
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {formatCurrency(salesMetrics.avgDealSize)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    Avg Deal Size
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {salesMetrics.conversionRate}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    Conversion Rate
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {formatCurrency(salesMetrics.customerAcquisitionCost)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    CAC
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                                    {salesMetrics.ltcCacRatio}:1
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    LTV:CAC Ratio
                                </Typography>
                            </Paper>
                        </Box>
                    </CardContent>
                </Card>
            </Stack>
        </DashboardContent>
    );
}
