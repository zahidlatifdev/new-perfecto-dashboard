'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';

import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { TablePaginationCustom } from 'src/components/table';
import { fCurrency } from 'src/utils/format-number';
import { FileViewer } from 'src/components/file-viewer';

// Helper functions
const formatCurrencyWithTwoDecimals = (value) => {
  return fCurrency(value, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Get document data helper (unified for receipts, invoices, and bills)
const getDocumentData = (document) => {
  const isInvoice = document.documentType === 'Invoice';
  const isBill = document.documentType === 'Bill';

  return {
    number: isInvoice
      ? document.invoiceNumber || 'N/A'
      : document.receiptNumber || document.invoiceNumber || 'N/A',
    amount: document.total || 0,
    date: isInvoice
      ? document.invoiceDate || document.createdAt
      : document.receiptDate || document.orderDate || document.invoiceDate || document.createdAt,
    vendor: isInvoice
      ? document.vendorName || document.billingName || 'Unknown'
      : document.vendor || document.billingName || 'Unknown',
    lineItems: document.items || [],
    tax: document.tax || 0,
    subtotal: document.subtotal || 0,
    shipping: document.shipping || 0,
    paymentMethod: document.paymentMethod,
    invoiceNumber: document.invoiceNumber,
    receiptNumber: document.receiptNumber,
    invoiceDate: document.invoiceDate,
    receiptDate: document.receiptDate,
    orderDate: document.orderDate,
    billingAddress: document.billingAddress,
    billingName: document.billingName,
    vendorName: document.vendorName,
    vendor: document.vendor,
    vendorAddress: document.vendorAddress,
    vendorPhone: document.vendorPhone,
    vendorEmail: document.vendorEmail,
    dueDate: document.dueDate,
    paymentTerms: document.paymentTerms,
    billingCompany: document.billingCompany,
    // Receipt specific fields
    receiptType: document.receiptType,
    orderId: document.orderId,
    shipmentDate: document.shipmentDate,
    shippingName: document.shippingName,
    shippingAddress: document.shippingAddress,
    shippingDiscount: document.shippingDiscount,
  };
};

// Status chip helper
const getStatusChip = (status) => {
  const statusConfig = {
    completed: { label: 'Processed', color: 'success' },
    pending: { label: 'Processing', color: 'warning' },
    failed: { label: 'Failed', color: 'error' },
  };
  const config = statusConfig[status] || { label: status || 'Unknown', color: 'default' };
  return <Chip size="small" label={config.label} color={config.color} variant="outlined" />;
};
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

import { MatchingOverview } from '../components/matching-overview';
import { ManualMatchingDialog } from '../components/manual-matching-dialog';
import { TransactionMatchingRow } from '../components/transaction-matching-row';
import { CreditCardLinkDialog } from '../components/credit-card-link-dialog';
import { UploadAndMatchDialog } from '../components/upload-and-match-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'index', label: '#', width: 40 },
  { id: 'matching', label: 'Matching', width: 140 },
  { id: 'date', label: 'Date', width: 100 },
  { id: 'description', label: 'Description', width: 250 },
  { id: 'category', label: 'Category', width: 180 },
  { id: 'debit', label: 'Debit', align: 'right', width: 100 },
  { id: 'credit', label: 'Credit', align: 'right', width: 100 },
  { id: 'status', label: 'Status', width: 130 },
  { id: 'actions', label: 'Actions', width: 120 },
];

// ----------------------------------------------------------------------

export function MatchingView() {
  const { selectedCompany } = useAuthContext();

  // State
  const [currentTab, setCurrentTab] = useState('overview');
  const [matchedSubTab, setMatchedSubTab] = useState('all'); // Sub-tab for bank/card transactions
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [expandedRows, setExpandedRows] = useState({});

  // Dialog states
  const [manualMatchDialog, setManualMatchDialog] = useState({
    open: false,
    transaction: null,
  });

  const [creditCardLinkDialog, setCreditCardLinkDialog] = useState({
    open: false,
    transaction: null,
  });

  const [uploadMatchDialog, setUploadMatchDialog] = useState({
    open: false,
    transaction: null,
  });

  const [documentDetailDialog, setDocumentDetailDialog] = useState({
    open: false,
    document: null,
  });

  const [dialogTab, setDialogTab] = useState(0);

  // Adjustment Edit Dialog State
  const [adjustmentEditDialog, setAdjustmentEditDialog] = useState({
    open: false,
    transaction: null,
    statement: null,
    currentAmount: 0,
    loading: false,
  });

  // Statistics
  const [statistics, setStatistics] = useState({
    matched: 0,
    unmatched: 0,
    total: 0,
  });

  // Statement totals for credit card calculations
  const [statementTotals, setStatementTotals] = useState({});

  // Fetch data only when company changes, not on tab changes
  useEffect(() => {
    if (selectedCompany?._id) {
      fetchTransactions();
      fetchStatementTotals();
    }
  }, [selectedCompany?._id]);

  const fetchStatementTotals = useCallback(async () => {
    try {
      // Fetch both bank and credit card statements to get totals
      const [bankStatementsResponse, cardStatementsResponse] = await Promise.all([
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
      ]);

      // Extract statement totals and create a map
      const totalsMap = {};

      const bankStatements = bankStatementsResponse.data.data?.statements || [];
      const cardStatements = cardStatementsResponse.data.data?.statements || [];

      [...bankStatements, ...cardStatements].forEach(statement => {
        if (statement.total !== undefined) {
          totalsMap[statement._id] = statement.total;
        }
      });

      console.log('Statement totals map:', totalsMap);
      setStatementTotals(totalsMap);
    } catch (error) {
      console.error('Failed to fetch statement totals:', error);
    }
  }, [selectedCompany?._id]);

  // Helper function to update statistics
  const updateStatistics = useCallback((txns) => {
    // Calculate statistics - include both document matches and credit card links
    const matched = txns.filter((t) => t.hasAnyMatches).length;
    const total = txns.length;
    setStatistics({
      matched,
      unmatched: total - matched,
      total,
    });
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(endpoints.transactions.list, {
        params: {
          companyId: selectedCompany._id,
          limit: 1000,
          sortBy: 'date',
          sortOrder: 'asc',
        },
      });

      if (response.data.success) {
        const txns = response.data.data.transactions.map((txn) => {
          const hasDocumentMatches = txn.matchedDocuments && txn.matchedDocuments.length > 0;
          const hasCreditCardLinks = txn.linkedCreditCardStatements && txn.linkedCreditCardStatements.length > 0;
          const hasAnyMatches = hasDocumentMatches || hasCreditCardLinks;

          return {
            id: txn._id,
            date: new Date(txn.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            description: txn.description,
            source: txn.accountType === 'bank_account' ? 'Bank Account' : 'Credit Card',
            accountType: txn.accountType,
            category: txn.category,
            debit: txn.debit,
            credit: txn.credit,
            matchedDocuments: txn.matchedDocuments || [],
            hasMatches: hasDocumentMatches,
            linkedCreditCardStatements: txn.linkedCreditCardStatements || [],
            hasAnyMatches: hasAnyMatches,
            hasCreditCardLinks: hasCreditCardLinks,
          };
        });

        setTransactions(txns);
        updateStatistics(txns);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCompany?._id]);

  // Event handlers
  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
    // Reset sub-tab when switching main tabs
    if (newValue === 'bank' || newValue === 'card') {
      setMatchedSubTab('all');
    }
  };

  const handleChangeMatchedSubTab = (event, newValue) => {
    setMatchedSubTab(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    const value = parseInt(e.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };

  const handleToggleExpand = (transactionId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [transactionId]: !prev[transactionId],
    }));
  };

  const handleManualMatch = (transaction) => {
    setManualMatchDialog({
      open: true,
      transaction,
    });
  };

  const handleCloseManualMatch = () => {
    setManualMatchDialog({
      open: false,
      transaction: null,
    });
  };

  const handleCreditCardLink = useCallback((transaction) => {
    setCreditCardLinkDialog({
      open: true,
      transaction,
    });
  }, []);

  const handleCloseCreditCardLink = () => {
    setCreditCardLinkDialog({
      open: false,
      transaction: null,
    });
  };

  const handleViewDocumentDetails = (document) => {
    setDocumentDetailDialog({
      open: true,
      document,
    });
  };

  const handleCloseDocumentDetails = () => {
    setDocumentDetailDialog({
      open: false,
      document: null,
    });
    setDialogTab(0);
  };

  const handleMatchSuccess = async (transactionData, actionType = 'document_match') => {
    if (actionType === 'credit_card_link') {
      // Handle credit card linking with proper optimistic update
      setTransactions((prev) => {
        const updated = prev.map((txn) => {
          if (txn.id === transactionData.transactionId) {
            // Find the full transaction data from the response
            const fullTransactionData = transactionData.transaction || {
              ...txn,
              linkedCreditCardStatements: transactionData.linkedCreditCardStatements || []
            };

            // Update the transaction with new linked credit card statements and matching status
            const hasCreditCardLinks = fullTransactionData.linkedCreditCardStatements && fullTransactionData.linkedCreditCardStatements.length > 0;
            const hasDocumentMatches = txn.hasMatches;
            const hasAnyMatches = hasDocumentMatches || hasCreditCardLinks;

            return {
              ...txn,
              linkedCreditCardStatements: fullTransactionData.linkedCreditCardStatements || [],
              hasCreditCardLinks,
              hasAnyMatches,
            };
          }
          // Also update other transactions that might be linked to the same statement (for multi-transaction statements)
          if (txn.linkedCreditCardStatements && transactionData.linkedCreditCardStatements) {
            const hasSharedStatement = txn.linkedCreditCardStatements.some(link =>
              transactionData.linkedCreditCardStatements.some(newLink =>
                (link.statementId?._id || link.statementId) === (newLink.statementId?._id || newLink.statementId)
              )
            );
            if (hasSharedStatement) {
              // Update matching status for transactions with shared statements
              const hasCreditCardLinks = txn.linkedCreditCardStatements && txn.linkedCreditCardStatements.length > 0;
              const hasDocumentMatches = txn.hasMatches;
              const hasAnyMatches = hasDocumentMatches || hasCreditCardLinks;

              return {
                ...txn,
                hasCreditCardLinks,
                hasAnyMatches,
              };
            }
          }
          return txn;
        });

        // Update statistics with the new transaction data
        updateStatistics(updated);
        return updated;
      });
    } else {
      // For document matching, update the specific transaction optimistically
      const transactionId = transactionData;
      const documentIds = Array.isArray(actionType) ? actionType : [actionType];

      // Update the transaction state optimistically
      setTransactions((prev) => {
        const updated = prev.map((txn) => {
          if (txn.id === transactionId) {
            // Add the new matched documents (this is a simplified update - in reality you'd get the full document data)
            const newMatchedDocs = [...(txn.matchedDocuments || [])];
            const hasDocumentMatches = newMatchedDocs.length > 0;
            const hasCreditCardLinks = txn.hasCreditCardLinks;
            const hasAnyMatches = hasDocumentMatches || hasCreditCardLinks;

            return {
              ...txn,
              hasMatches: hasDocumentMatches,
              hasAnyMatches,
            };
          }
          return txn;
        });

        // Update statistics with the new transaction data
        updateStatistics(updated);
        return updated;
      });

      // Also refresh the transactions data to get updated matched documents with full details
      await fetchTransactions();
    }
  };

  const handleRemoveMatch = async (transactionId, documentId) => {
    try {
      await axiosInstance.post(endpoints.matching.remove, {
        transactionId,
        documentId,
      });

      // Update local state optimistically
      setTransactions((prev) => {
        const updated = prev.map((txn) => {
          if (txn.id === transactionId) {
            const newMatchedDocuments = txn.matchedDocuments.filter((doc) => doc._id !== documentId);
            const hasDocumentMatches = newMatchedDocuments.length > 0;
            const hasCreditCardLinks = txn.hasCreditCardLinks || (txn.linkedCreditCardStatements && txn.linkedCreditCardStatements.length > 0);
            const hasAnyMatches = hasDocumentMatches || hasCreditCardLinks;

            return {
              ...txn,
              matchedDocuments: newMatchedDocuments,
              hasMatches: hasDocumentMatches,
              hasAnyMatches,
              hasCreditCardLinks, // Ensure this is preserved
            };
          }
          return txn;
        });

        // Update statistics with the new transaction data
        updateStatistics(updated);
        return updated;
      });

      console.log('Document match removed successfully');
    } catch (error) {
      console.error('Failed to remove match:', error);
      alert('Failed to remove match. Please try again.');
    }
  };

  const handleAutoMatchingToggle = (enabled) => {
    // Handle auto-matching toggle
    console.log('Auto-matching toggled:', enabled);
  };

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

  const handleRunAutoMatch = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(endpoints.matching.batchAutoMatch, {
        minConfidence: 0.7,
        limit: 100,
      });

      if (response.data.success) {
        // Refresh transactions to show new matches
        await fetchTransactions();

        // Show success message
        console.log('Auto-match completed:', response.data.message);
      }
    } catch (error) {
      console.error('Auto-match failed:', error);
    } finally {
      setLoading(false);
    }
  };

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

    try {
      const response = await axiosInstance.post(endpoints.matching.updateCreditCardAdjustment, {
        transactionId: transaction.id,
        statementId: statement.statementId?._id || statement.statementId,
        adjustmentAmount: parseFloat(newAdjustmentAmount) || 0
      });

      if (response.data.success) {
        // Optimistically update the transaction
        setTransactions(prev => {
          const updated = prev.map(txn =>
            txn.id === transaction.id
              ? {
                ...txn,
                linkedCreditCardStatements: response.data.data.transaction.linkedCreditCardStatements || txn.linkedCreditCardStatements
              }
              : txn
          );
          updateStatistics(updated);
          return updated;
        });

        setTimeout(() => {
          setAdjustmentEditDialog({
            open: false,
            transaction: null,
            statement: null,
            currentAmount: 0,
            loading: false
          });
        }, 500);

        // You can add toast notification here if available
        console.log('Adjustment amount updated successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to update adjustment amount');
      }
    } catch (error) {
      console.error('Failed to update adjustment amount:', error);
      alert('Failed to update adjustment amount. Please try again.');
    } finally {
      setAdjustmentEditDialog(prev => ({ ...prev, loading: false }));
    }
  }, [adjustmentEditDialog, updateStatistics]);

  // Calculate adjustment details for the dialog
  const getAdjustmentDetails = useCallback(() => {
    const { transaction, statement } = adjustmentEditDialog;

    if (!transaction || !statement) return null;

    const statementId = statement.statementId?._id || statement.statementId;
    const statementTotal = statementTotals[statementId] || 0;

    // Find all transactions linked to this same statement
    const linkedTransactions = transactions.filter(txn =>
      txn.linkedCreditCardStatements &&
      txn.linkedCreditCardStatements.some(ccStmt =>
        (ccStmt.statementId?._id || ccStmt.statementId) === statementId
      )
    );

    // Calculate totals
    const totalBankPayments = linkedTransactions.reduce((sum, txn) => {
      return sum + Math.abs(txn.debit || txn.credit || 0);
    }, 0);

    const totalAdjustments = linkedTransactions.reduce((sum, txn) => {
      const txnCcStatement = txn.linkedCreditCardStatements.find(ccStmt =>
        (ccStmt.statementId?._id || ccStmt.statementId) === statementId
      );
      return sum + (txnCcStatement?.adjustmentAmount || 0);
    }, 0);

    const currentTransactionAmount = Math.abs(transaction.debit || transaction.credit || 0);
    const currentAdjustment = statement.adjustmentAmount || 0;

    // Calculate without current adjustment to show what the new difference would be
    const totalWithoutCurrentAdjustment = totalBankPayments + (totalAdjustments - currentAdjustment);
    const differenceWithoutAdjustment = statementTotal - totalWithoutCurrentAdjustment;

    return {
      statementTotal,
      currentTransactionAmount,
      currentAdjustment,
      totalBankPayments,
      totalAdjustments,
      totalWithoutCurrentAdjustment,
      differenceWithoutAdjustment,
      linkedTransactionCount: linkedTransactions.length,
      isMultiTransaction: linkedTransactions.length > 1,
      statementFileName: statement.statementId?.fileName || 'Credit Card Statement'
    };
  }, [adjustmentEditDialog, statementTotals, transactions]);

  // Handler for unlinking credit card
  const handleUnlinkCreditCard = useCallback(async (transactionId, statementId) => {
    try {
      const response = await axiosInstance.post(endpoints.matching.unlinkCreditCard, {
        transactionId,
        statementId
      });

      if (response.data.success) {
        // Optimistically update the transaction
        setTransactions(prev => {
          const updated = prev.map(txn => {
            if (txn.id === transactionId) {
              // Remove the linked credit card statement
              const updatedLinkedStatements = (txn.linkedCreditCardStatements || []).filter(
                ccStmt => (ccStmt.statementId?._id || ccStmt.statementId) !== statementId
              );

              const hasCreditCardLinks = updatedLinkedStatements.length > 0;
              const hasDocumentMatches = txn.hasMatches;
              const hasAnyMatches = hasDocumentMatches || hasCreditCardLinks;

              return {
                ...txn,
                linkedCreditCardStatements: updatedLinkedStatements,
                hasCreditCardLinks,
                hasAnyMatches,
              };
            }
            return txn;
          });

          // Update statistics with the new transaction data
          updateStatistics(updated);
          return updated;
        });

        console.log('Credit card unlinked successfully');
      } else {
        throw new Error(response.data.message || 'Failed to unlink credit card');
      }
    } catch (error) {
      console.error('Failed to unlink credit card:', error);
      alert('Failed to unlink credit card. Please try again.');
    }
  }, [updateStatistics]);

  // Filter transactions based on current tab and sub-tab
  const getFilteredTransactions = () => {
    let filtered = [];

    switch (currentTab) {
      case 'bank':
        const bankTransactions = transactions.filter((t) => t.accountType === 'bank_account');
        if (matchedSubTab === 'matched') {
          filtered = bankTransactions.filter((t) => t.hasAnyMatches);
        } else if (matchedSubTab === 'unmatched') {
          filtered = bankTransactions.filter((t) => !t.hasAnyMatches);
        } else {
          filtered = bankTransactions;
        }
        break;
      case 'card':
        const cardTransactions = transactions.filter((t) => t.accountType === 'credit_card');
        if (matchedSubTab === 'matched') {
          filtered = cardTransactions.filter((t) => t.hasAnyMatches);
        } else if (matchedSubTab === 'unmatched') {
          filtered = cardTransactions.filter((t) => !t.hasAnyMatches);
        } else {
          filtered = cardTransactions;
        }
        break;
      case 'cash':
        const cashTransactions = transactions.filter((t) => t.accountType === 'cash_account');
        if (matchedSubTab === 'matched') {
          filtered = cashTransactions.filter((t) => t.hasAnyMatches);
        } else if (matchedSubTab === 'unmatched') {
          filtered = cashTransactions.filter((t) => !t.hasAnyMatches);
        } else {
          filtered = cashTransactions;
        }
        break;
      default:
        filtered = transactions;
        break;
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  const paginatedTransactions = rowsPerPage === -1
    ? filteredTransactions
    : filteredTransactions.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );



  // Helper function to render tab with conditional badge
  const renderTabWithBadge = (label, count, color = 'error') => {
    if (count > 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1 }}>
          <Typography variant="body2">{label}</Typography>
          <Badge
            badgeContent={count}
            color={color}
            sx={{
              '& .MuiBadge-badge': {
                position: 'static',
                transform: 'none',
                minWidth: '20px',
                height: '20px',
                padding: '0 6px',
                fontSize: '0.75rem',
              },
            }}
          />
        </Box>
      );
    }
    return <Typography variant="body2">{label}</Typography>;
  };

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">Transaction Matching</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mdi:auto-fix" />}
          onClick={handleRunAutoMatch}
          disabled={loading}
        >
          Run Auto-Match
        </Button>
      </Stack>

      {/* Tabs Navigation */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-flexContainer': {
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            },
            '& .MuiTab-root': {
              fontSize: '0.875rem',
              textTransform: 'none',
              minHeight: 48,
            },
          }}
        >
          <Tab value="overview" label="Overview" />
          <Tab
            value="bank"
            label={renderTabWithBadge('Bank Transactions',
              transactions.filter(t => t.accountType === 'bank_account').length, 'primary')}
          />
          <Tab
            value="card"
            label={renderTabWithBadge('Credit Card Transactions',
              transactions.filter(t => t.accountType === 'credit_card').length, 'secondary')}
          />
          <Tab
            value="cash"
            label={renderTabWithBadge('Cash Transactions',
              transactions.filter(t => t.accountType === 'cash_account').length, 'success')}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {currentTab === 'overview' && (
        <MatchingOverview onAutoMatchingToggle={handleAutoMatchingToggle} />
      )}

      {currentTab !== 'overview' && (
        <>
          {loading ? (
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 400,
                  }}
                >
                  <CircularProgress />
                </Box>
              </CardContent>
            </Card>
          ) : currentTab === 'bank' || currentTab === 'card' || currentTab === 'cash' ? (
            // Matched transactions with sub-tabs for credits and debits
            <Stack spacing={3}>
              {/* Sub-tabs for Credits and Debits */}
              <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={matchedSubTab}
                    onChange={handleChangeMatchedSubTab}
                    variant="fullWidth"
                    sx={{
                      '& .MuiTab-root': {
                        fontSize: '0.875rem',
                        textTransform: 'none',
                        minHeight: 56,
                        fontWeight: 500,
                      },
                    }}
                  >
                    <Tab
                      value="all"
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Iconify icon="mdi:format-list-bulleted" width={20} sx={{ color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              All {currentTab === 'bank' ? 'Bank' : currentTab === 'card' ? 'Credit Card' : 'Cash'} Transactions
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transactions.filter(t => t.accountType === (currentTab === 'bank' ? 'bank_account' : currentTab === 'card' ? 'credit_card' : 'cash_account')).length} transactions
                            </Typography>
                          </Box>
                        </Stack>
                      }
                      sx={{
                        bgcolor: matchedSubTab === 'all' ? 'primary.lighter' : 'transparent',
                        '&.Mui-selected': {
                          color: 'primary.dark',
                        },
                      }}
                    />
                    <Tab
                      value="matched"
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Iconify icon="mdi:check-circle" width={20} sx={{ color: 'success.main' }} />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              Matched
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transactions.filter(t => t.accountType === (currentTab === 'bank' ? 'bank_account' : currentTab === 'card' ? 'credit_card' : 'cash_account') && t.hasAnyMatches).length} transactions
                            </Typography>
                          </Box>
                        </Stack>
                      }
                      sx={{
                        bgcolor: matchedSubTab === 'matched' ? 'success.lighter' : 'transparent',
                        '&.Mui-selected': {
                          color: 'success.dark',
                        },
                      }}
                    />
                    <Tab
                      value="unmatched"
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Iconify icon="mdi:alert-circle" width={20} sx={{ color: 'warning.main' }} />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              Unmatched
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transactions.filter(t => t.accountType === (currentTab === 'bank' ? 'bank_account' : currentTab === 'card' ? 'credit_card' : 'cash_account') && !t.hasAnyMatches).length} transactions
                            </Typography>
                          </Box>
                        </Stack>
                      }
                      sx={{
                        bgcolor: matchedSubTab === 'unmatched' ? 'warning.lighter' : 'transparent',
                        '&.Mui-selected': {
                          color: 'warning.dark',
                        },
                      }}
                    />
                  </Tabs>
                </Box>

                {/* Sub-tab Content */}
                <CardContent sx={{ p: 0 }}>
                  {filteredTransactions.length > 0 ? (
                    <>
                      <TableContainer sx={{ width: '100%' }}>
                        <Table sx={{ tableLayout: 'fixed' }}>
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
                            {paginatedTransactions.map((transaction, index) => (
                              <TransactionMatchingRow
                                key={transaction.id}
                                transaction={transaction}
                                index={page * rowsPerPage + index + 1}
                                onManualMatch={handleManualMatch}
                                onRemoveMatch={handleRemoveMatch}
                                onViewDocument={handleViewDocumentDetails}
                                isExpanded={expandedRows[transaction.id]}
                                onToggleExpand={handleToggleExpand}
                                allTransactions={transactions}
                                statementTotals={statementTotals}
                                onEditAdjustment={handleEditAdjustment}
                                onUnlinkCreditCard={handleUnlinkCreditCard}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <TablePaginationCustom
                        count={filteredTransactions.length}
                        page={rowsPerPage === -1 ? 0 : page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                      />
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Iconify
                        icon={
                          matchedSubTab === 'all' ? 'mdi:format-list-bulleted' :
                            matchedSubTab === 'matched' ? 'mdi:check-circle-outline' :
                              'mdi:alert-circle-outline'
                        }
                        width={64}
                        sx={{
                          color:
                            matchedSubTab === 'all' ? 'primary.main' :
                              matchedSubTab === 'matched' ? 'success.main' : 'warning.main',
                          opacity: 0.5,
                          mb: 2
                        }}
                      />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No {
                          matchedSubTab === 'all' ? (currentTab === 'bank' ? 'Bank' : 'Credit Card') :
                            matchedSubTab === 'matched' ? 'Matched' : 'Unmatched'
                        } Transactions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {
                          matchedSubTab === 'all' ?
                            `No ${currentTab === 'bank' ? 'bank' : currentTab === 'card' ? 'credit card' : 'cash'} transactions found.` :
                            matchedSubTab === 'matched' ?
                              'No transactions have been matched with documents yet.' :
                              'All transactions have been matched with documents.'
                        }
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Stack>
          ) : null}
        </>
      )}

      {/* Manual Matching Dialog */}
      <ManualMatchingDialog
        open={manualMatchDialog.open}
        onClose={handleCloseManualMatch}
        transaction={manualMatchDialog.transaction}
        onMatchSuccess={handleMatchSuccess}
        onUploadRequest={handleUploadRequest}
        onCreditCardLink={handleCreditCardLink}
      />

      {/* Credit Card Link Dialog */}
      <CreditCardLinkDialog
        open={creditCardLinkDialog.open}
        onClose={handleCloseCreditCardLink}
        transaction={creditCardLinkDialog.transaction}
        onLinkSuccess={handleMatchSuccess}
      />

      {/* Upload and Match Dialog */}
      <UploadAndMatchDialog
        open={uploadMatchDialog.open}
        onClose={handleCloseUploadMatch}
        transaction={uploadMatchDialog.transaction}
        onUploadSuccess={handleMatchSuccess}
      />

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
          {(() => {
            const details = getAdjustmentDetails();
            if (!details) return null;

            const {
              statementTotal,
              currentTransactionAmount,
              currentAdjustment,
              totalBankPayments,
              totalAdjustments,
              differenceWithoutAdjustment,
              linkedTransactionCount,
              isMultiTransaction,
              statementFileName
            } = details;

            return (
              <Stack spacing={3}>
                {/* Statement Info */}
                <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {statementFileName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isMultiTransaction
                      ? `This statement is linked to ${linkedTransactionCount} transactions`
                      : 'This statement is linked to this transaction'
                    }
                  </Typography>
                </Box>

                {/* Current Status */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Current Status
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Statement Total:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {fCurrency(statementTotal)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Total Bank Payments:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {fCurrency(totalBankPayments)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Total Adjustments:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {fCurrency(totalAdjustments)}
                      </Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Current Difference:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={Math.abs(statementTotal - totalBankPayments - totalAdjustments) <= 0.01
                          ? 'success.main'
                          : 'warning.main'
                        }
                      >
                        {fCurrency(statementTotal - totalBankPayments - totalAdjustments)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                {/* Transaction Specific */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    This Transaction
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Transaction Amount:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {fCurrency(currentTransactionAmount)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Current Adjustment:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {fCurrency(currentAdjustment)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

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
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const input = document.getElementById('adjustment-amount-input');
                        if (input) input.value = Math.abs(differenceWithoutAdjustment).toFixed(2);
                      }}
                      disabled={adjustmentEditDialog.loading}
                    >
                      Auto-fill Difference ({fCurrency(Math.abs(differenceWithoutAdjustment))})
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const input = document.getElementById('adjustment-amount-input');
                        if (input) input.value = '0.00';
                      }}
                      disabled={adjustmentEditDialog.loading}
                    >
                      Clear ($0.00)
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            );
          })()}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setAdjustmentEditDialog({
              open: false,
              transaction: null,
              statement: null,
              currentAmount: 0,
              loading: false
            })}
            disabled={adjustmentEditDialog.loading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const input = document.getElementById('adjustment-amount-input');
              if (input) {
                handleUpdateAdjustment(input.value);
              }
            }}
            variant="contained"
            disabled={adjustmentEditDialog.loading}
            startIcon={adjustmentEditDialog.loading ? <CircularProgress size={20} /> : <Iconify icon="mdi:check" />}
          >
            {adjustmentEditDialog.loading ? 'Updating...' : 'Update Adjustment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Detail Dialog */}
      <Dialog
        open={documentDetailDialog.open}
        onClose={handleCloseDocumentDetails}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {documentDetailDialog.document?.documentType || 'Document'} Details
          {documentDetailDialog.document && (
            <Typography variant="body2" color="text.secondary">
              {documentDetailDialog.document.fileName}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent>
          {documentDetailDialog.document && (
            <Box sx={{ py: 2 }}>
              <Tabs
                value={dialogTab}
                onChange={(e, v) => setDialogTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 2 }}
              >
                <Tab label="Document" />
                <Tab label="Summary" />
              </Tabs>

              {/* Tab 0: Document Viewer */}
              {dialogTab === 0 && (
                <Box sx={{ mb: 3 }}>
                  <FileViewer document={documentDetailDialog.document} compact />
                </Box>
              )}

              {/* Tab 1: Summary */}
              {dialogTab === 1 && (
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
                            {getDocumentData(documentDetailDialog.document).vendor}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {documentDetailDialog.document.documentType || 'Document'} •{' '}
                            {getDocumentData(documentDetailDialog.document).number}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(getDocumentData(documentDetailDialog.document).date)}
                          </Typography>
                        </Box>
                        <Typography variant="h4" color="primary.main" fontWeight="bold">
                          {formatCurrencyWithTwoDecimals(
                            getDocumentData(documentDetailDialog.document).amount
                          )}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      {documentDetailDialog.document.documentType} Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {documentDetailDialog.document.documentType === 'Invoice'
                            ? 'Invoice Number'
                            : documentDetailDialog.document.documentType === 'Bill'
                              ? 'Bill Number'
                              : 'Receipt/Order ID'}
                        </Typography>
                        <Typography variant="body1">
                          {getDocumentData(documentDetailDialog.document).number}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Vendor/Customer
                        </Typography>
                        <Typography variant="body1">
                          {documentDetailDialog.document.documentType === 'Invoice' || documentDetailDialog.document.documentType === 'Bill'
                            ? getDocumentData(documentDetailDialog.document).billingName
                            : getDocumentData(documentDetailDialog.document).vendor}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Total Amount
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatCurrencyWithTwoDecimals(
                            getDocumentData(documentDetailDialog.document).amount
                          )}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Subtotal
                        </Typography>
                        <Typography variant="body1">
                          {formatCurrencyWithTwoDecimals(
                            getDocumentData(documentDetailDialog.document).subtotal
                          )}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Tax
                        </Typography>
                        <Typography variant="body1">
                          {formatCurrencyWithTwoDecimals(
                            getDocumentData(documentDetailDialog.document).tax
                          )}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Shipping
                        </Typography>
                        <Typography variant="body1">
                          {formatCurrencyWithTwoDecimals(
                            getDocumentData(documentDetailDialog.document).shipping
                          )}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Order & Processing Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        {getStatusChip(documentDetailDialog.document.status)}
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {documentDetailDialog.document.documentType === 'Invoice'
                            ? 'Invoice Date'
                            : documentDetailDialog.document.documentType === 'Bill'
                              ? 'Bill Date'
                              : 'Receipt/Order Date'}
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(getDocumentData(documentDetailDialog.document).date)}
                        </Typography>
                      </Box>
                      {getDocumentData(documentDetailDialog.document).dueDate && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Due Date
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(getDocumentData(documentDetailDialog.document).dueDate)}
                          </Typography>
                        </Box>
                      )}
                      {getDocumentData(documentDetailDialog.document).paymentTerms && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Payment Terms
                          </Typography>
                          <Typography variant="body1">
                            {getDocumentData(documentDetailDialog.document).paymentTerms}
                          </Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Payment Method
                        </Typography>
                        <Typography variant="body1">
                          {getDocumentData(documentDetailDialog.document).paymentMethod || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  {/* Address & Vendor Information */}
                  {(getDocumentData(documentDetailDialog.document).vendorAddress ||
                    getDocumentData(documentDetailDialog.document).billingAddress) && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Address Information
                        </Typography>
                        <Grid container spacing={3}>
                          {getDocumentData(documentDetailDialog.document).vendorAddress && (
                            <Grid item xs={12} md={6}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Vendor Address
                                </Typography>
                                <Typography variant="body1">
                                  {getDocumentData(documentDetailDialog.document).vendorName && (
                                    <>
                                      {getDocumentData(documentDetailDialog.document).vendorName}
                                      <br />
                                    </>
                                  )}
                                  {getDocumentData(documentDetailDialog.document).vendorAddress}
                                  {getDocumentData(documentDetailDialog.document).vendorPhone && (
                                    <>
                                      <br />
                                      Phone:{' '}
                                      {getDocumentData(documentDetailDialog.document).vendorPhone}
                                    </>
                                  )}
                                  {getDocumentData(documentDetailDialog.document).vendorEmail && (
                                    <>
                                      <br />
                                      Email:{' '}
                                      {getDocumentData(documentDetailDialog.document).vendorEmail}
                                    </>
                                  )}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          {getDocumentData(documentDetailDialog.document).billingAddress && (
                            <Grid item xs={12} md={6}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Billing Address
                                </Typography>
                                <Typography variant="body1">
                                  {getDocumentData(documentDetailDialog.document).billingName && (
                                    <>
                                      {getDocumentData(documentDetailDialog.document).billingName}
                                      <br />
                                    </>
                                  )}
                                  {getDocumentData(documentDetailDialog.document).billingCompany && (
                                    <>
                                      {getDocumentData(documentDetailDialog.document).billingCompany}
                                      <br />
                                    </>
                                  )}
                                  {getDocumentData(documentDetailDialog.document).billingAddress}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Grid>
                    )}

                  {/* Items Table - Exact copy from invoice/receipt list views */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Items
                    </Typography>
                    {Array.isArray(documentDetailDialog.document.items) &&
                      documentDetailDialog.document.items.length > 0 ? (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell align="center">Quantity</TableCell>
                            <TableCell align="right">Rate</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell>Category</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {documentDetailDialog.document.items.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{item.description || item.name || '—'}</TableCell>
                              <TableCell align="center">{item.quantity ?? '—'}</TableCell>
                              <TableCell align="right">
                                {item.rate
                                  ? formatCurrencyWithTwoDecimals(item.rate)
                                  : item.unitPrice
                                    ? formatCurrencyWithTwoDecimals(item.unitPrice)
                                    : '—'}
                              </TableCell>
                              <TableCell align="right">
                                {item.amount
                                  ? formatCurrencyWithTwoDecimals(item.amount)
                                  : item.totalPrice
                                    ? formatCurrencyWithTwoDecimals(item.totalPrice)
                                    : '—'}
                              </TableCell>
                              <TableCell>{item.category || item.condition || '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No items found.
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDocumentDetails}>Close</Button>
          <Button variant="contained" onClick={handleCloseDocumentDetails}>
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
