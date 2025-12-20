'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import { toast } from 'react-hot-toast';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { FileViewer } from 'src/components/file-viewer';
import { fCurrency } from 'src/utils/format-number';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const DOCUMENT_TABS = [
  {
    value: 'bank_statements',
    label: 'Bank Statements',
    type: 'BankStatement',
    uploadPath: paths.dashboard.bank_statements.upload,
    icon: 'ph:bank-bold',
    color: 'primary'
  },
  {
    value: 'card_statements',
    label: 'Card Statements',
    type: 'CardStatement',
    uploadPath: paths.dashboard.card_statements.upload,
    icon: 'ph:credit-card-bold',
    color: 'secondary'
  },
  {
    value: 'receipts',
    label: 'Receipts',
    type: 'Receipt',
    uploadPath: paths.dashboard.receipts.upload,
    icon: 'ph:receipt-bold',
    color: 'success'
  },
  {
    value: 'bills',
    label: 'Bills',
    type: 'Bill',
    uploadPath: paths.dashboard.bills.upload,
    icon: 'ph:file-text-bold',
    color: 'warning'
  },
  {
    value: 'invoices',
    label: 'Invoices',
    type: 'Invoice',
    uploadPath: paths.dashboard.invoices.upload,
    icon: 'ph:invoice-bold',
    color: 'info'
  }
];

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format date and time helper for upload timestamps
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Format currency helper
const formatCurrencyWithTwoDecimals = (value) => {
  if (value === null || value === undefined) return '—';
  return fCurrency(value, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function DocumentVault() {
  const router = useRouter();
  const { selectedCompany } = useAuthContext();

  // State management
  const [currentTab, setCurrentTab] = useState('bank_statements');
  const [allDocuments, setAllDocuments] = useState([]);
  const [allStatements, setAllStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [documentToDownload, setDocumentToDownload] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  // Fetch all documents once when component mounts or company changes
  useEffect(() => {
    fetchAllDocuments();
  }, [selectedCompany]);

  const fetchAllDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedCompany?._id) {
        setError('No company selected');
        setLoading(false);
        return;
      }

      // Make single API call to get all documents and statements
      const response = await axiosInstance.get(endpoints.documents.bank);
      if (response.data.success) {
        const { documents, statements } = response.data.data;
        setAllDocuments(documents || []);
        setAllStatements(statements || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch document vault data');
      }

    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError(err.response?.data?.message || 'Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter documents based on current tab
  const getFilteredDocuments = () => {
    if (currentTab === 'bank_statements') {
      return allStatements.filter(stmt => stmt.type === 'bank');
    }

    if (currentTab === 'card_statements') {
      return allStatements.filter(stmt => stmt.type === 'card');
    }

    // For documents (bills, invoices, receipts)
    const currentTabData = DOCUMENT_TABS.find(tab => tab.value === currentTab);
    if (!currentTabData) return [];

    return allDocuments.filter(doc => doc.type === currentTabData.type);
  };

  const documents = getFilteredDocuments();

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    // Clear expanded rows when switching tabs
    setExpandedRows({});
  };

  const handleUploadClick = () => {
    const currentTabData = DOCUMENT_TABS.find(tab => tab.value === currentTab);
    router.push(currentTabData.uploadPath);
  };

  const handleRefresh = () => {
    fetchAllDocuments();
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedDocument(null);
  };

  const handleMenuOpen = (event, document) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const handleDeleteClick = () => {
    setDocumentToDelete(selectedDocument);
    setOpenDeleteDialog(true);
    setAnchorEl(null);
  };

  const handleDownloadClick = () => {
    setDocumentToDownload(selectedDocument);
    setOpenDownloadDialog(true);
    setAnchorEl(null);
  };

  const handleDownloadConfirm = async () => {
    if (!documentToDownload?.filePath) {
      toast.error('File path not available for download');
      setOpenDownloadDialog(false);
      return;
    }

    try {
      setDownloadLoading(true);

      // Create download link
      const link = document.createElement('a');
      link.href = documentToDownload.filePath;
      link.download = documentToDownload.fileName || 'document';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started successfully');
      setOpenDownloadDialog(false);
      setDocumentToDownload(null);
    } catch (error) {
      console.error('Failed to download document:', error);
      toast.error('Failed to download document');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete?._id) {
      toast.error('No document selected for deletion');
      setOpenDeleteDialog(false);
      return;
    }

    try {
      setDeleteLoading(true);

      let endpoint;
      if (currentTab === 'bank_statements' || currentTab === 'card_statements') {
        endpoint = endpoints.documents.statements.delete(documentToDelete._id);
      } else {
        endpoint = endpoints.documents.delete(documentToDelete._id);
      }

      const response = await axiosInstance.delete(endpoint);

      if (response.data.success) {
        toast.success('Document deleted successfully');
        setOpenDeleteDialog(false);
        setDocumentToDelete(null);
        // Update local state to remove the deleted document
        if (currentTab === 'bank_statements' || currentTab === 'card_statements') {
          setAllStatements(prev => prev.filter(stmt => stmt._id !== documentToDelete._id));
        } else {
          setAllDocuments(prev => prev.filter(doc => doc._id !== documentToDelete._id));
        }
      } else {
        throw new Error(response.data.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
      toast.error(error.response?.data?.message || 'Failed to delete document');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: 'Processing', color: 'warning' },
      processing: { label: 'Processing', color: 'info' },
      completed: { label: 'Completed', color: 'success' },
      failed: { label: 'Failed', color: 'error' },
    };

    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip size="small" label={config.label} color={config.color} />;
  };

  const getDocumentDetails = (doc) => {
    if (currentTab === 'bank_statements' || currentTab === 'card_statements') {
      // For statements, use the new processed data structure
      const accountInfo = doc.accountInfo || {};
      const period = doc.period;
      const balances = doc.balances || {};

      // Create display name based on account type
      let displayName = doc.fileName;
      let accountDescription = '';

      if (doc.type === 'card' && accountInfo.cardName) {
        displayName = accountInfo.cardName;
        accountDescription = `${accountInfo.issuerBank || 'Card'}${accountInfo.lastFourDigits ? ' •••• ' + accountInfo.lastFourDigits : ''}`;
      } else if (doc.type === 'bank' && accountInfo.accountName) {
        displayName = accountInfo.accountName;
        accountDescription = `${accountInfo.bankName || 'Bank'}${accountInfo.accountNumber ? ' ••••' + accountInfo.accountNumber.slice(-4) : ''}`;
      } else {
        accountDescription = accountInfo.bankName || accountInfo.issuerBank || 'Statement';
      }

      return {
        name: displayName || doc.fileName,
        uploadDate: formatDateTime(doc.uploadDate),
        amount: null,
        description: accountDescription,
        fileType: doc.fileType,
        documentDate: period ? `${formatDate(period.startDate)} - ${formatDate(period.endDate)}` : null,
        details: {
          fileName: doc.fileName,
          accountType: doc.accountType,
          accountNumber: accountInfo.accountNumber,
          lastFourDigits: accountInfo.lastFourDigits,
          cardName: accountInfo.cardName,
          bankName: accountInfo.bankName,
          issuerBank: accountInfo.issuerBank,
          period: period ? `${formatDate(period.startDate)} - ${formatDate(period.endDate)}` : null,
          transactionCount: doc.transactionCount || 0,
          openingBalance: balances.openingBalance,
          closingBalance: balances.closingBalance,
          totalDeposits: balances.totalDeposits,
          totalWithdrawals: balances.totalWithdrawals,
        }
      };
    } else {
      return {
        name: doc.fileName,
        fileType: doc.fileType,
        uploadDate: formatDateTime(doc.uploadDate),
        amount: doc.total,
        description: doc.vendor || '',
        documentDate: doc.documentDate ? formatDate(doc.documentDate) : null,
        details: {
          fileName: doc.fileName,
          documentDate: doc.documentDate ? formatDate(doc.documentDate) : null,
          documentNumber: doc.documentNumber,
          itemCount: doc.itemCount || 0,
          subtotal: doc.subtotal,
          tax: doc.tax,
          shipping: doc.shipping,
          fees: doc.fees,
          paymentMethod: doc.paymentMethod,
          currency: doc.currency || 'USD',
          ...(doc.type === 'Invoice' && {
            dueDate: doc.dueDate ? formatDate(doc.dueDate) : null,
            balanceDue: doc.balanceDue
          }),
          ...(doc.type === 'Bill' && {
            servicePeriod: doc.servicePeriod,
            totalDue: doc.totalDue
          }),
          ...(doc.type === 'Receipt' && {
            shipmentDate: doc.shipmentDate ? formatDate(doc.shipmentDate) : null
          })
        }
      };
    }
  };

  const handleExpandRow = (docId) => {
    setExpandedRows(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const currentTabData = DOCUMENT_TABS.find(tab => tab.value === currentTab);
  const isStatementTab = currentTab === 'bank_statements' || currentTab === 'card_statements';

  return (
    <DashboardContent>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Document Vault</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<Iconify icon="ph:arrow-clockwise-bold" />}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadClick}
            startIcon={<Iconify icon="ph:cloud-arrow-up-bold" />}
          >
            Upload {currentTabData?.label}
          </Button>
        </Box>
      </Box>

      <Card>
        {/* Tabs */}
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}
        >
          {DOCUMENT_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={<Iconify icon={tab.icon} />}
              iconPosition="start"
            />
          ))}
        </Tabs>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <CircularProgress />
            </Box>
          ) : documents.length === 0 && !error ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <Iconify
                  icon={currentTabData?.icon || 'ph:file-bold'}
                  sx={{
                    fontSize: 120,
                    height: 120,
                    width: 120,
                    opacity: 0.3,
                    color: 'text.secondary',
                  }}
                />
              </Box>
              <Typography variant="h5" gutterBottom>
                No {currentTabData?.label} Found
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                You haven't uploaded any {currentTabData?.label.toLowerCase()} yet. Upload your first document to get started.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Iconify icon="ph:cloud-arrow-up-bold" />}
                onClick={handleUploadClick}
              >
                Upload {currentTabData?.label}
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={40}>#</TableCell>
                    <TableCell width={40} />
                    <TableCell>Document Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>{isStatementTab ? 'Period' : 'Document Date'}</TableCell>
                    <TableCell>Upload Date</TableCell>
                    {!isStatementTab && <TableCell align="right">Amount</TableCell>}
                    <TableCell>Status</TableCell>
                    <TableCell width={100}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc, index) => {
                    const docDetails = getDocumentDetails(doc);
                    const isExpanded = expandedRows[doc._id];
                    return (
                      <React.Fragment key={doc._id}>
                        <TableRow hover>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {index + 1}.
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => handleExpandRow(doc._id)}>
                              <Iconify
                                icon={isExpanded ? 'ph:caret-down-bold' : 'ph:caret-right-bold'}
                              />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {docDetails.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {docDetails.description || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {docDetails.documentDate || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {docDetails.uploadDate}
                            </Typography>
                          </TableCell>
                          {!isStatementTab && (
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {docDetails.amount ? formatCurrencyWithTwoDecimals(docDetails.amount) : '—'}
                              </Typography>
                            </TableCell>
                          )}
                          <TableCell>
                            {getStatusChip(doc.status || 'completed')}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton
                                size="small"
                                onClick={() => handleViewDocument(doc)}
                                title="View Document"
                              >
                                <Iconify icon="ph:eye-bold" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, doc)}
                                title="More Actions"
                              >
                                <Iconify icon="ph:dots-three-vertical-bold" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Row Details */}
                        <TableRow>
                          <TableCell colSpan={isStatementTab ? 8 : 9} sx={{ py: 0, border: 'none' }}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <Box sx={{ py: 2, px: 1 }}>
                                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                                  <Grid container spacing={3}>
                                    {isStatementTab ? (
                                      // Statement Details
                                      <>
                                        <Grid item xs={12} md={4}>
                                          <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                            <Iconify icon="ph:info-bold" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                                            Account Information
                                          </Typography>
                                          <Stack spacing={1.5}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                              <Typography variant="body2" color="text.secondary">
                                                File Name:
                                              </Typography>
                                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {docDetails.details.fileName || '—'}
                                              </Typography>
                                            </Box>
                                            <Divider />
                                            {docDetails.details.accountType === 'credit_card' ? (
                                              <>
                                                {docDetails.details.cardName && (
                                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                      Card Name:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                      {docDetails.details.cardName}
                                                    </Typography>
                                                  </Box>
                                                )}
                                                {docDetails.details.issuerBank && (
                                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                      Issuer:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                      {docDetails.details.issuerBank}
                                                    </Typography>
                                                  </Box>
                                                )}
                                                {docDetails.details.lastFourDigits && (
                                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                      Card Number:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                      •••• •••• •••• {docDetails.details.lastFourDigits}
                                                    </Typography>
                                                  </Box>
                                                )}
                                              </>
                                            ) : (
                                              <>
                                                {docDetails.details.bankName && (
                                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                      Bank Name:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                      {docDetails.details.bankName}
                                                    </Typography>
                                                  </Box>
                                                )}
                                                {docDetails.details.accountNumber && (
                                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                      Account Number:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                      ••••••{docDetails.details.accountNumber.slice(-4)}
                                                    </Typography>
                                                  </Box>
                                                )}
                                              </>
                                            )}
                                          </Stack>
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                          <Typography variant="subtitle2" gutterBottom sx={{ color: 'info.main', fontWeight: 'bold' }}>
                                            <Iconify icon="ph:calendar-blank-bold" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                                            Statement Period
                                          </Typography>
                                          <Stack spacing={1.5}>
                                            {docDetails.details.period ? (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Period:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                  {docDetails.details.period}
                                                </Typography>
                                              </Box>
                                            ) : (
                                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                Period information not available
                                              </Typography>
                                            )}
                                            <Divider />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                              <Typography variant="body2" color="text.secondary">
                                                Transactions:
                                              </Typography>
                                              <Chip
                                                label={docDetails.details.transactionCount}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                              />
                                            </Box>
                                          </Stack>
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                          <Typography variant="subtitle2" gutterBottom sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                            <Iconify icon="ph:currency-dollar-bold" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                                            Balance Information
                                          </Typography>
                                          <Stack spacing={1.5}>
                                            {docDetails.details.openingBalance !== null && docDetails.details.openingBalance !== undefined ? (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Opening Balance:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium', color: docDetails.details.openingBalance >= 0 ? 'success.main' : 'error.main' }}>
                                                  {formatCurrencyWithTwoDecimals(docDetails.details.openingBalance)}
                                                </Typography>
                                              </Box>
                                            ) : null}
                                            {docDetails.details.closingBalance !== null && docDetails.details.closingBalance !== undefined ? (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Closing Balance:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium', color: docDetails.details.closingBalance >= 0 ? 'success.main' : 'error.main' }}>
                                                  {formatCurrencyWithTwoDecimals(docDetails.details.closingBalance)}
                                                </Typography>
                                              </Box>
                                            ) : null}
                                            {docDetails.details.totalDeposits !== null && docDetails.details.totalDeposits !== undefined ? (
                                              <>
                                                <Divider />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                  <Typography variant="body2" color="text.secondary">
                                                    Total Deposits:
                                                  </Typography>
                                                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'success.main' }}>
                                                    {formatCurrencyWithTwoDecimals(docDetails.details.totalDeposits)}
                                                  </Typography>
                                                </Box>
                                              </>
                                            ) : null}
                                            {docDetails.details.totalWithdrawals !== null && docDetails.details.totalWithdrawals !== undefined ? (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Total Withdrawals:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'error.main' }}>
                                                  {formatCurrencyWithTwoDecimals(docDetails.details.totalWithdrawals)}
                                                </Typography>
                                              </Box>
                                            ) : null}
                                            {(!docDetails.details.openingBalance && !docDetails.details.closingBalance && !docDetails.details.totalDeposits && !docDetails.details.totalWithdrawals) && (
                                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                Balance information not available
                                              </Typography>
                                            )}
                                          </Stack>
                                        </Grid>
                                      </>
                                    ) : (
                                      // Document Details
                                      <>
                                        <Grid item xs={12} md={6}>
                                          <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                            <Iconify icon="ph:info-bold" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                                            Document Information
                                          </Typography>
                                          <Stack spacing={1.5}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                              <Typography variant="body2" color="text.secondary">
                                                File Name:
                                              </Typography>
                                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {docDetails.details.fileName || '—'}
                                              </Typography>
                                            </Box>
                                            <Divider />
                                            {docDetails.details.documentNumber && (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Document Number:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                  {docDetails.details.documentNumber}
                                                </Typography>
                                              </Box>
                                            )}
                                            {docDetails.details.documentDate && (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Document Date:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                  {docDetails.details.documentDate}
                                                </Typography>
                                              </Box>
                                            )}
                                            {docDetails.details.itemCount > 0 && (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Items:
                                                </Typography>
                                                <Chip
                                                  label={docDetails.details.itemCount}
                                                  size="small"
                                                  color="primary"
                                                  variant="outlined"
                                                />
                                              </Box>
                                            )}
                                            {docDetails.details.paymentMethod && (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Payment Method:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                  {docDetails.details.paymentMethod}
                                                </Typography>
                                              </Box>
                                            )}
                                            {docDetails.details.currency && docDetails.details.currency !== 'USD' && (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Currency:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                  {docDetails.details.currency}
                                                </Typography>
                                              </Box>
                                            )}
                                            {/* Invoice specific fields */}
                                            {doc.type === 'Invoice' && docDetails.details.dueDate && (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Due Date:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                  {docDetails.details.dueDate}
                                                </Typography>
                                              </Box>
                                            )}
                                            {/* Bill specific fields */}
                                            {doc.type === 'Bill' && docDetails.details.servicePeriod && (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Service Period:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                  {docDetails.details.servicePeriod}
                                                </Typography>
                                              </Box>
                                            )}
                                            {/* Receipt specific fields */}
                                            {doc.type === 'Receipt' && docDetails.details.shipmentDate && (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Shipment Date:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                  {docDetails.details.shipmentDate}
                                                </Typography>
                                              </Box>
                                            )}
                                          </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                          <Typography variant="subtitle2" gutterBottom sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                            <Iconify icon="ph:currency-dollar-bold" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                                            Financial Details
                                          </Typography>
                                          <Stack spacing={1.5}>
                                            {docDetails.details.subtotal !== undefined && docDetails.details.subtotal > 0 && (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Subtotal:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                  {formatCurrencyWithTwoDecimals(docDetails.details.subtotal)}
                                                </Typography>
                                              </Box>
                                            )}
                                            {docDetails.details.tax !== undefined && docDetails.details.tax > 0 && (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Tax:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                  {formatCurrencyWithTwoDecimals(docDetails.details.tax)}
                                                </Typography>
                                              </Box>
                                            )}
                                            {docDetails.details.shipping !== undefined && docDetails.details.shipping > 0 && (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Shipping:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                  {formatCurrencyWithTwoDecimals(docDetails.details.shipping)}
                                                </Typography>
                                              </Box>
                                            )}
                                            {docDetails.details.fees !== undefined && docDetails.details.fees > 0 && (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Fees:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                  {formatCurrencyWithTwoDecimals(docDetails.details.fees)}
                                                </Typography>
                                              </Box>
                                            )}
                                            <Divider />
                                            {/* Invoice specific: Balance Due */}
                                            {doc.type === 'Invoice' && docDetails.details.balanceDue !== undefined && (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Balance Due:
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                  color: docDetails.details.balanceDue > 0 ? 'error.main' : 'success.main',
                                                  fontWeight: 'bold'
                                                }}>
                                                  {formatCurrencyWithTwoDecimals(docDetails.details.balanceDue)}
                                                </Typography>
                                              </Box>
                                            )}
                                            {/* Bill specific: Total Due */}
                                            {doc.type === 'Bill' && docDetails.details.totalDue !== undefined && (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Total Due:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                                  {formatCurrencyWithTwoDecimals(docDetails.details.totalDue)}
                                                </Typography>
                                              </Box>
                                            )}
                                            {/* Total amount */}
                                            {docDetails.amount !== null && docDetails.amount !== undefined && (
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: 'success.lighter', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                  Total:
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                                  {formatCurrencyWithTwoDecimals(docDetails.amount)}
                                                </Typography>
                                              </Box>
                                            )}
                                          </Stack>
                                        </Grid>
                                      </>
                                    )}
                                  </Grid>
                                </Paper>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleViewDocument(selectedDocument)}>
          <Iconify icon="ph:eye-bold" sx={{ mr: 1 }} />
          View
        </MenuItem>
        <MenuItem onClick={handleDownloadClick}>
          <Iconify icon="ph:download-bold" sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Iconify icon="ph:trash-bold" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* View Document Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle>
          {selectedDocument && (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Iconify icon={currentTabData?.icon || 'ph:file-bold'} />
              <Box>
                <Typography variant="h6">
                  {getDocumentDetails(selectedDocument).name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedDocument.fileName}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedDocument && (
            <FileViewer document={selectedDocument} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="ph:download-bold" />}
            onClick={() => {
              setDocumentToDownload(selectedDocument);
              setOpenDownloadDialog(true);
              setOpenViewDialog(false);
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
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
            Are you sure you want to delete this document?
          </Typography>
          {documentToDelete && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Document:</strong> {getDocumentDetails(documentToDelete).name}
            </Typography>
          )}
          <Alert severity="warning">
            <AlertTitle>Warning</AlertTitle>
            This action will permanently delete the document and all its associations. This cannot be undone.
            {!isStatementTab &&
              ' Any associated transaction matches will also be removed.'
            }
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            startIcon={deleteLoading ? <CircularProgress size={16} /> : <Iconify icon="ph:trash-bold" />}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Document'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Download Confirmation Dialog */}
      <Dialog
        open={openDownloadDialog}
        onClose={() => setOpenDownloadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="ph:download-bold" sx={{ color: 'primary.main' }} />
            Download Document
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to download the following document:
          </Typography>
          {documentToDownload && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Document:</strong> {getDocumentDetails(documentToDownload).name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>File:</strong> {documentToDownload.fileName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Type:</strong> {currentTabData?.label}
              </Typography>
            </Box>
          )}
          <Alert severity="info">
            <AlertTitle>Download Information</AlertTitle>
            The document will be downloaded in its original format. Make sure you have sufficient storage space.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDownloadDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDownloadConfirm}
            color="primary"
            variant="contained"
            startIcon={downloadLoading ? <CircularProgress size={16} /> : <Iconify icon="ph:download-bold" />}
            disabled={downloadLoading}
          >
            {downloadLoading ? 'Downloading...' : 'Download'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}