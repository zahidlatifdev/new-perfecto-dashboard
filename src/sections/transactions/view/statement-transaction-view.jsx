'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TablePaginationCustom, TableSkeletonRows } from 'src/components/table';
import { DashboardContent } from 'src/layouts/dashboard';

import { fCurrency } from 'src/utils/format-number';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { CategorySelector } from 'src/components/category-selector';
import { TransactionMatchingCell } from '../components/transaction-matching-cell';
import { InvoiceItemsRows } from '../components/invoice-items-rows';
import { ManualMatchingDialog } from 'src/sections/matching/components/manual-matching-dialog';
import { UploadAndMatchDialog } from 'src/sections/matching/components/upload-and-match-dialog';
import { CategoryUpdateDialog } from '../components/category-update-dialog';
import { CreditCardLinkDialog } from 'src/sections/matching/components/credit-card-link-dialog';
import toast from 'react-hot-toast';
import { NoteDialog } from '../components/note-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'index', label: '#', width: 40 },
  { id: 'expand', label: '', width: 40 },
  { id: 'date', label: 'Date', width: 100 },
  { id: 'description', label: 'Description', width: 230 },
  { id: 'category', label: 'Category', width: 210 },
  { id: 'type', label: 'Type', width: 140 },
  { id: 'debit', label: 'Debit', align: 'right', width: 90 },
  { id: 'credit', label: 'Credit', align: 'right', width: 90 },
  { id: 'note', label: 'Note', width: 150 },
  { id: 'matches', label: 'Matching', width: 160 },
  { id: 'actions', label: 'Actions', width: 120 },
];

// Helper functions for document structure
const getVendorName = (document) => {
  if (document.documentType === 'Invoice' || document.documentType === 'Bill') {
    return document.vendorName || document.billingName || 'Unknown Vendor';
  } else {
    return document.vendor || document.billingName || 'Unknown Vendor';
  }
};

