'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Chip from '@mui/material/Chip';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Menu from '@mui/material/Menu';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { useRouter } from 'next/navigation';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { usePermissions } from 'src/hooks/use-permissions';
import toast from 'react-hot-toast';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'business_checking', label: 'Business Checking' },
  { value: 'business_savings', label: 'Business Savings' },
  { value: 'money_market', label: 'Money Market Account' },
  { value: 'cd', label: 'Certificate of Deposit (CD)' },
  { value: 'other', label: 'Other' },
];

// Helper function to format date string
const formatDateString = (apiDate) => {
  if (!apiDate) return '';
  return new Date(apiDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export function AccountsManagementView() {
  const router = useRouter();
  const { selectedCompany } = useAuthContext();
  const { can } = usePermissions();
  const [currentTab, setCurrentTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState({
    bankAccounts: [],
    creditCards: [],
    cashAccounts: []
  });
  const [error, setError] = useState(null);

  // Dialog states for account management
  const [accountManagementDialog, setAccountManagementDialog] = useState({
    open: false,
    account: null,
    accountType: null,
    mode: 'view'
  });
  const [formData, setFormData] = useState({
    accountName: '',
    description: '',
    initialBalance: 0,
    currency: 'USD',
    isDefault: false,
    // Bank account fields
    bankName: '',
    accountNumber: '',
    accountType: 'checking',
    // Credit card fields
    issuerBank: '',
    cardName: '',
    lastFourDigits: '',
    cardType: 'visa'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [viewAccountsDialog, setViewAccountsDialog] = useState(false);
  const [createAccountMenu, setCreateAccountMenu] = useState(null);

  useEffect(() => {
    if (selectedCompany?._id) {
      fetchAllAccounts();
    }
  }, [selectedCompany]);

  const fetchAllAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all account types in parallel
      const [bankResponse, creditResponse, cashResponse] = await Promise.allSettled([
        axiosInstance.get(endpoints.bankAccounts.list),
        axiosInstance.get(endpoints.creditCards.list),
        axiosInstance.get(endpoints.cashAccounts.list, {
          params: { includeBalance: true }
        })
      ]);

      const fetchedAccounts = {
        bankAccounts: bankResponse.status === 'fulfilled' ? (bankResponse.value.data.data?.bankAccounts || []) : [],
        creditCards: creditResponse.status === 'fulfilled' ? (creditResponse.value.data.data?.creditCards || []) : [],
        cashAccounts: cashResponse.status === 'fulfilled' ? (cashResponse.value.data.data?.cashAccounts || []) : []
      };

      setAccounts(fetchedAccounts);

      // Log any failed requests
      if (bankResponse.status === 'rejected') {
        console.warn('Failed to fetch bank accounts:', bankResponse.reason);
      }
      if (creditResponse.status === 'rejected') {
        console.warn('Failed to fetch credit cards:', creditResponse.reason);
      }
      if (cashResponse.status === 'rejected') {
        console.warn('Failed to fetch cash accounts:', cashResponse.reason);
      }

    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      setError('Failed to load accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const getAccountSummary = () => {
    const totalBankAccounts = accounts.bankAccounts.length;
    const totalCreditCards = accounts.creditCards.length;
    const totalCashAccounts = accounts.cashAccounts.length;
    const totalAccounts = totalBankAccounts + totalCreditCards + totalCashAccounts;

    const totalCashBalance = accounts.cashAccounts.reduce(
      (sum, account) => sum + (account.currentBalance || 0),
      0
    );

    return {
      totalAccounts,
      totalBankAccounts,
      totalCreditCards,
      totalCashAccounts,
      totalCashBalance
    };
  };

  const handleOpenAccountManagement = (account, mode = 'view') => {
    const accountType = account.type;

    // Set form data based on account type
    if (accountType === 'bank') {
      setFormData({
        accountName: account.accountName || '',
        description: account.description || '',
        initialBalance: account.initialBalance || 0,
        currency: account.currency || 'USD',
        isDefault: account.isDefault || false,
        bankName: account.bankName || '',
        accountNumber: account.accountNumber || '',
        accountType: account.accountType || 'checking',
        issuerBank: '',
        cardName: '',
        lastFourDigits: '',
        cardType: 'visa'
      });
    } else if (accountType === 'credit') {
      setFormData({
        accountName: account.cardName || '',
        description: account.description || '',
        initialBalance: account.initialBalance || 0,
        currency: account.currency || 'USD',
        isDefault: account.isDefault || false,
        bankName: '',
        accountNumber: '',
        accountType: 'checking',
        issuerBank: account.issuerBank || '',
        cardName: account.cardName || '',
        lastFourDigits: account.lastFourDigits || '',
        cardType: account.cardType || 'visa'
      });
    } else if (accountType === 'cash') {
      setFormData({
        accountName: account.accountName || '',
        description: account.description || '',
        initialBalance: account.initialBalance || 0,
        currency: account.currency || 'USD',
        isDefault: account.isDefault || false,
        bankName: '',
        accountNumber: '',
        accountType: 'checking',
        issuerBank: '',
        cardName: '',
        lastFourDigits: '',
        cardType: 'visa'
      });
    }

    setAccountManagementDialog({
      open: true,
      account,
      accountType,
      mode
    });
  };

  const handleOpenCreateAccount = (accountType) => {
    setFormData({
      accountName: '',
      description: '',
      initialBalance: 0,
      currency: 'USD',
      isDefault: false,
      bankName: '',
      accountNumber: '',
      accountType: 'checking',
      issuerBank: '',
      cardName: '',
      lastFourDigits: '',
      cardType: 'visa'
    });

    setAccountManagementDialog({
      open: true,
      account: null,
      accountType,
      mode: 'create'
    });
  };

  const handleCloseAccountManagement = () => {
    if (!formLoading && !deleteLoading) {
      setAccountManagementDialog({ open: false, account: null, accountType: null, mode: 'view' });
      setDeleteError(null);
    }
  };

  const handleDeleteAccount = (account) => {
    setAccountToDelete(account);
    setDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const accountType = accountToDelete.type;
      let endpoint;

      if (accountType === 'bank') {
        endpoint = endpoints.bankAccounts.delete(accountToDelete._id);
      } else if (accountType === 'credit') {
        endpoint = endpoints.creditCards.delete(accountToDelete._id);
      } else if (accountType === 'cash') {
        endpoint = endpoints.cashAccounts.delete(accountToDelete._id);
      }

      await axiosInstance.delete(endpoint);

      // Refresh accounts
      await fetchAllAccounts();

      toast.success(`${accountType === 'bank' ? 'Bank account' : accountType === 'credit' ? 'Credit card' : 'Cash account'} deleted successfully`);

      // Close dialogs
      setDeleteConfirmDialog(false);
      setAccountToDelete(null);
      setAccountManagementDialog({ open: false, account: null, accountType: null, mode: 'view' });

    } catch (error) {
      console.error('Delete account failed:', error);
      setDeleteError(error.message || 'Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  function isFormValid() {
    const { accountType } = accountManagementDialog;

    if (accountType === 'bank') {
      return formData.bankName.trim() && formData.accountName.trim();
    } else if (accountType === 'credit') {
      return formData.issuerBank.trim() && formData.cardName.trim() && formData.lastFourDigits.trim() && formData.lastFourDigits.length === 4;
    } else if (accountType === 'cash') {
      return formData.accountName.trim();
    }

    return false;
  }

  const handleSubmitAccount = async () => {
    const { account, accountType, mode } = accountManagementDialog;

    setFormLoading(true);

    try {
      let endpoint, data;

      if (accountType === 'bank') {
        data = {
          accountName: formData.accountName,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountType: formData.accountType
        };

        if (mode === 'create') {
          endpoint = endpoints.bankAccounts.create;
          await axiosInstance.post(endpoint, data);
        } else {
          endpoint = endpoints.bankAccounts.update(account._id);
          await axiosInstance.put(endpoint, data);
        }
      } else if (accountType === 'credit') {
        data = {
          cardName: formData.cardName || formData.accountName,
          issuerBank: formData.issuerBank,
          lastFourDigits: formData.lastFourDigits,
          cardType: formData.cardType
        };

        if (mode === 'create') {
          endpoint = endpoints.creditCards.create;
          await axiosInstance.post(endpoint, data);
        } else {
          endpoint = endpoints.creditCards.update(account._id);
          await axiosInstance.put(endpoint, data);
        }
      } else if (accountType === 'cash') {
        data = {
          accountName: formData.accountName,
          description: formData.description,
          initialBalance: parseFloat(formData.initialBalance) || 0,
          currency: formData.currency,
          isDefault: formData.isDefault
        };

        if (mode === 'create') {
          endpoint = endpoints.cashAccounts.create;
          await axiosInstance.post(endpoint, data);
        } else {
          endpoint = endpoints.cashAccounts.update(account._id);
          await axiosInstance.put(endpoint, data);
        }
      }

      // Refresh accounts
      await fetchAllAccounts();

      toast.success(`${accountType === 'bank' ? 'Bank account' : accountType === 'credit' ? 'Credit card' : 'Cash account'} ${mode === 'create' ? 'created' : 'updated'} successfully`);

      // Close dialog
      setAccountManagementDialog({ open: false, account: null, accountType: null, mode: 'view' });

    } catch (error) {
      console.error('Submit account failed:', error);
      toast.error(error.message || `Failed to ${mode} account. Please try again.`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenCreateAccountMenu = (event) => {
    setCreateAccountMenu(event.currentTarget);
  };

  const handleCloseCreateAccountMenu = () => {
    setCreateAccountMenu(null);
  };

  const handleFormDataChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const getAllAccounts = () => {
    return [
      ...accounts.bankAccounts.map(account => ({ ...account, type: 'bank' })),
      ...accounts.creditCards.map(account => ({ ...account, type: 'credit' })),
      ...accounts.cashAccounts.map(account => ({ ...account, type: 'cash' }))
    ];
  };

  const getFilteredAccounts = () => {
    switch (currentTab) {
      case 'bank':
        return accounts.bankAccounts.map(account => ({ ...account, type: 'bank' }));
      case 'credit':
        return accounts.creditCards.map(account => ({ ...account, type: 'credit' }));
      case 'cash':
        return accounts.cashAccounts.map(account => ({ ...account, type: 'cash' }));
      default:
        return [
          ...accounts.bankAccounts.map(account => ({ ...account, type: 'bank' })),
          ...accounts.creditCards.map(account => ({ ...account, type: 'credit' })),
          ...accounts.cashAccounts.map(account => ({ ...account, type: 'cash' }))
        ];
    }
  };

  const renderAccountCard = (account) => {
    const isBank = account.type === 'bank';
    const isCredit = account.type === 'credit';
    const isCash = account.type === 'cash';

    return (
      <Grid item xs={12} sm={6} md={4} key={`${account.type}-${account._id}`}>
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
              {/* Header with type and status */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Box sx={{ flex: 1 }}>
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
                      mb: 0.5
                    }}
                  >
                    {account.accountName || account.bankName || account.cardName}
                  </Typography>

                  <Chip
                    size="small"
                    label={isBank ? 'Bank Account' : isCredit ? 'Credit Card' : 'Cash Account'}
                    color={isBank ? 'primary' : isCredit ? 'secondary' : 'success'}
                    icon={
                      <Iconify
                        icon={
                          isBank ? 'ph:bank-bold' :
                            isCredit ? 'ph:credit-card-bold' :
                              'ph:wallet-bold'
                        }
                        sx={{ fontSize: 14 }}
                      />
                    }
                  />
                </Box>

                {account.isDefault && (
                  <Chip
                    size="small"
                    label="Default"
                    color="primary"
                    variant="outlined"
                    icon={<Iconify icon="ph:star-fill" sx={{ fontSize: 14 }} />}
                  />
                )}
              </Box>

              {/* Account details */}
              <Box
                sx={{
                  bgcolor: isBank ? 'primary.lighter' : isCredit ? 'secondary.lighter' : 'success.lighter',
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: isBank ? 'primary.light' : isCredit ? 'secondary.light' : 'success.light',
                }}
              >
                {isBank && (
                  <>
                    <Typography variant="subtitle2" color="primary.main">
                      {account.bankName}
                    </Typography>
                    {account.accountNumber && (
                      <Typography variant="caption" color="primary.dark">
                        •••• {account.accountNumber}
                      </Typography>
                    )}
                    {account.accountType && (
                      <Typography variant="caption" color="primary.dark" sx={{ display: 'block', mt: 0.5 }}>
                        {ACCOUNT_TYPE_OPTIONS.find(opt => opt.value === account.accountType)?.label || account.accountType}
                      </Typography>
                    )}
                  </>
                )}

                {isCredit && (
                  <>
                    <Typography variant="subtitle2" color="secondary.main">
                      {account.issuerBank}
                    </Typography>
                    {account.lastFourDigits && (
                      <Typography variant="caption" color="secondary.dark">
                        •••• {account.lastFourDigits}
                      </Typography>
                    )}
                  </>
                )}

                {isCash && (
                  <>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle2" color="success.main">
                        Current Balance
                      </Typography>
                      <Typography variant="h6" color="success.dark" sx={{ fontWeight: 600 }}>
                        {fCurrency(account.currentBalance || 0)} {account.currency}
                      </Typography>
                    </Stack>
                    {account.description && (
                      <Typography variant="caption" color="success.dark" sx={{ mt: 0.5, display: 'block' }}>
                        {account.description}
                      </Typography>
                    )}
                  </>
                )}
              </Box>

              {/* Additional info */}
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify
                    icon="ph:calendar"
                    sx={{ color: 'text.secondary', fontSize: 16 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Added: {formatDateString(account.createdAt)}
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
                onClick={() => handleOpenAccountManagement(account, 'view')}
                sx={{ border: '1px solid', borderColor: 'primary.main' }}
              >
                <Iconify icon="ph:gear" />
              </IconButton>
            </Stack>

            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="ph:eye" />}
              onClick={() => {
                if (isBank) router.push(`/dashboard/transactions?accountType=bank_account&accountId=${account._id}`);
                else if (isCredit) router.push(`/dashboard/transactions?accountType=credit_card&accountId=${account._id}`);
                else router.push(`/dashboard/cash-accounts/${account._id}/transactions?accountType=cash_account&accountId=${account._id}`);
              }}
            >
              Transactions
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
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
          icon="ph:building-apartment-bold"
          sx={{
            fontSize: 80,
            color: 'text.disabled',
            mb: 2,
          }}
        />
      </Box>
      <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}>
        No Accounts Found
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: 'text.secondary', maxWidth: 400, mx: 'auto' }}
      >
        Connect your bank accounts, credit cards, or create cash accounts to start managing your finances.
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" gap={2}>
        {can('accounts', 'create') && (
          <>
            <Button
              variant="contained"
              onClick={() => handleOpenCreateAccount('bank')}
              startIcon={<Iconify icon="ph:bank-bold" />}
              size="large"
            >
              Add Bank Account
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleOpenCreateAccount('credit')}
              startIcon={<Iconify icon="ph:credit-card-bold" />}
              size="large"
            >
              Add Credit Card
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleOpenCreateAccount('cash')}
              startIcon={<Iconify icon="ph:wallet-bold" />}
              size="large"
            >
              Add Cash Account
            </Button>
          </>
        )}
      </Stack>
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
              <Skeleton variant="text" width={60} height={32} />
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
          Please select a company to view accounts.
        </Alert>
      </DashboardContent>
    );
  }

  const summary = getAccountSummary();
  const filteredAccounts = getFilteredAccounts();

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            All Accounts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all your connected accounts in one place
          </Typography>
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
              All Accounts
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {summary.totalAccounts > 0
                ? `${summary.totalAccounts} account${summary.totalAccounts !== 1 ? 's' : ''} connected across all types`
                : 'Manage all your connected accounts in one place'
              }
            </Typography>
          </Box>

          {/* Add Create Account dropdown button */}
          <Stack direction="row" spacing={2}>
            {can('accounts', 'create') && (
              <Button
                variant="contained"
                onClick={handleOpenCreateAccountMenu}
                startIcon={<Iconify icon="ph:plus-bold" />}
                endIcon={<Iconify icon="ph:caret-down-bold" />}
              >
                Add Account
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={() => setViewAccountsDialog(true)}
              startIcon={<Iconify icon="ph:gear-bold" />}
            >
              Manage All
            </Button>
          </Stack>
        </Stack>

        {/* Create Account Menu */}
        <Menu
          anchorEl={createAccountMenu}
          open={Boolean(createAccountMenu)}
          onClose={handleCloseCreateAccountMenu}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem
            onClick={() => {
              handleCloseCreateAccountMenu();
              handleOpenCreateAccount('bank');
            }}
            sx={{ minWidth: 200 }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Iconify icon="ph:bank-bold" sx={{ color: 'primary.main' }} />
              <Box>
                <Typography variant="subtitle2">Bank Account</Typography>
                <Typography variant="caption" color="text.secondary">
                  Connect your bank account
                </Typography>
              </Box>
            </Stack>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseCreateAccountMenu();
              handleOpenCreateAccount('credit');
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Iconify icon="ph:credit-card-bold" sx={{ color: 'secondary.main' }} />
              <Box>
                <Typography variant="subtitle2">Credit Card</Typography>
                <Typography variant="caption" color="text.secondary">
                  Add a credit card
                </Typography>
              </Box>
            </Stack>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseCreateAccountMenu();
              handleOpenCreateAccount('cash');
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Iconify icon="ph:wallet-bold" sx={{ color: 'success.main' }} />
              <Box>
                <Typography variant="subtitle2">Cash Account</Typography>
                <Typography variant="caption" color="text.secondary">
                  Create a cash account
                </Typography>
              </Box>
            </Stack>
          </MenuItem>
        </Menu>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {summary.totalAccounts > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600, mb: 1 }}>
                {summary.totalAccounts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Accounts
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600, mb: 1 }}>
                {summary.totalBankAccounts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bank Accounts
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 600, mb: 1 }}>
                {summary.totalCreditCards}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Credit Cards
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 600, mb: 1 }}>
                {fCurrency(summary.totalCashBalance)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cash Balance
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filter Tabs */}
      {summary.totalAccounts > 0 && (
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              '& .MuiTab-root': {
                textTransform: 'none',
                minWidth: 120,
                fontWeight: 'medium',
                fontSize: '0.9rem',
              },
            }}
          >
            <Tab label={`All (${summary.totalAccounts})`} value="all" />
            <Tab label={`Bank (${summary.totalBankAccounts})`} value="bank" />
            <Tab label={`Credit Cards (${summary.totalCreditCards})`} value="credit" />
            <Tab label={`Cash (${summary.totalCashAccounts})`} value="cash" />
          </Tabs>
        </Box>
      )}

      {/* Empty State */}
      {filteredAccounts.length === 0 && !error && renderEmptyState()}

      {/* Accounts Grid */}
      {filteredAccounts.length > 0 && (
        <Grid container spacing={3}>
          {filteredAccounts.map(renderAccountCard)}
        </Grid>
      )}

      {/* View/Manage Accounts Dialog */}
      <Dialog
        open={viewAccountsDialog}
        onClose={() => setViewAccountsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Manage All Accounts</Typography>
            <IconButton onClick={() => setViewAccountsDialog(false)}>
              <Iconify icon="ph:x-bold" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Balance/Info</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getAllAccounts().map((account) => {
                  const isBank = account.type === 'bank';
                  const isCredit = account.type === 'credit';
                  const isCash = account.type === 'cash';

                  return (
                    <TableRow key={`${account.type}-${account._id}`}>
                      <TableCell>
                        <Stack>
                          <Typography variant="subtitle2">
                            {account.accountName || account.bankName || account.cardName}
                          </Typography>
                          {account.isDefault && (
                            <Chip
                              size="small"
                              label="Default"
                              color="primary"
                              variant="outlined"
                              sx={{ width: 'fit-content' }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isBank ? 'Bank Account' : isCredit ? 'Credit Card' : 'Cash Account'}
                          color={isBank ? 'primary' : isCredit ? 'secondary' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {isBank && (
                          <Stack>
                            <Typography variant="body2">{account.bankName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              •••• {account.accountNumber}
                            </Typography>
                          </Stack>
                        )}
                        {isCredit && (
                          <Stack>
                            <Typography variant="body2">{account.issuerBank}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              •••• {account.lastFourDigits}
                            </Typography>
                          </Stack>
                        )}
                        {isCash && (
                          <Typography variant="body2" color="text.secondary">
                            {account.description || 'Cash Account'}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {isCash ? (
                          <Typography variant="subtitle2" color="success.main">
                            {fCurrency(account.currentBalance || 0)} {account.currency}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Created {formatDateString(account.createdAt)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => {
                            setViewAccountsDialog(false);
                            handleOpenAccountManagement(account, 'edit');
                          }}
                          size="small"
                          color="primary"
                        >
                          <Iconify icon="ph:pencil-bold" />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setViewAccountsDialog(false);
                            handleDeleteAccount(account);
                          }}
                          size="small"
                          color="error"
                        >
                          <Iconify icon="ph:trash-bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {getAllAccounts().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No accounts found. Add your first account to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewAccountsDialog(false)}>
            Close
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setViewAccountsDialog(false);
              handleOpenCreateAccount('bank');
            }}
            startIcon={<Iconify icon="ph:bank-bold" />}
          >
            Add Bank
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setViewAccountsDialog(false);
              handleOpenCreateAccount('credit');
            }}
            startIcon={<Iconify icon="ph:credit-card-bold" />}
          >
            Add Card
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setViewAccountsDialog(false);
              handleOpenCreateAccount('cash');
            }}
            startIcon={<Iconify icon="ph:wallet-bold" />}
          >
            Add Cash
          </Button>
        </DialogActions>
      </Dialog>

      {/* Account Management Dialog */}
      <Dialog
        open={accountManagementDialog.open}
        onClose={handleCloseAccountManagement}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify
              icon={
                accountManagementDialog.accountType === 'bank' ? 'ph:bank-bold' :
                  accountManagementDialog.accountType === 'credit' ? 'ph:credit-card-bold' :
                    'ph:wallet-bold'
              }
              sx={{
                color: accountManagementDialog.accountType === 'bank' ? 'primary.main' :
                  accountManagementDialog.accountType === 'credit' ? 'secondary.main' :
                    'success.main'
              }}
            />
            <Typography variant="h6">
              {accountManagementDialog.mode === 'create'
                ? `Create ${accountManagementDialog.accountType === 'bank' ? 'Bank Account' : accountManagementDialog.accountType === 'credit' ? 'Credit Card' : 'Cash Account'}`
                : accountManagementDialog.mode === 'edit'
                  ? `Edit ${accountManagementDialog.accountType === 'bank' ? 'Bank Account' : accountManagementDialog.accountType === 'credit' ? 'Credit Card' : 'Cash Account'}`
                  : `Manage ${accountManagementDialog.accountType === 'bank' ? 'Bank Account' : accountManagementDialog.accountType === 'credit' ? 'Credit Card' : 'Cash Account'}`
              }
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {accountManagementDialog.accountType === 'bank' && (
              <>
                <TextField
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={handleFormDataChange('bankName')}
                  fullWidth
                  required
                  placeholder="e.g. Chase, Bank of America"
                  disabled={accountManagementDialog.mode === 'view'}
                />
                <TextField
                  label="Account Name"
                  value={formData.accountName}
                  onChange={handleFormDataChange('accountName')}
                  fullWidth
                  required
                  placeholder="e.g. Business Checking"
                  disabled={accountManagementDialog.mode === 'view'}
                />
                <TextField
                  select
                  label="Account Type"
                  value={formData.accountType}
                  onChange={handleFormDataChange('accountType')}
                  fullWidth
                  required
                  disabled={accountManagementDialog.mode === 'view'}
                  helperText="Select the type of bank account"
                >
                  {ACCOUNT_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Account Number (last 4 digits)"
                  value={formData.accountNumber}
                  onChange={handleFormDataChange('accountNumber')}
                  fullWidth
                  inputProps={{ maxLength: 4, pattern: '[0-9]*' }}
                  placeholder="e.g. 1234"
                  disabled={accountManagementDialog.mode === 'view'}
                  helperText="Only the last 4 digits for security"
                />
              </>
            )}

            {accountManagementDialog.accountType === 'credit' && (
              <>
                <TextField
                  label="Issuer Bank"
                  value={formData.issuerBank}
                  onChange={handleFormDataChange('issuerBank')}
                  fullWidth
                  required
                  placeholder="e.g. Chase, Citi, Capital One"
                  disabled={accountManagementDialog.mode === 'view'}
                />
                <TextField
                  label="Card Name"
                  value={formData.cardName}
                  onChange={handleFormDataChange('cardName')}
                  fullWidth
                  required
                  placeholder="e.g. Business Credit Card, Rewards Card"
                  disabled={accountManagementDialog.mode === 'view'}
                />
                <TextField
                  label="Last Four Digits"
                  value={formData.lastFourDigits}
                  onChange={handleFormDataChange('lastFourDigits')}
                  fullWidth
                  required
                  inputProps={{ maxLength: 4, pattern: '[0-9]*' }}
                  placeholder="e.g. 1234"
                  disabled={accountManagementDialog.mode === 'view'}
                  helperText="Last 4 digits of your credit card"
                />
                <TextField
                  select
                  label="Card Type"
                  value={formData.cardType}
                  onChange={handleFormDataChange('cardType')}
                  fullWidth
                  disabled={accountManagementDialog.mode === 'view'}
                >
                  <MenuItem value="visa">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography>Visa</Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="mastercard">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography>Mastercard</Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="amex">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography>American Express</Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="discover">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography>Discover</Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </>
            )}

            {accountManagementDialog.accountType === 'cash' && (
              <>
                <TextField
                  label="Account Name"
                  value={formData.accountName}
                  onChange={handleFormDataChange('accountName')}
                  fullWidth
                  required
                  placeholder="e.g. Petty Cash, Cash Register, Office Cash"
                  disabled={accountManagementDialog.mode === 'view'}
                />
                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={handleFormDataChange('description')}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Optional description for this cash account"
                  disabled={accountManagementDialog.mode === 'view'}
                />
                <TextField
                  label="Initial Balance"
                  value={formData.initialBalance}
                  onChange={handleFormDataChange('initialBalance')}
                  fullWidth
                  type="number"
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={accountManagementDialog.mode === 'view' || accountManagementDialog.mode === 'edit'}
                  helperText={accountManagementDialog.mode === 'edit' ? 'Initial balance cannot be changed after creation' : 'Starting balance for this account'}
                />
                <TextField
                  select
                  label="Currency"
                  value={formData.currency}
                  onChange={handleFormDataChange('currency')}
                  fullWidth
                  disabled={accountManagementDialog.mode === 'view'}
                >
                  <MenuItem value="USD">USD - US Dollar</MenuItem>
                  <MenuItem value="EUR">EUR - Euro</MenuItem>
                  <MenuItem value="GBP">GBP - British Pound</MenuItem>
                  <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
                </TextField>

                {accountManagementDialog.mode !== 'view' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isDefault}
                        onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      />
                    }
                    label="Set as default cash account"
                  />
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseAccountManagement}
            disabled={formLoading}
          >
            {accountManagementDialog.mode === 'view' ? 'Close' : 'Cancel'}
          </Button>

          {accountManagementDialog.mode === 'view' && (
            <>
              {can('accounts', 'edit') && (
                <Button
                  variant="outlined"
                  onClick={() => setAccountManagementDialog({ ...accountManagementDialog, mode: 'edit' })}
                  startIcon={<Iconify icon="ph:pencil-bold" />}
                >
                  Edit
                </Button>
              )}
              {can('accounts', 'delete') && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    handleDeleteAccount(accountManagementDialog.account);
                    setAccountManagementDialog({ open: false, account: null, accountType: null, mode: 'view' });
                  }}
                  startIcon={<Iconify icon="ph:trash-bold" />}
                >
                  Delete
                </Button>
              )}
            </>
          )}

          {(accountManagementDialog.mode === 'edit' || accountManagementDialog.mode === 'create') && (
            <Button
              variant="contained"
              onClick={handleSubmitAccount}
              disabled={formLoading || !isFormValid()}
              startIcon={formLoading ? <Iconify icon="ph:circle-notch" sx={{ animation: 'spin 1s linear infinite' }} /> : undefined}
            >
              {formLoading
                ? (accountManagementDialog.mode === 'create' ? 'Creating...' : 'Updating...')
                : (accountManagementDialog.mode === 'create' ? 'Create Account' : 'Update Account')
              }
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteConfirmDialog(false);
            setAccountToDelete(null);
            setDeleteError(null);
          }
        }}
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="ph:warning-bold" color="error.main" />
            <Typography variant="h6">Confirm Deletion</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setDeleteError(null)}
            >
              <AlertTitle>Error</AlertTitle>
              {deleteError}
            </Alert>
          )}
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete <strong>
              {accountToDelete?.accountName || accountToDelete?.bankName || accountToDelete?.cardName}
            </strong>?
          </Typography>
          <Alert severity="warning">
            <AlertTitle>Warning</AlertTitle>
            Deleting this account will also permanently remove:
            <ul>
              <li>All associated transactions</li>
              <li>All statement data</li>
              <li>All matching and categorization data</li>
            </ul>
            This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmDialog(false);
              setAccountToDelete(null);
              setDeleteError(null);
            }}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
            startIcon={deleteLoading ?
              <Iconify icon="ph:circle-notch" sx={{ animation: 'spin 1s linear infinite' }} /> :
              <Iconify icon="ph:trash-bold" />
            }
          >
            {deleteLoading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardContent>
  );
}