'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PendingItemsView() {
    const [tabValue, setTabValue] = useState('all');

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Mock data for pending items
    const pendingItems = [
        {
            id: 1,
            type: 'discrepancies',
            label: 'Discrepancy',
            labelColor: 'warning',
            title: 'Mismatch in Invoice INV-003 amount',
            description: 'Uploaded amount: $150.00, Bank record: $145.00. Date: May 27, 2025',
            action: 'Review & Resolve'
        },
        {
            id: 2,
            type: 'missing-info',
            label: 'Missing Document',
            labelColor: 'error',
            title: 'April Credit Card Statement',
            description: 'Required for Q2 reconciliation.',
            action: 'Upload Now'
        }
    ];

    // Filter items based on selected tab
    const filteredItems = tabValue === 'all'
        ? pendingItems
        : pendingItems.filter(item => item.type === tabValue);

    return (
        <DashboardContent maxWidth="xl">
            <Typography variant="h4" sx={{ mb: 4 }}>Pending Items</Typography>

            <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{
                        '& .MuiTab-root': {
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            minWidth: 'auto',
                            px: 2,
                            mr: 2,
                            '&.Mui-selected': {
                                color: 'primary.main',
                            }
                        }
                    }}
                >
                    <Tab
                        label={`All (${pendingItems.length})`}
                        value="all"
                        disableRipple
                    />
                    <Tab
                        label={`Discrepancies (${pendingItems.filter(item => item.type === 'discrepancies').length})`}
                        value="discrepancies"
                        disableRipple
                    />
                    <Tab
                        label={`Missing Info (${pendingItems.filter(item => item.type === 'missing-info').length})`}
                        value="missing-info"
                        disableRipple
                    />
                    <Tab
                        label="Uncategorized (0)"
                        value="uncategorized"
                        disableRipple
                    />
                </Tabs>
            </Box>

            <Stack spacing={2}>
                {filteredItems.map((item) => (
                    <Card key={item.id} sx={{
                        boxShadow: (theme) => theme.customShadows.card,
                        borderRadius: 2,
                        transition: 'box-shadow 0.3s ease-in-out',
                        '&:hover': {
                            boxShadow: (theme) => theme.customShadows.z16,
                        },
                    }}>
                        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                justifyContent="space-between"
                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                spacing={2}
                            >
                                <Box>
                                    <Chip
                                        label={item.label}
                                        color={item.labelColor}
                                        size="small"
                                        sx={{ mb: 1, fontWeight: 500, fontSize: '0.75rem' }}
                                    />

                                    <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                                        {item.title}
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary">
                                        {item.description}
                                    </Typography>
                                </Box>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                                >
                                    {item.action}
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}

                {filteredItems.length === 0 && (
                    <Card sx={{ boxShadow: 1, borderRadius: 2 }}>
                        <CardContent sx={{ textAlign: 'center', py: 5 }}>
                            <Iconify icon="eva:checkmark-circle-outline" width={60} height={60} sx={{ mb: 2, color: 'text.secondary' }} />
                            <Typography variant="h6">No pending items</Typography>
                            <Typography variant="body2" color="text.secondary">
                                All items in this category have been processed
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </Stack>
        </DashboardContent>
    );
}
