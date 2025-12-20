'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Sample report periods
const REPORT_PERIODS = [
    { value: 'lastMonth', label: 'Last Month (May 2025)' },
    { value: 'thisQuarter', label: 'This Quarter (Q2 2025)' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'custom', label: 'Custom' },
];

// Report card data
const REPORTS = [
    {
        id: 'profit-loss',
        title: 'Profit & Loss',
        description: 'Understand your revenue and expenses.',
        icon: 'ph:file-text-bold',
    },
    {
        id: 'balance-sheet',
        title: 'Balance Sheet',
        description: 'Snapshot of your assets and liabilities.',
        icon: 'ph:scales-bold',
    },
    {
        id: 'cash-flow',
        title: 'Cash Flow Statement',
        description: 'Track movement of cash in and out.',
        icon: 'ph:chart-line-up-bold',
    },
    {
        id: 'ar-aging',
        title: 'A/R Aging',
        description: 'See outstanding customer invoices.',
        icon: 'ph:users-bold',
    },
    {
        id: 'expense-vendor',
        title: 'Expense by Vendor',
        description: 'Breakdown of spending by vendor.',
        icon: 'ph:currency-dollar-bold',
    },
];

// ----------------------------------------------------------------------

export function ReportsView() {
    const [reportPeriod, setReportPeriod] = useState('lastMonth');

    const handlePeriodChange = (event) => {
        setReportPeriod(event.target.value);
    };

    const handleViewReport = (reportId) => {
        console.log(`View report: ${reportId} for period: ${reportPeriod}`);
        // In a real app, you'd navigate to the specific report view
    };

    return (
        <DashboardContent maxWidth="xl">
            {/* Header with Period Selector */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h4">Reports</Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Report Period:</Typography>
                    <FormControl sx={{ minWidth: 180 }} size="small">
                        <Select
                            value={reportPeriod}
                            onChange={handlePeriodChange}
                            displayEmpty
                        >
                            {REPORT_PERIODS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Stack>

            {/* Report Cards Grid */}
            <Grid container spacing={3}>
                {REPORTS.map((report) => (
                    <Grid item xs={12} md={6} lg={4} key={report.id}>
                        <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ mb: 2 }}>
                                <Iconify
                                    icon={report.icon}
                                    sx={{
                                        fontSize: 40,
                                        color: 'success.main',
                                        mb: 1.5
                                    }}
                                />
                            </Box>

                            <Typography variant="h6" sx={{ mb: 0.5 }}>
                                {report.title}
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                {report.description}
                            </Typography>

                            <Box sx={{ flexGrow: 1 }} />

                            <Button
                                variant="outlined"
                                color="inherit"
                                size="small"
                                fullWidth
                                onClick={() => handleViewReport(report.id)}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    mt: 2
                                }}
                            >
                                View Report
                            </Button>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </DashboardContent>
    );
}