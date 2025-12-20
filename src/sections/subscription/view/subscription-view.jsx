'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Subscription plans data
const PLANS = [
    {
        id: 'basic',
        name: 'Basic',
        description: 'For individuals and small startups',
        price: 19,
        features: [
            'Up to 50 transactions/month',
            'Basic AI categorization',
            'Standard reports',
            'Email support',
        ],
        current: false,
        recommendedFor: 'Freelancers',
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'For growing businesses',
        price: 49,
        features: [
            'Up to 200 transactions/month',
            'Advanced AI categorization & insights',
            'Customizable reports',
            'Priority email & chat support',
            'Bank & CC integrations',
        ],
        current: true,
        recommendedFor: 'Small businesses',
        accentColor: true,
    },
    {
        id: 'premium',
        name: 'Premium',
        description: 'For established businesses & enterprises',
        price: 99,
        features: [
            'Unlimited transactions',
            'Full AI suite & forecasting',
            'Advanced custom reports & API access',
            'Dedicated support manager',
            'All integrations + custom',
        ],
        current: false,
        recommendedFor: 'Larger companies',
    },
];

// ----------------------------------------------------------------------

export function SubscriptionView() {
    const [openManageDialog, setOpenManageDialog] = useState(false);
    const [openConfirmUpgrade, setOpenConfirmUpgrade] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const currentPlan = PLANS.find((plan) => plan.current);

    const handleOpenManageDialog = () => {
        setOpenManageDialog(true);
    };

    const handleCloseManageDialog = () => {
        setOpenManageDialog(false);
    };

    const handleOpenUpgradeDialog = (plan) => {
        setSelectedPlan(plan);
        setOpenConfirmUpgrade(true);
    };

    const handleCloseUpgradeDialog = () => {
        setOpenConfirmUpgrade(false);
    };

    const handleUpgrade = () => {
        // In a real app, this would initiate the upgrade process
        console.log(`Upgrading to ${selectedPlan.name} plan`);
        handleCloseUpgradeDialog();
    };

    return (
        <DashboardContent maxWidth="xl">
            {/* Current Plan Section */}
            <Box sx={{ mb: 6 }}>
                <Card sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ mb: 2, color: 'text.primary' }}>
                        Your Current Plan
                    </Typography>

                    <Box 
                        sx={{ 
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            bgcolor: 'success.lighter',
                            borderRadius: 1,
                            p: 3,
                        }}
                    >
                        <Box>
                            <Typography variant="h6" sx={{ color: 'success.dark' }}>
                                Pro Plan
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                Renews on July 1, 2025
                            </Typography>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    color: 'text.primary',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'baseline',
                                }}
                            >
                                $49
                                <Typography 
                                    component="span" 
                                    variant="body2" 
                                    sx={{ color: 'text.secondary', ml: 1 }}
                                >
                                    / month
                                </Typography>
                            </Typography>
                        </Box>

                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleOpenManageDialog}
                            sx={{ mt: { xs: 2, sm: 0 }, fontSize: '0.875rem' }}
                        >
                            Manage Subscription
                        </Button>
                    </Box>
                </Card>
            </Box>

            {/* Available Plans Section */}
            <Box>
                <Typography variant="h5" sx={{ mb: 3, color: 'text.primary' }}>
                    Available Plans
                </Typography>

                <Grid container spacing={3}>
                    {PLANS.map((plan) => (
                        <Grid item xs={12} md={4} key={plan.id}>
                            <Card 
                                sx={{ 
                                    p: 3, 
                                    height: '100%', 
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    ...(plan.accentColor && {
                                        border: (theme) => `1px solid ${theme.palette.success.main}`,
                                    }),
                                }}
                            >
                                {plan.current && (
                                    <Chip
                                        label="Current Plan"
                                        size="small"
                                        color="success"
                                        sx={{ 
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                        }}
                                    />
                                )}

                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        color: plan.accentColor ? 'success.main' : 'text.primary',
                                    }}
                                >
                                    {plan.name}
                                </Typography>

                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                    {plan.description}
                                </Typography>

                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        fontWeight: 'bold',
                                        color: plan.accentColor ? 'success.main' : 'text.primary',
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        mb: 1,
                                    }}
                                >
                                    ${plan.price}
                                    <Typography 
                                        component="span" 
                                        variant="body2" 
                                        sx={{ color: 'text.secondary', ml: 1 }}
                                    >
                                        / month
                                    </Typography>
                                </Typography>

                                <List disablePadding sx={{ my: 2, flexGrow: 1 }}>
                                    {plan.features.map((feature) => (
                                        <ListItem key={feature} disableGutters disablePadding sx={{ py: 0.5 }}>
                                            <ListItemIcon sx={{ minWidth: 28, color: 'success.main' }}>
                                                <Iconify icon="ph:check-circle-bold" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={feature} 
                                                primaryTypographyProps={{ 
                                                    variant: 'body2',
                                                    color: 'text.secondary',
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>

                                {plan.current ? (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        disabled
                                        sx={{ mt: 'auto' }}
                                    >
                                        Your Current Plan
                                    </Button>
                                ) : plan.id === 'basic' ? (
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="inherit"
                                        onClick={() => handleOpenUpgradeDialog(plan)}
                                        sx={{ mt: 'auto' }}
                                    >
                                        Choose Basic
                                    </Button>
                                ) : (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleOpenUpgradeDialog(plan)}
                                        sx={{ mt: 'auto' }}
                                    >
                                        Upgrade to {plan.name}
                                    </Button>
                                )}
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Manage Subscription Dialog */}
            <Dialog
                open={openManageDialog}
                onClose={handleCloseManageDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Manage Your Subscription</DialogTitle>
                
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="subtitle1">Current Plan</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Pro Plan - $49/month
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1">Billing Cycle</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Monthly - Next payment on July 1, 2025
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1">Payment Method</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Visa ending in 4242
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <Button 
                                variant="outlined" 
                                color="error" 
                                sx={{ mr: 2 }}
                            >
                                Cancel Subscription
                            </Button>
                            <Button variant="outlined">Update Payment Method</Button>
                        </Box>
                    </Stack>
                </DialogContent>
                
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseManageDialog} color="inherit">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Upgrade Dialog */}
            <Dialog
                open={openConfirmUpgrade}
                onClose={handleCloseUpgradeDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {selectedPlan?.id === 'basic' ? 'Downgrade to Basic Plan' : `Upgrade to ${selectedPlan?.name} Plan`}
                </DialogTitle>
                
                <DialogContent sx={{ pt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {selectedPlan?.id === 'basic' 
                            ? 'Are you sure you want to downgrade to the Basic plan? Some features will no longer be available.'
                            : `You're about to upgrade to the ${selectedPlan?.name} plan with enhanced features.`}
                    </Typography>
                    
                    <Box sx={{ bgcolor: 'background.neutral', p: 2, borderRadius: 1 }}>
                        <Typography variant="subtitle2">
                            New Monthly Payment: ${selectedPlan?.price}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Your card will be charged immediately. Prorated credits from your current plan will be applied.
                        </Typography>
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseUpgradeDialog} color="inherit">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleUpgrade}
                        variant="contained" 
                        color={selectedPlan?.id === 'basic' ? 'warning' : 'primary'}
                    >
                        Confirm {selectedPlan?.id === 'basic' ? 'Downgrade' : 'Upgrade'}
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardContent>
    );
}