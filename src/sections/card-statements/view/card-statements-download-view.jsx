'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Paper from '@mui/material/Paper';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// File formats available for download
const FORMAT_OPTIONS = [
    { value: 'csv', label: 'CSV', icon: 'ph:file-csv-bold' },
    { value: 'xlsx', label: 'Excel (XLSX)', icon: 'ph:file-xls-bold' },
    { value: 'pdf', label: 'PDF', icon: 'ph:file-pdf-bold' },
    { value: 'qfx', label: 'Quicken (QFX)', icon: 'ph:file-bold' },
    { value: 'ofx', label: 'OFX', icon: 'ph:file-bold' },
];

// Sample saved reports
const SAVED_REPORTS = [
    { id: 1, name: 'Monthly Statement Summary', format: 'xlsx', lastRun: 'June 10, 2025' },
    { id: 2, name: 'Quarterly Spend Analysis', format: 'pdf', lastRun: 'May 22, 2025' },
    { id: 3, name: 'Annual Transaction Export', format: 'csv', lastRun: 'June 5, 2025' },
];

// Sample month options for date filtering
const MONTH_OPTIONS = [
    { value: 'may2025', label: 'May 2025 Statement' },
    { value: 'apr2025', label: 'April 2025 Statement' },
    { value: 'mar2025', label: 'March 2025 Statement' },
    { value: 'feb2025', label: 'February 2025 Statement' },
    { value: 'jan2025', label: 'January 2025 Statement' },
    { value: 'dec2024', label: 'December 2024 Statement' },
    { value: 'last3', label: 'Last 3 Months' },
    { value: 'last6', label: 'Last 6 Months' },
    { value: 'last12', label: 'Last 12 Months' },
    { value: 'ytd', label: 'Year to Date (2025)' },
    { value: 'custom', label: 'Custom Date Range' },
];

// Card options
const CARD_OPTIONS = [
    { value: 'all', label: 'All Cards' },
    { value: 'amex5678', label: 'Amex Gold Business (...5678)' },
    { value: 'visa1234', label: 'Visa Business (...1234)' },
    { value: 'mc4321', label: 'Mastercard Corporate (...4321)' },
];

// ----------------------------------------------------------------------

export function CardStatementsDownloadView() {
    const router = useRouter();

    const [dateRange, setDateRange] = useState('may2025');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [format, setFormat] = useState('csv');
    const [selectedCard, setSelectedCard] = useState('all');
    const [filters, setFilters] = useState({
        categorized: true,
        uncategorized: true,
        expenses: true,
        income: true,
    });
    const [downloadStarted, setDownloadStarted] = useState(false);

    const handleFormatChange = (event) => {
        setFormat(event.target.value);
    };

    const handleDateRangeChange = (event) => {
        setDateRange(event.target.value);
    };

    const handleCardChange = (event) => {
        setSelectedCard(event.target.value);
    };

    const handleFilterChange = (event) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.checked,
        });
    };

    const handleDownload = () => {
        setDownloadStarted(true);

        // Simulate download process
        setTimeout(() => {
            setDownloadStarted(false);

            // Create a fake download link
            const link = document.createElement('a');
            link.download = `card-statement-${dateRange}-${new Date().toISOString().split('T')[0]}.${format}`;
            link.href = 'data:text/plain;charset=utf-8,';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, 1500);
    };

    const handleViewCardStatements = () => {
        router.push('/dashboard/card-statements/view');
    };

    const handleSavedReportDownload = (report) => {
        // Simulate download for saved report
        const link = document.createElement('a');
        link.download = `${report.name.toLowerCase().replace(/\s+/g, '-')}.${report.format}`;
        link.href = 'data:text/plain;charset=utf-8,';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <DashboardContent>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Download Card Statements
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
                Download your card statement data in various formats. Apply filters to customize your export.
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                    <Card sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Export Options
                        </Typography>

                        <Stack spacing={3}>
                            <TextField
                                select
                                label="Card"
                                value={selectedCard}
                                onChange={handleCardChange}
                                fullWidth
                                size="small"
                            >
                                {CARD_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Statement Period"
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                fullWidth
                                size="small"
                            >
                                {MONTH_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {dateRange === 'custom' && (
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Start Date"
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />

                                    <TextField
                                        label="End Date"
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Box>
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2">
                                Transaction Filters
                            </Typography>

                            <FormGroup row>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.categorized}
                                            onChange={handleFilterChange}
                                            name="categorized"
                                        />
                                    }
                                    label="Categorized"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.uncategorized}
                                            onChange={handleFilterChange}
                                            name="uncategorized"
                                        />
                                    }
                                    label="Uncategorized"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.expenses}
                                            onChange={handleFilterChange}
                                            name="expenses"
                                        />
                                    }
                                    label="Expenses"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.income}
                                            onChange={handleFilterChange}
                                            name="income"
                                        />
                                    }
                                    label="Income/Credits"
                                />
                            </FormGroup>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2">
                                File Format
                            </Typography>

                            <TextField
                                select
                                label="Select Format"
                                value={format}
                                onChange={handleFormatChange}
                                fullWidth
                                size="small"
                            >
                                {FORMAT_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Iconify icon={option.icon} />
                                            <Typography variant="body2">{option.label}</Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleDownload}
                                    disabled={downloadStarted || (dateRange === 'custom' && (!customStartDate || !customEndDate))}
                                    startIcon={<Iconify icon="ph:download-bold" />}
                                >
                                    {downloadStarted ? 'Generating...' : 'Download Statement Data'}
                                </Button>
                            </Box>
                        </Stack>
                    </Card>

                    <Alert severity="success" sx={{ mb: 4 }} icon={<Iconify icon="ph:chart-line-up-bold" />}>
                        <AlertTitle>Financial Analysis</AlertTitle>
                        Import your card statement data into financial analysis tools for business insights.
                        <Button size="small" sx={{ ml: 1 }} endIcon={<Iconify icon="ph:arrow-right-bold" fontSize="small" />}>
                            View Analytics
                        </Button>
                    </Alert>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Card sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Saved Reports
                        </Typography>

                        <Stack spacing={2}>
                            {SAVED_REPORTS.map((report) => (
                                <Paper
                                    key={report.id}
                                    variant="outlined"
                                    sx={{ p: 2 }}
                                >
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                        <Box>
                                            <Typography variant="subtitle2">
                                                {report.name}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                Last run: {report.lastRun}
                                            </Typography>
                                        </Box>

                                        <Button
                                            size="small"
                                            onClick={() => handleSavedReportDownload(report)}
                                            startIcon={<Iconify icon={
                                                FORMAT_OPTIONS.find(f => f.value === report.format)?.icon
                                            } />}
                                        >
                                            Download
                                        </Button>
                                    </Box>
                                </Paper>
                            ))}
                        </Stack>

                        <Box sx={{ mt: 3 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Iconify icon="ph:plus-bold" />}
                            >
                                Create New Saved Report
                            </Button>
                        </Box>
                    </Card>

                    <Alert severity="info" sx={{ mb: 2 }}>
                        <AlertTitle>Need Custom Exports?</AlertTitle>
                        Contact our support team to set up custom export formats for your business.
                    </Alert>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button
                    onClick={handleViewCardStatements}
                    startIcon={<Iconify icon="ph:list-bullets-bold" />}
                >
                    Back to Card Statements
                </Button>
            </Box>
        </DashboardContent>
    );
}