import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fCurrency } from 'src/utils/format-number';
import { Iconify } from 'src/components/iconify';

// Register Chart.js components
Chart.register(...registerables);

// ----------------------------------------------------------------------

export function AccountBalancesChart({ data, loading = false }) {
    const theme = useTheme();
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const createChart = () => {
        if (!data || !chartRef.current || loading) return;

        // Destroy existing chart
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const { bankAccounts = [], totalCashBalance = 0 } = data;

        // Prepare data for chart
        const accountData = [
            ...bankAccounts.map((account, index) => ({
                label: account.accountName || `Bank Account ${index + 1}`,
                value: Math.abs(account.balance || 0),
                type: 'bank',
                color: theme.palette.info.main,
            })),
            ...(totalCashBalance > 0 ? [{
                label: 'Cash Accounts',
                value: Math.abs(totalCashBalance),
                type: 'cash',
                color: theme.palette.warning.main,
            }] : [])
        ].filter(item => item.value > 0);

        if (accountData.length === 0) return;

        const ctx = chartRef.current.getContext('2d');

        chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: accountData.map(item => item.label),
                datasets: [
                    {
                        label: 'Balance',
                        data: accountData.map(item => item.value),
                        backgroundColor: accountData.map(item => alpha(item.color, 0.8)),
                        borderColor: accountData.map(item => item.color),
                        borderWidth: 1,
                        borderRadius: 6,
                        borderSkipped: false,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                                return `Balance: ${fCurrency(context.parsed.y)}`;
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
                            maxRotation: 45,
                        },
                    },
                    y: {
                        grid: {
                            color: alpha(theme.palette.divider, 0.5),
                        },
                        ticks: {
                            color: theme.palette.text.secondary,
                            callback: (value) => fCurrency(value),
                        },
                    },
                },
            },
        });
    };

    useEffect(() => {
        createChart();

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [data, loading, theme]);

    if (loading) {
        return (
            <Card sx={{ p: 3 }}>
                <Skeleton variant="text" width={150} height={28} sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" width="100%" height={200} />
            </Card>
        );
    }

    if (!data || (!data.bankAccounts?.length && !data.totalCashBalance)) {
        return (
            <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                    Account Balances
                </Typography>
                <Box
                    sx={{
                        height: 200,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                        gap: 2,
                    }}
                >
                    <Iconify icon="ph:bank-bold" width={48} />
                    <Typography>No account data available</Typography>
                </Box>
            </Card>
        );
    }

    const { bankAccounts = [], totalCashBalance = 0 } = data;
    const totalBalance = (bankAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance || 0), 0)) + Math.abs(totalCashBalance);

    return (
        <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6">Account Balances</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="ph:wallet-bold" width={20} sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle2" color="primary.main">
                        {fCurrency(totalBalance)}
                    </Typography>
                </Stack>
            </Stack>

            <Box sx={{ height: 200 }}>
                <canvas ref={chartRef} />
            </Box>

            {/* Account Summary */}
            <Stack spacing={1} sx={{ mt: 3 }}>
                {bankAccounts.map((account, index) => (
                    <Stack key={account._id || index} direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: alpha(theme.palette.info.main, 0.8),
                                }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                {account.accountName || `Bank Account ${index + 1}`}
                            </Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight="fontWeightMedium">
                            {fCurrency(Math.abs(account.balance || 0))}
                        </Typography>
                    </Stack>
                ))}
                {totalCashBalance > 0 && (
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: alpha(theme.palette.warning.main, 0.8),
                                }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                Cash Accounts
                            </Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight="fontWeightMedium">
                            {fCurrency(Math.abs(totalCashBalance))}
                        </Typography>
                    </Stack>
                )}
            </Stack>
        </Card>
    );
}

