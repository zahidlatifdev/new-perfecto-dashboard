'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Sample integrations data
const INTEGRATIONS = [
    { 
        id: 'quickbooks',
        name: 'QuickBooks Online',
        logo: 'QB', // Placeholder for logo text
        logoColor: '#22C55E', // Green color from the placeholder
        connected: false,
    },
    { 
        id: 'xero',
        name: 'Xero',
        logo: 'XO',
        logoColor: '#3B82F6', // Blue color from the placeholder
        connected: false,
    },
    { 
        id: 'plaid',
        name: 'Plaid (Bank Feeds)',
        logo: 'PL',
        logoColor: '#6366F1', // Indigo color from the placeholder
        connected: true,
    },
    { 
        id: 'stripe',
        name: 'Stripe',
        logo: 'ST',
        logoColor: '#EC4899', // Pink color from the placeholder
        connected: false,
    },
];

// ----------------------------------------------------------------------

export function IntegrationsView() {
    const [integrations, setIntegrations] = useState(INTEGRATIONS);
    const [openConnectDialog, setOpenConnectDialog] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState(null);

    const handleOpenConnectDialog = (integration) => {
        setSelectedIntegration(integration);
        setOpenConnectDialog(true);
    };

    const handleCloseConnectDialog = () => {
        setOpenConnectDialog(false);
    };

    const handleConnect = () => {
        // In a real app, this would initiate OAuth flow or API connection
        if (selectedIntegration) {
            const updatedIntegrations = integrations.map(item => 
                item.id === selectedIntegration.id 
                    ? { ...item, connected: true }
                    : item
            );
            setIntegrations(updatedIntegrations);
        }
        setOpenConnectDialog(false);
    };

    const handleExportCSV = () => {
        console.log('Exporting to CSV');
        // In a real app, this would trigger CSV export
    };

    const handleExportPDF = () => {
        console.log('Exporting to PDF');
        // In a real app, this would trigger PDF export
    };

    return (
        <DashboardContent maxWidth="xl">
            <Typography variant="h4" sx={{ mb: 3 }}>
                Integrations & Exports
            </Typography>

            {/* Integrations Grid */}
            <Grid container spacing={3}>
                {integrations.map((integration) => (
                    <Grid item xs={12} md={6} lg={4} key={integration.id}>
                        <Card sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                    sx={{ 
                                        bgcolor: integration.logoColor,
                                        color: '#FFFFFF',
                                        width: 40,
                                        height: 40,
                                        mr: 2,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {integration.logo}
                                </Avatar>
                                
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                        {integration.name}
                                    </Typography>
                                    
                                    {integration.connected ? (
                                        <Typography 
                                            variant="caption" 
                                            sx={{ color: 'success.main' }}
                                        >
                                            Connected
                                        </Typography>
                                    ) : (
                                        <Link
                                            component="button"
                                            variant="caption"
                                            onClick={() => handleOpenConnectDialog(integration)}
                                            sx={{ 
                                                color: 'success.main', 
                                                textDecoration: 'none',
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                        >
                                            Connect
                                        </Link>
                                    )}
                                </Box>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Data Export Card */}
            <Card sx={{ mt: 4, p: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Data Export
                </Typography>
                
                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2 }}
                >
                    Export your financial data in various formats.
                </Typography>
                
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<Iconify icon="ph:file-csv-bold" />}
                        onClick={handleExportCSV}
                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                        Export to CSV
                    </Button>
                    
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<Iconify icon="ph:file-pdf-bold" />}
                        onClick={handleExportPDF}
                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                        Export to PDF
                    </Button>
                </Stack>
            </Card>

            {/* Connect Integration Dialog */}
            <Dialog
                open={openConnectDialog}
                onClose={handleCloseConnectDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Connect to {selectedIntegration?.name}
                </DialogTitle>
                
                <DialogContent sx={{ pt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Connecting to {selectedIntegration?.name} will allow automatic sync of your financial data.
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                        You'll be redirected to {selectedIntegration?.name} to authorize the connection. Your data is secure and encrypted.
                    </Typography>
                </DialogContent>
                
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseConnectDialog} color="inherit">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConnect}
                        variant="contained" 
                        color="primary"
                    >
                        Connect Now
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardContent>
    );
}