'use client';

import { useState, useEffect, useCallback } from 'react';
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
import Switch from '@mui/material/Switch';

import { useAuthContext } from 'src/auth/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

// Account types for display only
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
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [showAutoSyncDialog, setShowAutoSyncDialog] = useState(false);
  const [selectedSyncAccount, setSelectedSyncAccount] = useState(null);
  const [selectedAutoSyncAccount, setSelectedAutoSyncAccount] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [linkToken, setLinkToken] = useState(null);
  const [plaidLoading, setPlaidLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState({});
  const [autoSyncLoading, setAutoSyncLoading] = useState(false);
  const [autoSyncSettings, setAutoSyncSettings] = useState({
    enabled: false,
    frequency: 'daily'
  });

  // Date range for sync (default: Jan 1 of current year to today)
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

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

  // Check sync status for an account
  const checkSyncStatus = useCallback(async (accountId) => {
    try {
      const response = await axios.get(endpoints.plaid.syncStatus(accountId));
      if (response.data.success) {
        setSyncStatus(prev => ({
          ...prev,
          [accountId]: response.data
        }));
        return response.data;
      }
    } catch (error) {
      console.error('Failed to check sync status:', error);
    }
  }, []);

  // Poll sync status while syncing
  useEffect(() => {
    const syncingAccounts = accounts.filter(
      acc => acc.isPlaidLinked && syncStatus[acc._id]?.syncStatus === 'syncing'
    );

    if (syncingAccounts.length === 0) return;

    const interval = setInterval(() => {
      syncingAccounts.forEach(acc => {
        checkSyncStatus(acc._id);
      });
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [accounts, syncStatus, checkSyncStatus]);

  // Load sync status for all Plaid accounts on mount
  useEffect(() => {
    accounts.filter(acc => acc.isPlaidLinked).forEach(acc => {
      checkSyncStatus(acc._id);
    });
  }, [accounts, checkSyncStatus]);

  const handleSyncAccount = async () => {
    if (!selectedSyncAccount) return;

    // Check if already syncing
    const status = syncStatus[selectedSyncAccount._id];
    if (status?.syncStatus === 'syncing') {
      toast.error('Sync already in progress. Please wait...');
      return;
    }

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

        // Update sync status
        setSyncStatus(prev => ({
          ...prev,
          [selectedSyncAccount._id]: {
            syncStatus: 'syncing',
            syncProgress: response.data.syncProgress
          }
        }));

        // Start polling for status
        setTimeout(() => {
          checkSyncStatus(selectedSyncAccount._id);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to sync account:', error);
      const errorMessage = error.message || 'Failed to sync account';

      if (error.syncStatus === 'syncing') {
        toast.error('Sync already in progress. Please wait for it to complete.');
      } else {
        setErrorMsg(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setSyncLoading(false);
    }
  };

  // Handle auto-sync configuration
  const handleOpenAutoSyncDialog = (account) => {
    setSelectedAutoSyncAccount(account);

    // Load current auto-sync settings
    const status = syncStatus[account._id];
    if (status?.autoSync) {
      setAutoSyncSettings({
        enabled: status.autoSync.enabled || false,
        frequency: status.autoSync.frequency || 'daily'
      });
    } else {
      setAutoSyncSettings({ enabled: false, frequency: 'daily' });
    }

    setShowAutoSyncDialog(true);
  };

  // Handle auto-sync configuration - API call is ONLY made here when Save button is clicked
  // Changing the Switch or frequency selection only updates local state (autoSyncSettings)
  const handleConfigureAutoSync = async () => {
    if (!selectedAutoSyncAccount) return;

    try {
      setAutoSyncLoading(true);

      // API call is made only when Save button is clicked
      const response = await axios.post(
        endpoints.plaid.autoSync(selectedAutoSyncAccount._id),
        autoSyncSettings
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setShowAutoSyncDialog(false);

        if (response.data.autoSync) {
          setSyncStatus(prev => ({
            ...prev,
            [selectedAutoSyncAccount._id]: {
              ...prev[selectedAutoSyncAccount._id],
              autoSync: response.data.autoSync,
              // Preserve other sync status fields if they exist
              syncStatus: prev[selectedAutoSyncAccount._id]?.syncStatus || 'idle',
              syncProgress: prev[selectedAutoSyncAccount._id]?.syncProgress,
              lastSync: prev[selectedAutoSyncAccount._id]?.lastSync,
            }
          }));
        }
      }
    } catch (error) {
      console.error('Failed to configure auto-sync:', error);
      toast.error(error.message || 'Failed to configure auto-sync');
    } finally {
      setAutoSyncLoading(false);
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
              Connect checking accounts, credit cards, and loan accounts via Plaid
            </Typography>
          </div>

          <LoadingButton
            variant="contained"
            color="primary"
            startIcon={plaidLoading ? <CircularProgress size={20} /> : <Iconify icon="simple-icons:plaid" />}
            onClick={handleConnectPlaid}
            loading={plaidLoading}
          >
            {plaidLoading ? 'Initializing...' : 'Connect with Plaid'}
          </LoadingButton>
        </Stack>

        {!!errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        {accounts.length === 0 && !loading && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Supported Account Types
            </Typography>
            <Typography variant="body2">
              • <strong>Checking Accounts:</strong> Connect your primary business checking accounts
              <br />
              • <strong>Credit Cards:</strong> All credit card types (bank-issued, PayPal, etc.)
              <br />
              • <strong>Loan Accounts:</strong> Auto, mortgage, student, business, home equity, and other loan types
            </Typography>
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
                          <Stack spacing={0.5}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Iconify icon="simple-icons:plaid" width={12} />
                              <Typography variant="caption" color="success.main">
                                Plaid Connected
                              </Typography>
                            </Stack>
                            {syncStatus[account._id]?.autoSync?.enabled && (
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Iconify icon="eva:clock-outline" width={12} />
                                <Typography variant="caption" color="info.main">
                                  Auto-Sync: {syncStatus[account._id].autoSync.frequency}
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        )}
                      </Stack>

                      {account.isPlaidLinked && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={
                              syncStatus[account._id]?.syncStatus === 'syncing' ? (
                                <CircularProgress size={16} />
                              ) : (
                                <Iconify icon="eva:refresh-outline" />
                              )
                            }
                            onClick={() => handleOpenSyncDialog(account)}
                            disabled={syncStatus[account._id]?.syncStatus === 'syncing'}
                          >
                            {syncStatus[account._id]?.syncStatus === 'syncing'
                              ? 'Syncing...'
                              : 'Sync Transactions'}
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<Iconify icon="eva:settings-2-outline" />}
                            onClick={() => handleOpenAutoSyncDialog(account)}
                          >
                            Auto-Sync
                          </Button>
                        </>
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
        onClose={() => !syncLoading && setShowSyncDialog(false)}
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

            {syncStatus[selectedSyncAccount?._id]?.lastSync && (
              <Typography variant="caption" color="text.secondary">
                Last synced: {new Date(syncStatus[selectedSyncAccount._id].lastSync).toLocaleString()}
              </Typography>
            )}

            {syncStatus[selectedSyncAccount?._id]?.syncStatus === 'syncing' && (
              <Alert severity="info" icon={<CircularProgress size={20} />}>
                {syncStatus[selectedSyncAccount._id].syncProgress?.currentStep || 'Syncing in progress...'}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSyncDialog(false)} color="inherit" disabled={syncLoading}>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleSyncAccount}
            variant="contained"
            loading={syncLoading}
            disabled={syncStatus[selectedSyncAccount?._id]?.syncStatus === 'syncing'}
          >
            Sync Transactions
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Auto-Sync Configuration Dialog */}
      <Dialog
        open={showAutoSyncDialog}
        onClose={() => setShowAutoSyncDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Iconify icon="eva:clock-outline" width={24} />
            <Typography variant="h6">Configure Auto-Sync</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info" icon={<Iconify icon="eva:info-outline" />}>
              <Typography variant="body2">
                Automatically sync transactions at scheduled intervals. Syncing occurs at midnight based on your selected frequency.
              </Typography>
            </Alert>

            {/* Enable/Disable Toggle */}
            <Card variant="outlined" sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">Auto-Sync</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {autoSyncSettings.enabled
                      ? 'Transactions will be synced automatically'
                      : 'Auto-sync is currently disabled'}
                  </Typography>
                </Stack>
                <Switch
                  checked={autoSyncSettings.enabled}
                  onChange={(e) => {
                    // Only updates local state - no API call until Save button is clicked
                    setAutoSyncSettings(prev => ({ ...prev, enabled: e.target.checked }));
                  }}
                  color="primary"
                />
              </Stack>
            </Card>

            {/* Frequency Selection */}
            {autoSyncSettings.enabled && (
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Sync Frequency
                </Typography>
                <Stack spacing={1.5}>
                  <Card
                    variant={autoSyncSettings.frequency === 'daily' ? 'outlined' : 'outlined'}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: autoSyncSettings.frequency === 'daily' ? 2 : 1,
                      borderColor: autoSyncSettings.frequency === 'daily' ? 'primary.main' : 'divider',
                      bgcolor: autoSyncSettings.frequency === 'daily' ? 'action.selected' : 'transparent',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => {
                      // Only updates local state - no API call until Save button is clicked
                      setAutoSyncSettings(prev => ({ ...prev, frequency: 'daily' }));
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Iconify
                        icon="eva:calendar-outline"
                        width={24}
                        sx={{ color: autoSyncSettings.frequency === 'daily' ? 'primary.main' : 'text.secondary' }}
                      />
                      <Stack spacing={0.5} sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">Daily</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Every day at midnight (00:00)
                        </Typography>
                      </Stack>
                      {autoSyncSettings.frequency === 'daily' && (
                        <Iconify icon="eva:checkmark-circle-2-fill" width={24} sx={{ color: 'primary.main' }} />
                      )}
                    </Stack>
                  </Card>

                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: autoSyncSettings.frequency === 'weekly' ? 2 : 1,
                      borderColor: autoSyncSettings.frequency === 'weekly' ? 'primary.main' : 'divider',
                      bgcolor: autoSyncSettings.frequency === 'weekly' ? 'action.selected' : 'transparent',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => {
                      // Only updates local state - no API call until Save button is clicked
                      setAutoSyncSettings(prev => ({ ...prev, frequency: 'weekly' }));
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Iconify
                        icon="eva:calendar-outline"
                        width={24}
                        sx={{ color: autoSyncSettings.frequency === 'weekly' ? 'primary.main' : 'text.secondary' }}
                      />
                      <Stack spacing={0.5} sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">Weekly</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Every Monday at midnight (00:00)
                        </Typography>
                      </Stack>
                      {autoSyncSettings.frequency === 'weekly' && (
                        <Iconify icon="eva:checkmark-circle-2-fill" width={24} sx={{ color: 'primary.main' }} />
                      )}
                    </Stack>
                  </Card>

                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: autoSyncSettings.frequency === 'monthly' ? 2 : 1,
                      borderColor: autoSyncSettings.frequency === 'monthly' ? 'primary.main' : 'divider',
                      bgcolor: autoSyncSettings.frequency === 'monthly' ? 'action.selected' : 'transparent',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => {
                      // Only updates local state - no API call until Save button is clicked
                      setAutoSyncSettings(prev => ({ ...prev, frequency: 'monthly' }));
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Iconify
                        icon="eva:calendar-outline"
                        width={24}
                        sx={{ color: autoSyncSettings.frequency === 'monthly' ? 'primary.main' : 'text.secondary' }}
                      />
                      <Stack spacing={0.5} sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">Monthly</Typography>
                        <Typography variant="caption" color="text.secondary">
                          1st of every month at midnight (00:00)
                        </Typography>
                      </Stack>
                      {autoSyncSettings.frequency === 'monthly' && (
                        <Iconify icon="eva:checkmark-circle-2-fill" width={24} sx={{ color: 'primary.main' }} />
                      )}
                    </Stack>
                  </Card>
                </Stack>
              </Stack>
            )}

            {/* Current Status */}
            {syncStatus[selectedAutoSyncAccount?._id]?.autoSync && (
              <Card variant="outlined" sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Current Status
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {syncStatus[selectedAutoSyncAccount._id].autoSync.enabled ? (
                        <>
                          <Iconify icon="eva:checkmark-circle-2-fill" width={16} sx={{ color: 'success.main' }} />
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            Active
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Iconify icon="eva:close-circle-fill" width={16} sx={{ color: 'text.disabled' }} />
                          <Typography variant="body2" fontWeight="medium" color="text.disabled">
                            Inactive
                          </Typography>
                        </>
                      )}
                    </Stack>
                  </Stack>

                  {syncStatus[selectedAutoSyncAccount._id].autoSync.frequency && (
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Frequency
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {syncStatus[selectedAutoSyncAccount._id].autoSync.frequency.charAt(0).toUpperCase() +
                          syncStatus[selectedAutoSyncAccount._id].autoSync.frequency.slice(1)}
                      </Typography>
                    </Stack>
                  )}

                  {syncStatus[selectedAutoSyncAccount._id].autoSync.lastAutoSync && (
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Last Sync
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {new Date(syncStatus[selectedAutoSyncAccount._id].autoSync.lastAutoSync).toLocaleString()}
                      </Typography>
                    </Stack>
                  )}

                  {syncStatus[selectedAutoSyncAccount._id].autoSync.nextAutoSync && (
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Next Sync
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" color="primary.main">
                        {new Date(syncStatus[selectedAutoSyncAccount._id].autoSync.nextAutoSync).toLocaleString()}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Card>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setShowAutoSyncDialog(false)} color="inherit" size="large">
            Cancel
          </Button>
          <LoadingButton
            onClick={handleConfigureAutoSync}
            variant="contained"
            loading={autoSyncLoading}
            size="large"
          >
            Save Settings
          </LoadingButton>
        </DialogActions>
      </Dialog>

    </DashboardContent>
  );
}
