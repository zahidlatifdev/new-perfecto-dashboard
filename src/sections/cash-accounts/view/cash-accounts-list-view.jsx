'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { useRouter } from 'next/navigation';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import toast from 'react-hot-toast';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

// Helper function to format date string from API
const formatDateString = (apiDate) => {
  if (!apiDate) return '';
  return new Date(apiDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export function CashAccountsListView() {
  const router = useRouter();
  const { selectedCompany } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [cashAccounts, setCashAccounts] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, account: null });
  const [editDialog, setEditDialog] = useState({ open: false, account: null });
  const [createDialog, setCreateDialog] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    accountName: '',
    description: '',
    initialBalance: 0,
    currency: 'USD',
    isDefault: false
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (selectedCompany?._id) {
      fetchCashAccounts();
    }
  }, [selectedCompany]);

  const fetchCashAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(endpoints.cashAccounts.list, {
        params: {
          includeBalance: true,
        },
      });

      const accounts = response.data.data?.cashAccounts || [];
      setCashAccounts(accounts);
    } catch (err) {
      console.error('Failed to fetch cash accounts:', err);
      setError('Failed to load cash accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (account) => {
    try {
      await axiosInstance.delete(endpoints.cashAccounts.delete(account._id));

      // Remove from local state
      setCashAccounts((prev) => prev.filter((a) => a._id !== account._id));
      setDeleteDialog({ open: false, account: null });

      toast.success('Cash account deleted successfully');
    } catch (err) {
      console.error('Failed to delete cash account:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete account. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleCreateAccount = async () => {
    try {
      setFormLoading(true);

      const response = await axiosInstance.post(endpoints.cashAccounts.create, formData);

      const newAccount = response.data.data.cashAccount;
      setCashAccounts((prev) => [newAccount, ...prev]);
      setCreateDialog(false);
      resetForm();

      toast.success('Cash account created successfully');
    } catch (err) {
      console.error('Failed to create cash account:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create account. Please try again.';
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateAccount = async () => {
    try {
      setFormLoading(true);

      const response = await axiosInstance.put(
        endpoints.cashAccounts.update(editDialog.account._id),
        formData
      );

      const updatedAccount = response.data.data.cashAccount;
      setCashAccounts((prev) =>
        prev.map((account) =>
          account._id === updatedAccount._id ? { ...account, ...updatedAccount } : account
        )
      );
      setEditDialog({ open: false, account: null });
      resetForm();

      toast.success('Cash account updated successfully');
    } catch (err) {
      console.error('Failed to update cash account:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update account. Please try again.';
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewTransactions = (account) => {
    router.push(`/dashboard/cash-accounts/${account._id}/transactions?accountType=cash_account&accountId=${account._id}`);
  };

  const handleAddTransaction = (account) => {
    router.push(`/dashboard/transactions?accountType=cash_account&accountId=${account._id}&action=add`);
  };

  const resetForm = () => {
    setFormData({
      accountName: '',
      description: '',
      initialBalance: 0,
      currency: 'USD',
      isDefault: false
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setCreateDialog(true);
  };

  const openEditDialog = (account) => {
    setFormData({
      accountName: account.accountName || '',
      description: account.description || '',
      initialBalance: account.initialBalance || 0,
      currency: account.currency || 'USD',
      isDefault: account.isDefault || false
    });
    setEditDialog({ open: true, account });
  };

  const renderEmptyState = () => (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center',
        bgcolor: 'background.neutral',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Iconify
          icon="ph:wallet-bold"
          sx={{
            fontSize: 80,
            color: 'text.disabled',
            mb: 2,
          }}
        />
      </Box>
      <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}>
        No Cash Accounts Found
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: 'text.secondary', maxWidth: 400, mx: 'auto' }}
      >
        Create your first cash account to start tracking cash transactions and managing your cash flow.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={openCreateDialog}
        startIcon={<Iconify icon="ph:plus-bold" />}
        sx={{ mb: 2 }}
      >
        Create Cash Account
      </Button>
    </Paper>
  );

  const renderLoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="rectangular" width="60px" height={24} />
                <Stack spacing={1}>
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="90%" />
                  <Skeleton variant="text" width="70%" />
                </Stack>
                <Skeleton variant="rectangular" width="100%" height={60} />
              </Stack>
            </CardContent>
            <Divider />
            <CardActions>
              <Skeleton variant="text" width={80} height={32} />
              <Skeleton variant="text" width={120} height={32} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (!selectedCompany?._id) {
    return (
      <DashboardContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>No Company Selected</AlertTitle>
          Please select a company to view cash accounts.
        </Alert>
      </DashboardContent>
    );
  }

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Cash Accounts
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your cash accounts and track cash transactions
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={openCreateDialog}
              startIcon={<Iconify icon="ph:plus-bold" />}
              disabled={loading}
            >
              Create Cash Account
            </Button>
          </Stack>
        </Box>
        {renderLoadingSkeleton()}
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Cash Accounts
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {cashAccounts.length > 0
                ? `${cashAccounts.length} cash account${cashAccounts.length !== 1 ? 's' : ''} configured`
                : 'Manage your cash accounts and track cash transactions'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={openCreateDialog}
            startIcon={<Iconify icon="ph:plus-bold" />}
          >
            Create Cash Account
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {cashAccounts.length === 0 && !error && renderEmptyState()}

      {/* Cash Accounts Grid */}
      {cashAccounts.length > 0 && (
        <Grid container spacing={3}>
          {cashAccounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.customShadows.z8,
                  },
                  ...(account.isDefault && {
                    border: '2px solid',
                    borderColor: 'primary.main',
                  })
                }}
              >
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Stack spacing={2}>
                    {/* Header with default badge */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          lineHeight: 1.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          flex: 1,
                        }}
                      >
                        {account.accountName}
                      </Typography>
                      {account.isDefault && (
                        <Chip
                          size="small"
                          label="Default"
                          color="primary"
                          icon={<Iconify icon="ph:star-fill" sx={{ fontSize: 16 }} />}
                        />
                      )}
                    </Box>

                    {/* Description */}
                    {account.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {account.description}
                      </Typography>
                    )}

                    {/* Balance display */}
                    <Box
                      sx={{
                        bgcolor: 'success.lighter',
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'success.light',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Iconify
                          icon="ph:wallet-bold"
                          sx={{ color: 'success.main', fontSize: 16 }}
                        />
                        <Typography variant="subtitle2" color="success.main">
                          Current Balance
                        </Typography>
                      </Stack>
                      <Typography variant="h6" color="success.dark" sx={{ fontWeight: 600 }}>
                        {fCurrency(account.currentBalance || 0)} {account.currency}
                      </Typography>
                      {account.initialBalance !== undefined && account.currentBalance !== account.initialBalance && (
                        <Typography variant="caption" color="success.dark">
                          Initial: {fCurrency(account.initialBalance)} {account.currency}
                        </Typography>
                      )}
                    </Box>

                    {/* Account details */}
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify
                          icon="ph:calendar"
                          sx={{ color: 'text.secondary', fontSize: 16 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Created: {formatDateString(account.createdAt)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify
                          icon="ph:currency-circle-dollar"
                          sx={{ color: 'text.secondary', fontSize: 16 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Currency: {account.currency}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>

                <Divider />

                <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => openEditDialog(account)}
                      sx={{ border: '1px solid', borderColor: 'primary.main' }}
                    >
                      <Iconify icon="ph:pencil" />
                    </IconButton>
                    {!account.isDefault && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, account })}
                        sx={{ border: '1px solid', borderColor: 'error.main' }}
                      >
                        <Iconify icon="ph:trash" />
                      </IconButton>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="ph:plus" />}
                      onClick={() => handleAddTransaction(account)}
                    >
                      Add
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Iconify icon="ph:eye" />}
                      onClick={() => handleViewTransactions(account)}
                    >
                      Transactions
                    </Button>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={createDialog || editDialog.open}
        onClose={() => {
          setCreateDialog(false);
          setEditDialog({ open: false, account: null });
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {createDialog ? 'Create Cash Account' : 'Edit Cash Account'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Account Name"
              fullWidth
              required
              value={formData.accountName}
              onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
              error={!formData.accountName.trim()}
              helperText={!formData.accountName.trim() ? 'Account name is required' : ''}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              helperText="Optional description for this cash account"
            />

            <TextField
              label="Initial Balance"
              fullWidth
              type="number"
              value={formData.initialBalance}
              onChange={(e) => setFormData(prev => ({ ...prev, initialBalance: parseFloat(e.target.value) || 0 }))}
              helperText="Starting balance for this account"
              inputProps={{ step: 0.01, min: 0 }}
            />

            <TextField
              label="Currency"
              fullWidth
              select
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
            >
              <MenuItem value="USD">USD - US Dollar</MenuItem>
              <MenuItem value="EUR">EUR - Euro</MenuItem>
              <MenuItem value="GBP">GBP - British Pound</MenuItem>
              <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
              <MenuItem value="AUD">AUD - Australian Dollar</MenuItem>
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                />
              }
              label="Set as default cash account"
              helperText="Default account will be used for new cash transactions"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setCreateDialog(false);
              setEditDialog({ open: false, account: null });
              resetForm();
            }}
            color="inherit"
            disabled={formLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={createDialog ? handleCreateAccount : handleUpdateAccount}
            variant="contained"
            disabled={!formData.accountName.trim() || formLoading}
            startIcon={formLoading ? <CircularProgress size={20} /> : null}
          >
            {createDialog ? 'Create Account' : 'Update Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, account: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="ph:warning-circle" sx={{ color: 'error.main' }} />
            Confirm Delete
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this cash account?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Account:</strong> {deleteDialog.account?.accountName}
          </Typography>
          <Alert severity="warning">
            <AlertTitle>Warning</AlertTitle>
            This action will deactivate the cash account. If there are existing transactions, the account
            will be marked as inactive but transactions will be preserved.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, account: null })} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteAccount(deleteDialog.account)}
            color="error"
            variant="contained"
            startIcon={<Iconify icon="ph:trash" />}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}