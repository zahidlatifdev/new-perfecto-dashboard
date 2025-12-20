'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { paths } from 'src/routes/paths';

import { useAuthContext } from 'src/auth/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import axios, { endpoints } from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const TABS = [
    { value: 'profile', label: 'Profile', icon: 'solar:user-bold-duotone' },
    { value: 'company', label: 'Company', icon: 'solar:buildings-bold-duotone' },
    { value: 'companies', label: 'Companies', icon: 'solar:buildings-3-bold-duotone' },
    { value: 'security', label: 'Security', icon: 'solar:shield-check-bold-duotone' },
    { value: 'notifications', label: 'Notifications', icon: 'solar:bell-bold-duotone' },
    { value: 'billing', label: 'Billing', icon: 'solar:card-bold-duotone' },
];

const INDUSTRY_OPTIONS = [
    'Technology',
    'Healthcare',
    'Finance',
    'Retail',
    'Manufacturing',
    'Education',
    'Real Estate',
    'Construction',
    'Transportation',
    'Food & Beverage',
    'Professional Services',
    'Other',
];

const COMPANY_SIZE_OPTIONS = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-1000', label: '201-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
];

const TIMEZONE_OPTIONS = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
];

const CURRENCY_OPTIONS = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' },
];

// ----------------------------------------------------------------------

