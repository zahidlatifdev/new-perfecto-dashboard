import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fCurrency } from 'src/utils/format-number';

// Register Chart.js components
Chart.register(...registerables);

// ----------------------------------------------------------------------

export function IncomeExpensesBreakdown({ data, loading = false }) {
    const theme = useTheme();
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    // Color palette for different categories
    const getColors = () => [
        theme.palette.error.main,
        theme.palette.warning.main,
        theme.palette.success.main,
        theme.palette.info.main,
        theme.palette.primary.main,
        alpha(theme.palette.error.main, 0.7),
        alpha(theme.palette.warning.main, 0.7),
        alpha(theme.palette.success.main, 0.7),
    ];

    useEffect(() => {
        if (!data || !chartRef.current || loading || !data.length) return;

        // Destroy existing chart
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        const colors = getColors();

        // Prepare data for the chart
        const chartData = data.map((category, index) => ({
            label: category._id || 'Other',
            value: Math.abs(category.totalAmount),
            color: colors[index % colors.length],
            count: category.totalCount,
        })).filter(item => item.value > 0);

        if (chartData.length === 0) return;

        chartInstanceRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartData.map(item => item.label),
                datasets: [
                    {
                        data: chartData.map(item => item.value),
                        backgroundColor: chartData.map(item => item.color),
                        borderColor: theme.palette.background.paper,
                        borderWidth: 2,
                        hoverBorderWidth: 3,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
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
                                const percentage = ((context.parsed / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
                                return `${value} (${percentage}%)`;
                            },
                        },
                    },
                },
            },
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [data, loading, theme]);

    if (loading) {
        return (
            <Card sx={{ p: 3 }}>
                <Skeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
                <Box sx={{
                    display: 'flex',
                    alignItems: { xs: 'flex-start', sm: 'flex-start' },
                    gap: { xs: 2, sm: 2 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    minHeight: { xs: 'auto' }
                }}>
                    <Skeleton variant="circular" width={{ xs: 160, sm: 140 }} height={{ xs: 160, sm: 140 }} sx={{ mx: { xs: 'auto', sm: 0 } }} />
                    <Stack spacing={1.5} sx={{ flex: 1, width: '100%' }}>
                        {[...Array(4)].map((_, index) => (
                            <Stack key={index} spacing={0.5}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Skeleton variant="circular" width={10} height={10} />
                                    <Skeleton variant="text" width="70%" height={14} />
                                </Stack>
                                <Skeleton variant="text" width="50%" height={12} />
                            </Stack>
                        ))}
                    </Stack>
                </Box>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Income/Expenses Breakdown
                </Typography>
                <Box
                    sx={{
                        height: 150,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                    }}
                >
                    <Typography>No data available</Typography>
                </Box>
            </Card>
        );
    }

    const colors = getColors();
    const categoriesWithData = data.filter(category => Math.abs(category.totalAmount) > 0);
    const totalAmount = categoriesWithData.reduce((sum, category) => sum + Math.abs(category.totalAmount), 0);

    return (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
                Income/Expenses Breakdown
            </Typography>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 3, sm: 2 },
                flexDirection: { xs: 'column', sm: 'row' },
                minHeight: { xs: 'auto' }
            }}>
                {/* Chart */}
                <Box sx={{
                    position: 'relative',
                    width: { xs: 160, sm: 140 },
                    height: { xs: 160, sm: 140 },
                    mx: { xs: 'auto', sm: 0 },
                    flexShrink: 0
                }}>
                    <canvas ref={chartRef} />
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
                        <Typography variant="subtitle2" color="text.primary" sx={{ fontSize: { xs: '0.875rem', sm: '0.75rem' }, fontWeight: 600 }}>
                            {fCurrency(totalAmount)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6875rem', sm: '0.625rem' } }}>
                            Total
                        </Typography>
                    </Box>
                </Box>

                {/* Legend */}
                <Stack spacing={1.5} sx={{ flex: 1, width: '100%', minWidth: 0, overflow: 'hidden' }}>
                    {categoriesWithData.map((category, index) => {
                        const percentage = totalAmount > 0 ? ((Math.abs(category.totalAmount) / totalAmount) * 100) : 0;
                        return (
                            <Stack key={category._id} direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, width: '100%' }}>
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        bgcolor: colors[index % colors.length],
                                        flexShrink: 0,
                                    }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: { xs: '0.75rem', sm: '0.6875rem' },
                                            fontWeight: 500,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            lineHeight: 1.2,
                                            mb: 0.25
                                        }}
                                        title={category._id || 'Other'}
                                    >
                                        {category._id || 'Other'}
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography
                                            variant="caption"
                                            fontWeight="fontWeightMedium"
                                            sx={{
                                                fontSize: { xs: '0.6875rem', sm: '0.625rem' },
                                                color: 'text.primary'
                                            }}
                                        >
                                            {fCurrency(Math.abs(category.totalAmount))}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ fontSize: { xs: '0.625rem', sm: '0.5625rem' } }}
                                        >
                                            ({percentage.toFixed(1)}%)
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Stack>
                        );
                    })}
                </Stack>
            </Box>
        </Card>
    );
}
