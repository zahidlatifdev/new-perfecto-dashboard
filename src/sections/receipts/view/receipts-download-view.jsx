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
    { value: 'json', label: 'JSON', icon: 'ph:file-js-bold' },
];

// Sample saved reports
const SAVED_REPORTS = [
    { id: 1, name: 'Monthly Receipts Summary', format: 'xlsx', lastRun: 'June 10, 2025' },
    { id: 2, name: 'Quarterly Receipts by Category', format: 'pdf', lastRun: 'May 22, 2025' },
    { id: 3, name: 'Expense Reports for Tax Filing', format: 'csv', lastRun: 'June 5, 2025' },
];

// Sample month options for date filtering
const MONTH_OPTIONS = [
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3', label: 'Last 3 Months' },
    { value: 'last6', label: 'Last 6 Months' },
    { value: 'year2025', label: 'Year 2025 (Jan-Jun)' },
    { value: 'year2024', label: 'Year 2024' },
    { value: 'custom', label: 'Custom Date Range' },
];

// ----------------------------------------------------------------------

export function ReceiptsDownloadView() {
    const router = useRouter();

    const [dateRange, setDateRange] = useState('last30');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [format, setFormat] = useState('csv');
    const [filters, setFilters] = useState({
        categorized: true,
        uncategorized: true,
        flagged: false,
    });
    const [downloadStarted, setDownloadStarted] = useState(false);

    const handleFormatChange = (event) => {
        setFormat(event.target.value);
    };

    const handleDateRangeChange = (event) => {
        setDateRange(event.target.value);
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
            link.download = `receipts-report-${new Date().toISOString().split('T')[0]}.${format}`;
            link.href = 'data:text/plain;charset=utf-8,';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, 1500);
    };

    const handleViewReceipts = () => {
        router.push('/dashboard/receipts/view');
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
                Download Receipts Data
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
                Download your processed receipt data in various formats. Apply filters to customize your report.
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                    <Card sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Custom Report
                        </Typography>

                        <Stack spacing={3}>
                            <TextField
                                select
                                label="Date Range"
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
                                Category Filters
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
                                            checked={filters.flagged}
                                            onChange={handleFilterChange}
                                            name="flagged"
                                        />
                                    }
                                    label="Flagged for Review"
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
                                    {downloadStarted ? 'Generating...' : 'Download Report'}
                                </Button>
                            </Box>
                        </Stack>
                    </Card>

                    <Alert severity="success" sx={{ mb: 4 }} icon={<Iconify icon="ph:chart-line-up-bold" />}>
                        <AlertTitle>Tax Reporting</AlertTitle>
                        Download your categorized receipts data for easy import into tax preparation software.
                        <Button size="small" sx={{ ml: 1 }} endIcon={<Iconify icon="ph:arrow-right-bold" fontSize="small" />}>
                            Learn More
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
                        <AlertTitle>Need Custom Reports?</AlertTitle>
                        Contact our support team to set up custom reporting needs for your business.
                    </Alert>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button
                    onClick={handleViewReceipts}
                    startIcon={<Iconify icon="ph:list-bullets-bold" />}
                >
                    Back to Receipts
                </Button>
            </Box>
        </DashboardContent>
    );
}