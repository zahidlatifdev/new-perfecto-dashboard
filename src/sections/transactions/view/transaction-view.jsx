'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
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
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TablePaginationCustom, TableSkeletonRows } from 'src/components/table';
import { DashboardContent } from 'src/layouts/dashboard';

import { fCurrency } from 'src/utils/format-number';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import { CategorySelector } from 'src/components/category-selector';
import { TransactionMatchingCell } from '../components/transaction-matching-cell';
import { InvoiceItemsRows } from '../components/invoice-items-rows';
import { ManualMatchingDialog } from 'src/sections/matching/components/manual-matching-dialog';
import { UploadAndMatchDialog } from 'src/sections/matching/components/upload-and-match-dialog';
import { CategoryUpdateDialog } from '../components/category-update-dialog';
import { CreditCardLinkDialog } from 'src/sections/matching/components/credit-card-link-dialog';
import { Chip } from '@mui/material';
import toast from 'react-hot-toast';
import { NoteDialog } from '../components/note-dialog';
import { LiabilitiesSummary } from '../components/liabilities-summary';

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

const getDocumentDate = (document) => {
  if (document.documentType === 'Invoice') {
    return document.invoiceDate;
  } else if (document.documentType === 'Bill') {
    return document.billDate;
  } else {
    return document.receiptDate || document.orderDate || document.invoiceDate;
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

const getSourceDisplay = (transaction, availableAccounts = []) => {
  if (transaction.accountId) {
    const account = availableAccounts.find((acc) => acc.originalId === transaction.accountId);

    if (account) {
      // For bank accounts
      if (account.type === 'bank_account') {
        const displayName = account.bankName || account.accountName || 'Bank Account';
        const lastFour = account.accountNumber ? account.accountNumber : 'XXXX';
        return `${displayName} (${lastFour})`;
      }
      // For credit cards
      if (account.type === 'credit_card') {
        const displayName = account.issuerBank || account.cardName || 'Credit Card';
        const lastFour = account.accountNumber ? account.accountNumber : 'XXXX';
        return `${displayName} (${lastFour})`;
      }
      // For cash accounts
      if (account.type === 'cash_account') {
        return `${account.accountName} (Cash)`;
      }
    }
  }
  return 'Manual';
};

// Helper to format statement period
const formatStatementPeriod = (statement) => {
  if (!statement?.statementPeriod?.startDate || !statement?.statementPeriod?.endDate) {
    return statement.displayName || 'Unknown Period';
  }

  const start = new Date(statement.statementPeriod.startDate);
  const end = new Date(statement.statementPeriod.endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return statement.displayName || 'Invalid Period';
  }
  const daysDifference = Math.abs((end - start) / (1000 * 60 * 60 * 24));
  if (daysDifference < 28 && start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${start.toLocaleString('en-US', { month: 'short' })} ${start.getFullYear()}`;
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleString('en-US', { month: 'short' })}–${end.toLocaleString('en-US', { month: 'short' })} ${start.getFullYear()}`;
  }
  return `${start.toLocaleString('en-US', { month: 'short' })} ${start.getFullYear()}–${end.toLocaleString('en-US', { month: 'short' })} ${end.getFullYear()}`;
};

// Enhanced filter options
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
  accountType: [
    { value: 'all', label: 'All Accounts' },
    { value: 'bank_account', label: 'Bank Accounts' },
    { value: 'credit_card', label: 'Credit Cards' },
    { value: 'cash_account', label: 'Cash Accounts' },
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

export function TransactionsView() {
  const { selectedCompany } = useAuthContext();
  const searchParams = useSearchParams();
  const statementId = searchParams.get('statementId');
  const statementType = searchParams.get('type');
  const accountType = searchParams.get('accountType');
  const accountId = searchParams.get('accountId');
  const action = searchParams.get('action');

  // UI State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [selectedTypes, setSelectedTypes] = useState({});
  const [modifiedRows, setModifiedRows] = useState({});
  const [openAddDialog, setOpenAddDialog] = useState(false);

  // Data State
  const [transactions, setTransactions] = useState([]);
  const [availableStatements, setAvailableStatements] = useState([]);
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [statementTotals, setStatementTotals] = useState({});
  const [liabilities, setLiabilities] = useState({
    totalLiabilities: 0,
    creditCardLiabilities: 0,
    loanLiabilities: 0,
    totalPayments: 0,
    netLiabilities: 0,
  });
  const [liabilitiesLoading, setLiabilitiesLoading] = useState(false);

  // Edit/Delete Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTransactionId, setDeleteTransactionId] = useState(null);
  const [editTransactionMessage, setEditTransactionMessage] = useState({ type: '', text: '' });
  const [isEditingTransaction, setIsEditingTransaction] = useState(false);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);

  // Matching Dialog States
  const [manualMatchDialog, setManualMatchDialog] = useState({ open: false, transaction: null });
  const [uploadMatchDialog, setUploadMatchDialog] = useState({ open: false, transaction: null });
  const [creditCardLinkDialog, setCreditCardLinkDialog] = useState({ open: false, transaction: null });
  const [expandedTransactions, setExpandedTransactions] = useState({});
  const [documentDetailDialog, setDocumentDetailDialog] = useState({ open: false, document: null });

  // Category State
  const [updatingCategoryId, setUpdatingCategoryId] = useState(null);
  const [categoryUpdateMessage, setCategoryUpdateMessage] = useState({});

  const [originalTransactionValues, setOriginalTransactionValues] = useState({});
  const [updatingTransactions, setUpdatingTransactions] = useState(new Set());

  // Note Dialog State
  const [noteDialog, setNoteDialog] = useState({
    open: false,
    transaction: null,
    loading: false,
  });

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
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);

  // Error States
  const [error, setError] = useState(null);
  const [addTransactionMessage, setAddTransactionMessage] = useState({ type: '', text: '' });


  const [adjustmentEditDialog, setAdjustmentEditDialog] = useState({
    open: false,
    transaction: null,
    statement: null,
    currentAmount: 0,
    loading: false,
  });

  // Cache and Request Management
  const dataCache = useRef({
    statements: null,
    accounts: null,
    cacheTimestamp: null,
  });
  const CACHE_DURATION = 5 * 60 * 1000;
  const activeRequestsRef = useRef(new Set());

  // Form State
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

  // Filter State
  const [filter, setFilter] = useState({
    dateRange: 'all',
    account: 'all',
    accountType: 'all',
    selectedStatement: 'all',
    matchingStatus: 'all',
    transactionType: 'all',
    search: '',
  });

  // Optimized function to fetch all initial data in parallel
  const fetchInitialData = useCallback(async () => {
    if (!selectedCompany?._id) return;

    const requestKey = `initial-data-${selectedCompany._id}`;

    if (activeRequestsRef.current.has(requestKey)) {
      return;
    }
    try {
      activeRequestsRef.current.add(requestKey);
      setLoading(true);
      setError(null);

      const now = Date.now();
      const isCacheValid =
        dataCache.current.cacheTimestamp && now - dataCache.current.cacheTimestamp < CACHE_DURATION;

      let statements = dataCache.current.statements;
      let accounts = dataCache.current.accounts;

      if (!isCacheValid) {
        const [
          bankStatementsResponse,
          creditCardStatementsResponse,
          bankAccountsResponse,
          creditCardAccountsResponse,
          cashAccountsResponse,
        ] = await Promise.all([
          axiosInstance.get(endpoints.documents.statements.list, {
            params: {
              companyId: selectedCompany._id,
              accountType: 'bank_account',
              sortBy: 'createdAt',
              sortOrder: 'desc',
            },
          }),
          axiosInstance.get(endpoints.documents.statements.list, {
            params: {
              companyId: selectedCompany._id,
              accountType: 'credit_card',
              sortBy: 'createdAt',
              sortOrder: 'desc',
            },
          }),
          axiosInstance.get(endpoints.bankAccounts.list, {
            params: {
              companyId: selectedCompany._id,
            },
          }),
          axiosInstance.get(endpoints.creditCards.list, {
            params: {
              companyId: selectedCompany._id,
            },
          }),
          axiosInstance.get(endpoints.cashAccounts.list, {
            params: {
              companyId: selectedCompany._id,
              includeBalance: true,
            },
          }),
        ]);

        // Process statements
        const bankStatements = (bankStatementsResponse.data.data?.statements || []).map((stmt) => ({
          ...stmt,
          type: 'bank',
          displayName: `${stmt.fileName} (Bank)`,
        }));

        const creditCardStatements = (creditCardStatementsResponse.data.data?.statements || []).map((stmt) => ({
          ...stmt,
          type: 'credit_card',
          displayName: `${stmt.fileName} (Credit Card)`,
        }));

        statements = [...bankStatements, ...creditCardStatements];

        // Process accounts - include all account types
        const bankAccounts = bankAccountsResponse.data.data?.bankAccounts || [];
        const creditCardAccounts = creditCardAccountsResponse.data.data?.creditCards || [];
        const cashAccounts = cashAccountsResponse.data.data?.cashAccounts || [];

        const bankAccountOptions = bankAccounts.map((account) => ({
          id: `bank_${account._id}`,
          type: 'bank_account',
          displayName: `${account.bankName} - ${account.accountName} (${account.accountNumber}) (Bank)`,
          shortDisplayName: `${account.accountName} (${account.accountNumber})`,
          fullDisplayName: `${account.bankName} - ${account.accountName} (${account.accountNumber}) (Bank Account)`,
          accountNumber: account.accountNumber,
          bankName: account.bankName,
          accountName: account.accountName,
          originalId: account._id,
        }));

        const creditCardAccountOptions = creditCardAccounts.map((account) => ({
          id: `credit_card_${account._id}`,
          type: 'credit_card',
          displayName: `${account.issuerBank || 'Credit Card'} - ${account.cardName || 'Card'} (${account.lastFourDigits}) (Card)`,
          shortDisplayName: `${account.cardName || 'Card'} (${account.lastFourDigits})`,
          fullDisplayName: `${account.issuerBank || 'Credit Card'} - ${account.cardName || 'Card'} (${account.lastFourDigits}) (Credit Card)`,
          accountNumber: account.lastFourDigits,
          issuerBank: account.issuerBank,
          cardName: account.cardName,
          originalId: account._id,
        }));

        const cashAccountOptions = cashAccounts.map((account) => ({
          id: `cash_${account._id}`,
          type: 'cash_account',
          displayName: `${account.accountName} (Cash)`,
          shortDisplayName: `${account.accountName}`,
          fullDisplayName: `${account.accountName} - Cash Account`,
          accountName: account.accountName,
          description: account.description,
          currency: account.currency,
          currentBalance: account.currentBalance,
          originalId: account._id,
        }));

        accounts = [...bankAccountOptions, ...creditCardAccountOptions, ...cashAccountOptions];

        dataCache.current = {
          statements,
          accounts,
          cacheTimestamp: now,
        };
      }

      setAvailableStatements(statements);
      setAvailableAccounts(accounts);

      await fetchTransactions(statements, accounts);
      await fetchLiabilities();
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      activeRequestsRef.current.delete(requestKey);
    }
  }, [selectedCompany?._id]);

  // Fetch liabilities data
  const fetchLiabilities = useCallback(async () => {
    if (!selectedCompany?._id) return;

    try {
      setLiabilitiesLoading(true);
      const response = await axiosInstance.get(endpoints.transactions.liabilities);
      setLiabilities(response.data.data.liabilities);
    } catch (err) {
      console.error('Failed to fetch liabilities:', err);
      // Don't show error for liabilities, just log it
    } finally {
      setLiabilitiesLoading(false);
    }
  }, [selectedCompany?._id]);

  const extractStatementTotalsFromTransactions = (transactions) => {
    const totalsMap = {};

    transactions.forEach((transaction, index) => {
      // Extract totals from linked credit card statements
      if (transaction.linkedCreditCardStatements && transaction.linkedCreditCardStatements.length > 0) {

        transaction.linkedCreditCardStatements.forEach((ccStatement, ccIndex) => {
          const statementId = ccStatement.statementId?._id || ccStatement.statementId;

          // Try multiple ways to get the statement total
          let statementTotal = ccStatement.statementId?.total ||
            ccStatement.statementId?.statementTotal ||
            ccStatement.total ||
            ccStatement.statementTotal;

          if (statementId && statementTotal !== undefined && statementTotal !== null) {
            totalsMap[statementId] = statementTotal;
          }
        });
      }
    });
    return totalsMap;
  };

  const fetchTransactions = useCallback(
    async (statements = null, accounts = null) => {
      if (!selectedCompany?._id) return;

      const currentAccounts = accounts || availableAccounts || dataCache.current.accounts;

      try {
        const params = {
          companyId: selectedCompany._id,
          limit: 1000,
          sortBy: 'date',
          sortOrder: 'asc',
        };

        // Handle specific account filtering from URL
        if (accountType && accountId) {
          params.accountType = accountType;
          params.accountId = accountId;
        } else if (statementId) {
          params.statementId = statementId;
        } else {
          // Fetch both bank and cash transactions (exclude credit card)
          // Make multiple requests for different account types
          const transactions = await axiosInstance.get(endpoints.transactions.list, {
            params: { ...params },
          })

          const apiTransactions = transactions.data.data.transactions || [];
          const extractedTotals = extractStatementTotalsFromTransactions(apiTransactions);
          setStatementTotals(extractedTotals);

          const processedTransactions = apiTransactions.map((txn) => {
            const sourceDisplay = getSourceDisplay(txn, currentAccounts);

            return {
              id: txn._id,
              date: formatDate(txn.date),
              rawDate: txn.date,
              description: txn.description || 'No description',
              vendor: txn.vendor || 'Unknown Vendor',
              source: sourceDisplay,
              category: txn.category || 'Uncategorized',
              note: txn.note || null,
              type: txn.type || 'Business',
              debit: txn.debit || null,
              credit: txn.credit || null,
              amount: txn.debit ? -Math.abs(txn.debit) : txn.credit ? Math.abs(txn.credit) : 0,
              accountType: txn.accountType,
              accountId: txn.accountId,
              statementId: txn.statementId,
              accountInfo: txn.accountInfo,
              matchedDocuments: txn.matchedDocuments || [],
              hasMatches: txn.matchedDocuments && txn.matchedDocuments.length > 0,
              linkedCreditCardStatements: txn.linkedCreditCardStatements || [],
              createdBy: txn.createdBy,
              createdAt: txn.createdAt,
              updatedAt: txn.updatedAt,
            };
          });

          const sortedTransactions = processedTransactions.sort((a, b) => {
            const dateA = new Date(a.rawDate);
            const dateB = new Date(b.rawDate);
            return dateA - dateB;
          });

          setTransactions(sortedTransactions);
          return;
        }

        // Single request for specific account type
        const response = await axiosInstance.get(endpoints.transactions.list, {
          params,
        });

        const apiTransactions = response.data.data.transactions || [];

        // Extract statement totals BEFORE processing transactions
        const extractedTotals = extractStatementTotalsFromTransactions(apiTransactions);
        setStatementTotals(extractedTotals);

        const processedTransactions = apiTransactions.map((txn) => {
          const sourceDisplay = getSourceDisplay(txn, currentAccounts);

          return {
            id: txn._id,
            date: formatDate(txn.date),
            rawDate: txn.date,
            description: txn.description || 'No description',
            vendor: txn.vendor || 'Unknown Vendor',
            source: sourceDisplay,
            category: txn.category || 'Uncategorized',
            note: txn.note || null,
            type: txn.type || 'Business',
            debit: txn.debit || null,
            credit: txn.credit || null,
            amount: txn.debit ? -Math.abs(txn.debit) : txn.credit ? Math.abs(txn.credit) : 0,
            accountType: txn.accountType,
            accountId: txn.accountId,
            statementId: txn.statementId,
            accountInfo: txn.accountInfo,
            matchedDocuments: txn.matchedDocuments || [],
            hasMatches: txn.matchedDocuments && txn.matchedDocuments.length > 0,
            linkedCreditCardStatements: txn.linkedCreditCardStatements || [],
            createdBy: txn.createdBy,
            createdAt: txn.createdAt,
            updatedAt: txn.updatedAt,
          };
        });

        const sortedTransactions = processedTransactions.sort((a, b) => {
          const dateA = new Date(a.rawDate);
          const dateB = new Date(b.rawDate);
          return dateA - dateB;
        });

        setTransactions(sortedTransactions);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError('Failed to load transactions. Please try again.');
      }
    },
    [selectedCompany?._id, statementId, availableStatements]
  );

  // Handler for opening adjustment edit dialog
  const handleEditAdjustment = useCallback((transaction, statement, currentAmount) => {
    setAdjustmentEditDialog({
      open: true,
      transaction,
      statement,
      currentAmount,
      loading: false,
    });
  }, []);

  // Handler for updating adjustment amount
  const handleUpdateAdjustment = useCallback(async (newAdjustmentAmount) => {
    const { transaction, statement } = adjustmentEditDialog;

    if (!transaction || !statement) return;

    setAdjustmentEditDialog(prev => ({ ...prev, loading: true }));
    setUpdatingTransactions(prev => new Set([...prev, transaction.id]));

    try {
      const response = await axiosInstance.post(endpoints.matching.updateCreditCardAdjustment, {
        transactionId: transaction.id,
        statementId: statement.statementId?._id || statement.statementId,
        adjustmentAmount: parseFloat(newAdjustmentAmount) || 0
      });

      if (response.data.success) {
        // Optimistically update ALL transactions that might have this statement linked
        setTransactions(prev =>
          prev.map(txn => {
            // Update the current transaction
            if (txn.id === transaction.id) {
              return {
                ...txn,
                linkedCreditCardStatements: txn.linkedCreditCardStatements.map(ccStmt =>
                  (ccStmt.statementId?._id || ccStmt.statementId) === (statement.statementId?._id || statement.statementId)
                    ? { ...ccStmt, adjustmentAmount: parseFloat(newAdjustmentAmount) || 0 }
                    : ccStmt
                )
              };
            }

            // For other transactions with the same statement, trigger re-render for updated combined totals
            if (txn.linkedCreditCardStatements && txn.linkedCreditCardStatements.some(
              link => (link.statementId?._id || link.statementId) === (statement.statementId?._id || statement.statementId)
            )) {
              return { ...txn }; // Force re-render
            }

            return txn;
          })
        );

        setAdjustmentEditDialog({
          open: false,
          transaction: null,
          statement: null,
          currentAmount: 0,
          loading: false,
        });

        toast.success('Adjustment amount updated successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to update adjustment amount');
      }
    } catch (error) {
      console.error('Failed to update adjustment amount:', error);
      alert('Failed to update adjustment amount. Please try again.');
    } finally {
      setUpdatingTransactions(prev => {
        const newSet = new Set(prev);
        newSet.delete(transaction.id);
        return newSet;
      });
      setAdjustmentEditDialog(prev => ({ ...prev, loading: false }));
    }
  }, [adjustmentEditDialog]);

  // Calculate adjustment details for the dialog
  const getAdjustmentDetails = useCallback(() => {
    // Only calculate when the dialog is actually open and we have the required data
    if (!adjustmentEditDialog.open || !adjustmentEditDialog.transaction || !adjustmentEditDialog.statement) {
      return null;
    }

    const { transaction, statement } = adjustmentEditDialog;
    const statementId = statement.statementId?._id || statement.statementId;
    const statementTotal = statementTotals[statementId] || 0;

    // Find all transactions linked to this same statement
    const linkedTransactions = transactions.filter(txn => {
      const hasLink = txn.linkedCreditCardStatements &&
        txn.linkedCreditCardStatements.some(ccStmt =>
          (ccStmt.statementId?._id || ccStmt.statementId) === statementId
        );
      return hasLink;
    });

    // Calculate totals with detailed logging
    const totalBankPayments = linkedTransactions.reduce((sum, txn, index) => {
      const amount = Math.abs(txn.debit || txn.credit || 0);
      return sum + amount;
    }, 0);

    const totalAdjustments = linkedTransactions.reduce((sum, txn, index) => {
      const txnCcStatement = txn.linkedCreditCardStatements.find(ccStmt =>
        (ccStmt.statementId?._id || ccStmt.statementId) === statementId
      );
      const adjustment = txnCcStatement?.adjustmentAmount || 0;
      return sum + adjustment;
    }, 0);

    const currentTransactionAmount = Math.abs(transaction.debit || transaction.credit || 0);
    const currentAdjustment = statement.adjustmentAmount || 0;

    // Calculate the combined total paid amount
    const combinedPaidAmount = totalBankPayments + totalAdjustments;
    const combinedDifference = statementTotal - combinedPaidAmount;

    // Calculate without current adjustment to show what the new difference would be
    const totalWithoutCurrentAdjustment = totalBankPayments + (totalAdjustments - currentAdjustment);
    const differenceWithoutAdjustment = statementTotal - totalWithoutCurrentAdjustment;

    const calculationSummary = {
      statementTotal,
      currentTransactionAmount,
      currentAdjustment,
      totalBankPayments,
      totalAdjustments,
      combinedPaidAmount,
      combinedDifference,
      totalWithoutCurrentAdjustment,
      differenceWithoutAdjustment,
      linkedTransactionCount: linkedTransactions.length,
      isMultiTransaction: linkedTransactions.length > 1,
      statementFileName: statement.statementId?.fileName || 'Credit Card Statement'
    };

    return calculationSummary;
  }, [adjustmentEditDialog, statementTotals, transactions]);

  // Main data loading effect
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!selectedCompany?._id) return;

      try {
        await fetchInitialData();
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load data:', error);
          setError('Failed to load data. Please try again.');
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [selectedCompany?._id, statementId, fetchInitialData]);

  // Effect to handle URL action parameter (e.g., action=add)
  useEffect(() => {
    if (action === 'add' && availableAccounts.length > 0) {
      // Auto-select the account if specified in URL
      if (accountType && accountId) {
        const targetAccount = availableAccounts.find(acc =>
          acc.type === accountType && acc.originalId === accountId
        );
        if (targetAccount) {
          setNewTransaction(prev => ({
            ...prev,
            account: targetAccount.id,
          }));
        }
      }
      setOpenAddDialog(true);
    }
  }, [action, accountType, accountId, availableAccounts]);


  // Update the filtering logic in filteredTransactions
  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter((row) => {
      // Date range filter
      const matchesDateRange = (() => {
        if (filter.dateRange === 'all') return true;

        const transactionDate = new Date(row.rawDate);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (filter.dateRange) {
          case 'today':
            return transactionDate >= today;
          case 'thisWeek': {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return transactionDate >= weekStart;
          }
          case 'thisMonth': {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return transactionDate >= monthStart;
          }
          case 'last30': {
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            return transactionDate >= thirtyDaysAgo;
          }
          case 'last90': {
            const ninetyDaysAgo = new Date(today);
            ninetyDaysAgo.setDate(today.getDate() - 90);
            return transactionDate >= ninetyDaysAgo;
          }
          case 'thisYear': {
            const yearStart = new Date(now.getFullYear(), 0, 1);
            return transactionDate >= yearStart;
          }
          default:
            return true;
        }
      })();

      // Search filter
      const matchesSearch =
        filter.search === '' ||
        row.description.toLowerCase().includes(filter.search.toLowerCase()) ||
        row.source.toLowerCase().includes(filter.search.toLowerCase());

      // Account type filter
      const matchesAccountType =
        filter.accountType === 'all' ||
        row.accountType === filter.accountType;

      // Account filter - match by account ID from transaction
      const matchesAccount = (() => {
        if (filter.account === 'all') return true;

        const selectedAccount = availableAccounts.find((acc) => acc.id === filter.account);
        if (!selectedAccount) return false;

        return row.accountId === selectedAccount.originalId && row.accountType === selectedAccount.type;
      })();

      // Statement filter - only applies to bank accounts (cash accounts don't have statements)
      const matchesStatement = (() => {
        if (filter.selectedStatement === 'all') return true;
        if (filter.selectedStatement === 'manual' && !row.statementId) return true;
        if (row.accountType === 'cash_account') return filter.selectedStatement === 'all' || filter.selectedStatement === 'manual';
        return row.statementId === filter.selectedStatement;
      })();

      // Matching status filter - include both document matches and credit card statement links
      const hasCreditCardLinks = row.linkedCreditCardStatements && row.linkedCreditCardStatements.length > 0;
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

      return (
        matchesDateRange &&
        matchesSearch &&
        matchesAccountType &&
        matchesAccount &&
        matchesStatement &&
        matchesMatchingStatus &&
        matchesTransactionType
      );
    });
    return filtered;
  }, [transactions, filter, availableAccounts]);

  const summaryData = useMemo(() => {
    const txns = filteredTransactions.length ? filteredTransactions : transactions;

    // Separate credit card transactions (liabilities) from regular transactions
    const creditCardTransactions = txns.filter(t => t.accountType === 'credit_card');
    const regularTransactions = txns.filter(t => t.accountType !== 'credit_card');

    // Calculate credit card liabilities (debit amounts from credit cards)
    const creditCardLiabilities = creditCardTransactions.reduce((acc, t) => acc + (t.debit || 0), 0);

    // Calculate loan liabilities (credit transactions with loan category)
    const loanTransactions = txns.filter(t =>
      t.credit > 0 && t.category && t.category.toLowerCase().includes('loan')
    );
    const loanLiabilities = loanTransactions.reduce((acc, t) => acc + (t.credit || 0), 0);

    // Regular debits and credits (excluding credit card debits and loan credits)
    const totalDebit = regularTransactions.reduce((acc, t) => acc + (t.debit || 0), 0);
    const totalCredit = regularTransactions.reduce((acc, t) => acc + (t.credit || 0), 0) - loanLiabilities;

    // Income is credits minus loan liabilities
    const income = totalCredit;
    const expenses = totalDebit;
    const netAmount = income - expenses;

    const creditTransactions = regularTransactions.filter((t) => t.credit > 0 && !t.category?.toLowerCase().includes('loan'));
    const debitTransactions = regularTransactions.filter((t) => t.debit > 0);

    return {
      totalDebit: expenses,
      totalCredit: income,
      netAmount,
      transactionCount: txns.length,
      avgCredit: creditTransactions.length > 0 ? income / creditTransactions.length : 0,
      avgDebit: debitTransactions.length > 0 ? expenses / debitTransactions.length : 0,
      // Liability specific data
      creditCardLiabilities,
      loanLiabilities,
      totalLiabilities: creditCardLiabilities + loanLiabilities,
      liabilityTransactionCount: creditCardTransactions.length + loanTransactions.length,
    };
  }, [filteredTransactions, transactions]);

  // Event handlers
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = (e) => {
    const value = parseInt(e.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };

  const handleCategoryChange = useCallback(
    (transactionId, value) => {
      setOriginalTransactionValues((prev) => {
        if (!prev[transactionId]) {
          const currentTransaction = transactions.find((txn) => txn.id === transactionId);
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
        prev.map((txn) => (txn.id === transactionId ? { ...txn, category: value } : txn))
      );
    },
    [transactions]
  );

  const handleTypeChange = useCallback(
    (transactionId, value) => {
      // Store original value if not already stored
      setOriginalTransactionValues((prev) => {
        if (!prev[transactionId]) {
          const currentTransaction = transactions.find((txn) => txn.id === transactionId);
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
        prev.map((txn) => (txn.id === transactionId ? { ...txn, type: value } : txn))
      );
    },
    [transactions]
  );

  // Helper function to update a single transaction
  const updateSingleTransaction = useCallback(async (transactionId, newCategory) => {
    try {
      const response = await axiosInstance.put(endpoints.transactions.update(transactionId), {
        category: newCategory,
      });
      if (response.data.success) {
        setTransactions((prev) =>
          prev.map((txn) => (txn.id === transactionId ? { ...txn, category: newCategory } : txn))
        );
        setCategoryUpdateMessage({ [transactionId]: 'success' });
        setModifiedRows((prev) => {
          const updated = { ...prev };
          delete updated[transactionId];
          return updated;
        });
      } else {
        throw new Error(response.data.message || 'Failed to update category');
      }
    } catch (err) {
      setCategoryUpdateMessage({ [transactionId]: 'error' });
      throw err;
    }
  }, []);

  // Helper function to update all transactions with same description
  const updateAllSimilarTransactions = useCallback(async (transactionId, newCategory) => {
    try {
      const response = await axiosInstance.put(
        endpoints.transactions.updateSimilarCategories(transactionId),
        { category: newCategory }
      );

      if (response.data.success) {
        const updatedTransactions = response.data.data.updatedTransactions || [];
        const updatedIds = updatedTransactions.map((txn) => txn._id);

        // Update all affected transactions in the local state
        setTransactions((prev) =>
          prev.map((txn) => (updatedIds.includes(txn.id) ? { ...txn, category: newCategory } : txn))
        );

        // Clear modified rows for all updated transactions
        setModifiedRows((prev) => {
          const updated = { ...prev };
          updatedIds.forEach((id) => delete updated[id]);
          return updated;
        });

        setCategoryUpdateMessage({ [transactionId]: 'success' });
        return response.data.data.updatedCount;
      } else {
        throw new Error(response.data.message || 'Failed to update categories');
      }
    } catch (err) {
      setCategoryUpdateMessage({ [transactionId]: 'error' });
      throw err;
    }
  }, []);

  // Helper function to update a single field
  const updateSingleTransactionField = useCallback(async (transactionId, field, value) => {
    try {
      const response = await axiosInstance.put(endpoints.transactions.update(transactionId), {
        [field]: value,
      });

      if (response.data.success) {
        setTransactions((prev) =>
          prev.map((txn) => (txn.id === transactionId ? { ...txn, [field]: value } : txn))
        );
        setCategoryUpdateMessage({ [transactionId]: 'success' });
        setModifiedRows((prev) => {
          const updated = { ...prev };
          delete updated[transactionId];
          return updated;
        });

        // Clear the selected values and original values after successful update
        if (field === 'category') {
          setSelectedCategories((prev) => {
            const updated = { ...prev };
            delete updated[transactionId];
            return updated;
          });
        }
        if (field === 'type') {
          setSelectedTypes((prev) => {
            const updated = { ...prev };
            delete updated[transactionId];
            return updated;
          });
        }
        // Clear original values after successful update
        setOriginalTransactionValues((prev) => {
          const updated = { ...prev };
          delete updated[transactionId];
          return updated;
        });
      } else {
        throw new Error(response.data.message || `Failed to update ${field}`);
      }
    } catch (err) {
      console.error(`❌ Error updating ${field}:`, err);
      setCategoryUpdateMessage({ [transactionId]: 'error' });
      throw err;
    }
  }, []);

  // Update the save handler to handle both category and type updates
  const handleUpdateCategoryAndType = useCallback(
    async (transactionId) => {
      const newCategory = selectedCategories.hasOwnProperty(transactionId)
        ? selectedCategories[transactionId]
        : transactions.find((txn) => txn.id === transactionId)?.category;
      const newType = selectedTypes.hasOwnProperty(transactionId)
        ? selectedTypes[transactionId]
        : transactions.find((txn) => txn.id === transactionId)?.type;

      // Get original values for comparison
      const originalValues = originalTransactionValues[transactionId];
      const currentTransaction = transactions.find((txn) => txn.id === transactionId);

      if (!currentTransaction) {
        setUpdatingCategoryId(null);
        return;
      }

      // Compare with original values, not current state
      const originalCategory = originalValues?.category || currentTransaction.category;
      const originalType = originalValues?.type || currentTransaction.type;

      const categoryChanged = newCategory !== originalCategory;
      const typeChanged = newType !== originalType;

      if (!categoryChanged && !typeChanged) {
        setUpdatingCategoryId(null);
        return;
      }

      setUpdatingCategoryId(transactionId);
      setCategoryUpdateMessage({});

      try {
        // If only type changed, update directly
        if (typeChanged && !categoryChanged) {
          await updateSingleTransactionField(transactionId, 'type', newType);
          return;
        }

        // If only category changed, use existing category logic
        if (categoryChanged && !typeChanged) {
          try {
            // Check for similar transactions for category
            const similarResponse = await axiosInstance.get(
              endpoints.transactions.findSimilar(transactionId),
              {
                params: { category: newCategory },
              }
            );

            const similarTransactions = similarResponse.data.data.similarTransactions || [];

            if (similarTransactions.length > 0) {
              setCategoryUpdateDialog({
                open: true,
                transactionId,
                currentTransaction,
                similarTransactions,
                newCategory,
                loading: false,
              });
              return;
            }
          } catch (similarError) {
            toast.error(
              '⚠️ Similar transactions API failed, proceeding with single update:'
            );
          }

          await updateSingleTransactionField(transactionId, 'category', newCategory);
          return;
        }

        // If both changed, update type directly and handle category with similar logic
        if (typeChanged && categoryChanged) {
          // Update type immediately
          await updateSingleTransactionField(transactionId, 'type', newType);

          try {
            // Check for similar transactions for category
            const similarResponse = await axiosInstance.get(
              endpoints.transactions.findSimilar(transactionId),
              {
                params: { category: newCategory },
              }
            );

            const similarTransactions = similarResponse.data.data.similarTransactions || [];

            if (similarTransactions.length > 0) {
              setCategoryUpdateDialog({
                open: true,
                transactionId,
                currentTransaction: { ...currentTransaction, type: newType },
                similarTransactions,
                newCategory,
                loading: false,
              });
              return;
            }
          } catch (similarError) {
            toast.error('Failed to fetch similar transactions');
          }

          // Update category as well
          await updateSingleTransactionField(transactionId, 'category', newCategory);
        }
      } catch (err) {
        console.error('❌ Error updating transaction:', err);
        setCategoryUpdateMessage({ [transactionId]: 'error' });
      } finally {
        setUpdatingCategoryId(null);
      }
    },
    [
      selectedCategories,
      selectedTypes,
      transactions,
      originalTransactionValues,
      updateSingleTransactionField,
    ]
  );

  // Category Update Dialog Handlers
  const handleCloseCategoryUpdateDialog = useCallback(() => {
    setCategoryUpdateDialog({
      open: false,
      transactionId: null,
      currentTransaction: null,
      similarTransactions: [],
      newCategory: '',
      loading: false,
    });
  }, []);

  const handleUpdateSingleCategory = useCallback(async () => {
    const { transactionId, newCategory } = categoryUpdateDialog;
    if (!transactionId || !newCategory) return;

    setCategoryUpdateDialog((prev) => ({ ...prev, loading: true }));
    setUpdatingCategoryId(transactionId);

    try {
      await updateSingleTransaction(transactionId, newCategory);
      handleCloseCategoryUpdateDialog();
    } catch (err) {
      console.error('Error updating single transaction:', err);
    } finally {
      setUpdatingCategoryId(null);
      setCategoryUpdateDialog((prev) => ({ ...prev, loading: false }));
    }
  }, [categoryUpdateDialog, updateSingleTransaction, handleCloseCategoryUpdateDialog]);

  const handleUpdateAllCategories = useCallback(async () => {
    const { transactionId, newCategory } = categoryUpdateDialog;
    if (!transactionId || !newCategory) return;

    setCategoryUpdateDialog((prev) => ({ ...prev, loading: true }));
    setUpdatingCategoryId(transactionId);

    try {
      const updatedCount = await updateAllSimilarTransactions(transactionId, newCategory);
      handleCloseCategoryUpdateDialog();
    } catch (err) {
      console.error('Error updating all similar transactions:', err);
    } finally {
      setUpdatingCategoryId(null);
      setCategoryUpdateDialog((prev) => ({ ...prev, loading: false }));
    }
  }, [categoryUpdateDialog, updateAllSimilarTransactions, handleCloseCategoryUpdateDialog]);

  const handleSearchTransaction = useCallback((description) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(description)}`, '_blank');
  }, []);

  const handleFilterChange = useCallback((name, value) => {
    setPage(0);
    setFilter((prev) => {
      const newFilter = {
        ...prev,
        [name]: value,
      };

      // Reset dependent filters when account type changes
      if (name === 'accountType') {
        newFilter.account = 'all';
        newFilter.selectedStatement = 'all';
      }

      // Reset statement when account changes
      if (name === 'account') {
        newFilter.selectedStatement = 'all';
      }

      return newFilter;
    });
  }, []);

  const handleOpenEditDialog = useCallback((transaction) => {
    setEditTransaction({
      ...transaction,
      date: transaction.rawDate ? new Date(transaction.rawDate).toISOString().split('T')[0] : '',
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
        endpoints.transactions.update(editTransaction.id),
        updates
      );
      if (response.data.success) {
        setEditTransactionMessage({ type: 'success', text: 'Transaction updated!' });
        setTransactions((prev) =>
          prev.map((txn) =>
            txn.id === editTransaction.id
              ? {
                ...txn,
                ...updates,
                amount: updates.debit ? -Math.abs(updates.debit) : Math.abs(updates.credit),
              }
              : txn
          )
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
      const response = await axiosInstance.delete(
        endpoints.transactions.delete(deleteTransactionId)
      );
      if (response.data.success) {
        setTransactions((prev) => prev.filter((txn) => txn.id !== deleteTransactionId));
        toast.success('Transaction deleted successfully');
        setTimeout(() => {
          setIsDeletingTransaction(false);
          handleCloseDeleteDialog();
        }, 800);
      } else {
        throw new Error(response.data.message || 'Failed to delete');
      }
    } catch (err) {
      setIsDeletingTransaction(false);
      const errorMessage = err?.message || err?.error || 'Failed to delete transaction';
      toast.error(errorMessage);
      console.error('Delete transaction error:', err);
    }
  }, [deleteTransactionId, handleCloseDeleteDialog]);

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
      type: 'debit',
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

    if (!newTransaction.date) errors.push('Date is required');
    if (!newTransaction.account) errors.push('Account is required');
    if (!newTransaction.description.trim()) errors.push('Description is required');
    if (newTransaction.description.trim().length < 3)
      errors.push('Description must be at least 3 characters');
    if (newTransaction.vendor && newTransaction.vendor.trim().length < 3) {
      errors.push('Vendor must be at least 3 characters');
    }
    if (!newTransaction.category) errors.push('Category is required');
    if (!newTransaction.type) errors.push('Type is required');
    if (
      !newTransaction.amount ||
      isNaN(parseFloat(newTransaction.amount)) ||
      parseFloat(newTransaction.amount) <= 0
    ) {
      errors.push('Valid amount is required');
    }
    if (!newTransaction.transactionType) errors.push('Transaction type is required');

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
      const selectedAccount = availableAccounts.find((acc) => acc.id === newTransaction.account);

      // Prepare transaction data for API
      const transactionData = {
        companyId: selectedCompany._id,
        date: newTransaction.date,
        description: newTransaction.description.trim(),
        vendor: newTransaction.vendor.trim() || null,
        category: newTransaction.category,
        type: newTransaction.type,
        note: newTransaction.note || null,
        debit: newTransaction.transactionType === 'debit' ? amount : null,
        credit: newTransaction.transactionType === 'credit' ? amount : null,
        accountType: selectedAccount?.type,
        accountId: selectedAccount?.originalId,
        statementId: null,
      };

      // Call API to create transaction
      const response = await axiosInstance.post(endpoints.transactions.create, transactionData);

      if (response.data.success) {
        // Show success message
        setAddTransactionMessage({
          type: 'success',
          text: 'Transaction added successfully!',
        });

        // Add the new transaction to the local state
        const newTxn = response.data.data.transaction;
        const formattedTransaction = {
          id: newTxn._id,
          date: formatDate(newTxn.date),
          rawDate: newTxn.date,
          description: newTxn.description,
          vendor: newTxn.vendor,
          source: getSourceDisplay(newTxn, availableAccounts),
          category: newTxn.category,
          type: newTxn.type,
          debit: newTxn.debit || null,
          credit: newTxn.credit || null,
          amount: newTxn.debit
            ? -Math.abs(newTxn.debit)
            : newTxn.credit
              ? Math.abs(newTxn.credit)
              : 0,
          accountType: newTxn.accountType,
          accountId: newTxn.accountId,
          statementId: null,
          matchedDocuments: [],
          hasMatches: false,
          linkedCreditCardStatements: [],
          note: newTxn.note || null,
          createdBy: newTxn.createdBy,
          createdAt: newTxn.createdAt,
          updatedAt: newTxn.updatedAt,
        };

        // Add to transactions list and sort
        setTransactions((prev) => {
          const updated = [formattedTransaction, ...prev];
          return updated.sort((a, b) => {
            const dateA = new Date(a.rawDate);
            const dateB = new Date(b.rawDate);
            return dateA - dateB;
          });
        });

        // Close dialog after a short delay to show success message
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
        text: err.response?.data?.message || 'Failed to add transaction. Please try again.',
      });
    } finally {
      setIsAddingTransaction(false);
    }
  }, [
    validateTransaction,
    selectedCompany?._id,
    availableAccounts,
    newTransaction,
    handleCloseAddDialog,
  ]);

  const isFormValid = useMemo(() => {
    return (
      newTransaction.date &&
      newTransaction.account &&
      newTransaction.description.trim() &&
      newTransaction.category &&
      newTransaction.type &&
      newTransaction.amount &&
      !isNaN(parseFloat(newTransaction.amount)) &&
      parseFloat(newTransaction.amount) > 0 &&
      newTransaction.transactionType
    );
  }, [newTransaction]);

  // Helper function to get display value for selected account
  const getSelectedAccountDisplay = useCallback(
    (accountId) => {
      const account = availableAccounts.find((acc) => acc.id === accountId);
      return account ? account.shortDisplayName : '';
    },
    [availableAccounts]
  );

  const handleExpandRow = useCallback((transactionId) => {
    setExpandedTransactions((prev) => ({
      ...prev,
      [transactionId]: !prev[transactionId],
    }));
  }, []);

  const handleManualMatch = useCallback((transaction) => {
    setManualMatchDialog({
      open: true,
      transaction,
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

  // Update the handleUnlinkCreditCard function with better optimistic updates
  const handleUnlinkCreditCard = useCallback(async (transactionId, statementId) => {
    // Add loading state
    setUpdatingTransactions(prev => new Set([...prev, transactionId]));

    try {
      const response = await axiosInstance.post(endpoints.matching.unlinkCreditCard, {
        transactionId,
        statementId
      });

      if (response.data.success) {
        // Optimistically update ALL transactions that might have this statement linked
        setTransactions(prev =>
          prev.map(txn => {
            // Remove the statement from the current transaction
            if (txn.id === transactionId) {
              return {
                ...txn,
                linkedCreditCardStatements: txn.linkedCreditCardStatements.filter(
                  link => (link.statementId?._id || link.statementId) !== statementId
                )
              };
            }

            if (txn.linkedCreditCardStatements && txn.linkedCreditCardStatements.some(
              link => (link.statementId?._id || link.statementId) === statementId
            )) {
              return { ...txn };
            }

            return txn;
          })
        );

      } else {
        throw new Error(response.data.message || 'Failed to unlink credit card statement');
      }
    } catch (error) {
      console.error('Failed to unlink credit card statement:', error);
      // Show error notification
      alert('Failed to unlink credit card statement. Please try again.');
    } finally {
      // Remove loading state
      setUpdatingTransactions(prev => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        return newSet;
      });
    }
  }, []);

  const handleViewCreditCardStatement = useCallback((statementId) => {
    // Navigate to credit card statement view page
    window.open(`/statements/credit-card/${statementId}`, '_blank');
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

  const handleUploadMatch = useCallback((transaction) => {
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

  const handleMatchSuccess = useCallback(
    (updatedTransaction, actionType = 'document_match') => {
      if (actionType === 'credit_card_link') {
        // Handle credit card linking with proper optimistic update
        setTransactions((prev) =>
          prev.map((txn) => {
            if (txn.id === updatedTransaction.transactionId) {
              // Find the full transaction data from the response
              const fullTransactionData = updatedTransaction.transaction || {
                ...txn,
                linkedCreditCardStatements: updatedTransaction.linkedCreditCardStatements || []
              };

              // Update the transaction with new linked credit card statements
              return {
                ...txn,
                linkedCreditCardStatements: fullTransactionData.linkedCreditCardStatements || []
              };
            }
            // Also check if this transaction has the same statement linked (for multi-transaction updates)
            if (txn.linkedCreditCardStatements && updatedTransaction.linkedCreditCardStatements) {
              const hasSharedStatement = txn.linkedCreditCardStatements.some(link =>
                updatedTransaction.linkedCreditCardStatements.some(newLink =>
                  (link.statementId?._id || link.statementId) === (newLink.statementId?._id || newLink.statementId)
                )
              );
              if (hasSharedStatement) {
                // Force re-render for transactions with shared statements
                return { ...txn };
              }
            }
            return txn;
          })
        );
      } else {
        // Handle document matching updates
        setTransactions((prev) =>
          prev.map((txn) =>
            txn.id === updatedTransaction.id ? updatedTransaction : txn
          )
        );
      }

      // Close any open dialogs
      setManualMatchDialog({ open: false, transaction: null });
      setCreditCardLinkDialog({ open: false, transaction: null });
      setUploadMatchDialog({ open: false, transaction: null });
    },
    []
  );

  const handleRemoveMatch = useCallback(
    async (transactionId, documentId) => {
      try {
        // Add to updating set
        setUpdatingTransactions(prev => new Set(prev).add(transactionId));

        const response = await axiosInstance.delete(endpoints.matching.remove, {
          data: { transactionId, documentId }
        });

        if (response.data.success) {
          // Optimistically update the transaction
          setTransactions(prev =>
            prev.map(txn =>
              txn.id === transactionId
                ? {
                  ...txn,
                  matchedDocuments: txn.matchedDocuments?.filter(doc => doc._id !== documentId) || []
                }
                : txn
            )
          );
        }
      } catch (error) {
        console.error('Failed to remove match:', error);
      } finally {
        // Remove from updating set
        setUpdatingTransactions(prev => {
          const newSet = new Set(prev);
          newSet.delete(transactionId);
          return newSet;
        });
      }
    },
    []
  );

  const handleViewDocumentDetails = useCallback((document) => {
    setDocumentDetailDialog({
      open: true,
      document,
    });
  }, []);

  // Handle document updates (for item category changes)
  const handleDocumentUpdate = useCallback((updatedDocument) => {
    setTransactions((prev) =>
      prev.map((txn) => ({
        ...txn,
        matchedDocuments: txn.matchedDocuments.map((doc) =>
          doc._id === updatedDocument._id ? updatedDocument : doc
        ),
      }))
    );
  }, []);

  const handleCloseDocumentDetails = useCallback(() => {
    setDocumentDetailDialog({
      open: false,
      document: null,
    });
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

  const handleSaveNote = useCallback(async (noteText) => {
    const { transaction } = noteDialog;
    if (!transaction) return;

    setNoteDialog(prev => ({ ...prev, loading: true }));
    console.log('Saving note:', noteText);
    try {
      const response = await axiosInstance.put(endpoints.transactions.update(transaction.id), {
        note: noteText || null,
      });

      if (!response.data.success) {
        throw new Error('Failed to update note');
      }
      // Update local state
      setTransactions(prev =>
        prev.map(txn =>
          (txn.id === transaction.id || txn._id === transaction._id)
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
      setNoteDialog(prev => ({ ...prev, loading: false }));
    }
  }, [noteDialog, handleCloseNoteDialog]);

  const paginatedTransactions = useMemo(() => {
    if (rowsPerPage === -1) {
      return filteredTransactions;
    }
    return filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredTransactions, page, rowsPerPage]);

  const getPageTitle = useCallback(() => {
    if (statementId && statementType) {
      return `${statementType === 'bank' ? 'Bank' : 'Card'} Statement Transactions`;
    }
    return 'All Transactions';
  }, [statementId, statementType]);

  if (loading) {
    return (
      <DashboardContent>
        <Stack spacing={3}>
          {/* Header Skeleton */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 1 }} />
          </Stack>

          {/* Summary Cards Skeleton */}
          <Grid container spacing={2}>
            {Array.from({ length: 4 }, (_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Skeleton variant="text" width="60%" height={16} />
                      <Skeleton variant="text" width="40%" height={24} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Filters Skeleton */}
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Skeleton variant="text" width={100} height={24} />
                <Grid container spacing={3}>
                  {Array.from({ length: 6 }, (_, index) => (
                    <Grid item xs={12} sm={6} md={2} key={index}>
                      <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          {/* Table Skeleton */}
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
        </Stack>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent>
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">{getPageTitle()}</Typography>
        {!statementId && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleOpenAddDialog}
          >
            Add Transaction
          </Button>
        )}
      </Stack>

      {statementId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Filtered View</AlertTitle>
          Showing transactions from a specific {statementType === 'bank' ? 'bank' : 'card'}{' '}
          statement.
          <Button
            size="small"
            onClick={() => (window.location.href = '/dashboard/transactions')}
            sx={{ ml: 1 }}
          >
            View All Transactions
          </Button>
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3} lg={1.7}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                >
                  Total Expenses
                </Typography>
                <Avatar
                  sx={{
                    backgroundColor: 'error.lighter',
                    width: 32,
                    height: 32,
                  }}
                >
                  <Iconify icon="eva:diagonal-arrow-right-up-fill" color="error.main" width={16} />
                </Avatar>
              </Stack>
              <Typography variant="h5" sx={{ fontSize: '1.25rem' }}>
                {fCurrency(summaryData.totalDebit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={1.7}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                >
                  Total Income
                </Typography>
                <Avatar
                  sx={{
                    backgroundColor: 'success.lighter',
                    width: 32,
                    height: 32,
                  }}
                >
                  <Iconify
                    icon="eva:diagonal-arrow-left-down-fill"
                    color="success.main"
                    width={16}
                  />
                </Avatar>
              </Stack>
              <Typography variant="h5" sx={{ fontSize: '1.25rem' }}>
                {fCurrency(summaryData.totalCredit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={1.7}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                >
                  Net Amount
                </Typography>
                <Avatar
                  sx={{
                    backgroundColor:
                      summaryData.netAmount >= 0 ? 'success.lighter' : 'error.lighter',
                    width: 32,
                    height: 32,
                  }}
                >
                  <Iconify
                    icon={
                      summaryData.netAmount >= 0 ? 'eva:trending-up-fill' : 'eva:trending-down-fill'
                    }
                    color={summaryData.netAmount >= 0 ? 'success.main' : 'error.main'}
                    width={16}
                  />
                </Avatar>
              </Stack>
              <Typography
                variant="h5"
                color={summaryData.netAmount >= 0 ? 'success.main' : 'error.main'}
                sx={{ fontSize: '1.25rem' }}
              >
                {fCurrency(summaryData.netAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={1.7}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                >
                  Avg Income
                </Typography>
                <Avatar
                  sx={{
                    backgroundColor: 'info.lighter',
                    width: 32,
                    height: 32,
                  }}
                >
                  <Iconify icon="eva:bar-chart-2-fill" color="info.main" width={16} />
                </Avatar>
              </Stack>
              <Typography variant="h5" sx={{ fontSize: '1.25rem' }}>
                {fCurrency(summaryData.avgCredit || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={1.7}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                >
                  Avg Expenses
                </Typography>
                <Avatar
                  sx={{
                    backgroundColor: 'warning.lighter',
                    width: 32,
                    height: 32,
                  }}
                >
                  <Iconify icon="eva:bar-chart-fill" color="warning.main" width={16} />
                </Avatar>
              </Stack>
              <Typography variant="h5" sx={{ fontSize: '1.25rem' }}>
                {fCurrency(summaryData.avgDebit || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={1.7}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                >
                  Total Transactions
                </Typography>
                <Avatar
                  sx={{
                    backgroundColor: 'primary.lighter',
                    width: 32,
                    height: 32,
                  }}
                >
                  <Iconify icon="eva:hash-fill" color="primary.main" width={16} />
                </Avatar>
              </Stack>
              <Typography variant="h5" sx={{ fontSize: '1.25rem' }}>
                {summaryData.transactionCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={1.7}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                >
                  Total Liabilities
                </Typography>
                <Avatar
                  sx={{
                    backgroundColor: 'error.lighter',
                    width: 32,
                    height: 32,
                  }}
                >
                  <Iconify icon="eva:alert-triangle-fill" color="error.main" width={16} />
                </Avatar>
              </Stack>
              <Typography variant="h5" sx={{ fontSize: '1.25rem' }}>
                {fCurrency(liabilities.netLiabilities || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters - Row 1: All Filter Controls */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{
          mb: 2,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          rowGap: 2,
          columnGap: 2,
          overflowX: { xs: 'auto', md: 'visible' },
          '& > *': {
            flexShrink: 0,
          },
        }}
      >
        <FormControl sx={{ minWidth: { xs: 120, sm: 130 } }} size="small">
          <InputLabel id="date-range-label">Date Range</InputLabel>
          <Select
            labelId="date-range-label"
            value={filter.dateRange}
            label="Date Range"
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            {FILTER_OPTIONS.dateRange.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: { xs: 120, sm: 130 } }} size="small">
          <InputLabel id="account-type-label">Account Type</InputLabel>
          <Select
            labelId="account-type-label"
            value={filter.accountType}
            label="Account Type"
            onChange={(e) => handleFilterChange('accountType', e.target.value)}
          >
            {FILTER_OPTIONS.accountType.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          sx={{ minWidth: { xs: 150, sm: 170 } }}
          size="small"
        >
          <InputLabel id="account-filter-label">Account</InputLabel>
          <Select
            labelId="account-filter-label"
            value={filter.account}
            label="Account"
            onChange={(e) => handleFilterChange('account', e.target.value)}
          >
            <MenuItem value="all">All Accounts</MenuItem>
            {availableAccounts
              .filter((acc) => filter.accountType === 'all' || acc.type === filter.accountType)
              .map((acc) => (
                <MenuItem key={acc.id} value={acc.id}>
                  <Tooltip title={acc.fullDisplayName} arrow placement="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify
                        icon={
                          acc.type === 'bank_account'
                            ? 'ph:bank-bold'
                            : acc.type === 'credit_card'
                              ? 'ph:credit-card-bold'
                              : 'mdi:cash'
                        }
                        width={16}
                        color={
                          acc.type === 'bank_account'
                            ? 'primary.main'
                            : acc.type === 'credit_card'
                              ? 'secondary.main'
                              : 'success.main'
                        }
                      />
                      <span>{acc.displayName}</span>
                    </Box>
                  </Tooltip>
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl
          sx={{ minWidth: { xs: 120, sm: 140 } }}
          size="small"
          disabled={filter.account === 'all' || filter.accountType === 'cash_account'}
        >
          <InputLabel id="statement-select-label">Statement</InputLabel>
          <Select
            labelId="statement-select-label"
            value={filter.selectedStatement}
            label="Statement"
            onChange={(e) => handleFilterChange('selectedStatement', e.target.value)}
          >
            <MenuItem value="all">All Statements</MenuItem>
            {filter.accountType !== 'cash_account' && availableStatements
              .filter((stmt) => {
                if (filter.account === 'all') {
                  // Show statements matching the selected account type
                  if (filter.accountType === 'all') return true;
                  return (filter.accountType === 'bank_account' && stmt.type === 'bank') ||
                    (filter.accountType === 'credit_card' && stmt.type === 'credit_card');
                }

                const selectedAccount = availableAccounts.find((acc) => acc.id === filter.account);
                if (!selectedAccount) return false;

                return (
                  (selectedAccount.type === 'bank_account' && stmt.type === 'bank' && stmt.accountId === selectedAccount.originalId) ||
                  (selectedAccount.type === 'credit_card' && stmt.type === 'credit_card' && stmt.accountId === selectedAccount.originalId)
                );
              })
              .sort((a, b) => {
                const startDateA = a.statementPeriod?.startDate ? new Date(a.statementPeriod.startDate) : new Date(0);
                const startDateB = b.statementPeriod?.startDate ? new Date(b.statementPeriod.startDate) : new Date(0);
                if (startDateA.getTime() !== startDateB.getTime()) {
                  return startDateB - startDateA;
                }
                const endDateA = a.statementPeriod?.endDate ? new Date(a.statementPeriod.endDate) : new Date(0);
                const endDateB = b.statementPeriod?.endDate ? new Date(b.statementPeriod.endDate) : new Date(0);
                return endDateB - endDateA;
              })
              .map((statement) => (
                <MenuItem key={statement._id} value={statement._id}>
                  <Tooltip title={statement.displayName} arrow placement="right">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify
                        icon={statement.type === 'bank' ? 'ph:bank-bold' : 'ph:credit-card-bold'}
                        width={16}
                        color={statement.type === 'bank' ? 'primary.main' : 'secondary.main'}
                      />
                      <span>{formatStatementPeriod(statement)}</span>
                    </Stack>
                  </Tooltip>
                </MenuItem>
              ))}
            <MenuItem value="manual">Manual Transactions</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: { xs: 100, sm: 110 } }} size="small">
          <InputLabel id="matching-status-label">Matching</InputLabel>
          <Select
            labelId="matching-status-label"
            value={filter.matchingStatus}
            label="Matching"
            onChange={(e) => handleFilterChange('matchingStatus', e.target.value)}
          >
            {FILTER_OPTIONS.matchingStatus.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: { xs: 100, sm: 110 } }} size="small">
          <InputLabel id="transaction-type-label">Type</InputLabel>
          <Select
            labelId="transaction-type-label"
            value={filter.transactionType}
            label="Type"
            onChange={(e) => handleFilterChange('transactionType', e.target.value)}
          >
            {FILTER_OPTIONS.transactionType.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Search and Actions - Row 2 */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{
          mb: 3,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          rowGap: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search transactions or sources..."
          value={filter.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flexGrow: 1,
            minWidth: { xs: '100%', sm: 420 },
            maxWidth: { sm: 680, md: 820 },
          }}
        />

        <Button
          variant="outlined"
          size="small"
          onClick={() =>
            setFilter({
              dateRange: 'all',
              accountType: 'all',
              account: 'all',
              selectedStatement: 'all',
              matchingStatus: 'all',
              transactionType: 'all',
              search: '',
            })
          }
          startIcon={<Iconify icon="eva:refresh-fill" />}
          sx={{
            ml: { sm: 'auto' },
            whiteSpace: 'nowrap',
            minWidth: { xs: 'auto', sm: 130 },
            flexShrink: 0,
          }}
        >
          Clear Filters
        </Button>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            minWidth: { xs: 'auto', sm: 150 },
            textAlign: { xs: 'center', sm: 'left' },
            flex: { xs: '1 1 100%', sm: '0 0 auto' },
            order: { xs: 3, sm: 0 },
          }}
        >
          {filteredTransactions.length} of {transactions.length} transactions
        </Typography>
      </Stack>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, overflow: 'unset', width: '100%' }}>
            <Table size="small" sx={{ tableLayout: 'fixed' }}>
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
                        fontSize: '0.8rem',
                      }}
                    >
                      <Typography
                        noWrap
                        variant="subtitle2"
                        sx={{ fontSize: '0.80rem', fontWeight: 'bold' }}
                      >
                        {column.label}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedTransactions.map((row, index) => {
                  const categoryValue =
                    selectedCategories[row.id] || row.category || 'Uncategorized';
                  const typeValue = selectedTypes[row.id] || row.type || 'Business';
                  const isExpanded = expandedTransactions[row.id];
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow hover>
                        <TableCell sx={{ padding: '6px 12px' }}>
                          <Typography variant="body2" color="text.secondary">
                            {rowsPerPage === -1
                              ? filteredTransactions.indexOf(row) + 1
                              : page * rowsPerPage + index + 1}
                            .
                          </Typography>
                        </TableCell>

                        {/* Expand Column */}
                        <TableCell sx={{ padding: '6px 12px' }}>
                          <IconButton size="small" onClick={() => handleExpandRow(row.id)}>
                            <Iconify
                              icon={isExpanded ? 'ph:caret-down-bold' : 'ph:caret-right-bold'}
                              width={16}
                            />
                          </IconButton>
                        </TableCell>

                        <TableCell
                          sx={{ whiteSpace: 'nowrap', padding: '6px 12px', fontSize: '0.80rem' }}
                        >
                          {row.date}
                        </TableCell>
                        <TableCell sx={{ padding: '6px 12px', fontSize: '0.80rem', width: 300 }}>
                          <Tooltip title={row.description}>
                            <Typography noWrap sx={{ fontSize: '0.80rem', maxWidth: 300 }}>
                              {row.description}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ width: 180, padding: '6px 12px', fontSize: '0.80rem' }}>
                          <CategorySelector
                            value={categoryValue}
                            onChange={(value) => handleCategoryChange(row.id, value)}
                            transactionType={row.debit ? 'debit' : 'credit'}
                            isPersonal={typeValue === 'Personal'}
                            size="small"
                            showAddOption={true}
                            showDeleteOption={true}
                            sx={{ fontSize: '0.80rem', height: 28 }}
                          />
                        </TableCell>
                        <TableCell sx={{ width: 100, padding: '6px 12px', fontSize: '0.80rem' }}>
                          <FormControl fullWidth size="small">
                            <Select
                              value={typeValue}
                              onChange={(e) => handleTypeChange(row.id, e.target.value)}
                              size="small"
                              sx={{ fontSize: '0.80rem', height: 28 }}
                            >
                              <MenuItem value="Business" sx={{ fontSize: '0.80rem' }}>
                                Business
                              </MenuItem>
                              <MenuItem value="Personal" sx={{ fontSize: '0.80rem' }}>
                                Personal
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="right" sx={{ padding: '6px 12px', fontSize: '0.80rem' }}>
                          {row.debit ? (
                            <Typography
                              variant="body2"
                              color="error.main"
                              sx={{ fontSize: '0.80rem' }}
                            >
                              {fCurrency(row.debit)}
                            </Typography>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ padding: '6px 12px', fontSize: '0.80rem' }}>
                          {row.credit ? (
                            <Typography
                              variant="body2"
                              color="success.main"
                              sx={{ fontSize: '0.80rem' }}
                            >
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
                            >
                              <Iconify
                                icon={row.note ? "mdi:note-edit" : "mdi:note-plus"}
                                width={16}
                              />
                            </IconButton>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ padding: '6px 12px', fontSize: '0.80rem' }}>
                          <TransactionMatchingCell
                            transaction={row}
                            onManualMatch={handleManualMatch}
                            allTransactions={transactions}
                            statementTotals={statementTotals}
                            isUpdating={updatingTransactions.has(row.id)}
                          />
                        </TableCell>
                        <TableCell sx={{ padding: '6px 12px', fontSize: '0.8rem' }}>
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
                                  disabled={!modifiedRows[row.id] || updatingCategoryId === row.id}
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
                            >
                              <Iconify icon="ph:pencil-bold" width={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(row.id)}
                              title="Delete Transaction"
                              sx={{ padding: '2px' }}
                            >
                              <Iconify icon="ph:trash-bold" width={16} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>

                      {/* Document Header and Items Rows - Show each document followed by its items */}
                      {isExpanded &&
                        row.hasMatches &&
                        row.matchedDocuments.map((document) => (
                          <React.Fragment key={`${row.id}-doc-${document._id}`}>
                            {/* Document Header Row */}
                            <TableRow>
                              <TableCell
                                colSpan={9}
                                sx={{
                                  py: 1,
                                  border: 0,
                                  bgcolor: 'background.neutral',
                                  width: '100%',
                                }}
                              >
                                <Box sx={{ pl: 6, overflow: 'hidden' }}>
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                  >
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                      <Avatar
                                        sx={{
                                          width: 24,
                                          height: 24,
                                          bgcolor:
                                            document.documentType === 'Invoice'
                                              ? 'primary.main'
                                              : document.documentType === 'Bill'
                                                ? 'info.main'
                                                : 'secondary.main',
                                        }}
                                      >
                                        <Iconify
                                          icon={
                                            document.documentType === 'Invoice'
                                              ? 'mdi:file-invoice'
                                              : document.documentType === 'Bill'
                                                ? 'mdi:file-document'
                                                : 'mdi:receipt'
                                          }
                                          width={12}
                                        />
                                      </Avatar>

                                      <Box>
                                        <Typography
                                          variant="body2"
                                          fontWeight="medium"
                                          sx={{
                                            fontSize: '0.875rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: '400px',
                                          }}
                                        >
                                          {getVendorName(document)} • {document.documentType} •{' '}
                                          {getDocumentDate(document)
                                            ? new Date(
                                              getDocumentDate(document)
                                            ).toLocaleDateString()
                                            : 'No date'}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="primary.main"
                                          fontWeight="bold"
                                        >
                                          Total: {fCurrency(document.total || 0)}
                                        </Typography>
                                      </Box>
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
                          // Calculate combined info for this statement with debugging
                          const statementId = ccStatement.statementId?._id || ccStatement.statementId;
                          const statementTotal = statementTotals[statementId] || 0;

                          // Find all transactions linked to this same statement
                          const linkedTransactions = transactions.filter(txn => {
                            const hasLink = txn.linkedCreditCardStatements &&
                              txn.linkedCreditCardStatements.some(ccStmt =>
                                (ccStmt.statementId?._id || ccStmt.statementId) === statementId
                              );

                            return hasLink;
                          });

                          // Calculate totals with detailed logging
                          const totalBankPayments = linkedTransactions.reduce((sum, txn, txnIndex) => {
                            const amount = Math.abs(txn.debit || txn.credit || 0);
                            return sum + amount;
                          }, 0);

                          const totalAdjustments = linkedTransactions.reduce((sum, txn, txnIndex) => {
                            const txnCcStatement = txn.linkedCreditCardStatements.find(ccStmt =>
                              (ccStmt.statementId?._id || ccStmt.statementId) === statementId
                            );
                            const adjustment = txnCcStatement?.adjustmentAmount || 0;
                            return sum + adjustment;
                          }, 0);

                          const combinedPaidAmount = totalBankPayments + totalAdjustments;
                          const combinedDifference = statementTotal - combinedPaidAmount;

                          const currentTransactionAmount = Math.abs(row.debit || row.credit || 0);
                          const currentAdjustment = ccStatement.adjustmentAmount || 0;

                          return (
                            <React.Fragment key={`${row.id}-cc-${statementId || index}`}>
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
                                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minWidth: 0, flex: '0 0 auto' }}>
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
                                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                            <Typography variant="h6" fontWeight="bold" color="secondary.main" sx={{ fontSize: '1.1rem' }}>
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
                                                fontWeight: 'bold'
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
                                                  fontWeight: 'medium'
                                                }}
                                              />
                                            )}
                                          </Stack>

                                          <Tooltip title={ccStatement.statementId?.fileName || `Statement ${index + 1}`}>
                                            <Typography
                                              variant="body2"
                                              color="text.primary"
                                              sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.875rem', maxWidth: 200 }}
                                              noWrap
                                            >
                                              {ccStatement.statementId?.fileName || `Statement ${index + 1}`}
                                            </Typography>
                                          </Tooltip>

                                          {ccStatement.statementId?.statementPeriod && (
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                              Period: {formatDate(ccStatement.statementId.statementPeriod.startDate)} - {formatDate(ccStatement.statementId.statementPeriod.endDate)}
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
                                                justifyContent: 'center'
                                              }}
                                            >
                                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.5 }}>
                                                Statement Total
                                              </Typography>
                                              <Typography variant="h6" color="secondary.main" fontWeight="bold" sx={{ fontSize: '1.25rem' }}>
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
                                                justifyContent: 'center'
                                              }}
                                            >
                                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.5 }}>
                                                This Transaction
                                              </Typography>
                                              <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ fontSize: '1.25rem' }}>
                                                {fCurrency(currentTransactionAmount)}
                                              </Typography>
                                              {currentAdjustment > 0 && (
                                                <Typography variant="caption" color="info.main" sx={{ fontSize: '0.7rem', fontWeight: 600, mt: 0.5 }}>
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
                                                justifyContent: 'center'
                                              }}
                                            >
                                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.5 }}>
                                                Total Paid
                                              </Typography>
                                              <Typography variant="h6" color="success.main" fontWeight="bold" sx={{ fontSize: '1.25rem' }}>
                                                {fCurrency(combinedPaidAmount)}
                                              </Typography>
                                              <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mt: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                  Bank: {fCurrency(totalBankPayments)}
                                                </Typography>
                                                {totalAdjustments > 0 && (
                                                  <>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                      •
                                                    </Typography>
                                                    <Typography variant="caption" color="info.main" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
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
                                                bgcolor: Math.abs(combinedDifference) <= 0.01 ? 'success.lighter' : 'warning.lighter',
                                                border: '1px solid',
                                                borderColor: Math.abs(combinedDifference) <= 0.01 ? 'success.main' : 'warning.main',
                                                borderRadius: 2,
                                                textAlign: 'center',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center'
                                              }}
                                            >
                                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.5 }}>
                                                Status
                                              </Typography>
                                              <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                color={Math.abs(combinedDifference) <= 0.01 ? "success.main" : "warning.main"}
                                                sx={{ fontSize: '1.1rem' }}
                                              >
                                                {Math.abs(combinedDifference) <= 0.01 ?
                                                  "✓ Fully Paid" :
                                                  combinedDifference > 0 ?
                                                    `${fCurrency(combinedDifference)} Remaining` :
                                                    `${fCurrency(Math.abs(combinedDifference))} Overpaid`
                                                }
                                              </Typography>
                                            </Paper>
                                          </Grid>
                                        </Grid>
                                      </Box>

                                      {/* Right Section - Actions */}
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: '0 0 auto' }}>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          color="primary"
                                          onClick={() => handleViewCreditCardStatement(statementId)}
                                          startIcon={<Iconify icon="mdi:eye" />}
                                          sx={{
                                            fontSize: '0.8rem',
                                            minWidth: 'auto',
                                            px: 2,
                                            py: 1,
                                            fontWeight: 600
                                          }}
                                        >
                                          View Statement
                                        </Button>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          color="info"
                                          onClick={() => handleEditAdjustment(row, ccStatement, currentAdjustment)}
                                          startIcon={<Iconify icon="mdi:pencil" />}
                                          disabled={updatingTransactions.has(row.id)}
                                          sx={{
                                            fontSize: '0.8rem',
                                            minWidth: 'auto',
                                            px: 2,
                                            py: 1,
                                            fontWeight: 600
                                          }}
                                        >
                                          Edit Adjustment
                                        </Button>

                                        <Button
                                          size="small"
                                          variant="outlined"
                                          color="error"
                                          onClick={() => handleUnlinkCreditCard(row.id, statementId)}
                                          startIcon={<Iconify icon="mdi:unlink" />}
                                          disabled={updatingTransactions.has(row.id)}
                                          sx={{
                                            fontSize: '0.8rem',
                                            minWidth: 'auto',
                                            px: 2,
                                            py: 1,
                                            fontWeight: 600
                                          }}
                                        >
                                          {updatingTransactions.has(row.id) ? 'Unlinking...' : 'Unlink'}
                                        </Button>
                                      </Box>
                                    </Stack>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          );
                        })
                      }

                      {/* No matches message */}
                      {isExpanded &&
                        !row.hasMatches &&
                        (!row.linkedCreditCardStatements || row.linkedCreditCardStatements.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={9} sx={{ py: 2, border: 0, width: '100%' }}>
                              <Box sx={{ textAlign: 'center', pl: 6 }}>
                                <Iconify
                                  icon="mdi:link-off"
                                  width={32}
                                  sx={{ color: 'text.disabled', mb: 1 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  No matched documents
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
                })}
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
          count={filteredTransactions.length}
          page={rowsPerPage === -1 ? 0 : page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:plus-fill" width={24} />
            <Typography variant="h6">Add New Transaction</Typography>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {/* Show success/error message */}
          {addTransactionMessage.text && (
            <Alert
              severity={addTransactionMessage.type}
              sx={{ mb: 2 }}
              onClose={() => setAddTransactionMessage({ type: '', text: '' })}
            >
              {addTransactionMessage.text}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => handleNewTransactionChange('date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={isAddingTransaction}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required size="small">
                <InputLabel id="account-label">Account</InputLabel>
                <Select
                  labelId="account-label"
                  value={newTransaction.account}
                  onChange={(e) => handleNewTransactionChange('account', e.target.value)}
                  label="Account"
                  disabled={isAddingTransaction}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {selected && (
                        <>
                          <Iconify
                            icon={
                              availableAccounts.find((acc) => acc.id === selected)?.type === 'bank_account'
                                ? 'ph:bank-bold'
                                : availableAccounts.find((acc) => acc.id === selected)?.type === 'credit_card'
                                  ? 'ph:credit-card-bold'
                                  : 'mdi:cash'
                            }
                            width={16}
                            color={
                              availableAccounts.find((acc) => acc.id === selected)?.type === 'bank_account'
                                ? 'primary.main'
                                : availableAccounts.find((acc) => acc.id === selected)?.type === 'credit_card'
                                  ? 'secondary.main'
                                  : 'success.main'
                            }
                          />
                          <Typography
                            noWrap
                            sx={{
                              fontSize: '0.875rem',
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {getSelectedAccountDisplay(selected)}
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                  sx={{
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      pr: 4,
                    },
                  }}
                >
                  {availableAccounts.length === 0 && (
                    <MenuItem disabled>
                      <Typography color="text.secondary">
                        No accounts found. Please add a bank account or credit card first.
                      </Typography>
                    </MenuItem>
                  )}

                  {availableAccounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      <Tooltip title={account.fullDisplayName} arrow placement="right">
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ width: '100%' }}
                        >
                          <Iconify
                            icon={
                              account.type === 'bank_account'
                                ? 'ph:bank-bold'
                                : account.type === 'credit_card'
                                  ? 'ph:credit-card-bold'
                                  : 'mdi:cash'
                            }
                            width={16}
                            color={
                              account.type === 'bank_account'
                                ? 'primary.main'
                                : account.type === 'credit_card'
                                  ? 'secondary.main'
                                  : 'success.main'
                            }
                          />
                          <Typography
                            noWrap
                            sx={{
                              fontSize: '0.875rem',
                              maxWidth: '300px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {account.displayName}
                          </Typography>
                        </Stack>
                      </Tooltip>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Description"
                placeholder="Enter transaction description"
                value={newTransaction.description}
                onChange={(e) => handleNewTransactionChange('description', e.target.value)}
                disabled={isAddingTransaction}
                inputProps={{ maxLength: 200 }}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vendor"
                placeholder="Enter vendor name"
                value={newTransaction.vendor}
                onChange={(e) => handleNewTransactionChange('vendor', e.target.value)}
                disabled={isAddingTransaction}
                inputProps={{ maxLength: 100 }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <CategorySelector
                value={newTransaction.category}
                onChange={(value) => handleNewTransactionChange('category', value)}
                transactionType={newTransaction.transactionType}
                isPersonal={newTransaction.type === 'Personal'}
                label="Category"
                disabled={isAddingTransaction}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required size="small">
                <InputLabel id="type-label">Type</InputLabel>
                <Select
                  labelId="type-label"
                  value={newTransaction.type}
                  onChange={(e) => handleNewTransactionChange('type', e.target.value)}
                  label="Type"
                  disabled={isAddingTransaction}
                >
                  <MenuItem value="Business">Business</MenuItem>
                  <MenuItem value="Personal">Personal</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required size="small">
                <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
                <Select
                  labelId="transaction-type-label"
                  value={newTransaction.transactionType}
                  onChange={(e) => handleNewTransactionChange('transactionType', e.target.value)}
                  label="Transaction Type"
                  disabled={isAddingTransaction}
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
              <TextField
                fullWidth
                required
                label="Amount"
                placeholder="0.00"
                value={newTransaction.amount}
                onChange={(e) => handleNewTransactionChange('amount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                type="number"
                inputProps={{
                  step: '0.01',
                  min: '0.01',
                }}
                disabled={isAddingTransaction}
                size="small"
                error={
                  newTransaction.amount &&
                  (isNaN(parseFloat(newTransaction.amount)) ||
                    parseFloat(newTransaction.amount) <= 0)
                }
                helperText={
                  newTransaction.amount &&
                    (isNaN(parseFloat(newTransaction.amount)) ||
                      parseFloat(newTransaction.amount) <= 0)
                    ? 'Please enter a valid amount greater than 0'
                    : ''
                }
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
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseAddDialog} color="inherit" disabled={isAddingTransaction}>
            Cancel
          </Button>
          <Button
            onClick={handleAddTransaction}
            variant="contained"
            disabled={!isFormValid || isAddingTransaction}
            startIcon={
              isAddingTransaction ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Iconify icon="eva:plus-fill" width={20} />
              )
            }
          >
            {isAddingTransaction ? 'Adding...' : 'Add Transaction'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="ph:pencil-bold" width={24} />
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
              !editTransaction.amount ||
              !editTransaction.type
            }
            startIcon={
              isEditingTransaction ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Iconify icon="ph:floppy-disk-bold" width={20} />
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
            <Iconify icon="ph:trash-bold" width={24} color="error.main" />
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
                <Iconify icon="ph:trash-bold" width={20} />
              )
            }
          >
            {isDeletingTransaction ? 'Deleting...' : 'Delete'}
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
            <Grid container spacing={3}>
              {/* Document Header Information */}
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1, mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor:
                          documentDetailDialog.document.documentType === 'Invoice'
                            ? 'primary.main'
                            : documentDetailDialog.document.documentType === 'Bill'
                              ? 'info.main'
                              : 'secondary.main',
                      }}
                    >
                      <Iconify
                        icon={
                          documentDetailDialog.document.documentType === 'Invoice'
                            ? 'mdi:file-invoice'
                            : documentDetailDialog.document.documentType === 'Bill'
                              ? 'mdi:file-document'
                              : 'mdi:receipt'
                        }
                        width={24}
                      />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {getVendorName(documentDetailDialog.document)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {documentDetailDialog.document.documentType || 'Document'} •{' '}
                        {getDocumentNumber(documentDetailDialog.document)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getDocumentDate(documentDetailDialog.document)
                          ? formatDate(getDocumentDate(documentDetailDialog.document))
                          : 'No date'}
                      </Typography>
                    </Box>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {fCurrency(documentDetailDialog.document.total || 0)}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>

              {/* Document Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Document Information
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      File Name:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {documentDetailDialog.document.fileName || 'N/A'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Document Type:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {documentDetailDialog.document.documentType || 'Unknown'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Method:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {documentDetailDialog.document.paymentMethod || 'N/A'}
                    </Typography>
                  </Box>

                  {documentDetailDialog.document.orderId && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Order ID:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {documentDetailDialog.document.orderId}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>

              {/* Financial Summary */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Financial Summary
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {fCurrency(documentDetailDialog.document.subtotal || 0)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Tax:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {fCurrency(documentDetailDialog.document.tax || 0)}
                    </Typography>
                  </Box>

                  {documentDetailDialog.document.shipping && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Shipping:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {fCurrency((document.shipping || 0) + (document.shippingDiscount || 0))}
                      </Typography>
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      pt: 1,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body1" fontWeight="bold">
                      Total:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary.main">
                      {fCurrency(documentDetailDialog.document.total || 0)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Items Section - Enhanced to match invoice/receipt list views */}
              {documentDetailDialog.document.items &&
                documentDetailDialog.document.items.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      Items Details ({documentDetailDialog.document.items.length})
                    </Typography>
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {documentDetailDialog.document.items.map((item, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2,
                            mb: 2,
                            bgcolor: 'background.neutral',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <Stack spacing={1.5}>
                            {/* Item Header with Name, Category, and Total */}
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" fontWeight="medium" gutterBottom>
                                  {item.description || item.name || `Item ${index + 1}`}
                                </Typography>
                                {item.category && (
                                  <Box
                                    sx={{
                                      display: 'inline-block',
                                      px: 1,
                                      py: 0.5,
                                      bgcolor: 'primary.lighter',
                                      color: 'primary.main',
                                      borderRadius: 1,
                                      fontSize: '0.75rem',
                                      fontWeight: 'medium',
                                    }}
                                  >
                                    {item.category}
                                  </Box>
                                )}
                              </Box>
                              <Typography
                                variant="h6"
                                color="primary.main"
                                sx={{ fontWeight: 'bold', minWidth: 'fit-content' }}
                              >
                                {fCurrency(item.amount || item.totalPrice || 0)}
                              </Typography>
                            </Stack>

                            {/* Item Details Grid */}
                            <Grid container spacing={2}>
                              {/* Quantity */}
                              <Grid item xs={6} sm={3}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontWeight: 'medium' }}
                                >
                                  Quantity
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {item.quantity || 1}
                                </Typography>
                              </Grid>

                              {/* Unit Price */}
                              <Grid item xs={6} sm={3}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontWeight: 'medium' }}
                                >
                                  Unit Price
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {fCurrency(item.rate || item.unitPrice || 0)}
                                </Typography>
                              </Grid>

                              {/* Total Price */}
                              <Grid item xs={6} sm={3}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontWeight: 'medium' }}
                                >
                                  Total Price
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight="medium"
                                  color="primary.main"
                                >
                                  {fCurrency(item.amount || item.totalPrice || 0)}
                                </Typography>
                              </Grid>

                              {/* Category (if not shown above) */}
                              {!item.category && (
                                <Grid item xs={6} sm={3}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 'medium' }}
                                  >
                                    Category
                                  </Typography>
                                  <Typography variant="body2">Uncategorized</Typography>
                                </Grid>
                              )}

                              {/* Additional Receipt-specific fields */}
                              {item.condition && (
                                <Grid item xs={6} sm={4}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 'medium' }}
                                  >
                                    Condition
                                  </Typography>
                                  <Typography variant="body2">{item.condition}</Typography>
                                </Grid>
                              )}

                              {item.soldBy && (
                                <Grid item xs={6} sm={4}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 'medium' }}
                                  >
                                    Sold By
                                  </Typography>
                                  <Typography variant="body2">{item.soldBy}</Typography>
                                </Grid>
                              )}

                              {item.suppliedBy && (
                                <Grid item xs={6} sm={4}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 'medium' }}
                                  >
                                    Supplied By
                                  </Typography>
                                  <Typography variant="body2">{item.suppliedBy}</Typography>
                                </Grid>
                              )}
                            </Grid>
                          </Stack>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDocumentDetails} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Adjustment Edit Dialog */}
      <Dialog
        open={adjustmentEditDialog.open}
        onClose={() => !adjustmentEditDialog.loading && setAdjustmentEditDialog({
          open: false,
          transaction: null,
          statement: null,
          currentAmount: 0,
          loading: false
        })}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: 400 }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:pencil" width={24} sx={{ color: 'info.main' }} />
            <Typography variant="h6">Edit Adjustment Amount</Typography>
            {adjustmentEditDialog.loading && (
              <CircularProgress size={20} sx={{ ml: 1 }} />
            )}
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {adjustmentEditDialog.open && (() => {
            const details = getAdjustmentDetails();

            if (!details) {
              return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Loading adjustment details...
                  </Typography>
                </Box>
              );
            }

            return (
              <Stack spacing={3}>
                {/* Header Information */}
                <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'secondary.main',
                      }}
                    >
                      <Iconify icon="mdi:credit-card" width={20} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {details.statementFileName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Transaction: {adjustmentEditDialog.transaction?.description}
                      </Typography>
                      {details.isMultiTransaction && (
                        <Typography variant="body2" color="info.main" sx={{ mt: 0.5 }}>
                          This statement is linked to {details.linkedTransactionCount} bank transactions
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Box>

                {/* Current Status */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Current Status
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: 'secondary.light',
                          borderRadius: 2,
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.5, display: 'block' }}>
                          Statement Total
                        </Typography>
                        <Typography variant="h6" color="secondary.main" fontWeight="bold">
                          {fCurrency(details.statementTotal)}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: 'primary.light',
                          borderRadius: 2,
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.5, display: 'block' }}>
                          Bank Payments
                        </Typography>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          {fCurrency(details.totalBankPayments)}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: 'info.light',
                          borderRadius: 2,
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.5, display: 'block' }}>
                          Current Adjustments
                        </Typography>
                        <Typography variant="h6" color="info.main" fontWeight="bold">
                          {fCurrency(details.totalAdjustments)}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: Math.abs(details.differenceWithoutAdjustment) <= 0.01 ? 'success.main' : 'warning.main',
                          borderRadius: 2,
                          textAlign: 'center',
                          bgcolor: Math.abs(details.differenceWithoutAdjustment) <= 0.01 ? 'success.lighter' : 'warning.lighter'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.5, display: 'block' }}>
                          Remaining Balance
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={Math.abs(details.differenceWithoutAdjustment) <= 0.01 ? 'success.main' : 'warning.main'}
                        >
                          {Math.abs(details.differenceWithoutAdjustment) <= 0.01 ? '✓ Balanced' : fCurrency(Math.abs(details.differenceWithoutAdjustment))}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                {/* Current Transaction Details */}
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                    This Transaction Details
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Transaction Amount:</Typography>
                      <Typography variant="body1" fontWeight="bold">{fCurrency(details.currentTransactionAmount)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Current Adjustment:</Typography>
                      <Typography variant="body1" fontWeight="bold" color="info.main">
                        {fCurrency(details.currentAdjustment)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Contribution:</Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        {fCurrency(details.currentTransactionAmount + details.currentAdjustment)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Adjustment Recommendations */}
                {Math.abs(details.differenceWithoutAdjustment) > 0.01 && (
                  <Alert
                    severity={details.differenceWithoutAdjustment > 0 ? "warning" : "info"}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Recommendation:</strong> To balance this statement, you need an adjustment of{' '}
                      <strong>{fCurrency(details.differenceWithoutAdjustment)}</strong>
                    </Typography>
                    {details.differenceWithoutAdjustment > 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        The statement total is higher than bank payments. Add this amount as adjustment.
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        The bank payments exceed the statement total. Consider reducing adjustments.
                      </Typography>
                    )}
                  </Alert>
                )}

                {/* Adjustment Input */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    New Adjustment Amount
                  </Typography>
                  <TextField
                    autoFocus
                    fullWidth
                    label="Adjustment Amount"
                    type="number"
                    variant="outlined"
                    defaultValue={adjustmentEditDialog.currentAmount}
                    disabled={adjustmentEditDialog.loading}
                    inputProps={{
                      step: '0.01',
                      min: '0',
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !adjustmentEditDialog.loading) {
                        handleUpdateAdjustment(e.target.value);
                      }
                    }}
                    id="adjustment-amount-input"
                    helperText="Enter the adjustment amount to account for fees, tips, or other differences"
                  />
                </Box>

                {/* Quick Amount Buttons */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Quick Actions
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={adjustmentEditDialog.loading}
                      onClick={() => {
                        const input = document.getElementById('adjustment-amount-input');
                        if (input) {
                          input.value = details.differenceWithoutAdjustment;
                          input.focus();
                        }
                      }}
                    >
                      Use Recommended ({fCurrency(details.differenceWithoutAdjustment)})
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={adjustmentEditDialog.loading}
                      onClick={() => {
                        const input = document.getElementById('adjustment-amount-input');
                        if (input) {
                          input.value = 0;
                          input.focus();
                        }
                      }}
                    >
                      Clear Adjustment
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            );
          })()}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => !adjustmentEditDialog.loading && setAdjustmentEditDialog({
              open: false,
              transaction: null,
              statement: null,
              currentAmount: 0,
              loading: false
            })}
            color="inherit"
            disabled={adjustmentEditDialog.loading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const input = document.getElementById('adjustment-amount-input');
              handleUpdateAdjustment(input?.value || 0);
            }}
            variant="contained"
            color="info"
            disabled={adjustmentEditDialog.loading}
            startIcon={
              adjustmentEditDialog.loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Iconify icon="mdi:check" />
              )
            }
          >
            {adjustmentEditDialog.loading ? 'Updating...' : 'Update Adjustment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Update Dialog */}
      <CategoryUpdateDialog
        open={categoryUpdateDialog.open}
        onClose={handleCloseCategoryUpdateDialog}
        onUpdateSingle={handleUpdateSingleCategory}
        onUpdateAll={handleUpdateAllCategories}
        currentTransaction={categoryUpdateDialog.currentTransaction}
        similarTransactions={categoryUpdateDialog.similarTransactions}
        newCategory={categoryUpdateDialog.newCategory}
        loading={categoryUpdateDialog.loading}
      />

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
