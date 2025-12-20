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

export function CategoryBreakdown({ data, loading = false }) {
    const theme = useTheme();
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    // Color palette for different categories
    const getColors = () => [
        theme.palette.error.main,      // Business Expenses
        theme.palette.warning.main,    // Personal Expenses  
        theme.palette.success.main,    // Income
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
                        display: false, // We'll create a custom legend
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
                                return `${context.label}: ${value} (${percentage}%)`;
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
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: { xs: 2, sm: 3 },
                    flexDirection: { xs: 'column', sm: 'row' }
                }}>
                    <Skeleton variant="circular" width={200} height={200} sx={{ mx: { xs: 'auto', sm: 0 } }} />
                    <Stack spacing={2} sx={{ flex: 1, width: '100%' }}>
                        {[...Array(4)].map((_, index) => (
                            <Stack key={index} direction="row" alignItems="center" spacing={1}>
                                <Skeleton variant="circular" width={12} height={12} />
                                <Skeleton variant="text" width="60%" height={20} />
                                <Skeleton variant="text" width="30%" height={20} />
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
                        height: 250,
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
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 2, sm: 3 },
                flexDirection: { xs: 'column', sm: 'row' }
            }}>
                {/* Chart */}
                <Box sx={{
                    position: 'relative',
                    width: 200,
                    height: 200,
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
                        <Typography variant="h6" color="text.primary">
                            {fCurrency(totalAmount)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Total
                        </Typography>
                    </Box>
                </Box>

                {/* Legend */}
                <Stack spacing={2} sx={{ flex: 1, width: '100%', minWidth: 0 }}>
                    {categoriesWithData.map((category, index) => {
                        const percentage = totalAmount > 0 ? ((Math.abs(category.totalAmount) / totalAmount) * 100) : 0;
                        return (
                            <Stack key={category._id} direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
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
                                    <Typography variant="body2" fontWeight="fontWeightMedium">
                                        {fCurrency(Math.abs(category.totalAmount))}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {percentage.toFixed(1)}%
                                    </Typography>
                                </Stack>
                            </Stack>
                        );
                    })}
                </Stack>
            </Box>
        </Card>
    );
}