function ProfileTab() {
    const { user, checkUserSession } = useAuthContext();
    const loading = useBoolean();

    const { state: profile, setState: setProfile } = useSetState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        avatar: user?.avatar || '',
        preferences: {
            timezone: user?.preferences?.timezone || 'UTC',
            dateFormat: user?.preferences?.dateFormat || 'MM/DD/YYYY',
            currency: user?.preferences?.currency || 'USD',
            notifications: {
                email: user?.preferences?.notifications?.email ?? true,
                push: user?.preferences?.notifications?.push ?? true,
                processing: user?.preferences?.notifications?.processing ?? true,
                matching: user?.preferences?.notifications?.matching ?? true,
            },
        },
    });

    const handleSave = useCallback(async () => {
        try {
            loading.onTrue();

            // Update profile via API
            await axios.put(endpoints.user.updateProfile, {
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                preferences: profile.preferences
            });

            // Refresh user session to get updated data
            await checkUserSession();

        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            loading.onFalse();
        }
    }, [profile, loading, checkUserSession]);

    return (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
                Profile Information
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Avatar
                            src={profile.avatar}
                            alt={`${profile.firstName} ${profile.lastName}`}
                            sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                        >
                            {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                        </Avatar>
                        <Button variant="outlined" component="label">
                            <input type="file" hidden accept="image/*" />
                            Change Photo
                        </Button>
                    </Box>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Stack spacing={3}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                label="First Name"
                                value={profile.firstName}
                                onChange={(e) => setProfile({ firstName: e.target.value })}
                            />
                            <TextField
                                fullWidth
                                label="Last Name"
                                value={profile.lastName}
                                onChange={(e) => setProfile({ lastName: e.target.value })}
                            />
                        </Stack>

                        <TextField
                            fullWidth
                            label="Email"
                            value={profile.email}
                            disabled
                            helperText="Contact support to change your email address"
                        />

                        <TextField
                            fullWidth
                            label="Phone"
                            value={profile.phone}
                            onChange={(e) => setProfile({ phone: e.target.value })}
                        />

                        <Divider />

                        <Typography variant="subtitle1">Preferences</Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel>Timezone</InputLabel>
                                <Select
                                    value={profile.preferences.timezone}
                                    label="Timezone"
                                    onChange={(e) =>
                                        setProfile({
                                            preferences: {
                                                ...profile.preferences,
                                                timezone: e.target.value,
                                            },
                                        })
                                    }
                                >
                                    {TIMEZONE_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Currency</InputLabel>
                                <Select
                                    value={profile.preferences.currency}
                                    label="Currency"
                                    onChange={(e) =>
                                        setProfile({
                                            preferences: {
                                                ...profile.preferences,
                                                currency: e.target.value,
                                            },
                                        })
                                    }
                                >
                                    {CURRENCY_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>

                        <Box sx={{ textAlign: 'right' }}>
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={loading.value}
                                startIcon={loading.value ? <Iconify icon="svg-spinners:8-dots-rotate" /> : undefined}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </Stack>
                </Grid>
            </Grid>
        </Card>
    );
}

// ----------------------------------------------------------------------

function CompanyTab() {
    const { selectedCompany, checkUserSession } = useAuthContext();
    const loading = useBoolean();

    const { state: company, setState: setCompany } = useSetState({
        name: selectedCompany?.name || '',
        description: selectedCompany?.description || '',
        industry: selectedCompany?.industry || '',
        size: selectedCompany?.size || '1-10',
        website: selectedCompany?.website || '',
        phone: selectedCompany?.phone || '',
        taxId: selectedCompany?.taxId || '',
        logo: selectedCompany?.logo || '',
        status: selectedCompany?.status || '',
        plan: selectedCompany?.plan || '',
        role: selectedCompany?.role || '',
        address: {
            street: selectedCompany?.address?.street || '',
            city: selectedCompany?.address?.city || '',
            state: selectedCompany?.address?.state || '',
            zipCode: selectedCompany?.address?.zipCode || '',
            country: selectedCompany?.address?.country || 'US',
        },
        settings: {
            baseCurrency: selectedCompany?.settings?.baseCurrency || 'USD',
            timezone: selectedCompany?.settings?.timezone || 'UTC',
            dateFormat: selectedCompany?.settings?.dateFormat || 'MM/DD/YYYY',
            autoMatching: selectedCompany?.settings?.autoMatching ?? true,
            retentionPeriod: selectedCompany?.settings?.retentionPeriod || 7,
            notifications: {
                processingComplete: selectedCompany?.settings?.notifications?.processingComplete ?? true,
                newMatches: selectedCompany?.settings?.notifications?.newMatches ?? true,
                missingDocuments: selectedCompany?.settings?.notifications?.missingDocuments ?? true,
            },
        },
    });

    const handleSave = useCallback(async () => {
        if (!selectedCompany?._id) return;

        try {
            loading.onTrue();
            await axios.put(endpoints.company.update(selectedCompany._id), company);
            await checkUserSession();
            // Show success message (you can add a snackbar here if needed)
        } catch (error) {
            console.error('Failed to update company:', error);
            // Show error message (you can add a snackbar here if needed)
        } finally {
            loading.onFalse();
        }
    }, [company, selectedCompany, loading, checkUserSession]);

    if (!selectedCompany) {
        return (
            <Alert severity="warning">
                No company selected. Please select a company to manage its settings.
            </Alert>
        );
    }

    return (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
                Company Information
            </Typography>

            <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        fullWidth
                        label="Company Name"
                        value={company.name}
                        onChange={(e) => setCompany({ name: e.target.value })}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Industry</InputLabel>
                        <Select
                            value={company.industry}
                            label="Industry"
                            onChange={(e) => setCompany({ industry: e.target.value })}
                        >
                            {INDUSTRY_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>

                <TextField
                    fullWidth
                    label="Description"
                    value={company.description}
                    onChange={(e) => setCompany({ description: e.target.value })}
                    multiline
                    rows={3}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel>Company Size</InputLabel>
                        <Select
                            value={company.size}
                            label="Company Size"
                            onChange={(e) => setCompany({ size: e.target.value })}
                        >
                            {COMPANY_SIZE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Tax ID"
                        value={company.taxId}
                        onChange={(e) => setCompany({ taxId: e.target.value })}
                    />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        fullWidth
                        label="Website"
                        value={company.website}
                        onChange={(e) => setCompany({ website: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Phone"
                        value={company.phone}
                        onChange={(e) => setCompany({ phone: e.target.value })}
                    />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        fullWidth
                        label="Status"
                        value={company.status}
                        disabled
                    />
                    <TextField
                        fullWidth
                        label="Plan"
                        value={company.plan}
                        disabled
                    />
                    <TextField
                        fullWidth
                        label="Role"
                        value={company.role}
                        disabled
                    />
                </Stack>

                <Divider />

                <Typography variant="subtitle1">Address</Typography>

                <TextField
                    fullWidth
                    label="Street Address"
                    value={company.address.street}
                    onChange={(e) =>
                        setCompany({
                            address: { ...company.address, street: e.target.value },
                        })
                    }
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        fullWidth
                        label="City"
                        value={company.address.city}
                        onChange={(e) =>
                            setCompany({
                                address: { ...company.address, city: e.target.value },
                            })
                        }
                    />
                    <TextField
                        fullWidth
                        label="State"
                        value={company.address.state}
                        onChange={(e) =>
                            setCompany({
                                address: { ...company.address, state: e.target.value },
                            })
                        }
                    />
                    <TextField
                        fullWidth
                        label="ZIP Code"
                        value={company.address.zipCode}
                        onChange={(e) =>
                            setCompany({
                                address: { ...company.address, zipCode: e.target.value },
                            })
                        }
                    />
                </Stack>

                <Divider />

                <Typography variant="subtitle1">Company Settings</Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel>Base Currency</InputLabel>
                        <Select
                            value={company.settings.baseCurrency}
                            label="Base Currency"
                            onChange={(e) =>
                                setCompany({
                                    settings: {
                                        ...company.settings,
                                        baseCurrency: e.target.value,
                                    },
                                })
                            }
                        >
                            {CURRENCY_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Timezone</InputLabel>
                        <Select
                            value={company.settings.timezone}
                            label="Timezone"
                            onChange={(e) =>
                                setCompany({
                                    settings: {
                                        ...company.settings,
                                        timezone: e.target.value,
                                    },
                                })
                            }
                        >
                            {TIMEZONE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>

                <FormControlLabel
                    control={
                        <Switch
                            checked={company.settings.autoMatching}
                            onChange={(e) =>
                                setCompany({
                                    settings: {
                                        ...company.settings,
                                        autoMatching: e.target.checked,
                                    },
                                })
                            }
                        />
                    }
                    label="Enable automatic transaction matching"
                />

                <Box sx={{ textAlign: 'right' }}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading.value}
                        startIcon={loading.value ? <Iconify icon="svg-spinners:8-dots-rotate" /> : undefined}
                    >
                        Save Changes
                    </Button>
                </Box>
            </Stack>
        </Card>
    );
}

// ----------------------------------------------------------------------

function CompaniesTab() {
    const { companies, user, checkUserSession, switchCompany } = useAuthContext();
    const createDialog = useBoolean();
    const loading = useBoolean();
    const router = useRouter();

    const { state: createForm, setState: setCreateForm } = useSetState({
        name: '',
        description: '',
        industry: 'Technology',
        size: '1-10',
        website: '',
        phone: '',
        email: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'US',
        },
    });

    const handleCreateCompany = useCallback(async () => {
        try {
            loading.onTrue();
            await axios.post(endpoints.company.create, createForm);

            // Refresh user session to get updated companies
            await checkUserSession();

            createDialog.onFalse();
            setCreateForm({
                name: '',
                description: '',
                industry: 'Technology',
                size: '1-10',
                website: '',
                phone: '',
                email: '',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'US',
                },
            });
        } catch (error) {
            console.error('Failed to create company:', error);
        } finally {
            loading.onFalse();
        }
    }, [createForm, loading, createDialog, setCreateForm, checkUserSession]);

    const handleSwitchToCompany = useCallback(async (companyId) => {
        try {
            await switchCompany(companyId);
            // The page will reload after switching
        } catch (error) {
            console.error('Failed to switch company:', error);
        }
    }, [switchCompany]);

    const handleManageCompany = useCallback((companyId) => {
        // Navigate to collaborate view to manage company members
        router.push('/dashboard/collaborate');
    }, [router]);

    return (
        <>
            <Card sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Typography variant="h6">
                        My Companies
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        onClick={createDialog.onTrue}
                    >
                        Create Company
                    </Button>
                </Stack>

                <Stack spacing={2}>
                    {companies?.map((company) => {
                        return (
                            <Card key={company._id} variant="outlined" sx={{ p: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar src={company.logo} alt={company.name}>
                                        {company.name?.charAt(0)}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1">{company.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Role: {company?.role}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleSwitchToCompany(company._id)}
                                        >
                                            Switch To
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleManageCompany(company._id)}
                                        >
                                            Manage
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Card>
                        );
                    })}

                    {(!companies || companies.length === 0) && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                No companies found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Create your first company to get started
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Iconify icon="mingcute:add-line" />}
                                onClick={createDialog.onTrue}
                            >
                                Create Your First Company
                            </Button>
                        </Box>
                    )}
                </Stack>
            </Card>

            {/* Create Company Dialog */}
            <Dialog open={createDialog.value} onClose={createDialog.onFalse} maxWidth="md" fullWidth>
                <DialogTitle>Create New Company</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Company Name"
                            value={createForm.name}
                            onChange={(e) => setCreateForm({ name: e.target.value })}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            value={createForm.description}
                            onChange={(e) => setCreateForm({ description: e.target.value })}
                            multiline
                            rows={3}
                        />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel>Industry</InputLabel>
                                <Select
                                    value={createForm.industry}
                                    label="Industry"
                                    onChange={(e) => setCreateForm({ industry: e.target.value })}
                                >
                                    {INDUSTRY_OPTIONS.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Company Size</InputLabel>
                                <Select
                                    value={createForm.size}
                                    label="Company Size"
                                    onChange={(e) => setCreateForm({ size: e.target.value })}
                                >
                                    {COMPANY_SIZE_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                label="Website"
                                value={createForm.website}
                                onChange={(e) => setCreateForm({ website: e.target.value })}
                                placeholder="https://example.com"
                            />
                            <TextField
                                fullWidth
                                label="Phone"
                                value={createForm.phone}
                                onChange={(e) => setCreateForm({ phone: e.target.value })}
                            />
                        </Stack>

                        <TextField
                            fullWidth
                            label="Email"
                            value={createForm.email}
                            onChange={(e) => setCreateForm({ email: e.target.value })}
                            type="email"
                        />

                        <Divider />

                        <Typography variant="subtitle2">Address</Typography>

                        <TextField
                            fullWidth
                            label="Street Address"
                            value={createForm.address.street}
                            onChange={(e) =>
                                setCreateForm({
                                    address: { ...createForm.address, street: e.target.value },
                                })
                            }
                        />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                label="City"
                                value={createForm.address.city}
                                onChange={(e) =>
                                    setCreateForm({
                                        address: { ...createForm.address, city: e.target.value },
                                    })
                                }
                            />
                            <TextField
                                fullWidth
                                label="State"
                                value={createForm.address.state}
                                onChange={(e) =>
                                    setCreateForm({
                                        address: { ...createForm.address, state: e.target.value },
                                    })
                                }
                            />
                            <TextField
                                fullWidth
                                label="ZIP Code"
                                value={createForm.address.zipCode}
                                onChange={(e) =>
                                    setCreateForm({
                                        address: { ...createForm.address, zipCode: e.target.value },
                                    })
                                }
                            />
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={createDialog.onFalse}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateCompany}
                        disabled={loading.value || !createForm.name}
                        startIcon={loading.value ? <Iconify icon="svg-spinners:8-dots-rotate" /> : undefined}
                    >
                        Create Company
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}// ----------------------------------------------------------------------

export function SettingsView() {
    const searchParams = useSearchParams();
    const [currentTab, setCurrentTab] = useState(searchParams.get('tab') || 'profile');

    const handleChangeTab = useCallback((event, newValue) => {
        setCurrentTab(newValue);
    }, []);

    const renderContent = () => {
        switch (currentTab) {
            case 'profile':
                return <ProfileTab />;
            case 'company':
                return <CompanyTab />;
            case 'companies':
                return <CompaniesTab />;
            case 'security':
                return (
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6">Security Settings</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Coming soon...
                        </Typography>
                    </Card>
                );
            case 'notifications':
                return (
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6">Notification Settings</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Coming soon...
                        </Typography>
                    </Card>
                );
            case 'billing':
                return (
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6">Billing & Subscription</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Coming soon...
                        </Typography>
                    </Card>
                );
            default:
                return <ProfileTab />;
        }
    };

    return (
        <DashboardContent>
            <Container maxWidth="xl">

                <Tabs
                    value={currentTab}
                    onChange={handleChangeTab}
                    sx={{
                        mb: { xs: 3, md: 5 },
                    }}
                >
                    {TABS.map((tab) => (
                        <Tab
                            key={tab.value}
                            iconPosition="start"
                            value={tab.value}
                            label={tab.label}
                            icon={<Iconify icon={tab.icon} width={20} />}
                        />
                    ))}
                </Tabs>

                {renderContent()}
            </Container>
        </DashboardContent>
    );
}