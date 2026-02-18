'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TablePaginationCustom } from 'src/components/table';
import { DashboardContent } from 'src/layouts/dashboard';
import { CategorySelector } from 'src/components/category-selector';

import { fCurrency } from 'src/utils/format-number';
import axios, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { usePermissions } from 'src/hooks/use-permissions';
import toast from 'react-hot-toast';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'index', label: '#', width: 40 },
  { id: 'date', label: 'Date', width: 100 },
  { id: 'description', label: 'Description', width: 180 },
  { id: 'category', label: 'Category', width: 150 },
  { id: 'debit', label: 'Debit', align: 'right', width: 90 },
  { id: 'credit', label: 'Credit', align: 'right', width: 90 },
  { id: 'notes', label: 'Notes', width: 250 },
  { id: 'actions', label: 'Actions', width: 160 },
];

const ACCOUNT_TYPE_TABS = [
  { value: 'bank_account', label: 'Bank Accounts', icon: 'mdi:bank' },
  { value: 'credit_line', label: 'Credit Cards', icon: 'mdi:credit-card' },
  { value: 'loan_account', label: 'Loan Accounts', icon: 'mdi:cash-multiple' },
];

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getSourceDisplay = (transaction, availableAccounts = []) => {
  // Ensure availableAccounts is an array
  if (!Array.isArray(availableAccounts)) {
    return 'Manual';
  }

  if (transaction.accountId) {
    // Handle both populated and non-populated accountId
    let accountIdToFind = transaction.accountId;
    if (typeof transaction.accountId === 'object' && transaction.accountId._id) {
      accountIdToFind = transaction.accountId._id;
    }

    const account = availableAccounts.find((acc) => acc._id === accountIdToFind);

    if (account) {
      if (account.accountType === 'bank_account') {
        const displayName = account.institutionName || account.accountName || 'Bank Account';
        const lastFour = account.accountNumber ? account.accountNumber.slice(-4) : 'XXXX';
        return `${displayName} (${lastFour})`;
      }
      if (account.accountType === 'credit_card') {
        const displayName = account.institutionName || account.accountName || 'Credit Card';
        const lastFour = account.lastFourDigits ? account.lastFourDigits : 'XXXX';
        return `${displayName} (${lastFour})`;
      }
      if (account.accountType === 'loan_account') {
        const displayName = account.accountName || 'Loan Account';
        return displayName;
      }
    }
  }
  return 'Manual';
};

const FILTER_OPTIONS = {
  dateRange: [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'last90', label: 'Last 90 Days' },
    { value: 'thisYear', label: 'This Year' },
  ],
  transactionType: [
    { value: 'all', label: 'All Types' },
    { value: 'debit', label: 'Debits' },
    { value: 'credit', label: 'Credits' },
  ],
};

// ----------------------------------------------------------------------

