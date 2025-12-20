import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';

import { fCurrency } from 'src/utils/format-number';

// Register Chart.js components
Chart.register(...registerables);

// ----------------------------------------------------------------------

export function DetailedCategoryBreakdown({ data, loading = false }) {
    const theme = useTheme();
    const expenseChartRef = useRef(null);
    const incomeChartRef = useRef(null);
    const expenseChartInstanceRef = useRef(null);
    const incomeChartInstanceRef = useRef(null);

    // Color palette for different categories
    const getExpenseColors = () => [
        theme.palette.error.main,
        theme.palette.error.light,
        alpha(theme.palette.error.main, 0.8),
        alpha(theme.palette.error.main, 0.6),
        alpha(theme.palette.error.main, 0.4),
        alpha(theme.palette.error.main, 0.3),
        alpha(theme.palette.error.main, 0.2),
        alpha(theme.palette.error.main, 0.1),
    ];

    const getIncomeColors = () => [
        theme.palette.success.main,
        theme.palette.success.light,
        alpha(theme.palette.success.main, 0.8),
        alpha(theme.palette.success.main, 0.6),
        alpha(theme.palette.success.main, 0.4),
    ];

    // Create chart
    const createChart = (chartRef, chartInstanceRef, chartData, colors, title) => {
        if (!chartData || !chartRef.current || chartData.length === 0) return;

        // Destroy existing chart
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');

        const filteredData = chartData.filter(item => item.amount > 0);
        if (filteredData.length === 0) return;

        chartInstanceRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: filteredData.map(item => item._id || 'Other'),
                datasets: [
                    {
                        data: filteredData.map(item => item.amount),
                        backgroundColor: filteredData.map((_, index) => colors[index % colors.length]),
                        borderColor: theme.palette.background.paper,
                        borderWidth: 2,
                        hoverBorderWidth: 3,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        backgroundColor: theme.palette.background.paper,
                        titleColor: theme.palette.text.primary,
                        bodyColor: theme.palette.text.secondary,
                        borderColor: theme.palette.divider,
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => {
                                const value = fCurrency(context.parsed);
                                const percentage = ((context.parsed / filteredData.reduce((sum, item) => sum + item.amount, 0)) * 100).toFixed(1);
                                return `${context.label}: ${value} (${percentage}%)`;
                            },
                        },
                    },
                },
            },
        });
    };

    useEffect(() => {
        if (!data || loading) return;

        const expenseColors = getExpenseColors();
        const incomeColors = getIncomeColors();

        createChart(expenseChartRef, expenseChartInstanceRef, data.expenses, expenseColors, 'Expenses');
        createChart(incomeChartRef, incomeChartInstanceRef, data.income, incomeColors, 'Income');

        return () => {
            if (expenseChartInstanceRef.current) {
                expenseChartInstanceRef.current.destroy();
            }
            if (incomeChartInstanceRef.current) {
                incomeChartInstanceRef.current.destroy();
            }
        };
    }, [data, loading, theme]);

    if (loading) {
        return (
            <Card sx={{ p: 3 }}>
                <Skeleton variant="text" width={200} height={28} sx={{ mb: 3 }} />
                <Stack spacing={4}>
                    <Box>
                        <Skeleton variant="text" width={100} height={24} sx={{ mb: 2 }} />
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: { xs: 2, sm: 3 },
                            flexDirection: { xs: 'column', sm: 'row' }
                        }}>
                            <Skeleton variant="circular" width={140} height={140} />
                            <Stack spacing={1.5} sx={{ flex: 1, width: '100%' }}>
                                {[...Array(4)].map((_, index) => (
                                    <Stack key={index} direction="row" alignItems="center" spacing={1}>
                                        <Skeleton variant="circular" width={10} height={10} />
                                        <Skeleton variant="text" width="60%" height={16} />
                                        <Skeleton variant="text" width="25%" height={16} />
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                    </Box>
                    <Box>
                        <Skeleton variant="text" width={100} height={24} sx={{ mb: 2 }} />
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: { xs: 2, sm: 3 },
                            flexDirection: { xs: 'column', sm: 'row' }
                        }}>
                            <Skeleton variant="circular" width={140} height={140} />
                            <Stack spacing={1.5} sx={{ flex: 1, width: '100%' }}>
                                {[...Array(3)].map((_, index) => (
                                    <Stack key={index} direction="row" alignItems="center" spacing={1}>
                                        <Skeleton variant="circular" width={10} height={10} />
                                        <Skeleton variant="text" width="60%" height={16} />
                                        <Skeleton variant="text" width="25%" height={16} />
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                    </Box>
                </Stack>
            </Card>
        );
    }

    if (!data || (!data.expenses?.length && !data.income?.length)) {
        return (
            <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                    Category Breakdown
                </Typography>
                <Box
                    sx={{
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                    }}
                >
                    <Typography>No category data available</Typography>
                </Box>
            </Card>
        );
    }

    const expenseColors = getExpenseColors();
    const incomeColors = getIncomeColors();

    const expenseData = data.expenses?.filter(cat => cat.amount > 0) || [];
    const incomeData = data.income?.filter(cat => cat.amount > 0) || [];

    const totalExpenses = expenseData.reduce((sum, cat) => sum + cat.amount, 0);
    const totalIncome = incomeData.reduce((sum, cat) => sum + cat.amount, 0);

    const renderCategoryList = (categories, colors, total, title) => (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, color: title === 'Expenses' ? 'error.main' : 'success.main' }}>
                {title}
            </Typography>
            <Box sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 2, sm: 3 },
                flexDirection: { xs: 'column', sm: 'row' }
            }}>
                {/* Chart */}
                <Box sx={{
                    position: 'relative',
                    width: 140,
                    height: 140,
                    mx: { xs: 'auto', sm: 0 },
                    flexShrink: 0
                }}>
                    <canvas ref={title === 'Expenses' ? expenseChartRef : incomeChartRef} />
                    {/* Center text */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
                            {fCurrency(total)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Total
                        </Typography>
                    </Box>
                </Box>

                {/* Legend */}
                <Stack spacing={1.5} sx={{ flex: 1, width: '100%', minWidth: 0 }}>
                    {categories.slice(0, 8).map((category, index) => {
                        const percentage = total > 0 ? ((category.amount / total) * 100) : 0;
                        return (
                            <Stack key={category._id} direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        bgcolor: colors[index % colors.length],
                                        flexShrink: 0,
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        flex: 1,
                                        minWidth: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                    title={category._id || 'Other'}
                                >
                                    {category._id || 'Other'}
                                </Typography>
                                <Stack alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
                                    <Typography variant="body2" fontWeight="fontWeightMedium" sx={{ fontSize: 12 }}>
                                        {fCurrency(category.amount)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                                        {percentage.toFixed(1)}%
                                    </Typography>
                                </Stack>
                            </Stack>
                        );
                    })}
                </Stack>
            </Box>
        </Box>
    );

    return (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
                Detailed Category Breakdown
            </Typography>

            <Stack spacing={4}>
                {/* Expenses */}
                {expenseData.length > 0 && renderCategoryList(expenseData, expenseColors, totalExpenses, 'Expenses')}

                {/* Income */}
                {incomeData.length > 0 && renderCategoryList(incomeData, incomeColors, totalIncome, 'Income')}

                {/* Show message if no data */}
                {expenseData.length === 0 && incomeData.length === 0 && (
                    <Box
                        sx={{
                            height: 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.secondary',
                        }}
                    >
                        <Typography>No category data available</Typography>
                    </Box>
                )}
            </Stack>
        </Card>
    );
}

