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
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
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
  const [errorMsg, setErrorMsg] = useState('');
  const [linkToken, setLinkToken] = useState(null);
  const [plaidLoading, setPlaidLoading] = useState(false);
  const [disconnectDialog, setDisconnectDialog] = useState({
    open: false,
    account: null,
  });


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


  const handleOpenDisconnectDialog = (account) => {
    setDisconnectDialog({
      open: true,
      account,
    });
  };

  const handleCloseDisconnectDialog = () => {
    setDisconnectDialog({
      open: false,
      account: null,
    });
  };

  const handleConfirmDisconnect = async () => {
    const { account } = disconnectDialog;
    if (!account) return;

    try {
      setLoading(true);
      await axios.delete(endpoints.plaid.disconnect(account._id));
      toast.success('Account disconnected successfully');
      handleCloseDisconnectDialog();
      fetchAccounts();
    } catch (error) {
      console.error('Failed to disconnect account:', error);
      toast.error(error.response?.data?.message || 'Failed to disconnect account');
    } finally {
      setLoading(false);
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
                    Connect your bank accounts, credit cards, or loans via Plaid to get started
                  </Typography>
                  {process.env.NODE_ENV !== 'production' && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Sandbox Testing:</strong> When connecting, select <strong>"First Platypus Bank"</strong> (not the OAuth versions) and use credentials <code>user_transactions_dynamic</code> with any password for rich transaction data, or <code>user_good</code>/<code>pass_good</code> for basic testing.
                      </Typography>
                    </Alert>
                  )}
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <LoadingButton
                      variant="contained"
                      startIcon={plaidLoading ? <CircularProgress size={20} /> : <Iconify icon="simple-icons:plaid" />}
                      onClick={handleConnectPlaid}
                      loading={plaidLoading}
                    >
                      Connect with Plaid
                    </LoadingButton>
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
                        <Tooltip title="Disconnect account">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenUnlinkDialog(account)}
                            disabled={loading}
                          >
                            <Iconify icon="eva:power-outline" />
                          </IconButton>
                        </Tooltip>
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
                            {/* Show sync status only during initial sync */}
                            {account.plaidIntegrationId?.syncStatus === 'syncing' && (
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <CircularProgress size={12} />
                                <Typography variant="caption" color="warning.main">
                                  Setting up...
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        )}
                      </Stack>

                      {account.isPlaidLinked && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Iconify icon="eva:power-outline" />}
                          onClick={() => handleOpenDisconnectDialog(account)}
                          disabled={loading}
                        >
                          Disconnect
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

      {/* Disconnect Account Confirmation Dialog */}

      {/* Disconnect Account Confirmation Dialog */}





      {/* Disconnect Account Confirmation Dialog */}
      <Dialog open={disconnectDialog.open} onClose={handleCloseDisconnectDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:alert-triangle-outline" width={24} color="error.main" />
            <Typography variant="h6" color="error.main">
              Disconnect Account
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography>
              Are you sure you want to disconnect <strong>{disconnectDialog.account?.accountName}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This will disconnect all accounts linked to the same institution.
            </Typography>

            <Alert severity="warning" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>This action cannot be undone.</strong> Disconnecting will:
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                <li>Remove the account from Plaid (stops all billing)</li>
                <li>Delete all associated transactions</li>
                <li>Deactivate the account and integration data</li>
                <li>Securely clear all stored credentials</li>
              </Box>
            </Alert>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>Note:</strong> You can reconnect this account later if needed, but historical transactions will need to be synced again.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={handleCloseDisconnectDialog}
            color="inherit"
            size="large"
            disabled={loading}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleConfirmDisconnect}
            variant="contained"
            color="error"
            loading={loading}
            size="large"
            startIcon={<Iconify icon="eva:trash-2-outline" />}
          >
            Disconnect Account
          </LoadingButton>
        </DialogActions>
      </Dialog>

    </DashboardContent>
  );
}
