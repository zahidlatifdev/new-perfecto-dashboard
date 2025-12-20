import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import { useTheme } from '@mui/material/styles';

// Register Chart.js components
Chart.register(...registerables);

// ----------------------------------------------------------------------

export function FinancialChart({ data, loading = false, period, onPeriodChange }) {
    const theme = useTheme();
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const periodOptions = [
        { value: 'this_month', label: 'This Month' },
        { value: 'this_quarter', label: 'This Quarter' },
        { value: 'this_year', label: 'This Year' },
    ];

    useEffect(() => {
        if (!data || !chartRef.current || loading) return;

        // Destroy existing chart
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');

        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: data.income,
                        borderColor: theme.palette.success.main,
                        backgroundColor: theme.palette.success.main,
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: theme.palette.success.main,
                        pointBorderColor: theme.palette.common.white,
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                    },
                    {
                        label: 'Expenses',
                        data: data.expenses,
                        borderColor: theme.palette.error.main,
                        backgroundColor: theme.palette.error.main,
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: theme.palette.error.main,
                        pointBorderColor: theme.palette.common.white,
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 20,
                            color: theme.palette.text.secondary,
                        },
                    },
                    tooltip: {
                        backgroundColor: theme.palette.background.paper,
                        titleColor: theme.palette.text.primary,
                        bodyColor: theme.palette.text.secondary,
                        borderColor: theme.palette.divider,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: (context) => {
                                const value = new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                }).format(context.parsed.y);
                                return `${context.dataset.label}: ${value}`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: theme.palette.text.secondary,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: theme.palette.divider,
                        },
                        ticks: {
                            color: theme.palette.text.secondary,
                            callback: (value) => {
                                return new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    notation: 'compact',
                                }).format(value);
                            },
                        },
                    },
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
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
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Skeleton variant="text" width={150} height={28} />
                    <Skeleton variant="rectangular" width={120} height={40} />
                </Stack>
                <Skeleton variant="rectangular" height={300} />
            </Card>
        );
    }

    return (
        <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6">Financial Overview</Typography>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={period}
                        onChange={onPeriodChange}
                        sx={{
                            '& .MuiSelect-select': {
                                py: 1,
                            },
                        }}
                    >
                        {periodOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            <Box sx={{ height: 300 }}>
                <canvas ref={chartRef} />
            </Box>
        </Card>
    );
}
