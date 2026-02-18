'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';

import { useAuthContext } from 'src/auth/hooks';
import { usePermissions } from 'src/hooks/use-permissions';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import axios, { endpoints } from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

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

export function CompanyView() {
  const { company, checkUserSession } = useAuthContext();
  const { can } = usePermissions();
  const loading = useBoolean();
  const [success, setSuccess] = useState(false);

  const { state: companyData, setState: setCompanyData } = useSetState({
    name: company?.name || '',
    description: company?.description || '',
    industry: company?.industry || '',
    size: company?.size || '1-10',
    website: company?.website || '',
    phone: company?.phone || '',
    taxId: company?.taxId || '',
    logo: company?.logo || '',
    status: company?.status || '',
    plan: company?.plan || '',
    type: company?.type || '',
    address: {
      street: company?.address?.street || '',
      city: company?.address?.city || '',
      state: company?.address?.state || '',
      zipCode: company?.address?.zipCode || '',
      country: company?.address?.country || 'US',
    },
    settings: {
      baseCurrency: company?.settings?.baseCurrency || 'USD',
      timezone: company?.settings?.timezone || 'UTC',
      dateFormat: company?.settings?.dateFormat || 'MM/DD/YYYY',
      autoMatching: company?.settings?.autoMatching ?? true,
      retentionPeriod: company?.settings?.retentionPeriod || 7,
      notifications: {
        processingComplete: company?.settings?.notifications?.processingComplete ?? true,
        newMatches: company?.settings?.notifications?.newMatches ?? true,
        missingDocuments: company?.settings?.notifications?.missingDocuments ?? true,
      },
    },
  });

  const handleSave = useCallback(async () => {
    if (!company?._id) return;

    try {
      loading.onTrue();
      setSuccess(false);
      await axios.put(endpoints.company.update(company._id), companyData);
      await checkUserSession();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update company:', error);
    } finally {
      loading.onFalse();
    }
  }, [companyData, company, loading, checkUserSession]);

  if (!company) {
    return (
      <DashboardContent>
        <Container maxWidth="lg">
          <Alert severity="warning">
            No company found. Please contact support if this issue persists.
          </Alert>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4">Company Information</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Manage your company details and settings
            </Typography>
          </div>
        </Stack>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Company information updated successfully!
          </Alert>
        )}

        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Company Name"
                value={companyData.name}
                onChange={(e) => setCompanyData({ name: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={companyData.industry}
                  label="Industry"
                  onChange={(e) => setCompanyData({ industry: e.target.value })}
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
              value={companyData.description}
              onChange={(e) => setCompanyData({ description: e.target.value })}
              multiline
              rows={3}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Company Size</InputLabel>
                <Select
                  value={companyData.size}
                  label="Company Size"
                  onChange={(e) => setCompanyData({ size: e.target.value })}
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
                value={companyData.taxId}
                onChange={(e) => setCompanyData({ taxId: e.target.value })}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Website"
                value={companyData.website}
                onChange={(e) => setCompanyData({ website: e.target.value })}
              />
              <TextField
                fullWidth
                label="Phone"
                value={companyData.phone}
                onChange={(e) => setCompanyData({ phone: e.target.value })}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="Type" value={companyData.type} disabled />
              <TextField fullWidth label="Status" value={companyData.status} disabled />
            </Stack>

            <Divider />

            <Typography variant="subtitle1">Address</Typography>

            <TextField
              fullWidth
              label="Street Address"
              value={companyData.address.street}
              onChange={(e) =>
                setCompanyData({
                  address: { ...companyData.address, street: e.target.value },
                })
              }
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="City"
                value={companyData.address.city}
                onChange={(e) =>
                  setCompanyData({
                    address: { ...companyData.address, city: e.target.value },
                  })
                }
              />
              <TextField
                fullWidth
                label="State"
                value={companyData.address.state}
                onChange={(e) =>
                  setCompanyData({
                    address: { ...companyData.address, state: e.target.value },
                  })
                }
              />
              <TextField
                fullWidth
                label="ZIP Code"
                value={companyData.address.zipCode}
                onChange={(e) =>
                  setCompanyData({
                    address: { ...companyData.address, zipCode: e.target.value },
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
                  value={companyData.settings.baseCurrency}
                  label="Base Currency"
                  onChange={(e) =>
                    setCompanyData({
                      settings: {
                        ...companyData.settings,
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
                  value={companyData.settings.timezone}
                  label="Timezone"
                  onChange={(e) =>
                    setCompanyData({
                      settings: {
                        ...companyData.settings,
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
                  checked={companyData.settings.autoMatching}
                  onChange={(e) =>
                    setCompanyData({
                      settings: {
                        ...companyData.settings,
                        autoMatching: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Enable automatic transaction matching"
            />

            <Box sx={{ textAlign: 'right' }}>
              {can('company', 'edit') && (
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading.value}
                  startIcon={loading.value ? <Iconify icon="svg-spinners:8-dots-rotate" /> : undefined}
                >
                  Save Changes
                </Button>
              )}
            </Box>
          </Stack>
        </Card>
      </Container>
    </DashboardContent>
  );
}

