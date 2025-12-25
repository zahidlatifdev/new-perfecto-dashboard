'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';

import { DealsTab } from '../tabs/deals-tab';
import { AlternativesTab } from '../tabs/alternatives-tab';

// ----------------------------------------------------------------------

export function DealScoutView() {
    const [currentTab, setCurrentTab] = useState('deals');
    const [alertCount, setAlertCount] = useState(0);

    useEffect(() => {
        // Load price alerts count from localStorage
        const loadAlerts = () => {
            try {
                const stored = localStorage.getItem('priceAlerts');
                if (stored) {
                    const alerts = JSON.parse(stored);
                    setAlertCount(alerts.filter((a) => a.isActive).length);
                }
            } catch (error) {
                console.error('Error loading alerts:', error);
            }
        };

        loadAlerts();

        // Listen for storage changes
        const handleStorageChange = () => loadAlerts();
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('alertsUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('alertsUpdated', handleStorageChange);
        };
    }, []);

    const handleChangeTab = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const TABS = [
        {
            value: 'deals',
            label: 'Deals & Coupons',
            icon: <Iconify icon="solar:tag-bold-duotone" width={24} />,
            badge: alertCount > 0 ? alertCount : null,
        },
        {
            value: 'alternatives',
            label: 'Business Alternatives',
            icon: <Iconify icon="solar:refresh-circle-bold-duotone" width={24} />,
        },
    ];

    return (
        <DashboardContent maxWidth="xl">
            <Stack spacing={3}>
                {/* Header */}
                <Box>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                        <Iconify icon="solar:star-bold-duotone" width={32} sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Deal Scout
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        AI-powered search for deals, coupons, and cost-effective alternatives
                    </Typography>
                </Box>

                {/* Tabs */}
                <Card>
                    <CustomTabs value={currentTab} onChange={handleChangeTab}>
                        {TABS.map((tab) => (
                            <Tab
                                key={tab.value}
                                value={tab.value}
                                icon={tab.icon}
                                label={
                                    tab.badge ? (
                                        <Badge badgeContent={tab.badge} color="error" sx={{ ml: 1 }}>
                                            {tab.label}
                                        </Badge>
                                    ) : (
                                        tab.label
                                    )
                                }
                                iconPosition="start"
                            />
                        ))}
                    </CustomTabs>

                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: currentTab === 'deals' ? 'block' : 'none' }}>
                            <DealsTab onAlertUpdate={() => setAlertCount((prev) => prev + 1)} />
                        </Box>
                        <Box sx={{ display: currentTab === 'alternatives' ? 'block' : 'none' }}>
                            <AlternativesTab />
                        </Box>
                    </Box>
                </Card>
            </Stack>
        </DashboardContent>
    );
}