const getDocumentNumber = (document) => {
  if (document.documentType === 'Invoice') {
    return document.invoiceNumber || 'N/A';
  } else if (document.documentType === 'Bill') {
    return document.billNumber || 'N/A';
  } else {
    return document.receiptNumber || document.invoiceNumber || 'N/A';
  }
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Enhanced filter options for statement-specific view
const STATEMENT_FILTER_OPTIONS = {
  dateRange: [
    { value: 'all', label: 'All Time' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'last90', label: 'Last 90 Days' },
    { value: 'thisYear', label: 'This Year' },
  ],
  matchingStatus: [
    { value: 'all', label: 'All Statuses' },
    { value: 'matched', label: 'Matched' },
    { value: 'unmatched', label: 'Unmatched' },
  ],
  transactionType: [
    { value: 'all', label: 'All Types' },
    { value: 'debit', label: 'Debits' },
    { value: 'credit', label: 'Credits' },
  ],
};

// ----------------------------------------------------------------------

export function StatementTransactionView() {
  const { selectedCompany } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract parameters from URL
  const statementId = searchParams.get('statementId');
  const accountId = searchParams.get('accountId');
  const accountType = searchParams.get('accountType');
  const sourceType = searchParams.get('type'); // 'bank', 'card', 'cash'

  // UI State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [selectedTypes, setSelectedTypes] = useState({});
  const [modifiedRows, setModifiedRows] = useState({});

  // Data State
  const [transactions, setTransactions] = useState([]);
  const [statementInfo, setStatementInfo] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);
  const [statementTotals, setStatementTotals] = useState({});
  const [liabilities, setLiabilities] = useState({
    totalLiabilities: 0,
    creditCardLiabilities: 0,
    loanLiabilities: 0,
    totalPayments: 0,
    netLiabilities: 0,
  });
  const [liabilitiesLoading, setLiabilitiesLoading] = useState(false);

  // Dialog States
  const [manualMatchDialog, setManualMatchDialog] = useState({ open: false, transaction: null });
  const [uploadMatchDialog, setUploadMatchDialog] = useState({ open: false, transaction: null });
  const [creditCardLinkDialog, setCreditCardLinkDialog] = useState({
    open: false,
    transaction: null,
  });
  const [expandedTransactions, setExpandedTransactions] = useState({});
  const [documentDetailDialog, setDocumentDetailDialog] = useState({ open: false, document: null });

  // Edit/Delete Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTransactionId, setDeleteTransactionId] = useState(null);
  const [editTransactionMessage, setEditTransactionMessage] = useState({ type: '', text: '' });
  const [isEditingTransaction, setIsEditingTransaction] = useState(false);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);

  // Add Transaction Dialog State
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [addTransactionMessage, setAddTransactionMessage] = useState({ type: '', text: '' });

  // Note Dialog State
  const [noteDialog, setNoteDialog] = useState({
    open: false,
    transaction: null,
    loading: false,
  });

  // Adjustment Dialog State
  const [adjustmentEditDialog, setAdjustmentEditDialog] = useState({
    open: false,
    transaction: null,
    statement: null,
    currentAmount: 0,
    loading: false,
  });

  // Category State
  const [updatingCategoryId, setUpdatingCategoryId] = useState(null);
  const [categoryUpdateMessage, setCategoryUpdateMessage] = useState({});
  const [originalTransactionValues, setOriginalTransactionValues] = useState({});
  const [updatingTransactions, setUpdatingTransactions] = useState(new Set());

  // Category Update Dialog State
  const [categoryUpdateDialog, setCategoryUpdateDialog] = useState({
    open: false,
    transactionId: null,
    currentTransaction: null,
    similarTransactions: [],
    newCategory: '',
    loading: false,
  });

  // Loading States
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [headerLoading, setHeaderLoading] = useState(true);

  // Error States
  const [error, setError] = useState(null);

  // Filter State - simplified for statement view
  const [filter, setFilter] = useState({
    dateRange: 'all',
    matchingStatus: 'all',
    transactionType: 'all',
    search: '',
  });

  // Form State for Add Transaction
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    account: '',
    description: '',
    vendor: '',
    category: 'Uncategorized',
    type: 'Business',
    amount: '',
    transactionType: 'debit',
    note: '',
  });

  // Determine the view type and source
  const viewType = useMemo(() => {
    if (accountType === 'cash_account') return 'cash_account';
    if (sourceType === 'bank') return 'bank_statement';
    if (sourceType === 'card') return 'card_statement';
    return 'account';
  }, [accountType, sourceType]);

  // Fetch statement/account information
  const fetchSourceInfo = useCallback(async () => {
    if (!selectedCompany?._id) return;

    try {
      setHeaderLoading(true);
      let response;

      if (statementId && (sourceType === 'bank' || sourceType === 'card')) {
        // Fetch statement information
        response = await axiosInstance.get(endpoints.documents.statements.get(statementId), {
          params: { companyId: selectedCompany._id },
        });
        setStatementInfo(response.data.data?.statement || response.data.data);
      } else if (accountId && accountType) {
        // Fetch account information
        const endpoint =
          accountType === 'cash_account'
            ? endpoints.cashAccounts.get(accountId)
            : accountType === 'bank_account'
              ? endpoints.bankAccounts.get(accountId)
              : endpoints.creditCards.get(accountId);

        response = await axiosInstance.get(endpoint, {
          params: { companyId: selectedCompany._id },
        });
        setAccountInfo(
          response.data.data?.cashAccount ||
            response.data.data?.bankAccount ||
            response.data.data?.creditCard ||
            response.data.data
        );
      }
    } catch (err) {
      console.error('Failed to fetch source info:', err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to load source information.';
      setError(`Source Info Error: ${errorMessage}`);
    } finally {
      setHeaderLoading(false);
    }
  }, [selectedCompany?._id, statementId, accountId, accountType, sourceType]);

  // Fetch transactions for the specific statement/account
  const fetchTransactions = useCallback(async () => {
    if (!selectedCompany?._id) return;

    try {
      setTransactionsLoading(true);
      const params = {
        companyId: selectedCompany._id,
        limit: 1000,
        sortBy: 'date',
        sortOrder: 'desc',
      };

      // Add specific filtering based on view type
      if (statementId) {
        params.statementId = statementId;
      } else if (accountId && accountType) {
        params.accountId = accountId;
        params.accountType = accountType;
      }

      const response = await axiosInstance.get(endpoints.transactions.list, { params });
      const transactionsData = response.data.data?.transactions || response.data.data || [];

      // Process transactions to add matching information and normalize ID field
      const processedTransactions = transactionsData.map((transaction) => ({
        ...transaction,
        id: transaction._id, // Add id field for compatibility with matching components
        hasMatches: transaction.matchedDocuments && transaction.matchedDocuments.length > 0,
      }));

      setTransactions(processedTransactions);

      // Extract and set statement totals from transaction data
      const extractedTotals = extractStatementTotalsFromTransactions(transactionsData);
      setStatementTotals(extractedTotals);

      // Initialize category and type tracking
      const categories = {};
      const types = {};
      const originals = {};

      processedTransactions.forEach((transaction) => {
        categories[transaction._id] = transaction.category || 'Uncategorized';
        types[transaction._id] = transaction.type || 'Business';
        originals[transaction._id] = {
          category: transaction.category || 'Uncategorized',
          type: transaction.type || 'Business',
        };
      });

      setSelectedCategories(categories);
      setSelectedTypes(types);
      setOriginalTransactionValues(originals);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to load transactions.';
      setError(`Transactions Error: ${errorMessage}`);
    } finally {
      setTransactionsLoading(false);
    }
  }, [selectedCompany?._id, statementId, accountId, accountType]);

  // Extract statement totals from transaction data (no separate API call needed)
  const extractStatementTotalsFromTransactions = useCallback((transactions) => {
    const totalsMap = {};

    transactions.forEach((transaction) => {
      // Extract totals from linked credit card statements
      if (
        transaction.linkedCreditCardStatements &&
        transaction.linkedCreditCardStatements.length > 0
      ) {
        transaction.linkedCreditCardStatements.forEach((ccStatement) => {
          if (
            ccStatement.statementId &&
            ccStatement.statementId._id &&
            ccStatement.statementId.total !== undefined
          ) {
            totalsMap[ccStatement.statementId._id] = ccStatement.statementId.total;
          }
        });
      }
    });

    return totalsMap;
  }, []);

  // Fetch liabilities data
  const fetchLiabilities = useCallback(async () => {
    if (!selectedCompany?._id) return;

    try {
      setLiabilitiesLoading(true);
      const params = {};

      // Add date filtering if we have statement info
      if (statementInfo?.statementPeriod) {
        params.startDate = statementInfo.statementPeriod.startDate;
        params.endDate = statementInfo.statementPeriod.endDate;
      }

      const response = await axiosInstance.get(endpoints.transactions.liabilities, { params });
      setLiabilities(response.data.data.liabilities);
    } catch (err) {
      console.error('Failed to fetch liabilities:', err);
      // Don't show error for liabilities, just log it
    } finally {
      setLiabilitiesLoading(false);
    }
  }, [selectedCompany?._id, statementInfo]);

  // Combined loading effect
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!selectedCompany?._id) {
        console.log('No selected company, skipping data load');
        return;
      }

      // Validate required parameters
      if (!statementId && !accountId) {
        if (isMounted) {
          setError('Missing required parameters: either statementId or accountId is required.');
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch data sequentially to avoid race conditions
        await fetchSourceInfo();
        await fetchTransactions();
        await fetchLiabilities();
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load data:', error);
          setError('Failed to load data. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [selectedCompany?._id, statementId, accountId, accountType, sourceType]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((row) => {
      // Search filter
      const matchesSearch =
        filter.search === '' ||
        row.description?.toLowerCase().includes(filter.search.toLowerCase()) ||
        row.vendor?.toLowerCase().includes(filter.search.toLowerCase()) ||
        row.category?.toLowerCase().includes(filter.search.toLowerCase());

      // Date range filter
      const transactionDate = new Date(row.date);
      const now = new Date();
      const matchesDateRange = (() => {
        if (filter.dateRange === 'all') return true;
        if (filter.dateRange === 'thisMonth') {
          return (
            transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() === now.getFullYear()
          );
        }
        if (filter.dateRange === 'last30') {
          return transactionDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        if (filter.dateRange === 'last90') {
          return transactionDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        }
        if (filter.dateRange === 'thisYear') {
          return transactionDate.getFullYear() === now.getFullYear();
        }
        return true;
      })();

      // Matching status filter
      const hasCreditCardLinks =
        row.linkedCreditCardStatements && row.linkedCreditCardStatements.length > 0;
      const hasAnyMatches = row.hasMatches || hasCreditCardLinks;
      const matchesMatchingStatus =
        filter.matchingStatus === 'all' ||
        (filter.matchingStatus === 'matched' && hasAnyMatches) ||
        (filter.matchingStatus === 'unmatched' && !hasAnyMatches);

      // Transaction type filter
      const matchesTransactionType =
        filter.transactionType === 'all' ||
        (filter.transactionType === 'debit' && row.debit && row.debit > 0) ||
        (filter.transactionType === 'credit' && row.credit && row.credit > 0);

      return matchesSearch && matchesDateRange && matchesMatchingStatus && matchesTransactionType;
    });
  }, [transactions, filter]);

  // Calculate summary data
  const summaryData = useMemo(() => {
    // Separate credit card transactions (liabilities) from regular transactions
    const creditCardTransactions = filteredTransactions.filter(
      (t) => t.accountType === 'credit_card'
    );
    const regularTransactions = filteredTransactions.filter((t) => t.accountType !== 'credit_card');

    // Calculate credit card liabilities (debit amounts from credit cards)
    const creditCardLiabilities = creditCardTransactions.reduce(
      (sum, t) => sum + (t.debit || 0),
      0
    );

    // Calculate loan liabilities (credit transactions with loan category)
    const loanTransactions = filteredTransactions.filter(
      (t) => t.credit > 0 && t.category && t.category.toLowerCase().includes('loan')
    );
    const loanLiabilities = loanTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);

    // Regular debits and credits (excluding credit card debits and loan credits)
    const totalDebit = regularTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const totalCredit =
      regularTransactions.reduce((sum, t) => sum + (t.credit || 0), 0) - loanLiabilities;

    // Income is credits minus loan liabilities
    const income = totalCredit;
    const expenses = totalDebit;
    const netAmount = income - expenses;

    const matchedCount = filteredTransactions.filter(
      (row) =>
        row.hasMatches ||
        (row.linkedCreditCardStatements && row.linkedCreditCardStatements.length > 0)
    ).length;
    const unmatchedCount = filteredTransactions.length - matchedCount;

    return {
      totalTransactions: filteredTransactions.length,
      totalDebit: expenses,
      totalCredit: income,
      netAmount,
      matchedCount,
      unmatchedCount,
      // Liability specific data
      creditCardLiabilities,
      loanLiabilities,
      totalLiabilities: creditCardLiabilities + loanLiabilities,
    };
  }, [filteredTransactions]);

  // Handle category update
  const handleCategoryUpdate = useCallback(
    async (transactionId, newCategory) => {
      if (updatingTransactions.has(transactionId)) return;

      try {
        setUpdatingTransactions((prev) => new Set(prev).add(transactionId));
        setUpdatingCategoryId(transactionId);

        await axiosInstance.put(endpoints.transactions.update(transactionId), {
          category: newCategory,
        });

        setSelectedCategories((prev) => ({ ...prev, [transactionId]: newCategory }));
        setModifiedRows((prev) => ({ ...prev, [transactionId]: true }));

        setCategoryUpdateMessage((prev) => ({
          ...prev,
          [transactionId]: { type: 'success', text: 'Category updated successfully!' },
        }));

        setTimeout(() => {
          setCategoryUpdateMessage((prev) => {
            const updated = { ...prev };
            delete updated[transactionId];
            return updated;
          });
        }, 3000);
      } catch (err) {
        console.error('Failed to update category:', err);
        setCategoryUpdateMessage((prev) => ({
          ...prev,
          [transactionId]: { type: 'error', text: 'Failed to update category' },
        }));

        setTimeout(() => {
          setCategoryUpdateMessage((prev) => {
            const updated = { ...prev };
            delete updated[transactionId];
            return updated;
          });
        }, 3000);
      } finally {
        setUpdatingCategoryId(null);
        setUpdatingTransactions((prev) => {
          const updated = new Set(prev);
          updated.delete(transactionId);
          return updated;
        });
      }
    },
    [updatingTransactions]
  );

  // Handle type update
  const handleTypeUpdate = useCallback(
    async (transactionId, newType) => {
      if (updatingTransactions.has(transactionId)) return;

      try {
        setUpdatingTransactions((prev) => new Set(prev).add(transactionId));

        await axiosInstance.put(endpoints.transactions.update(transactionId), {
          type: newType,
        });

        setSelectedTypes((prev) => ({ ...prev, [transactionId]: newType }));
        setModifiedRows((prev) => ({ ...prev, [transactionId]: true }));
      } catch (err) {
        console.error('Failed to update type:', err);
        toast.error('Failed to update transaction type');
      } finally {
        setUpdatingTransactions((prev) => {
          const updated = new Set(prev);
          updated.delete(transactionId);
          return updated;
        });
      }
    },
    [updatingTransactions]
  );

  // Edit Transaction Handlers
  const handleOpenEditDialog = useCallback((transaction) => {
    setEditTransaction({
      ...transaction,
      date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : '',
      amount: transaction.debit ? transaction.debit : transaction.credit,
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

  const handleEditTransactionChange = useCallback(
    (field, value) => {
      setEditTransaction((prev) => ({
        ...prev,
        [field]: value,
      }));
      if (editTransactionMessage.type === 'error') {
        setEditTransactionMessage({ type: '', text: '' });
      }
    },
    [editTransactionMessage.type]
  );

  const handleSaveEditTransaction = useCallback(async () => {
    if (!editTransaction) return;
    setIsEditingTransaction(true);
    const updates = {
      description: editTransaction.description,
      vendor: editTransaction.vendor,
      date: editTransaction.date,
      category: editTransaction.category,
      type: editTransaction.type,
      debit:
        editTransaction.transactionType === 'debit' ? parseFloat(editTransaction.amount) : null,
      credit:
        editTransaction.transactionType === 'credit' ? parseFloat(editTransaction.amount) : null,
    };

    try {
      const response = await axiosInstance.put(
        endpoints.transactions.update(editTransaction._id),
        updates
      );

      if (response.data.success) {
        setEditTransactionMessage({ type: 'success', text: 'Transaction updated!' });

        // Update the transaction in the local state
        setTransactions((prev) =>
          prev.map((txn) => (txn._id === editTransaction._id ? { ...txn, ...updates } : txn))
        );

        setTimeout(() => {
          setIsEditingTransaction(false);
          handleCloseEditDialog();
        }, 1200);
      } else {
        throw new Error(response.data.message || 'Failed to update');
      }
    } catch (err) {
      setEditTransactionMessage({ type: 'error', text: err.message });
      setIsEditingTransaction(false);
    }
  }, [editTransaction, handleCloseEditDialog]);

  // Delete Transaction Handlers
  const handleOpenDeleteDialog = useCallback((transactionId) => {
    setDeleteTransactionId(transactionId);
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeleteTransactionId(null);
  }, []);

  const handleConfirmDeleteTransaction = useCallback(async () => {
    setIsDeletingTransaction(true);
    try {
      const response = await axiosInstance.delete(
        endpoints.transactions.delete(deleteTransactionId)
      );
      if (response.data.success) {
        setTransactions((prev) => prev.filter((txn) => txn._id !== deleteTransactionId));
        setTimeout(() => {
          setIsDeletingTransaction(false);
          handleCloseDeleteDialog();
        }, 800);
      } else {
        throw new Error(response.data.message || 'Failed to delete');
      }
    } catch (err) {
      setIsDeletingTransaction(false);
    }
  }, [deleteTransactionId, handleCloseDeleteDialog]);

  // Add Transaction Handlers
  const handleOpenAddDialog = useCallback(() => {
    setOpenAddDialog(true);
    setAddTransactionMessage({ type: '', text: '' });
  }, []);

  const handleCloseAddDialog = useCallback(() => {
    if (isAddingTransaction) return;

    setOpenAddDialog(false);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      account: '',
      description: '',
      category: 'Uncategorized',
      type: 'Business',
      vendor: '',
      amount: '',
      transactionType: 'debit',
    });
    setAddTransactionMessage({ type: '', text: '' });
  }, [isAddingTransaction]);

  const handleNewTransactionChange = useCallback(
    (field, value) => {
      setNewTransaction((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (addTransactionMessage.type === 'error') {
        setAddTransactionMessage({ type: '', text: '' });
      }
    },
    [addTransactionMessage.type]
  );

  const validateTransaction = useCallback(() => {
    const errors = [];

    if (!newTransaction.description.trim()) {
      errors.push('Description is required');
    }
    if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
      errors.push('Valid amount is required');
    }
    if (!newTransaction.date) {
      errors.push('Date is required');
    }
    if (!newTransaction.category) {
      errors.push('Category is required');
    }

    return errors;
  }, [newTransaction]);

  const handleAddTransaction = useCallback(async () => {
    // Validate all fields
    const validationErrors = validateTransaction();
    if (validationErrors.length > 0) {
      setAddTransactionMessage({
        type: 'error',
        text: validationErrors.join(', '),
      });
      return;
    }

    if (!selectedCompany?._id) {
      setAddTransactionMessage({
        type: 'error',
        text: 'No company selected',
      });
      return;
    }

    try {
      setIsAddingTransaction(true);
      setAddTransactionMessage({ type: '', text: '' });

      const amount = parseFloat(newTransaction.amount);

      // Prepare transaction data for API
      const transactionData = {
        companyId: selectedCompany._id,
        date: newTransaction.date,
        description: newTransaction.description.trim(),
        vendor: newTransaction.vendor?.trim() || null,
        category: newTransaction.category,
        type: newTransaction.type,
        debit: newTransaction.transactionType === 'debit' ? amount : null,
        credit: newTransaction.transactionType === 'credit' ? amount : null,
        accountType: accountType,
        accountId: accountId,
        statementId: statementId || null,
      };

      // Call API to create transaction
      const response = await axiosInstance.post(endpoints.transactions.create, transactionData);

      if (response.data.success) {
        // Show success message
        setAddTransactionMessage({
          type: 'success',
          text: 'Transaction added successfully!',
        });

        // Refresh transactions
        await fetchTransactions();

        // Close dialog after short delay
        setTimeout(() => {
          handleCloseAddDialog();
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to create transaction');
      }
    } catch (err) {
      console.error('Failed to add transaction:', err);
      setAddTransactionMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to add transaction',
      });
    } finally {
      setIsAddingTransaction(false);
    }
  }, [
    newTransaction,
    selectedCompany,
    validateTransaction,
    accountType,
    accountId,
    statementId,
    fetchTransactions,
    handleCloseAddDialog,
  ]);

  // Expand Row Handler
  const handleExpandRow = useCallback((transactionId) => {
    setExpandedTransactions((prev) => ({
      ...prev,
      [transactionId]: !prev[transactionId],
    }));
  }, []);

  // Matching dialog handlers
  const handleManualMatch = useCallback((transaction) => {
    setManualMatchDialog({
      open: true,
      transaction,
    });
  }, []);

  const handleCloseManualMatch = useCallback(() => {
    setManualMatchDialog({
      open: false,
      transaction: null,
    });
  }, []);

  const handleUploadRequest = useCallback((transaction) => {
    setUploadMatchDialog({
      open: true,
      transaction,
    });
  }, []);

  const handleCloseUploadMatch = useCallback(() => {
    setUploadMatchDialog({
      open: false,
      transaction: null,
    });
  }, []);

  const handleCreditCardLink = useCallback((transaction) => {
    setCreditCardLinkDialog({
      open: true,
      transaction,
    });
  }, []);

  const handleCloseCreditCardLink = useCallback(() => {
    setCreditCardLinkDialog({
      open: false,
      transaction: null,
    });
  }, []);

  // Handle successful matching with UI update
  const handleMatchSuccess = useCallback((updatedTransaction, actionType = 'document_match') => {
    console.log('handleMatchSuccess called:', { updatedTransaction, actionType });

    if (actionType === 'credit_card_link') {
      // Handle credit card linking with proper optimistic update
      setTransactions((prev) =>
        prev.map((txn) => {
          if (txn.id === updatedTransaction.transactionId) {
            // Find the full transaction data from the response
            const fullTransactionData = updatedTransaction.transaction || {
              ...txn,
              linkedCreditCardStatements: updatedTransaction.linkedCreditCardStatements || [],
            };

            // Update the transaction with new linked credit card statements
            return {
              ...txn,
              linkedCreditCardStatements: fullTransactionData.linkedCreditCardStatements || [],
            };
          }
          return txn;
        })
      );
    } else {
      // Handle document matching updates
      const transactionId = updatedTransaction.id || updatedTransaction._id;
      setTransactions((prev) =>
        prev.map((txn) => {
          if (txn.id === transactionId || txn._id === transactionId) {
            // Merge the updated transaction data, ensuring we preserve the id field
            const updatedMatchedDocuments =
              updatedTransaction.matchedDocuments || txn.matchedDocuments || [];
            const mergedTransaction = {
              ...txn,
              ...updatedTransaction,
              id: txn.id, // Preserve the id field for consistency
              matchedDocuments: updatedMatchedDocuments,
              hasMatches: updatedMatchedDocuments && updatedMatchedDocuments.length > 0,
            };
            console.log('Updated transaction with matches:', mergedTransaction);
            return mergedTransaction;
          }
          return txn;
        })
      );
    }

    // Close any open dialogs
    setManualMatchDialog({ open: false, transaction: null });
    setCreditCardLinkDialog({ open: false, transaction: null });
    setUploadMatchDialog({ open: false, transaction: null });
  }, []);

  // Handle removing matches with UI update
  const handleRemoveMatch = useCallback(async (transactionId, documentId) => {
    try {
      // Add to updating set
      setUpdatingTransactions((prev) => new Set(prev).add(transactionId));

      const response = await axiosInstance.delete(endpoints.matching.remove, {
        data: { transactionId, documentId },
      });

      if (response.data.success) {
        // Optimistically update the transaction
        setTransactions((prev) =>
          prev.map((txn) => {
            if (txn.id === transactionId) {
              const updatedMatchedDocuments =
                txn.matchedDocuments?.filter((doc) => doc._id !== documentId) || [];
              return {
                ...txn,
                matchedDocuments: updatedMatchedDocuments,
                hasMatches: updatedMatchedDocuments.length > 0,
              };
            }
            return txn;
          })
        );
      }
    } catch (error) {
      console.error('Failed to remove match:', error);
    } finally {
      // Remove from updating set
      setUpdatingTransactions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        return newSet;
      });
    }
  }, []);

  // Document detail handlers
  const handleViewDocumentDetails = useCallback((document) => {
    setDocumentDetailDialog({
      open: true,
      document,
    });
  }, []);

  const handleCloseDocumentDetails = useCallback(() => {
    setDocumentDetailDialog({
      open: false,
      document: null,
    });
  }, []);

  // Handle document updates (for item category changes)
  const handleDocumentUpdate = useCallback((updatedDocument) => {
    setTransactions((prev) =>
      prev.map((txn) => ({
        ...txn,
        matchedDocuments:
          txn.matchedDocuments?.map((doc) =>
            doc._id === updatedDocument._id ? updatedDocument : doc
          ) || [],
      }))
    );
  }, []);

  // Category and type change handlers
  const handleCategoryChange = useCallback(
    (transactionId, value) => {
      setOriginalTransactionValues((prev) => {
        if (!prev[transactionId]) {
          const currentTransaction = transactions.find(
            (txn) => txn.id === transactionId || txn._id === transactionId
          );
          return {
            ...prev,
            [transactionId]: {
              category: currentTransaction?.category,
              type: currentTransaction?.type,
            },
          };
        }
        return prev;
      });

      setSelectedCategories((prev) => ({
        ...prev,
        [transactionId]: value,
      }));
      setModifiedRows((prev) => ({
        ...prev,
        [transactionId]: true,
      }));

      // Update the transaction in the local state immediately for UI feedback
      setTransactions((prev) =>
        prev.map((txn) =>
          txn.id === transactionId || txn._id === transactionId ? { ...txn, category: value } : txn
        )
      );
    },
    [transactions]
  );

  const handleTypeChange = useCallback(
    (transactionId, value) => {
      // Store original value if not already stored
      setOriginalTransactionValues((prev) => {
        if (!prev[transactionId]) {
          const currentTransaction = transactions.find(
            (txn) => txn.id === transactionId || txn._id === transactionId
          );
          return {
            ...prev,
            [transactionId]: {
              category: currentTransaction?.category,
              type: currentTransaction?.type,
            },
          };
        }
        return prev;
      });

      setSelectedTypes((prev) => ({
        ...prev,
        [transactionId]: value,
      }));
      setModifiedRows((prev) => ({
        ...prev,
        [transactionId]: true,
      }));

      // Update the transaction in the local state immediately for UI feedback
      setTransactions((prev) =>
        prev.map((txn) =>
          txn.id === transactionId || txn._id === transactionId ? { ...txn, type: value } : txn
        )
      );
    },
    [transactions]
  );

  // Credit card statement handlers
  const handleUnlinkCreditCard = useCallback(async (transactionId, statementId) => {
    // Add loading state
    setUpdatingTransactions((prev) => new Set([...prev, transactionId]));

    try {
      const response = await axiosInstance.post(endpoints.matching.unlinkCreditCard, {
        transactionId,
        statementId,
      });

      if (response.data.success) {
        // Optimistically update ALL transactions that might have this statement linked
        setTransactions((prev) =>
          prev.map((txn) => {
            // Remove the statement from the current transaction
            if (txn.id === transactionId) {
              return {
                ...txn,
                linkedCreditCardStatements: txn.linkedCreditCardStatements.filter(
                  (link) => (link.statementId?._id || link.statementId) !== statementId
                ),
              };
            }

            // For other transactions, if they have the same statement, trigger a re-render
            // to update the combined totals display
            if (
              txn.linkedCreditCardStatements &&
              txn.linkedCreditCardStatements.some(
                (link) => (link.statementId?._id || link.statementId) === statementId
              )
            ) {
              return { ...txn }; // Force re-render
            }

            return txn;
          })
        );

        console.log('Credit card statement unlinked successfully');
      } else {
        throw new Error(response.data.message || 'Failed to unlink credit card statement');
      }
    } catch (error) {
      console.error('Failed to unlink credit card statement:', error);
      alert('Failed to unlink credit card statement. Please try again.');
    } finally {
      // Remove loading state
      setUpdatingTransactions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        return newSet;
      });
    }
  }, []);

  const handleViewCreditCardStatement = useCallback((statementId) => {
    window.open(`/dashboard/card-statements/${statementId}`, '_blank');
  }, []);

  const handleOpenNoteDialog = useCallback((transaction) => {
    setNoteDialog({
      open: true,
      transaction,
      loading: false,
    });
  }, []);

  const handleCloseNoteDialog = useCallback(() => {
    setNoteDialog({
      open: false,
      transaction: null,
      loading: false,
    });
  }, []);

  const handleSaveNote = useCallback(
    async (noteText) => {
      const { transaction } = noteDialog;
      if (!transaction) return;

      setNoteDialog((prev) => ({ ...prev, loading: true }));

      try {
        const response = await fetch(`/api/transactions/${transaction.id || transaction._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            note: noteText || null,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update note');
        }

        const result = await response.json();

        // Update local state
        setTransactions((prev) =>
          prev.map((txn) =>
            txn.id === transaction.id || txn._id === transaction._id
              ? { ...txn, note: noteText || null }
              : txn
          )
        );

        toast.success('Note updated successfully');
        handleCloseNoteDialog();
      } catch (error) {
        console.error('Failed to update note:', error);
        toast.error('Failed to update note. Please try again.');
      } finally {
        setNoteDialog((prev) => ({ ...prev, loading: false }));
      }
    },
    [noteDialog, handleCloseNoteDialog]
  );

  const handleEditAdjustment = useCallback((transaction, statement, currentAmount) => {
    setAdjustmentEditDialog({
      open: true,
      transaction,
      statement,
      currentAmount,
      loading: false,
    });
  }, []);

  const handleCloseAdjustmentDialog = useCallback(() => {
    setAdjustmentEditDialog({
      open: false,
      transaction: null,
      statement: null,
      currentAmount: 0,
      loading: false,
    });
  }, []);

  const handleSaveAdjustment = useCallback(
    async (newAdjustmentAmount) => {
      const { transaction, statement } = adjustmentEditDialog;
      if (!transaction || !statement) return;

      setAdjustmentEditDialog((prev) => ({ ...prev, loading: true }));

      try {
        const response = await axiosInstance.post(endpoints.matching.updateAdjustment, {
          transactionId: transaction.id,
          statementId: statement.statementId?._id || statement.statementId,
          adjustmentAmount: parseFloat(newAdjustmentAmount) || 0,
        });

        if (response.data.success) {
          // Update the transaction with new adjustment
          setTransactions((prev) =>
            prev.map((txn) => {
              if (txn.id === transaction.id) {
                return {
                  ...txn,
                  linkedCreditCardStatements: txn.linkedCreditCardStatements.map((ccStmt) =>
                    (ccStmt.statementId?._id || ccStmt.statementId) ===
                    (statement.statementId?._id || statement.statementId)
                      ? { ...ccStmt, adjustmentAmount: parseFloat(newAdjustmentAmount) || 0 }
                      : ccStmt
                  ),
                };
              }
              return txn;
            })
          );

          handleCloseAdjustmentDialog();
          console.log('Adjustment updated successfully');
        } else {
          throw new Error(response.data.message || 'Failed to update adjustment');
        }
      } catch (error) {
        console.error('Failed to update adjustment:', error);
        alert('Failed to update adjustment. Please try again.');
      } finally {
        setAdjustmentEditDialog((prev) => ({ ...prev, loading: false }));
      }
    },
    [adjustmentEditDialog, handleCloseAdjustmentDialog]
  );

  // Render header info
  const renderHeaderInfo = () => {
    if (headerLoading) {
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Skeleton variant="circular" width={40} height={40} />
                <Stack spacing={1} sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width={200} height={24} />
                  <Skeleton variant="text" width={300} height={20} />
                </Stack>
              </Stack>
              <Stack direction="row" spacing={3}>
                <Skeleton variant="text" width={120} height={20} />
                <Skeleton variant="text" width={120} height={20} />
                <Skeleton variant="text" width={120} height={20} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      );
    }

    const getIcon = () => {
      if (viewType === 'cash_account') return 'ph:wallet';
      if (viewType === 'bank_statement') return 'ph:bank';
      if (viewType === 'card_statement') return 'ph:credit-card';
      return 'ph:file-text';
    };

    const getTitle = () => {
      if (statementInfo) {
        const period = statementInfo.statementPeriod;
        if (period?.startDate && period?.endDate) {
          const start = new Date(period.startDate).toLocaleDateString();
          const end = new Date(period.endDate).toLocaleDateString();
          return `${statementInfo.fileName} (${start} - ${end})`;
        }
        return statementInfo.fileName;
      }
      if (accountInfo) {
        return accountInfo.accountName || accountInfo.cardName || 'Account';
      }
      return 'Transactions';
    };

    const getSubtitle = () => {
      if (statementInfo) {
        return `${viewType === 'bank_statement' ? 'Bank' : 'Card'} Statement • ${summaryData.totalTransactions} transactions`;
      }
      if (accountInfo) {
        const balance = accountInfo.currentBalance || accountInfo.balance;
        return `Cash Account${balance !== undefined ? ` • Current Balance: ${fCurrency(balance)}` : ''} • ${summaryData.totalTransactions} transactions`;
      }
      return `${summaryData.totalTransactions} transactions`;
    };

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  width: 48,
                  height: 48,
                }}
              >
                <Iconify icon={getIcon()} width={24} />
              </Avatar>
              <Stack sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{getTitle()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {getSubtitle()}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="ph:arrow-left" />}
                  onClick={() => router.back()}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="ph:plus" />}
                  onClick={handleOpenAddDialog}
                >
                  Add Transaction
                </Button>
              </Stack>
            </Stack>

            {/* Summary Statistics */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Paper sx={{ p: 2, textAlign: 'center', borderLeft: 3, borderColor: 'error.main' }}>
                  <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
                    {fCurrency(summaryData.totalDebit)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Expenses
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Paper
                  sx={{ p: 2, textAlign: 'center', borderLeft: 3, borderColor: 'success.main' }}
                >
                  <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                    {fCurrency(summaryData.totalCredit)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Income
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderLeft: 3,
                    borderColor: summaryData.netAmount >= 0 ? 'success.main' : 'error.main',
                  }}
                >
                  <Typography
                    variant="h6"
                    color={summaryData.netAmount >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {fCurrency(summaryData.netAmount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Net Amount
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Paper
                  sx={{ p: 2, textAlign: 'center', borderLeft: 3, borderColor: 'primary.main' }}
                >
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {summaryData.matchedCount}/{summaryData.totalTransactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Matched
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Paper sx={{ p: 2, textAlign: 'center', borderLeft: 3, borderColor: 'error.main' }}>
                  <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
                    {fCurrency(liabilities.netLiabilities || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Liabilities
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // Render filters
  const renderFilters = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h6">Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={3}>
              <TextField
                fullWidth
                size="small"
                value={filter.search}
                onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Search transactions..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="ph:magnifying-glass" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={filter.dateRange}
                  label="Date Range"
                  onChange={(e) => setFilter((prev) => ({ ...prev, dateRange: e.target.value }))}
                >
                  {STATEMENT_FILTER_OPTIONS.dateRange.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Matching Status</InputLabel>
                <Select
                  value={filter.matchingStatus}
                  label="Matching Status"
                  onChange={(e) =>
                    setFilter((prev) => ({ ...prev, matchingStatus: e.target.value }))
                  }
                >
                  {STATEMENT_FILTER_OPTIONS.matchingStatus.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={filter.transactionType}
                  label="Transaction Type"
                  onChange={(e) =>
                    setFilter((prev) => ({ ...prev, transactionType: e.target.value }))
                  }
                >
                  {STATEMENT_FILTER_OPTIONS.transactionType.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <Stack
                direction="row"
                spacing={1}
                justifyContent="flex-end"
                sx={{ height: '100%', alignItems: 'center' }}
              >
                <Chip
                  label={`${filteredTransactions.length} transactions`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                {(filter.search ||
                  filter.dateRange !== 'all' ||
                  filter.matchingStatus !== 'all' ||
                  filter.transactionType !== 'all') && (
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() =>
                      setFilter({
                        dateRange: 'all',
                        matchingStatus: 'all',
                        transactionType: 'all',
                        search: '',
                      })
                    }
                    startIcon={<Iconify icon="ph:x" />}
                  >
                    Clear
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardContent>
        {renderHeaderInfo()}
        {renderFilters()}
        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 960 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {TABLE_HEAD.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        align={headCell.align || 'left'}
                        sx={{ width: headCell.width }}
                      >
                        {headCell.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableSkeletonRows rows={10} columns={TABLE_HEAD} />
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent>
        <Stack spacing={3} sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
          <Button variant="outlined" onClick={() => router.back()}>
            Go Back
          </Button>
        </Stack>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {renderHeaderInfo()}
      {renderFilters()}

      <Card>
        <Scrollbar>
          <TableContainer sx={{ minWidth: { xs: 800, md: 960 } }}>
            <Table>
              <TableHead>
                <TableRow>
                  {TABLE_HEAD.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.align || 'left'}
                      sx={{ width: headCell.width }}
                    >
                      {headCell.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {transactionsLoading ? (
                  <TableSkeletonRows rows={10} columns={TABLE_HEAD} />
                ) : (
                  filteredTransactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      const globalIndex = page * rowsPerPage + index + 1;
                      const isExpanded = expandedTransactions[row._id];
                      const hasDocuments = row.matchedDocuments && row.matchedDocuments.length > 0;
                      const hasLinkedStatements =
                        row.linkedCreditCardStatements && row.linkedCreditCardStatements.length > 0;

                      return (
                        <React.Fragment key={row._id}>
                          <TableRow hover>
                            <TableCell sx={{ padding: '6px 12px' }}>
                              <Typography variant="body2" color="text.secondary">
                                {globalIndex}.
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ padding: '6px 12px' }}>
                              <IconButton size="small" onClick={() => handleExpandRow(row._id)}>
                                <Iconify
                                  icon={isExpanded ? 'ph:caret-down-bold' : 'ph:caret-right-bold'}
                                  width={16}
                                />
                              </IconButton>
                            </TableCell>
                            <TableCell
                              sx={{
                                whiteSpace: 'nowrap',
                                padding: '6px 12px',
                                fontSize: '0.80rem',
                              }}
                            >
                              {formatDate(row.date)}
                            </TableCell>
                            <TableCell
                              sx={{ padding: '6px 12px', fontSize: '0.80rem', width: 300 }}
                            >
                              <Tooltip title={row.description}>
                                <Typography noWrap sx={{ fontSize: '0.80rem', maxWidth: 300 }}>
                                  {row.description}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell
                              sx={{ width: 180, padding: '6px 12px', fontSize: '0.80rem' }}
                            >
                              <CategorySelector
                                value={
                                  selectedCategories[row._id] || row.category || 'Uncategorized'
                                }
                                onChange={(value) => handleCategoryChange(row._id, value)}
                                transactionType={row.debit ? 'debit' : 'credit'}
                                isPersonal={(selectedTypes[row._id] || row.type) === 'Personal'}
                                size="small"
                                showAddOption={true}
                                showDeleteOption={true}
                                sx={{ fontSize: '0.80rem', height: 28 }}
                              />
                            </TableCell>
                            <TableCell
                              sx={{ width: 140, padding: '6px 12px', fontSize: '0.80rem' }}
                            >
                              <Select
                                value={selectedTypes[row._id] || row.type || 'Business'}
                                onChange={(e) => handleTypeChange(row._id, e.target.value)}
                                size="small"
                                fullWidth
                                sx={{ fontSize: '0.80rem', height: 28 }}
                              >
                                <MenuItem value="Business">Business</MenuItem>
                                <MenuItem value="Personal">Personal</MenuItem>
                              </Select>
                            </TableCell>
                            <TableCell align="right">
                              {row.debit ? fCurrency(row.debit) : '-'}
                            </TableCell>
                            <TableCell align="right">
                              {row.credit ? fCurrency(row.credit) : '-'}
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
                                >
                                  <Iconify
                                    icon={row.note ? 'mdi:note-edit' : 'mdi:note-plus'}
                                    width={16}
                                  />
                                </IconButton>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <TransactionMatchingCell
                                transaction={row}
                                onManualMatch={handleManualMatch}
                                allTransactions={transactions}
                                statementTotals={statementTotals}
                                isUpdating={updatingTransactions.has(row.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5}>
                                <Tooltip title="Edit Transaction">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenEditDialog(row)}
                                  >
                                    <Iconify icon="ph:pencil" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Transaction">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleOpenDeleteDialog(row._id)}
                                  >
                                    <Iconify icon="ph:trash" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>

                          {/* Document Header and Items Rows - Show each document followed by its items */}
                          {isExpanded &&
                            hasDocuments &&
                            row.matchedDocuments?.map((document) => (
                              <React.Fragment key={`${row._id}-doc-${document._id}`}>
                                {/* Document Header Row */}
                                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                  <TableCell colSpan={10} sx={{ py: 1.5, border: 0 }}>
                                    <Box sx={{ pl: 6 }}>
                                      <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                      >
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                          <Avatar
                                            sx={{
                                              width: 32,
                                              height: 32,
                                              bgcolor:
                                                document.documentType === 'Invoice'
                                                  ? 'success.main'
                                                  : 'warning.main',
                                            }}
                                          >
                                            <Iconify
                                              icon={
                                                document.documentType === 'Invoice'
                                                  ? 'mdi:receipt'
                                                  : 'mdi:file-document'
                                              }
                                              width={18}
                                            />
                                          </Avatar>
                                          <Stack>
                                            <Typography variant="subtitle2">
                                              {document.documentType} - {getVendorName(document)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {getDocumentNumber(document)} •{' '}
                                              {fCurrency(document.totalAmount || 0)}
                                            </Typography>
                                          </Stack>
                                        </Stack>

                                        <Stack direction="row" spacing={1}>
                                          <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleViewDocumentDetails(document)}
                                            title="View Document Details"
                                          >
                                            <Iconify icon="mdi:eye" width={14} />
                                          </IconButton>

                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleRemoveMatch(row.id, document._id)}
                                            title="Remove Match"
                                          >
                                            <Iconify icon="mdi:close" width={14} />
                                          </IconButton>
                                        </Stack>
                                      </Stack>
                                    </Box>
                                  </TableCell>
                                </TableRow>

                                {/* Document Items Rows */}
                                <InvoiceItemsRows
                                  document={document}
                                  isInvoice={document.documentType === 'Invoice'}
                                  onDocumentUpdate={handleDocumentUpdate}
                                />
                              </React.Fragment>
                            ))}

                          {/* Linked Credit Card Statements */}
                          {isExpanded &&
                            row.linkedCreditCardStatements &&
                            row.linkedCreditCardStatements.length > 0 &&
                            row.linkedCreditCardStatements.map((ccStatement, index) => {
                              // Calculate combined info for this statement
                              const statementId =
                                ccStatement.statementId?._id || ccStatement.statementId;
                              const statementTotal = statementTotals[statementId] || 0;
                              // Find all transactions linked to this same statement
                              const linkedTransactions = transactions.filter(
                                (txn) =>
                                  txn.linkedCreditCardStatements &&
                                  txn.linkedCreditCardStatements.some(
                                    (ccStmt) =>
                                      (ccStmt.statementId?._id || ccStmt.statementId) ===
                                      statementId
                                  )
                              );

                              // Calculate totals
                              const totalBankPayments = linkedTransactions.reduce((sum, txn) => {
                                return sum + Math.abs(txn.debit || txn.credit || 0);
                              }, 0);

                              const totalAdjustments = linkedTransactions.reduce((sum, txn) => {
                                const txnCcStatement = txn.linkedCreditCardStatements.find(
                                  (ccStmt) =>
                                    (ccStmt.statementId?._id || ccStmt.statementId) === statementId
                                );
                                return sum + (txnCcStatement?.adjustmentAmount || 0);
                              }, 0);

                              const combinedPaidAmount = totalBankPayments + totalAdjustments;
                              const combinedDifference = statementTotal - combinedPaidAmount;

                              const currentTransactionAmount = Math.abs(
                                row.debit || row.credit || 0
                              );
                              const currentAdjustment = ccStatement.adjustmentAmount || 0;

                              return (
                                <React.Fragment key={`${row._id}-cc-${statementId || index}`}>
                                  {/* Credit Card Statement Header Row */}
                                  <TableRow>
                                    <TableCell
                                      colSpan={10}
                                      sx={{
                                        py: 2.5,
                                        border: 0,
                                        bgcolor: 'rgba(103, 58, 183, 0.04)',
                                        borderLeft: '4px solid',
                                        borderLeftColor: 'secondary.main',
                                        width: '100%',
                                      }}
                                    >
                                      <Box sx={{ pl: 4, pr: 2 }}>
                                        <Stack direction="row" alignItems="flex-start" spacing={3}>
                                          {/* Left Section - Icon and Basic Info */}
                                          <Box
                                            sx={{
                                              display: 'flex',
                                              alignItems: 'flex-start',
                                              gap: 2,
                                              minWidth: 0,
                                              flex: '0 0 auto',
                                            }}
                                          >
                                            <Avatar
                                              sx={{
                                                width: 48,
                                                height: 48,
                                                bgcolor: 'secondary.main',
                                                boxShadow: 2,
                                              }}
                                            >
                                              <Iconify icon="mdi:credit-card" width={24} />
                                            </Avatar>

                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                              <Stack
                                                direction="row"
                                                alignItems="center"
                                                spacing={1}
                                                sx={{ mb: 1 }}
                                              >
                                                <Typography
                                                  variant="h6"
                                                  fontWeight="bold"
                                                  color="secondary.main"
                                                  sx={{ fontSize: '1.1rem' }}
                                                >
                                                  Credit Card Statement
                                                </Typography>
                                                <Chip
                                                  label="CC"
                                                  size="small"
                                                  color="secondary"
                                                  variant="filled"
                                                  sx={{
                                                    fontSize: '0.7rem',
                                                    height: 22,
                                                    fontWeight: 'bold',
                                                  }}
                                                />
                                                {linkedTransactions.length > 1 && (
                                                  <Chip
                                                    label={`${linkedTransactions.length} Txns`}
                                                    size="small"
                                                    color="info"
                                                    variant="outlined"
                                                    sx={{
                                                      fontSize: '0.7rem',
                                                      height: 22,
                                                      fontWeight: 'medium',
                                                    }}
                                                  />
                                                )}
                                              </Stack>

                                              <Tooltip
                                                title={
                                                  ccStatement.statementId?.fileName ||
                                                  `Statement ${index + 1}`
                                                }
                                              >
                                                <Typography
                                                  variant="body2"
                                                  color="text.primary"
                                                  sx={{
                                                    mb: 0.5,
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    maxWidth: 200,
                                                  }}
                                                  noWrap
                                                >
                                                  {ccStatement.statementId?.fileName ||
                                                    `Statement ${index + 1}`}
                                                </Typography>
                                              </Tooltip>

                                              {ccStatement.statementId?.statementPeriod && (
                                                <Typography
                                                  variant="body2"
                                                  color="text.secondary"
                                                  sx={{ fontSize: '0.8rem' }}
                                                >
                                                  Period:{' '}
                                                  {formatDate(
                                                    ccStatement.statementId.statementPeriod
                                                      .startDate
                                                  )}{' '}
                                                  -{' '}
                                                  {formatDate(
                                                    ccStatement.statementId.statementPeriod.endDate
                                                  )}
                                                </Typography>
                                              )}
                                            </Box>
                                          </Box>

                                          {/* Middle Section - Financial Details Grid */}
                                          <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Grid container spacing={2}>
                                              {/* Statement Total */}
                                              <Grid item xs={12} sm={6} md={3}>
                                                <Paper
                                                  elevation={0}
                                                  sx={{
                                                    p: 2,
                                                    bgcolor: 'background.paper',
                                                    border: '1px solid',
                                                    borderColor: 'secondary.light',
                                                    borderRadius: 2,
                                                    textAlign: 'center',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                  }}
                                                >
                                                  <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                      fontSize: '0.75rem',
                                                      fontWeight: 600,
                                                      mb: 0.5,
                                                    }}
                                                  >
                                                    Statement Total
                                                  </Typography>
                                                  <Typography
                                                    variant="h6"
                                                    color="secondary.main"
                                                    fontWeight="bold"
                                                    sx={{ fontSize: '1.25rem' }}
                                                  >
                                                    {fCurrency(statementTotal)}
                                                  </Typography>
                                                </Paper>
                                              </Grid>

                                              {/* Current Transaction */}
                                              <Grid item xs={12} sm={6} md={3}>
                                                <Paper
                                                  elevation={0}
                                                  sx={{
                                                    p: 2,
                                                    bgcolor: 'background.paper',
                                                    border: '1px solid',
                                                    borderColor: 'primary.light',
                                                    borderRadius: 2,
                                                    textAlign: 'center',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                  }}
                                                >
                                                  <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                      fontSize: '0.75rem',
                                                      fontWeight: 600,
                                                      mb: 0.5,
                                                    }}
                                                  >
                                                    This Transaction
                                                  </Typography>
                                                  <Typography
                                                    variant="h6"
                                                    color="primary.main"
                                                    fontWeight="bold"
                                                    sx={{ fontSize: '1.25rem' }}
                                                  >
                                                    {fCurrency(currentTransactionAmount)}
                                                  </Typography>
                                                  {currentAdjustment > 0 && (
                                                    <Typography
                                                      variant="caption"
                                                      color="info.main"
                                                      sx={{
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        mt: 0.5,
                                                      }}
                                                    >
                                                      + Adj: {fCurrency(currentAdjustment)}
                                                    </Typography>
                                                  )}
                                                </Paper>
                                              </Grid>

                                              {/* Total Paid (Combined) */}
                                              <Grid item xs={12} sm={6} md={3}>
                                                <Paper
                                                  elevation={0}
                                                  sx={{
                                                    p: 2,
                                                    bgcolor: 'background.paper',
                                                    border: '1px solid',
                                                    borderColor: 'success.light',
                                                    borderRadius: 2,
                                                    textAlign: 'center',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                  }}
                                                >
                                                  <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                      fontSize: '0.75rem',
                                                      fontWeight: 600,
                                                      mb: 0.5,
                                                    }}
                                                  >
                                                    Total Paid
                                                  </Typography>
                                                  <Typography
                                                    variant="h6"
                                                    color="success.main"
                                                    fontWeight="bold"
                                                    sx={{ fontSize: '1.25rem' }}
                                                  >
                                                    {fCurrency(combinedPaidAmount)}
                                                  </Typography>
                                                  <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    justifyContent="center"
                                                    sx={{ mt: 0.5 }}
                                                  >
                                                    <Typography
                                                      variant="caption"
                                                      color="text.secondary"
                                                      sx={{ fontSize: '0.7rem' }}
                                                    >
                                                      Bank: {fCurrency(totalBankPayments)}
                                                    </Typography>
                                                    {totalAdjustments > 0 && (
                                                      <>
                                                        <Typography
                                                          variant="caption"
                                                          color="text.secondary"
                                                          sx={{ fontSize: '0.7rem' }}
                                                        >
                                                          •
                                                        </Typography>
                                                        <Typography
                                                          variant="caption"
                                                          color="info.main"
                                                          sx={{
                                                            fontSize: '0.7rem',
                                                            fontWeight: 600,
                                                          }}
                                                        >
                                                          Adj: {fCurrency(totalAdjustments)}
                                                        </Typography>
                                                      </>
                                                    )}
                                                  </Stack>
                                                </Paper>
                                              </Grid>

                                              {/* Status */}
                                              <Grid item xs={12} sm={6} md={3}>
                                                <Paper
                                                  elevation={0}
                                                  sx={{
                                                    p: 2,
                                                    bgcolor:
                                                      Math.abs(combinedDifference) <= 0.01
                                                        ? 'success.lighter'
                                                        : 'warning.lighter',
                                                    border: '1px solid',
                                                    borderColor:
                                                      Math.abs(combinedDifference) <= 0.01
                                                        ? 'success.main'
                                                        : 'warning.main',
                                                    borderRadius: 2,
                                                    textAlign: 'center',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                  }}
                                                >
                                                  <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                      fontSize: '0.75rem',
                                                      fontWeight: 600,
                                                      mb: 0.5,
                                                    }}
                                                  >
                                                    Status
                                                  </Typography>
                                                  <Typography
                                                    variant="h6"
                                                    fontWeight="bold"
                                                    color={
                                                      Math.abs(combinedDifference) <= 0.01
                                                        ? 'success.main'
                                                        : 'warning.main'
                                                    }
                                                    sx={{ fontSize: '1.1rem' }}
                                                  >
                                                    {Math.abs(combinedDifference) <= 0.01
                                                      ? '✓ Fully Paid'
                                                      : combinedDifference > 0
                                                        ? `${fCurrency(combinedDifference)} Remaining`
                                                        : `${fCurrency(Math.abs(combinedDifference))} Overpaid`}
                                                  </Typography>
                                                </Paper>
                                              </Grid>
                                            </Grid>
                                          </Box>

                                          {/* Right Section - Actions */}
                                          <Box
                                            sx={{
                                              display: 'flex',
                                              flexDirection: 'column',
                                              gap: 1.5,
                                              flex: '0 0 auto',
                                            }}
                                          >
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              color="primary"
                                              onClick={() =>
                                                handleViewCreditCardStatement(statementId)
                                              }
                                              startIcon={<Iconify icon="mdi:eye" />}
                                              sx={{
                                                fontSize: '0.8rem',
                                                minWidth: 'auto',
                                                px: 2,
                                                py: 1,
                                                fontWeight: 600,
                                              }}
                                            >
                                              View Statement
                                            </Button>
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              color="info"
                                              onClick={() =>
                                                handleEditAdjustment(
                                                  row,
                                                  ccStatement,
                                                  currentAdjustment
                                                )
                                              }
                                              startIcon={<Iconify icon="mdi:pencil" />}
                                              disabled={updatingTransactions.has(row.id)}
                                              sx={{
                                                fontSize: '0.8rem',
                                                minWidth: 'auto',
                                                px: 2,
                                                py: 1,
                                                fontWeight: 600,
                                              }}
                                            >
                                              Edit Adjustment
                                            </Button>

                                            <Button
                                              size="small"
                                              variant="outlined"
                                              color="error"
                                              onClick={() =>
                                                handleUnlinkCreditCard(row.id, statementId)
                                              }
                                              startIcon={<Iconify icon="mdi:unlink" />}
                                              disabled={updatingTransactions.has(row.id)}
                                              sx={{
                                                fontSize: '0.8rem',
                                                minWidth: 'auto',
                                                px: 2,
                                                py: 1,
                                                fontWeight: 600,
                                              }}
                                            >
                                              {updatingTransactions.has(row.id)
                                                ? 'Unlinking...'
                                                : 'Unlink'}
                                            </Button>
                                          </Box>
                                        </Stack>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                </React.Fragment>
                              );
                            })}

                          {/* No matches message */}
                          {isExpanded && !hasDocuments && !hasLinkedStatements && (
                            <TableRow>
                              <TableCell colSpan={10} sx={{ py: 2, border: 0, width: '100%' }}>
                                <Box sx={{ textAlign: 'center', pl: 6 }}>
                                  <Iconify
                                    icon="mdi:link-off"
                                    width={32}
                                    sx={{ color: 'text.disabled', mb: 1 }}
                                  />
                                  <Typography variant="body2" color="text.secondary">
                                    No matched documents or linked statements
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Click "Match" to manually link documents to this transaction
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                )}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      <Paper sx={{ py: 5 }}>
                        <Typography variant="h6" gutterBottom>
                          No transactions found
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Try changing your filters or search term
                        </Typography>
                      </Paper>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePaginationCustom
          page={page}
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Dialogs */}
      <ManualMatchingDialog
        open={manualMatchDialog.open}
        transaction={manualMatchDialog.transaction}
        onClose={() => setManualMatchDialog({ open: false, transaction: null })}
        onSuccess={() => {
          fetchTransactions();
          setManualMatchDialog({ open: false, transaction: null });
        }}
      />

      <UploadAndMatchDialog
        open={uploadMatchDialog.open}
        transaction={uploadMatchDialog.transaction}
        onClose={() => setUploadMatchDialog({ open: false, transaction: null })}
        onSuccess={() => {
          fetchTransactions();
          setUploadMatchDialog({ open: false, transaction: null });
        }}
      />

      <CreditCardLinkDialog
        open={creditCardLinkDialog.open}
        transaction={creditCardLinkDialog.transaction}
        onClose={() => setCreditCardLinkDialog({ open: false, transaction: null })}
        onSuccess={() => {
          fetchTransactions();
          setCreditCardLinkDialog({ open: false, transaction: null });
        }}
      />

      <CategoryUpdateDialog
        open={categoryUpdateDialog.open}
        transactionId={categoryUpdateDialog.transactionId}
        currentTransaction={categoryUpdateDialog.currentTransaction}
        similarTransactions={categoryUpdateDialog.similarTransactions}
        newCategory={categoryUpdateDialog.newCategory}
        loading={categoryUpdateDialog.loading}
        onClose={() =>
          setCategoryUpdateDialog({
            open: false,
            transactionId: null,
            currentTransaction: null,
            similarTransactions: [],
            newCategory: '',
            loading: false,
          })
        }
        onConfirm={async (updateSimilar) => {
          // Handle category update for similar transactions
          await fetchTransactions();
        }}
      />

      {/* Edit Transaction Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          {editTransaction && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Row 1: Date and Amount */}
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
                  inputProps={{
                    step: '0.01',
                    min: '0.01',
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  size="small"
                />
              </Grid>

              {/* Row 2: Transaction Type and Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required size="small">
                  <InputLabel id="edit-transaction-type-label">Transaction Type</InputLabel>
                  <Select
                    labelId="edit-transaction-type-label"
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
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required size="small">
                  <InputLabel id="edit-type-label">Type</InputLabel>
                  <Select
                    labelId="edit-type-label"
                    value={editTransaction.type}
                    onChange={(e) => handleEditTransactionChange('type', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="Business">Business</MenuItem>
                    <MenuItem value="Personal">Personal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Row 3: Category */}
              <Grid item xs={12}>
                <CategorySelector
                  value={editTransaction.category}
                  onChange={(value) => handleEditTransactionChange('category', value)}
                  transactionType={editTransaction.transactionType}
                  isPersonal={editTransaction.type === 'Personal'}
                  label="Category"
                  size="small"
                />
              </Grid>

              {/* Row 4: Description */}
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

              {/* Row 5: Vendor */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Vendor"
                  value={editTransaction.vendor || ''}
                  onChange={(e) => handleEditTransactionChange('vendor', e.target.value)}
                  inputProps={{ maxLength: 100 }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Note (Optional)"
                  placeholder="Add a note for this transaction..."
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

          {editTransactionMessage.text && (
            <Alert severity={editTransactionMessage.type} sx={{ mt: 2 }}>
              {editTransactionMessage.text}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSaveEditTransaction}
            variant="contained"
            disabled={isEditingTransaction}
          >
            {isEditingTransaction ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Transaction Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteTransaction}
            color="error"
            variant="contained"
            disabled={isDeletingTransaction}
          >
            {isDeletingTransaction ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Row 1: Date and Amount */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => handleNewTransactionChange('date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Amount"
                value={newTransaction.amount}
                onChange={(e) => handleNewTransactionChange('amount', e.target.value)}
                type="number"
                inputProps={{
                  step: '0.01',
                  min: '0.01',
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                size="small"
              />
            </Grid>

            {/* Row 2: Transaction Type and Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required size="small">
                <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
                <Select
                  labelId="transaction-type-label"
                  value={newTransaction.transactionType}
                  onChange={(e) => handleNewTransactionChange('transactionType', e.target.value)}
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required size="small">
                <InputLabel id="type-label">Type</InputLabel>
                <Select
                  labelId="type-label"
                  value={newTransaction.type}
                  onChange={(e) => handleNewTransactionChange('type', e.target.value)}
                  label="Type"
                >
                  <MenuItem value="Business">Business</MenuItem>
                  <MenuItem value="Personal">Personal</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Row 3: Category */}
            <Grid item xs={12}>
              <CategorySelector
                value={newTransaction.category}
                onChange={(value) => handleNewTransactionChange('category', value)}
                transactionType={newTransaction.transactionType}
                isPersonal={newTransaction.type === 'Personal'}
                label="Category"
                size="small"
              />
            </Grid>

            {/* Row 4: Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Description"
                value={newTransaction.description}
                onChange={(e) => handleNewTransactionChange('description', e.target.value)}
                inputProps={{ maxLength: 200 }}
                size="small"
              />
            </Grid>

            {/* Row 5: Vendor */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vendor"
                value={newTransaction.vendor || ''}
                onChange={(e) => handleNewTransactionChange('vendor', e.target.value)}
                inputProps={{ maxLength: 100 }}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Note (Optional)"
                placeholder="Add a note for this transaction..."
                value={newTransaction.note}
                onChange={(e) => handleNewTransactionChange('note', e.target.value)}
                disabled={isAddingTransaction}
                multiline
                rows={2}
                inputProps={{ maxLength: 500 }}
                size="small"
                helperText={`${(newTransaction.note || '').length}/500 characters`}
              />
            </Grid>
          </Grid>

          {addTransactionMessage.text && (
            <Alert severity={addTransactionMessage.type} sx={{ mt: 2 }}>
              {addTransactionMessage.text}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleAddTransaction} variant="contained" disabled={isAddingTransaction}>
            {isAddingTransaction ? <CircularProgress size={20} /> : 'Add Transaction'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Matching Dialog */}
      <ManualMatchingDialog
        open={manualMatchDialog.open}
        onClose={handleCloseManualMatch}
        transaction={manualMatchDialog.transaction}
        onMatchSuccess={handleMatchSuccess}
        onUploadRequest={handleUploadRequest}
        onCreditCardLink={handleCreditCardLink}
      />

      {/* Upload and Match Dialog */}
      <UploadAndMatchDialog
        open={uploadMatchDialog.open}
        onClose={handleCloseUploadMatch}
        transaction={uploadMatchDialog.transaction}
        onUploadSuccess={handleMatchSuccess}
      />

      {/* Credit Card Link Dialog */}
      <CreditCardLinkDialog
        open={creditCardLinkDialog.open}
        onClose={handleCloseCreditCardLink}
        transaction={creditCardLinkDialog.transaction}
        onLinkSuccess={handleMatchSuccess}
      />

      {/* Document Detail Dialog */}
      <Dialog
        open={documentDetailDialog.open}
        onClose={handleCloseDocumentDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {documentDetailDialog.document?.documentType || 'Document'} Details
            </Typography>
            <IconButton onClick={handleCloseDocumentDetails}>
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {documentDetailDialog.document && (
            <InvoiceItemsRows
              document={documentDetailDialog.document}
              isInvoice={documentDetailDialog.document.documentType === 'Invoice'}
              onDocumentUpdate={handleDocumentUpdate}
              fullView={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Adjustment Edit Dialog */}
      <Dialog
        open={adjustmentEditDialog.open}
        onClose={handleCloseAdjustmentDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:pencil" width={24} color="info.main" />
            <Typography variant="h6" color="info.main">
              Edit Adjustment
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Adjust the payment amount for better matching accuracy.
          </Typography>

          <TextField
            fullWidth
            label="Adjustment Amount"
            type="number"
            defaultValue={adjustmentEditDialog.currentAmount}
            inputProps={{ step: 0.01 }}
            helperText="Enter positive for overpayment, negative for underpayment"
            sx={{ mb: 2 }}
            id="adjustment-amount"
          />

          <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
            This adjustment will be added to the transaction amount for matching calculations.
          </Alert>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseAdjustmentDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              const input = document.getElementById('adjustment-amount');
              const value = input?.value || '0';
              handleSaveAdjustment(value);
            }}
            variant="contained"
            color="info"
            disabled={adjustmentEditDialog.loading}
            startIcon={
              adjustmentEditDialog.loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Iconify icon="mdi:content-save" width={20} />
              )
            }
          >
            {adjustmentEditDialog.loading ? 'Saving...' : 'Save Adjustment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Note Dialog */}
      <NoteDialog
        open={noteDialog.open}
        onClose={handleCloseNoteDialog}
        onSave={handleSaveNote}
        transaction={noteDialog.transaction}
        loading={noteDialog.loading}
      />
    </DashboardContent>
  );
}
1