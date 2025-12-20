'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import FormHelperText from '@mui/material/FormHelperText';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';

import { DashboardContent } from 'src/layouts/dashboard';
import { fCurrency } from 'src/utils/format-number';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Sample data for accounts
const ACCOUNTS = [
    { value: 'chase', label: 'Chase Checking (...1234)' },
    { value: 'amex', label: 'Amex Gold (...5678)' },
];

// Sample data for periods
const PERIODS = [
    { value: 'may2025', label: 'May 2025' },
    { value: 'apr2025', label: 'April 2025' },
    { value: 'mar2025', label: 'March 2025' },
];

// Sample unreconciled transactions
const UNRECONCILED_TRANSACTIONS = [
    {
        id: '1',
        description: 'Bank Fee',
        amount: 10.00,
        date: 'May 31',
        action: 'match',
    },
    {
        id: '2',
        description: 'Unknown Debit',
        amount: 25.00,
        date: 'May 29',
        action: 'investigate',
    },
];

// Format currency with exactly 2 decimal places
const formatCurrencyWithTwoDecimals = (value) => {
    // Use fCurrency but ensure 2 decimal places
    return fCurrency(value, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// ----------------------------------------------------------------------

export function ReconciliationView() {
    const [account, setAccount] = useState('chase');
    const [period, setPeriod] = useState('may2025');

    // Sample reconciliation data - in a real app this would come from an API
    const statementBalance = 12540.50;
    const bookBalance = 12530.50;
    const difference = statementBalance - bookBalance;
    const isReconciled = difference === 0;
    const lastReconciled = 'April 30, 2025';

    const handleAccountChange = (event) => {
        setAccount(event.target.value);
    };

    const handlePeriodChange = (event) => {
        setPeriod(event.target.value);
    };

    const handleMatch = (transactionId) => {
        console.log(`Match transaction: ${transactionId}`);
        // In a real app, you'd match the transaction here
    };

    const handleInvestigate = (transactionId) => {
        console.log(`Investigate transaction: ${transactionId}`);
        // In a real app, you'd open an investigation modal here
    };

    const handleStartReconciliation = () => {
        console.log('Start reconciliation process');
        // In a real app, you'd start the reconciliation workflow
    };

    return (
        <DashboardContent maxWidth="xl">
            {/* Header with Account and Period Selectors */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h4">Reconciliation</Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Account:</Typography>
                    <FormControl sx={{ minWidth: 180 }} size="small">
                        <Select
                            value={account}
                            onChange={handleAccountChange}
                            displayEmpty
                        >
                            {ACCOUNTS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Period:</Typography>
                    <FormControl sx={{ minWidth: 130 }} size="small">
                        <Select
                            value={period}
                            onChange={handlePeriodChange}
                            displayEmpty
                        >
                            {PERIODS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Stack>

            {/* Main Reconciliation Card */}
            <Card>
                <CardContent sx={{ p: 3 }}>
                    {/* Balance Summary */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                <Typography variant="caption" color="text.secondary">
                                    Statement Ending Balance
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                    {formatCurrencyWithTwoDecimals(statementBalance)}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                <Typography variant="caption" color="text.secondary">
                                    Book Balance (Perfecto AI)
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                    {formatCurrencyWithTwoDecimals(bookBalance)}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                <Typography variant="caption" color="text.secondary">
                                    Difference
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: difference === 0 ? 'success.main' : 'error.main'
                                    }}
                                >
                                    {formatCurrencyWithTwoDecimals(difference)}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Reconciliation Status */}
                    <Box sx={{ mb: 3 }}>
                        <Chip
                            label={isReconciled ? "Reconciled" : "Unreconciled"}
                            color={isReconciled ? "success" : "error"}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                        />
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            component="span"
                            sx={{ ml: 1 }}
                        >
                            Last reconciled: {lastReconciled}
                        </Typography>
                    </Box>

                    {/* Unreconciled Transactions */}
                    <Box sx={{ mb: 3 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                mb: 2,
                                fontWeight: 'bold',
                                color: 'text.primary'
                            }}
                        >
                            Unreconciled Transactions ({UNRECONCILED_TRANSACTIONS.length})
                        </Typography>

                        <Stack spacing={1.5}>
                            {UNRECONCILED_TRANSACTIONS.map((transaction) => (
                                <Paper
                                    key={transaction.id}
                                    sx={{
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        border: (theme) => `1px solid ${theme.palette.divider}`,
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography variant="body2">
                                        {transaction.description} - {formatCurrencyWithTwoDecimals(transaction.amount)} ({transaction.date})
                                    </Typography>

                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="inherit"
                                        onClick={() => transaction.action === 'match'
                                            ? handleMatch(transaction.id)
                                            : handleInvestigate(transaction.id)
                                        }
                                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                    >
                                        {transaction.action === 'match' ? 'Match/Add' : 'Investigate'}
                                    </Button>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>

                    {/* Action Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleStartReconciliation}
                        >
                            Start Reconciliation
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </DashboardContent>
    );
}