'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useState } from 'react';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

// Format currency with exactly 2 decimal places
const formatCurrencyWithTwoDecimals = (value) => {
    return fCurrency(value, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// Sample missing documents data
const MISSING_DOCUMENTS = [
    'April 2025 Credit Card Statement',
    'Receipt for \'Large Equipment Purchase\'',
];

// ----------------------------------------------------------------------

export function TaxHubView() {
    const [openUploadDialog, setOpenUploadDialog] = useState(false);

    const handleOpenUploadDialog = () => {
        setOpenUploadDialog(true);
    };

    const handleCloseUploadDialog = () => {
        setOpenUploadDialog(false);
    };

    const handleDownloadCPAPackage = () => {
        console.log('Downloading CPA Package');
        // In a real app, this would trigger the download of a prepared document package
    };

    return (
        <DashboardContent maxWidth="xl">
            <Typography variant="h4" sx={{ mb: 3 }}>
                Tax Hub
            </Typography>

            <Grid container spacing={3}>
                {/* Estimated Tax Liability Card */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Estimated Tax Liability
                        </Typography>
                        
                        <Typography 
                            variant="h3" 
                            sx={{ 
                                fontWeight: 'bold',
                                color: 'success.dark',
                                mb: 0.5,
                            }}
                        >
                            {formatCurrencyWithTwoDecimals(1850.00)}
                            <Typography
                                component="span"
                                variant="body2"
                                sx={{
                                    fontWeight: 'normal',
                                    color: 'text.secondary',
                                    ml: 1,
                                }}
                            >
                                (Q2 2025)
                            </Typography>
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary">
                            Next payment due: July 15, 2025
                        </Typography>
                    </Card>
                </Grid>

                {/* Missing Documents Card */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Missing Documents for Filing
                        </Typography>
                        
                        <List dense disablePadding>
                            {MISSING_DOCUMENTS.map((document, index) => (
                                <ListItem 
                                    key={index} 
                                    disablePadding 
                                    sx={{ 
                                        py: 0.5,
                                        color: 'error.main',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 24, color: 'error.main' }}>
                                        <Iconify icon="ph:warning-circle-fill" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={document}
                                        primaryTypographyProps={{ 
                                            variant: 'body2',
                                            color: 'error.main',
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        
                        <Button 
                            variant="contained"
                            color="secondary"
                            size="small"
                            sx={{ 
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                mt: 2,
                            }}
                            onClick={handleOpenUploadDialog}
                        >
                            Upload Missing Documents
                        </Button>
                    </Card>
                </Grid>

                {/* CPA Report Package Card */}
                <Grid item xs={12}>
                    <Card 
                        sx={{ 
                            p: 3,
                            textAlign: 'center',
                        }}
                    >
                        <Box sx={{ mb: 2 }}>
                            <Iconify 
                                icon="ph:download-simple-bold"
                                sx={{ 
                                    fontSize: 48,
                                    color: 'success.main',
                                    mb: 1,
                                }}
                            />
                        </Box>
                        
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Ready-for-CPA Report Package
                        </Typography>
                        
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ mb: 2 }}
                        >
                            Download a package with all necessary reports and documents for your accountant.
                        </Typography>
                        
                        <Button 
                            variant="contained"
                            color="primary"
                            startIcon={<Iconify icon="ph:file-archive-bold" />}
                            onClick={handleDownloadCPAPackage}
                        >
                            Download CPA Package (2025 YTD)
                        </Button>
                    </Card>
                </Grid>
            </Grid>

            {/* Upload Missing Documents Dialog */}
            <Dialog 
                open={openUploadDialog}
                onClose={handleCloseUploadDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Upload Missing Documents</DialogTitle>
                
                <DialogContent sx={{ pt: 1 }}>
                    <List>
                        {MISSING_DOCUMENTS.map((document, index) => (
                            <ListItem key={index} sx={{ py: 2 }}>
                                <ListItemText 
                                    primary={document}
                                    secondary="Click to upload or drag and drop"
                                />
                                <Button 
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Iconify icon="ph:upload-simple-bold" />}
                                    sx={{ ml: 2 }}
                                >
                                    Browse
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseUploadDialog} color="inherit">
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleCloseUploadDialog}
                    >
                        Upload All Documents
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardContent>
    );
}