export function TransactionsView() {
  const { company } = useAuthContext();
  const { can } = usePermissions();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Get initial accountType from URL parameter
  const getInitialAccountType = useCallback(() => {
    const accountTypeParam = searchParams.get('accountType');
    if (accountTypeParam && ['bank_account', 'credit_card', 'loan_account'].includes(accountTypeParam)) {
      return accountTypeParam;
    }
    return 'bank_account'; // Default to bank accounts
  }, [searchParams]);

  // UI State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [modifiedRows, setModifiedRows] = useState({});
  const [updatingCategoryId, setUpdatingCategoryId] = useState(null);
  const [categoryUpdateMessage, setCategoryUpdateMessage] = useState({});

  // Data State
  const [transactions, setTransactions] = useState([]);
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [transactionsCache, setTransactionsCache] = useState({}); // Cache transactions by account type

  // Edit/Delete Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTransactionId, setDeleteTransactionId] = useState(null);
  const [editTransactionMessage, setEditTransactionMessage] = useState({ type: '', text: '' });
  const [isEditingTransaction, setIsEditingTransaction] = useState(false);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);

  // Note Dialog State
  const [noteDialog, setNoteDialog] = useState({
    open: false,
    transaction: null,
    noteText: '',
    loading: false,
  });
  // Loading States
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false); // For table-specific loading

  // Error States
  const [error, setError] = useState(null);

  // Filter State
  const [filter, setFilter] = useState({
    dateRange: 'all',
    accountType: getInitialAccountType(),
    account: 'all',
    transactionType: 'all',
    search: '',
  });

  // Cache and Request Management
  const dataCache = useRef({
    accounts: null,
    cacheTimestamp: null,
  });
  const CACHE_DURATION = 5 * 60 * 1000;

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    if (!company?._id) return [];

    const now = Date.now();
    const isCacheValid =
      dataCache.current.accounts &&
      dataCache.current.cacheTimestamp &&
      now - dataCache.current.cacheTimestamp < CACHE_DURATION;

    if (isCacheValid) {
      return dataCache.current.accounts;
    }

    try {
      const response = await axios.get(endpoints.accounts.list, {
        params: { companyId: company._id },
      });

      const accountData = response.data.data.accounts || {};
      const bankAccounts = accountData.bankAccounts || [];
      const creditCards = accountData.creditLines || [];
      const loanAccounts = accountData.loanAccounts || [];

      // Flatten all accounts into a single array
      const accounts = [
        ...bankAccounts.map(acc => ({ ...acc, accountType: 'bank_account' })),
        ...creditCards.map(acc => ({ ...acc, accountType: 'credit_card' })),
        ...loanAccounts.map(acc => ({ ...acc, accountType: 'loan_account' })),
      ];

      dataCache.current = {
        accounts,
        cacheTimestamp: now,
      };

      return accounts;
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      return [];
    }
  }, [company?._id]);

  // Fetch transactions for a specific account type
  const fetchTransactionsForAccountType = useCallback(async (accountType) => {
    if (!company?._id || !accountType) return [];

    try {
      const accounts = await fetchAccounts();

      const params = {
        limit: 1000,
        sortBy: 'date',
        sortOrder: 'desc',
        accountType,
      };

      const response = await axios.get(endpoints.transactions.list, { params });
      const apiTransactions = response.data.data.transactions || [];

      const processedTransactions = apiTransactions.map((txn) => {
        const sourceDisplay = getSourceDisplay(txn, accounts);

        return {
          id: txn._id,
          date: formatDate(txn.date),
          rawDate: txn.date,
          description: txn.description || 'No description',
          vendor: txn.vendor || '',
          source: sourceDisplay,
          category: txn.category || 'Uncategorized',
          note: txn.note || '',
          debit: txn.debit || null,
          credit: txn.credit || null,
          amount: txn.debit ? -Math.abs(txn.debit) : txn.credit ? Math.abs(txn.credit) : 0,
          accountType: txn.accountType,
          accountId: txn.accountId,
          createdBy: txn.createdBy,
          createdAt: txn.createdAt,
          updatedAt: txn.updatedAt,
        };
      });

      return processedTransactions;
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      throw err;
    }
  }, [company?._id, fetchAccounts]);

  // Load transactions for current account type
  const loadTransactionsForCurrentTab = useCallback(async (accountType) => {
    if (transactionsCache[accountType]) {
      // Use cached data
      setTransactions(transactionsCache[accountType]);
      return;
    }

    try {
      setTableLoading(true);
      const transactionsData = await fetchTransactionsForAccountType(accountType);

      // Cache the data
      setTransactionsCache(prev => ({
        ...prev,
        [accountType]: transactionsData
      }));

      setTransactions(transactionsData);
    } catch (err) {
      setError('Failed to load transactions. Please try again.');
      toast.error('Failed to load transactions');
    } finally {
      setTableLoading(false);
    }
  }, [transactionsCache, fetchTransactionsForAccountType]);

  // Initial data fetch
  const fetchInitialData = useCallback(async () => {
    if (!company?._id) return;

    try {
      setLoading(true);
      setError(null);

      const accounts = await fetchAccounts();
      setAvailableAccounts(accounts);

      // Load transactions for initial account type
      await loadTransactionsForCurrentTab(filter.accountType);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [company?._id, fetchAccounts, loadTransactionsForCurrentTab, filter.accountType]);

  // Load initial data on mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Category change handler (no immediate API call)
  const handleCategoryChange = useCallback(
    (transactionId, newCategory) => {
      const transaction = transactions.find((t) => t.id === transactionId);
      if (!transaction || transaction.category === newCategory) return;

      // Update selected categories
      setSelectedCategories((prev) => ({ ...prev, [transactionId]: newCategory }));

      // Mark row as modified
      setModifiedRows((prev) => ({ ...prev, [transactionId]: true }));

      // Clear any previous update messages for this row
      setCategoryUpdateMessage((prev) => {
        const updated = { ...prev };
        delete updated[transactionId];
        return updated;
      });
    },
    [transactions]
  );

  // Handle saving category changes
  const handleUpdateCategoryAndType = useCallback(
    async (transactionId) => {
      const newCategory = selectedCategories[transactionId];
      if (!newCategory) return;

      setUpdatingCategoryId(transactionId);

      try {
        const response = await axios.put(endpoints.transactions.update(transactionId), {
          category: newCategory,
        });

        if (response.data.success) {
          // Update cached data
          setTransactionsCache(prev => ({
            ...prev,
            [filter.accountType]: prev[filter.accountType]?.map(txn =>
              txn.id === transactionId ? { ...txn, category: newCategory } : txn
            ) || []
          }));

          // Update transaction in current display
          setTransactions((prev) =>
            prev.map((txn) => (txn.id === transactionId ? { ...txn, category: newCategory } : txn))
          );

          // Mark as not modified and show success
          setModifiedRows((prev) => {
            const updated = { ...prev };
            delete updated[transactionId];
            return updated;
          });

          setCategoryUpdateMessage((prev) => ({ ...prev, [transactionId]: 'success' }));

          setTimeout(() => {
            setCategoryUpdateMessage((prev) => {
              const updated = { ...prev };
              delete updated[transactionId];
              return updated;
            });
          }, 2000);
        }
      } catch (error) {
        console.error('Failed to update category:', error);
        setCategoryUpdateMessage((prev) => ({ ...prev, [transactionId]: 'error' }));

        setTimeout(() => {
          setCategoryUpdateMessage((prev) => {
            const updated = { ...prev };
            delete updated[transactionId];
            return updated;
          });
        }, 3000);
      } finally {
        setUpdatingCategoryId(null);
      }
    },
    [selectedCategories, filter.accountType]
  );

  // Handle search transaction on Google
  const handleSearchTransaction = useCallback((description) => {
    if (description) {
      const searchQuery = encodeURIComponent(description);
      window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
    }
  }, []);

  // Edit dialog handlers
  const handleOpenEditDialog = useCallback((transaction) => {
    setEditTransaction({
      id: transaction.id,
      date: new Date(transaction.rawDate).toISOString().split('T')[0],
      description: transaction.description,
      vendor: transaction.vendor,
      category: transaction.category,
      note: transaction.note,
      amount: Math.abs(transaction.amount),
      transactionType: transaction.debit ? 'debit' : 'credit',
    });
    setEditDialogOpen(true);
    setEditTransactionMessage({ type: '', text: '' });
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setEditDialogOpen(false);
    setEditTransaction(null);
    setEditTransactionMessage({ type: '', text: '' });
  }, []);

  const handleEditTransactionChange = useCallback((field, value) => {
    setEditTransaction((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveEditTransaction = useCallback(async () => {
    if (!editTransaction) return;

    setIsEditingTransaction(true);
    setEditTransactionMessage({ type: '', text: '' });

    try {
      const updates = {
        date: editTransaction.date,
        description: editTransaction.description,
        vendor: editTransaction.vendor,
        category: editTransaction.category,
        note: editTransaction.note || null,
      };

      // Handle amount and debit/credit
      const amount = parseFloat(editTransaction.amount);
      if (editTransaction.transactionType === 'debit') {
        updates.debit = amount;
        updates.credit = null;
      } else {
        updates.credit = amount;
        updates.debit = null;
      }

      const response = await axios.put(
        endpoints.transactions.update(editTransaction.id),
        updates
      );

      if (response.data.success) {
        toast.success('Transaction updated successfully');
        handleCloseEditDialog();

        // Update cached data
        setTransactionsCache(prev => ({
          ...prev,
          [filter.accountType]: prev[filter.accountType]?.map(txn =>
            txn.id === editTransaction.id ? { ...txn, ...updates } : txn
          ) || []
        }));

        // Update current transactions display
        setTransactions(prev => prev.map(txn =>
          txn.id === editTransaction.id ? { ...txn, ...updates } : txn
        ));
      }
    } catch (error) {
      console.error('Failed to update transaction:', error);
      setEditTransactionMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update transaction',
      });
      toast.error('Failed to update transaction');
    } finally {
      setIsEditingTransaction(false);
    }
  }, [editTransaction, handleCloseEditDialog, fetchTransactionsForAccountType]);

  // Delete dialog handlers
  const handleOpenDeleteDialog = useCallback((transactionId) => {
    setDeleteTransactionId(transactionId);
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeleteTransactionId(null);
  }, []);

  const handleConfirmDeleteTransaction = useCallback(async () => {
    if (!deleteTransactionId) return;

    setIsDeletingTransaction(true);
    try {
      const response = await axios.delete(
        endpoints.transactions.delete(deleteTransactionId)
      );
      if (response.data.success) {
        toast.success('Transaction deleted successfully');
        handleCloseDeleteDialog();

        // Update cached data
        setTransactionsCache(prev => ({
          ...prev,
          [filter.accountType]: prev[filter.accountType]?.filter(txn => txn.id !== deleteTransactionId) || []
        }));

        // Update current transactions display
        setTransactions(prev => prev.filter(txn => txn.id !== deleteTransactionId));
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast.error('Failed to delete transaction');
    } finally {
      setIsDeletingTransaction(false);
    }
  }, [deleteTransactionId, handleCloseDeleteDialog, fetchTransactionsForAccountType]);

  // Note dialog handlers
  const handleOpenNoteDialog = useCallback((transaction) => {
    setNoteDialog({
      open: true,
      transaction,
      noteText: transaction.note || '',
      loading: false,
    });
  }, []);

  const handleCloseNoteDialog = useCallback(() => {
    setNoteDialog({
      open: false,
      transaction: null,
      noteText: '',
      loading: false,
    });
  }, []);

  const handleSaveNote = useCallback(async () => {
    const { transaction, noteText } = noteDialog;
    if (!transaction) return;

    setNoteDialog((prev) => ({ ...prev, loading: true }));

    try {
      const response = await axios.put(endpoints.transactions.update(transaction.id), {
        note: noteText || null,
      });

      if (response.data.success) {
        toast.success('Note updated successfully');

        // Update cached data
        setTransactionsCache(prev => ({
          ...prev,
          [filter.accountType]: prev[filter.accountType]?.map(txn =>
            txn.id === transaction.id ? { ...txn, note: noteText } : txn
          ) || []
        }));

        // Update current transactions display
        setTransactions((prev) =>
          prev.map((txn) => (txn.id === transaction.id ? { ...txn, note: noteText } : txn))
        );
        handleCloseNoteDialog();
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note');
    } finally {
      setNoteDialog((prev) => ({ ...prev, loading: false }));
    }
  }, [noteDialog, handleCloseNoteDialog]);

  // Filter functions
  const getDateRangeFilter = useCallback((dateRange) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateRange) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'thisWeek': {
        const firstDay = new Date(today);
        firstDay.setDate(today.getDate() - today.getDay());
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 7);
        return { start: firstDay, end: lastDay };
      }
      case 'thisMonth': {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start: firstDay, end: lastDay };
      }
      case 'last30': {
        const start = new Date(today);
        start.setDate(today.getDate() - 30);
        return { start, end: now };
      }
      case 'last90': {
        const start = new Date(today);
        start.setDate(today.getDate() - 90);
        return { start, end: now };
      }
      case 'thisYear': {
        const firstDay = new Date(now.getFullYear(), 0, 1);
        const lastDay = new Date(now.getFullYear(), 11, 31);
        return { start: firstDay, end: lastDay };
      }
      default:
        return null;
    }
  }, []);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Date range filter
    if (filter.dateRange !== 'all') {
      const dateRange = getDateRangeFilter(filter.dateRange);
      if (dateRange) {
        filtered = filtered.filter((txn) => {
          const txnDate = new Date(txn.rawDate);
          return txnDate >= dateRange.start && txnDate <= dateRange.end;
        });
      }
    }

    // Account filter
    if (filter.account && filter.account !== 'all') {
      filtered = filtered.filter((txn) => {
        const txnAccountId = typeof txn.accountId === 'object' ? txn.accountId._id : txn.accountId;
        return txnAccountId === filter.account;
      });
    }

    // Transaction type filter
    if (filter.transactionType !== 'all') {
      filtered = filtered.filter((txn) =>
        filter.transactionType === 'debit' ? txn.debit : txn.credit
      );
    }

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (txn) =>
          txn.description.toLowerCase().includes(searchLower) ||
          txn.vendor.toLowerCase().includes(searchLower) ||
          txn.category.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [transactions, filter, getDateRangeFilter]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalDebit = filteredTransactions.reduce(
      (sum, txn) => sum + (txn.debit || 0),
      0
    );
    const totalCredit = filteredTransactions.reduce(
      (sum, txn) => sum + (txn.credit || 0),
      0
    );

    return {
      totalTransactions: filteredTransactions.length,
      totalDebit,
      totalCredit,
      netAmount: totalCredit - totalDebit,
    };
  }, [filteredTransactions]);

  // Paginated transactions
  const paginatedTransactions = useMemo(() => {
    if (rowsPerPage === -1) return filteredTransactions;
    const start = page * rowsPerPage;
    return filteredTransactions.slice(start, start + rowsPerPage);
  }, [filteredTransactions, page, rowsPerPage]);

  // Handle account type tab change
  const handleAccountTypeChange = useCallback(
    (event, newValue) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newValue) {
        params.set('accountType', newValue);
      } else {
        params.delete('accountType');
      }

      router.replace(`${pathname}?${params.toString()}`);

      // Update local state
      setFilter((prev) => ({ ...prev, accountType: newValue }));
      setPage(0);
    }, [router, pathname, searchParams]);

  // Render loading state
  if (loading && transactions.length === 0) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  // Render error state
  if (error && transactions.length === 0) {
    return (
      <DashboardContent>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchInitialData}>
          Retry
        </Button>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Transactions</Typography>
        </Stack>

        {/* Account Type Tabs */}
        <Card>
          <Tabs
            value={filter.accountType}
            onChange={handleAccountTypeChange}
            sx={{ px: 2, pt: 2 }}
          >
            {ACCOUNT_TYPE_TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={<Iconify icon={tab.icon} width={20} />}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Card>

        {/* Summary Stats */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Transactions
              </Typography>
              <Typography variant="h4">{summaryStats.totalTransactions}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Debits
              </Typography>
              <Typography variant="h4" color="error.main">
                {fCurrency(summaryStats.totalDebit)}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Credits
              </Typography>
              <Typography variant="h4" color="success.main">
                {fCurrency(summaryStats.totalCredit)}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Net Amount
              </Typography>
              <Typography
                variant="h4"
                color={summaryStats.netAmount >= 0 ? 'success.main' : 'error.main'}
              >
                {fCurrency(summaryStats.netAmount)}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search transactions..."
                value={filter.search}
                onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" width={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={filter.dateRange}
                  onChange={(e) => setFilter((prev) => ({ ...prev, dateRange: e.target.value }))}
                  label="Date Range"
                >
                  {FILTER_OPTIONS.dateRange.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={filter.transactionType}
                  onChange={(e) =>
                    setFilter((prev) => ({ ...prev, transactionType: e.target.value }))
                  }
                  label="Transaction Type"
                >
                  {FILTER_OPTIONS.transactionType.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Account</InputLabel>
                <Select
                  value={filter.account}
                  onChange={(e) => setFilter((prev) => ({ ...prev, account: e.target.value }))}
                  label="Account"
                >
                  <MenuItem value="all">All Accounts</MenuItem>
                  {availableAccounts.map((account) => {
                    let displayName = account.accountName || 'Account';
                    if (account.accountType === 'bank_account') {
                      displayName = `${account.institutionName || 'Bank'} - ${account.accountName}`;
                    } else if (account.accountType === 'credit_card') {
                      displayName = `${account.institutionName || 'Credit Card'} - ${account.accountName}`;
                    } else if (account.accountType === 'loan_account') {
                      displayName = account.accountName;
                    }
                    return (
                      <MenuItem key={account._id} value={account._id}>
                        {displayName}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>

        {/* Transactions Table */}
        <Card sx={{ position: 'relative' }}>
          {tableLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 10,
              }}
            >
              <CircularProgress size={40} />
            </Box>
          )}
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {TABLE_HEAD.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align || 'left'}
                        sx={{
                          width: column.width,
                          color: 'text.secondary',
                          backgroundColor: 'background.neutral',
                          padding: '8px 12px',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontSize: '0.80rem', fontWeight: 'bold' }}>
                          {column.label}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={TABLE_HEAD.length} align="center" sx={{ py: 10 }}>
                        <Typography variant="body2" color="text.secondary">
                          No transactions found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTransactions.map((row, index) => {
                      const categoryValue = selectedCategories[row.id] || row.category || 'Uncategorized';
                      return (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ padding: '6px 12px' }}>
                            <Typography variant="body2" color="text.secondary">
                              {page * rowsPerPage + index + 1}.
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap', padding: '6px 12px', fontSize: '0.80rem' }}>
                            {row.date}
                          </TableCell>

                          <TableCell sx={{ padding: '6px 12px', fontSize: '0.80rem', width: 300 }}>
                            <Tooltip title={row.description}>
                              <Typography noWrap sx={{ fontSize: '0.80rem', maxWidth: 300 }}>
                                {row.description}
                              </Typography>
                            </Tooltip>
                          </TableCell>

                          <TableCell sx={{ width: 180, padding: '6px 12px' }}>
                            <CategorySelector
                              value={categoryValue}
                              onChange={(value) => handleCategoryChange(row.id, value)}
                              transactionType={row.debit ? 'debit' : 'credit'}
                              size="small"
                              showAddOption
                              showDeleteOption
                              sx={{ fontSize: '0.80rem', height: 28 }}
                            />
                          </TableCell>

                          <TableCell align="right" sx={{ padding: '6px 12px', fontSize: '0.80rem' }}>
                            {row.debit ? (
                              <Typography variant="body2" color="error.main" sx={{ fontSize: '0.80rem' }}>
                                {fCurrency(row.debit)}
                              </Typography>
                            ) : (
                              '-'
                            )}
                          </TableCell>

                          <TableCell align="right" sx={{ padding: '6px 12px', fontSize: '0.80rem' }}>
                            {row.credit ? (
                              <Typography variant="body2" color="success.main" sx={{ fontSize: '0.80rem' }}>
                                {fCurrency(row.credit)}
                              </Typography>
                            ) : (
                              '-'
                            )}
                          </TableCell>

                          <TableCell sx={{ width: 150 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              {row.note ? (
                                <Tooltip title={row.note} arrow>
                                  <Box
                                    sx={{
                                      maxWidth: 120,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      fontSize: '0.75rem',
                                      color: 'text.secondary',
                                    }}
                                  >
                                    {row.note}
                                  </Box>
                                </Tooltip>
                              ) : (
                                <Typography variant="caption" color="text.disabled">
                                  No note
                                </Typography>
                              )}
                              <IconButton
                                size="small"
                                onClick={() => handleOpenNoteDialog(row)}
                                sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                                disabled={!can('transactions', 'edit')}
                              >
                                <Iconify
                                  icon={row.note ? "mdi:note-edit" : "mdi:note-plus"}
                                  width={16}
                                />
                              </IconButton>
                            </Stack>
                          </TableCell>

                          <TableCell sx={{ padding: '6px 12px' }}>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton
                                size="small"
                                onClick={() => handleSearchTransaction(row.description)}
                                title="Search Google"
                                sx={{ padding: '2px' }}
                              >
                                <Iconify icon="ph:magnifying-glass-bold" width={16} />
                              </IconButton>
                              <Tooltip
                                title={
                                  updatingCategoryId === row.id
                                    ? 'Updating...'
                                    : categoryUpdateMessage[row.id] === 'success'
                                      ? 'Updated!'
                                      : categoryUpdateMessage[row.id] === 'error'
                                        ? 'Error updating'
                                        : 'Save Changes'
                                }
                                arrow
                                placement="top"
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => {
                                      handleUpdateCategoryAndType(row.id);
                                    }}
                                    disabled={!modifiedRows[row.id] || updatingCategoryId === row.id || !can('transactions', 'edit')}
                                    sx={{
                                      padding: '2px',
                                      ...(modifiedRows[row.id]
                                        ? {
                                          color: 'success.main',
                                          '&:hover': { color: 'success.dark' },
                                        }
                                        : {}),
                                    }}
                                  >
                                    {updatingCategoryId === row.id ? (
                                      <CircularProgress size={16} color="inherit" />
                                    ) : (
                                      <Iconify icon="ph:floppy-disk-bold" width={16} />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleOpenEditDialog(row)}
                                title="Edit Transaction"
                                sx={{ padding: '2px' }}
                                disabled={!can('transactions', 'edit')}
                              >
                                <Iconify icon="ph:pencil-bold" width={16} />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteDialog(row.id)}
                                title="Delete Transaction"
                                sx={{ padding: '2px' }}
                                disabled={!can('transactions', 'delete')}
                              >
                                <Iconify icon="ph:trash-bold" width={16} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePaginationCustom
            count={filteredTransactions.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>
      </Stack>

      {/* Edit Transaction Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:edit-outline" width={24} />
            <Typography variant="h6">Edit Transaction</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {editTransactionMessage.text && (
            <Alert
              severity={editTransactionMessage.type}
              sx={{ mb: 2 }}
              onClose={() => setEditTransactionMessage({ type: '', text: '' })}
            >
              {editTransactionMessage.text}
            </Alert>
          )}
          {editTransaction && (
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Date"
                  type="date"
                  value={editTransaction.date}
                  onChange={(e) => handleEditTransactionChange('date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Amount"
                  value={editTransaction.amount}
                  onChange={(e) => handleEditTransactionChange('amount', e.target.value)}
                  type="number"
                  inputProps={{ step: '0.01', min: '0.01' }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Transaction Type</InputLabel>
                  <Select
                    value={editTransaction.transactionType}
                    onChange={(e) => handleEditTransactionChange('transactionType', e.target.value)}
                    label="Transaction Type"
                  >
                    <MenuItem value="debit">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="eva:arrow-up-fill" width={16} color="error.main" />
                        <Typography>Debit (Expense)</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="credit">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="eva:arrow-down-fill" width={16} color="success.main" />
                        <Typography>Credit (Income)</Typography>
                      </Stack>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <CategorySelector
                  value={editTransaction.category}
                  onChange={(value) => handleEditTransactionChange('category', value)}
                  transactionType={editTransaction.transactionType}
                  label="Category"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Description"
                  value={editTransaction.description}
                  onChange={(e) => handleEditTransactionChange('description', e.target.value)}
                  inputProps={{ maxLength: 200 }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Vendor"
                  value={editTransaction.vendor}
                  onChange={(e) => handleEditTransactionChange('vendor', e.target.value)}
                  inputProps={{ maxLength: 100 }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Note (Optional)"
                  value={editTransaction.note || ''}
                  onChange={(e) => handleEditTransactionChange('note', e.target.value)}
                  multiline
                  rows={2}
                  inputProps={{ maxLength: 500 }}
                  size="small"
                  helperText={`${(editTransaction.note || '').length}/500 characters`}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSaveEditTransaction}
            variant="contained"
            disabled={
              isEditingTransaction ||
              !editTransaction ||
              !editTransaction.description ||
              !editTransaction.date ||
              !editTransaction.category ||
              !editTransaction.amount
            }
            startIcon={
              isEditingTransaction ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Iconify icon="eva:save-outline" width={20} />
              )
            }
          >
            {isEditingTransaction ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Transaction Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="xs">
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:trash-2-outline" width={24} color="error.main" />
            <Typography variant="h6" color="error.main">
              Delete Transaction
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Typography>Are you sure you want to delete this transaction?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteTransaction}
            variant="contained"
            color="error"
            disabled={isDeletingTransaction}
            startIcon={
              isDeletingTransaction ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Iconify icon="eva:trash-2-outline" width={20} />
              )
            }
          >
            {isDeletingTransaction ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialog.open} onClose={handleCloseNoteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:file-text-outline" width={24} />
            <Typography variant="h6">Transaction Note</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {noteDialog.transaction && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Transaction
                </Typography>
                <Typography variant="body2">{noteDialog.transaction.description}</Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Note"
                placeholder="Add a note for this transaction..."
                value={noteDialog.noteText}
                onChange={(e) =>
                  setNoteDialog((prev) => ({ ...prev, noteText: e.target.value }))
                }
                inputProps={{ maxLength: 500 }}
                helperText={`${noteDialog.noteText.length}/500 characters`}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNoteDialog} color="inherit" disabled={noteDialog.loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveNote}
            variant="contained"
            disabled={noteDialog.loading}
            startIcon={
              noteDialog.loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Iconify icon="eva:save-outline" width={20} />
              )
            }
          >
            {noteDialog.loading ? 'Saving...' : 'Save Note'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
