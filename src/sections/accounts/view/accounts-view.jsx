'use client';

import { useState, useEffect, useCallback } from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlaidLink } from 'react-plaid-link';
import toast from 'react-hot-toast';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';

import { useAuthContext } from 'src/auth/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

const ManualAccountSchema = zod.object({
  accountName: zod.string().min(1, { message: 'Account name is required!' }),
  accountType: zod.string().min(1, { message: 'Account type is required!' }),
  accountNumber: zod.string().optional(),
  institutionName: zod.string().optional(),
  openingBalance: zod.string().optional(),
});

const ACCOUNT_TYPES = [
  { value: 'bank_account', label: 'Bank Account' },
  { value: 'credit_line', label: 'Credit Line/Card' },
  { value: 'loan_account', label: 'Loan Account' },
];

// ----------------------------------------------------------------------

export function AccountsView() {
  const { company } = useAuthContext();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [selectedSyncAccount, setSelectedSyncAccount] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [linkToken, setLinkToken] = useState(null);
  const [plaidLoading, setPlaidLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  
  // Date range for sync (default: Jan 1 of current year to today)
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const defaultValues = {
    accountName: '',
    accountType: '',
    accountNumber: '',
    institutionName: '',
    openingBalance: '0',
  };

  const methods = useForm({
    resolver: zodResolver(ManualAccountSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const fetchAccounts = useCallback(async () => {
    if (!company?._id) return;

    try {
      setLoading(true);
      const response = await axios.get(endpoints.accounts.list, {
        params: { companyId: company._id },
      });
      setAccounts(response.data.data?.allAccounts || []);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      setErrorMsg('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, [company]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Handle Plaid Link success
  const onPlaidSuccess = useCallback(async (publicToken, metadata) => {
    try {
      setPlaidLoading(true);
      setErrorMsg('');

      // Exchange public token
      await axios.post(endpoints.plaid.exchangeToken, {
        publicToken,
        companyId: company._id,
        metadata,
      });

      fetchAccounts();
      setPlaidLoading(false);
    } catch (error) {
      console.error('Plaid connection error:', error);
      setErrorMsg(error.message || 'Failed to connect accounts');
      setPlaidLoading(false);
    }
  }, [company, fetchAccounts]);

  // Initialize Plaid Link
  const config = {
    token: linkToken,
    onSuccess: onPlaidSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  // Create link token and open Plaid Link
  const handleConnectPlaid = async () => {
    try {
      setPlaidLoading(true);
      setErrorMsg('');

      if (!company?._id) {
        setErrorMsg('Company information not found');
        setPlaidLoading(false);
        return;
      }

      // Create link token
      const response = await axios.post(endpoints.plaid.createLinkToken, {
        companyId: company._id,
      });

      if (response.data.success && response.data.linkToken) {
        setLinkToken(response.data.linkToken);
        // Wait for token to be set, then open
        setTimeout(() => {
          setPlaidLoading(false);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to create link token:', error);
      setErrorMsg(error.message || 'Failed to initialize Plaid connection');
      setPlaidLoading(false);
    }
  };

  // Open Plaid Link when token is ready
  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  const onSubmitManual = handleSubmit(async (data) => {
    try {
      setErrorMsg('');

      await axios.post(endpoints.accounts.create, {
        companyId: company._id,
        accountName: data.accountName,
        accountType: data.accountType,
        accountNumber: data.accountNumber || null,
        institutionName: data.institutionName || null,
        openingBalance: parseFloat(data.openingBalance) || 0,
        isPlaidLinked: false,
        isActive: true,
      });

      setShowManualDialog(false);
      reset();
      fetchAccounts();
    } catch (error) {
      console.error('Failed to create account:', error);
      setErrorMsg(error.response?.data?.message || 'Failed to create account');
    }
  });

  const handleUnlinkAccount = async (accountId) => {
    if (!confirm('Are you sure you want to unlink this account?')) return;

    try {
      await axios.delete(endpoints.accounts.delete(accountId));
      fetchAccounts();
    } catch (error) {
      console.error('Failed to unlink account:', error);
      setErrorMsg(error.message || 'Failed to unlink account');
    }
  };

  const handleOpenSyncDialog = (account) => {
    setSelectedSyncAccount(account);
    setShowSyncDialog(true);
  };

  const handleSyncAccount = async () => {
    if (!selectedSyncAccount) return;

    try {
      setSyncLoading(true);
      setErrorMsg('');
      
      const response = await axios.post(endpoints.plaid.sync(selectedSyncAccount._id), {
        startDate,
        endDate,
      });
      
      if (response.data.success) {
        toast.success(response.data.message || `Fetched ${response.data.count} transactions from Plaid!`);
        setShowSyncDialog(false);
        
        // Wait a bit then refresh accounts to show updated sync time
        setTimeout(() => {
          fetchAccounts();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to sync account:', error);
      setErrorMsg(error.message || 'Failed to sync account');
      toast.error(error.message || 'Failed to sync account');
    } finally {
      setSyncLoading(false);
    }
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'bank_account':
        return 'mdi:bank';
      case 'credit_line':
        return 'mdi:credit-card';
      case 'loan_account':
        return 'mdi:cash';
      default:
        return 'mdi:account';
    }
  };

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4">Accounts</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Manage your linked accounts and add new ones
            </Typography>
          </div>

          <Stack direction="row" spacing={2}>
            <LoadingButton
              variant="contained"
              color="primary"
              startIcon={plaidLoading ? <CircularProgress size={20} /> : <Iconify icon="simple-icons:plaid" />}
              onClick={handleConnectPlaid}
              loading={plaidLoading}
            >
              {plaidLoading ? 'Initializing...' : 'Connect with Plaid'}
            </LoadingButton>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => setShowManualDialog(true)}
            >
              Add Manually
            </Button>
          </Stack>
        </Stack>

        {!!errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        <Grid container spacing={3}>
          {accounts.length === 0 && !loading ? (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <Iconify icon="mdi:account-off" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No Accounts Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Connect your bank accounts, credit cards, or loans to get started
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <LoadingButton
                      variant="contained"
                      startIcon={plaidLoading ? <CircularProgress size={20} /> : <Iconify icon="simple-icons:plaid" />}
                      onClick={handleConnectPlaid}
                      loading={plaidLoading}
                    >
                      Connect with Plaid
                    </LoadingButton>
                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="eva:plus-fill" />}
                      onClick={() => setShowManualDialog(true)}
                    >
                      Add Manually
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            accounts.map((account) => (
              <Grid item xs={12} md={6} lg={4} key={account._id}>
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Iconify icon={getAccountIcon(account.accountType)} width={32} />
                          <Typography variant="subtitle1">{account.accountName}</Typography>
                        </Stack>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleUnlinkAccount(account._id)}
                        >
                          <Iconify icon="eva:trash-2-outline" />
                        </IconButton>
                      </Stack>

                      <Stack spacing={1}>
                        <Typography variant="caption" color="text.secondary">
                          Institution: {account.institutionName || 'N/A'}
                        </Typography>
                        {account.accountNumber && (
                          <Typography variant="caption" color="text.secondary">
                            Account: ****{account.accountNumber.slice(-4)}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Type:{' '}
                          {ACCOUNT_TYPES.find((t) => t.value === account.accountType)?.label ||
                            account.accountType}
                        </Typography>
                        {account.isPlaidLinked && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Iconify icon="simple-icons:plaid" width={12} />
                            <Typography variant="caption" color="success.main">
                              Plaid Connected
                            </Typography>
                          </Stack>
                        )}
                      </Stack>

                      {account.isPlaidLinked && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Iconify icon="eva:refresh-outline" />}
                          onClick={() => handleOpenSyncDialog(account)}
                        >
                          Sync Transactions
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      {/* Sync Transactions Dialog */}
      <Dialog
        open={showSyncDialog}
        onClose={() => setShowSyncDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Sync Transactions</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Alert severity="info">
              Select the date range for transactions you want to sync from Plaid.
            </Alert>

            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              inputProps={{ max: new Date().toISOString().split('T')[0] }}
            />

            {selectedSyncAccount?.plaidIntegrationId?.lastSync && (
              <Typography variant="caption" color="text.secondary">
                Last synced: {new Date(selectedSyncAccount.plaidIntegrationId.lastSync).toLocaleString()}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSyncDialog(false)} color="inherit">
            Cancel
          </Button>
          <LoadingButton onClick={handleSyncAccount} variant="contained" loading={syncLoading}>
            Sync Transactions
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Manual Account Dialog */}
      <Dialog
        open={showManualDialog}
        onClose={() => setShowManualDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Account Manually</DialogTitle>
        <DialogContent>
          <Form methods={methods} onSubmit={onSubmitManual}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Field.Text name="accountName" label="Account Name" InputLabelProps={{ shrink: true }} />

              <Field.Select name="accountType" label="Account Type" InputLabelProps={{ shrink: true }}>
                <MenuItem value="">
                  <em>Select account type</em>
                </MenuItem>
                {ACCOUNT_TYPES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Text
                name="institutionName"
                label="Institution Name (optional)"
                InputLabelProps={{ shrink: true }}
              />

              <Field.Text
                name="accountNumber"
                label="Account Number (optional)"
                InputLabelProps={{ shrink: true }}
              />

              <Field.Text
                name="openingBalance"
                label="Opening Balance"
                type="number"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowManualDialog(false)} color="inherit">
            Cancel
          </Button>
          <LoadingButton onClick={onSubmitManual} variant="contained" loading={isSubmitting}>
            Add Account
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
