import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    FormGroup,
    Typography,
    Stack,
    Box,
    CircularProgress,
    Paper,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';

const reportOptions = [
    'Expense by Category',
    'Burn Rate',
    'Profit & Loss',
    'Cash Flow Summary',
    'Revenue Trends',
    'Subscription Expenses',
    'Tax Deductible Expenses',
    'Savings Opportunities',
    'Category Trends',
    'Forecast vs Actual',
];

export function ExportModal({ open, onOpenChange, reportTitle, isAllReports = false }) {
    const [format, setFormat] = useState('pdf');
    const [selectedReports, setSelectedReports] = useState(reportOptions);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        // Simulate export
        setTimeout(() => {
            setIsExporting(false);
            onOpenChange(false);
        }, 1500);
    };

    const toggleReport = (report) => {
        setSelectedReports((prev) =>
            prev.includes(report) ? prev.filter((r) => r !== report) : [...prev, report]
        );
    };

    const toggleAll = () => {
        setSelectedReports(selectedReports.length === reportOptions.length ? [] : reportOptions);
    };

    return (
        <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:download-bold-duotone" width={24} />
                    <Typography variant="h6">
                        {isAllReports ? 'Export All Reports' : `Export ${reportTitle}`}
                    </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Choose your export format and options.
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3}>
                    {/* Format Selection */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Export Format
                        </Typography>
                        <RadioGroup value={format} onChange={(e) => setFormat(e.target.value)}>
                            <Stack direction="row" spacing={2}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        flex: 1,
                                        p: 2,
                                        cursor: 'pointer',
                                        border: 2,
                                        borderColor: format === 'pdf' ? 'primary.main' : 'divider',
                                        bgcolor: format === 'pdf' ? 'primary.lighter' : 'transparent',
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                    onClick={() => setFormat('pdf')}
                                >
                                    <FormControlLabel
                                        value="pdf"
                                        control={<Radio />}
                                        label={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Iconify icon="solar:document-text-bold" width={20} sx={{ color: 'error.main' }} />
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        PDF
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Formatted report
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        }
                                    />
                                </Paper>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        flex: 1,
                                        p: 2,
                                        cursor: 'pointer',
                                        border: 2,
                                        borderColor: format === 'csv' ? 'primary.main' : 'divider',
                                        bgcolor: format === 'csv' ? 'primary.lighter' : 'transparent',
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                    onClick={() => setFormat('csv')}
                                >
                                    <FormControlLabel
                                        value="csv"
                                        control={<Radio />}
                                        label={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Iconify icon="solar:file-bold" width={20} sx={{ color: 'success.main' }} />
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        CSV
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Raw data
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        }
                                    />
                                </Paper>
                            </Stack>
                        </RadioGroup>
                    </Box>

                    {/* Report Selection */}
                    {isAllReports && (
                        <Box>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                                <Typography variant="subtitle2">Include Reports</Typography>
                                <Button size="small" onClick={toggleAll}>
                                    {selectedReports.length === reportOptions.length ? 'Deselect All' : 'Select All'}
                                </Button>
                            </Stack>
                            <Paper
                                variant="outlined"
                                sx={{
                                    maxHeight: 192,
                                    overflow: 'auto',
                                    p: 2,
                                    bgcolor: 'action.hover',
                                }}
                            >
                                <FormGroup>
                                    {reportOptions.map((report) => (
                                        <FormControlLabel
                                            key={report}
                                            control={
                                                <Checkbox
                                                    checked={selectedReports.includes(report)}
                                                    onChange={() => toggleReport(report)}
                                                    size="small"
                                                />
                                            }
                                            label={<Typography variant="body2">{report}</Typography>}
                                        />
                                    ))}
                                </FormGroup>
                            </Paper>
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={() => onOpenChange(false)} color="inherit">
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleExport}
                    disabled={isExporting || (isAllReports && selectedReports.length === 0)}
                    startIcon={
                        isExporting ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : (
                            <Iconify icon="solar:download-linear" />
                        )
                    }
                >
                    {isExporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
