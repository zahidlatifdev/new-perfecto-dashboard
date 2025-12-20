'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Chip from '@mui/material/Chip';
import TableContainer from '@mui/material/TableContainer';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import TextField from '@mui/material/TextField';
import { toast } from 'react-hot-toast';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { FileViewer } from 'src/components/file-viewer';
import { fCurrency } from 'src/utils/format-number';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { Tab, Tabs } from '@mui/material';
import { CategorySelector } from 'src/components/category-selector';

// ----------------------------------------------------------------------

// Format currency with exactly 2 decimal places
const formatCurrencyWithTwoDecimals = (value) => {
  return fCurrency(value, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Format date in MM/DD/YYYY format
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Helper function to determine if a category is personal based on category name
const isPersonalCategory = (categoryName) => {
  if (!categoryName) return false;
  
  const personalKeywords = [
    'Personal', 'Food & Dining', 'Entertainment', 'Healthcare', 'Health Supplements',
    'Personal Care', 'Family & Friends', 'Personal Travel', 'Personal Transportation',
    'Housing', 'Shopping', 'Financial Services', 'Subscriptions', 'Cash Operations',
    'Education', 'Gifts & Donations', 'Personal Insurance', 'Personal Utilities'
  ];
  
  return personalKeywords.some(keyword => categoryName.includes(keyword));
};

// Helper function to format date for input
const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Helper function to parse date from input
const parseDateFromInput = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString);
};

export function ReceiptsListView() {
  const router = useRouter();
  const { selectedCompany } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dialogTab, setDialogTab] = useState(0);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);

  // New state for edit and delete functionality
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReceiptForAction, setSelectedReceiptForAction] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    vendorName: '',
    invoiceNumber: '',
    total: '',
    invoiceDate: '',
    tax: '',
    subtotal: '',
    shipping: '',
    paymentMethod: '',
    billingName: '',
    items: [],
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, [selectedCompany, filter, page, limit]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedCompany?._id) {
        setError('No company selected');
        setLoading(false);
        return;
      }

      // Fetch receipt documents using the correct API endpoint
      const response = await axiosInstance.get(endpoints.documents.list, {
        params: {
          type: 'Receipt',
          status: filter === 'all' ? undefined : filter,
          page,
          limit,
        },
      });

      // Handle the correct response structure from API documentation
      if (response.data.success) {
        const receipts = response.data.data?.documents || [];
        setDocuments(receipts);
        const pagination = response.data.data?.pagination;
        if (pagination) {
          setTotal(pagination.total ?? receipts.length);
        } else {
          setTotal(receipts.length);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch receipts');
      }
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
      setError(err.response?.data?.message || 'Failed to load receipts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (receipt) => {
    setSelectedDocument(receipt);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedDocument(null);
  };

  const handleExpandRow = (receiptId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [receiptId]: !prev[receiptId],
    }));
  };

  const handleUploadNew = () => {
    router.push('/dashboard/receipts/upload');
  };

  const handleRefresh = () => {
    fetchReceipts();
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    const maxPage = Math.max(1, Math.ceil(total / limit));
    if (page < maxPage) setPage(page + 1);
  };

  const handleMenuOpen = (event, receipt) => {
    setAnchorEl(event.currentTarget);
    setSelectedReceiptForAction(receipt);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setSelectedReceiptForAction(null);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setSelectedReceiptForAction(null);
  };

  const handleEditClick = () => {
    if (selectedReceiptForAction) {
      const isInvoice = selectedReceiptForAction.documentType === 'Invoice';
      const receiptData = getReceiptData(selectedReceiptForAction);

      setEditFormData({
        vendorName: isInvoice ? (selectedReceiptForAction.vendorName || '') : (selectedReceiptForAction.vendor || ''),
        invoiceNumber: receiptData.receiptNumber,
        total: selectedReceiptForAction.total || '',
        invoiceDate: formatDateForInput(receiptData.date),
        tax: selectedReceiptForAction.tax || '',
        subtotal: selectedReceiptForAction.subtotal || '',
        shipping: selectedReceiptForAction.shipping || '',
        paymentMethod: selectedReceiptForAction.paymentMethod || '',
        billingName: selectedReceiptForAction.billingName || '',
        items: selectedReceiptForAction.items ? selectedReceiptForAction.items.map(item => ({
          ...item,
          category: item.category || 'Uncategorized'
        })) : [],
      });
      setOpenEditDialog(true);
    }
    setAnchorEl(null);
  };

  const handleItemChange = (idx, field, value) => {
    setEditFormData(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };

      // Auto-calculate total price if quantity or unit price changes
      if (field === 'quantity' || field === 'rate' || field === 'unitPrice') {
        const quantity = parseFloat(field === 'quantity' ? value : items[idx].quantity) || 0;
        const unitPrice = parseFloat(field === 'rate' ? value : (field === 'unitPrice' ? value : (items[idx].rate || items[idx].unitPrice))) || 0;
        const totalPrice = quantity * unitPrice;
        items[idx].amount = totalPrice;
        items[idx].totalPrice = totalPrice;
      }

      // Recalculate totals
      const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount || item.totalPrice) || 0), 0);
      const tax = parseFloat(prev.tax) || 0;
      const shipping = parseFloat(prev.shipping) || 0;
      const total = subtotal + tax + shipping;

      return {
        ...prev,
        items,
        subtotal: subtotal.toFixed(2),
        total: total.toFixed(2)
      };
    });
  };

  const handleAddItem = () => {
    setEditFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        quantity: 1,
        rate: 0,
        unitPrice: 0,
        amount: 0,
        totalPrice: 0,
        category: 'Uncategorized',
        condition: '',
        soldBy: '',
        suppliedBy: ''
      }],
    }));
  };

  const handleDeleteItem = (idx) => {
    setEditFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    setAnchorEl(null);
  };

  const handleEditSubmit = async () => {
    try {
      setEditLoading(true);

      const isInvoice = selectedReceiptForAction.documentType === 'Invoice';
      const updateData = {
        total: parseFloat(editFormData.total) || 0,
        tax: parseFloat(editFormData.tax) || 0,
        subtotal: parseFloat(editFormData.subtotal) || 0,
        shipping: parseFloat(editFormData.shipping) || 0,
        paymentMethod: editFormData.paymentMethod,
        billingName: editFormData.billingName,
        items: editFormData.items,
      };

      if (isInvoice) {
        updateData.vendorName = editFormData.vendorName;
        updateData.invoiceNumber = editFormData.invoiceNumber;
        updateData.invoiceDate = parseDateFromInput(editFormData.invoiceDate);
      } else {
        updateData.vendor = editFormData.vendorName;
        updateData.receiptNumber = editFormData.invoiceNumber;
        updateData.receiptDate = parseDateFromInput(editFormData.invoiceDate);
      }

      const response = await axiosInstance.put(
        endpoints.documents.update(selectedReceiptForAction._id),
        updateData
      );

      if (response.data.success) {
        toast.success('Receipt updated successfully');
        setOpenEditDialog(false);
        fetchReceipts();
      } else {
        throw new Error(response.data.message || 'Failed to update receipt');
      }
    } catch (error) {
      console.error('Failed to update receipt:', error);
      toast.error(error.response?.data?.message || 'Failed to update receipt');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReceiptForAction || !selectedReceiptForAction._id) {
      toast.error('No receipt selected for deletion');
      setOpenDeleteDialog(false);
      return;
    }
    try {
      setDeleteLoading(true);

      const response = await axiosInstance.delete(
        endpoints.documents.delete(selectedReceiptForAction._id)
      );

      if (response.data.success) {
        toast.success('Receipt deleted successfully');
        setOpenDeleteDialog(false);
        fetchReceipts();
      } else {
        throw new Error(response.data.message || 'Failed to delete receipt');
      }
    } catch (error) {
      console.error('Failed to delete receipt:', error);
      toast.error(error.response?.data?.message || 'Failed to delete receipt');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Recalculate total if tax or shipping changes
      if (field === 'tax' || field === 'shipping' || field === 'subtotal') {
        const subtotal = parseFloat(updated.subtotal) || 0;
        const tax = parseFloat(updated.tax) || 0;
        const shipping = parseFloat(updated.shipping) || 0;
        updated.total = (subtotal + tax + shipping).toFixed(2);
      }

      return updated;
    });
  };

  const getExtractedDataObject = (doc) => {
    // Return the document itself as it contains all the extracted data
    return doc || {};
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

  const getTypeChip = (type) => {
    const typeConfig = {
      Invoice: { label: 'Invoice', color: 'primary' },
      Receipt: { label: 'Receipt', color: 'secondary' },
      expense: { label: 'Expense', color: 'error' },
      income: { label: 'Income', color: 'success' },
    };

    const config = typeConfig[type] || { label: type || 'Document', color: 'default' };
    return <Chip size="small" label={config.label} color={config.color} variant="outlined" />;
  };

  const getReceiptData = (receipt) => {
    const isInvoice = receipt.documentType === 'Invoice';

    return {
      receiptNumber: isInvoice ? (receipt.invoiceNumber || 'N/A') : (receipt.receiptNumber || receipt.invoiceNumber || 'N/A'),
      amount: receipt.total || 0,
      date: isInvoice ? (receipt.invoiceDate || receipt.createdAt) : (receipt.receiptDate || receipt.orderDate || receipt.invoiceDate || receipt.createdAt),
      vendor: isInvoice ? (receipt.vendorName || receipt.billingName || 'Unknown') : (receipt.vendor || receipt.billingName || 'Unknown'),
      lineItems: receipt.items || [],
      tax: receipt.tax || 0,
      subtotal: receipt.subtotal || 0,
    };
  };

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Receipts</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select value={filter} onChange={(e) => { setPage(1); setFilter(e.target.value); }} displayEmpty>
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<Iconify icon="ph:arrow-clockwise-bold" />}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadNew}
            startIcon={<Iconify icon="ph:cloud-arrow-up-bold" />}
          >
            Upload Receipt
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {documents.length === 0 && !error && !loading && (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Box sx={{ maxWidth: 480, mx: 'auto' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <Iconify
                icon="ph:receipt-bold"
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
              No Receipts Found
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {filter === 'all'
                ? "You haven't uploaded any receipts yet. Upload a receipt to get started with document processing."
                : `No receipts found with status "${filter}". Try changing the filter or upload a new receipt.`}
            </Typography>

            <Button
              variant="contained"
              startIcon={<Iconify icon="ph:cloud-arrow-up-bold" />}
              onClick={handleUploadNew}
            >
              Upload Your First Receipt
            </Button>
          </Box>
        </Card>
      )}

      {documents.length > 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell />
                  <TableCell>Receipt #</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((receipt, index) => {
                  const receiptData = getReceiptData(receipt);
                  const isExpanded = expandedRows[receipt._id];
                  return (
                    <React.Fragment key={receipt._id}>
                      <TableRow key={receipt._id}>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {(page - 1) * limit + index + 1}.
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleExpandRow(receipt._id)}>
                            <Iconify
                              icon={isExpanded ? 'ph:caret-down-bold' : 'ph:caret-right-bold'}
                            />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {receiptData.receiptNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {receiptData.vendor}
                          </Typography>
                        </TableCell>
                        <TableCell>{getTypeChip(receipt.documentType || 'Receipt')}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(receiptData.date)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {formatCurrencyWithTwoDecimals(receiptData.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>{getStatusChip(receipt.status)}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(receipt)}
                              title="View Details"
                            >
                              <Iconify icon="ph:eye-bold" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, receipt)}
                              title="More Actions"
                            >
                              <Iconify icon="ph:dots-three-vertical-bold" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row Details */}
                      <TableRow key={receipt._id + '-expanded'}>
                        <TableCell colSpan={9} sx={{ py: 0 }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 2, px: 1 }}>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Receipt Details
                                  </Typography>
                                  <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" color="text.secondary">
                                        File Name:
                                      </Typography>
                                      <Typography variant="body2">{receipt.fileName}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" color="text.secondary">
                                        Order ID:
                                      </Typography>
                                      <Typography variant="body2">
                                        {receipt.orderId || '—'}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" color="text.secondary">
                                        Subtotal:
                                      </Typography>
                                      <Typography variant="body2">
                                        {formatCurrencyWithTwoDecimals(receiptData.subtotal)}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" color="text.secondary">
                                        Tax:
                                      </Typography>
                                      <Typography variant="body2">
                                        {formatCurrencyWithTwoDecimals(receiptData.tax)}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Grid>

                                {receiptData.lineItems.length > 0 && (
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Items
                                    </Typography>
                                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                                      {receiptData.lineItems.slice(0, 5).map((item, index) => (
                                        <Box
                                          key={index}
                                          sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            py: 0.5,
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                          }}
                                        >
                                          <Typography variant="body2" sx={{ flex: 1 }}>
                                            {item.name || `Item ${index + 1}`}
                                            {item.quantity && (
                                              <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                                                (Qty: {item.quantity})
                                              </Typography>
                                            )}
                                          </Typography>
                                          <Typography variant="body2">
                                            {formatCurrencyWithTwoDecimals(
                                              item.amount || item.totalPrice || item.total || 0
                                            )}
                                          </Typography>
                                        </Box>
                                      ))}
                                      {receiptData.lineItems.length > 5 && (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ mt: 1 }}
                                        >
                                          +{receiptData.lineItems.length - 5} more items
                                        </Typography>
                                      )}
                                    </Box>
                                  </Grid>
                                )}
                              </Grid>
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
          {/* Pagination */}
          <Box
            sx={{
              p: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {`Showing ${documents.length === 0 ? 0 : (page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total} receipts`}
            </Typography>

            <Box>
              <IconButton size="small" onClick={handlePrevPage} disabled={page === 1}>
                <Iconify icon="ph:caret-left-bold" />
              </IconButton>
              <Typography variant="caption" sx={{ mx: 1 }}>
                Page {page} of {Math.max(1, Math.ceil(total / limit))}
              </Typography>
              <IconButton size="small" onClick={handleNextPage} disabled={page >= Math.ceil(total / limit)}>
                <Iconify icon="ph:caret-right-bold" />
              </IconButton>
            </Box>
          </Box>
        </Card>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEditClick}>
          <Iconify icon="ph:pencil-bold" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => window.open(selectedReceiptForAction?.filePath, '_blank')}>
          <Iconify icon="ph:download-bold" sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Iconify icon="ph:trash-bold" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Receipt</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Receipt Information Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Receipt Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Vendor Name"
                value={editFormData.vendorName ?? ''}
                onChange={e => handleEditFormChange('vendorName', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Receipt/Order Number"
                value={editFormData.invoiceNumber ?? ''}
                onChange={e => handleEditFormChange('invoiceNumber', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Receipt Date"
                type="date"
                value={editFormData.invoiceDate ?? ''}
                onChange={e => handleEditFormChange('invoiceDate', e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Payment Method"
                value={editFormData.paymentMethod ?? ''}
                onChange={e => handleEditFormChange('paymentMethod', e.target.value)}
                size="small"
                fullWidth
                placeholder="e.g., Credit Card, Cash, Debit Card"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Billing Name"
                value={editFormData.billingName ?? ''}
                onChange={e => handleEditFormChange('billingName', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>

            {/* Financial Summary Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>
                Financial Summary
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Subtotal"
                type="number"
                value={editFormData.subtotal ?? ''}
                onChange={e => handleEditFormChange('subtotal', e.target.value)}
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>$</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Tax"
                type="number"
                value={editFormData.tax ?? ''}
                onChange={e => handleEditFormChange('tax', e.target.value)}
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>$</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Shipping"
                type="number"
                value={editFormData.shipping ?? ''}
                onChange={e => handleEditFormChange('shipping', e.target.value)}
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>$</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Total Amount"
                type="number"
                value={editFormData.total ?? ''}
                onChange={e => handleEditFormChange('total', e.target.value)}
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>$</Typography>
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'primary.lighter',
                    fontWeight: 'bold'
                  }
                }}
              />
            </Grid>
            {/* Items Section - Enhanced */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>
                Items ({editFormData.items.length})
              </Typography>
              {editFormData.items.map((item, idx) => (
                <Card key={idx} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Description"
                        value={item.name ?? ''}
                        onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CategorySelector
                        value={item.category ?? 'Uncategorized'}
                        onChange={(value) => handleItemChange(idx, 'category', value)}
                        transactionType="debit"
                        isPersonal={isPersonalCategory(item.category) || (!item.category || item.category === 'Uncategorized')}
                        label="Category"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Quantity"
                        type="number"
                        value={item.quantity ?? ''}
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                        size="small"
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Unit Price"
                        type="number"
                        value={item.rate || item.unitPrice || ''}
                        onChange={e => handleItemChange(idx, item.rate ? 'rate' : 'unitPrice', e.target.value)}
                        size="small"
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                        InputProps={{
                          startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>$</Typography>
                        }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Total Price"
                        type="number"
                        value={item.amount || item.totalPrice || ''}
                        onChange={e => handleItemChange(idx, item.amount ? 'amount' : 'totalPrice', e.target.value)}
                        size="small"
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                        InputProps={{
                          startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>$</Typography>
                        }}
                      />
                    </Grid>

                    {/* Receipt-specific fields */}
                    {(item.condition || item.soldBy || item.suppliedBy) && (
                      <>
                        {item.condition && (
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="Condition"
                              value={item.condition ?? ''}
                              onChange={e => handleItemChange(idx, 'condition', e.target.value)}
                              size="small"
                              fullWidth
                            />
                          </Grid>
                        )}
                        {item.soldBy && (
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="Sold By"
                              value={item.soldBy ?? ''}
                              onChange={e => handleItemChange(idx, 'soldBy', e.target.value)}
                              size="small"
                              fullWidth
                            />
                          </Grid>
                        )}
                        {item.suppliedBy && (
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="Supplied By"
                              value={item.suppliedBy ?? ''}
                              onChange={e => handleItemChange(idx, 'suppliedBy', e.target.value)}
                              size="small"
                              fullWidth
                            />
                          </Grid>
                        )}
                      </>
                    )}

                    <Grid item xs={6} sm={3}>
                      <Button
                        color="error"
                        variant="outlined"
                        size="small"
                        onClick={() => handleDeleteItem(idx)}
                        startIcon={<Iconify icon="ph:trash-bold" />}
                        fullWidth
                      >
                        Delete
                      </Button>
                    </Grid>
                  </Grid>
                </Card>
              ))}
              <Button
                variant="outlined"
                onClick={handleAddItem}
                startIcon={<Iconify icon="ph:plus-bold" />}
                sx={{ mt: 1 }}
              >
                Add Item
              </Button>

              {/* Items Summary */}
              {editFormData.items.length > 0 && (
                <Card sx={{ mt: 2, p: 2, bgcolor: 'background.neutral' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Items Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Total Items
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {editFormData.items.length}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Items Subtotal
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ${editFormData.items.reduce((sum, item) => sum + (parseFloat(item.amount || item.totalPrice) || 0), 0).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Tax & Shipping
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ${((parseFloat(editFormData.tax) || 0) + (parseFloat(editFormData.shipping) || 0)).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Grand Total
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        ${editFormData.total}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleEditDialogClose} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            disabled={editLoading || !editFormData.vendorName || !editFormData.total}
            startIcon={editLoading ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="ph:floppy-disk-bold" />}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Receipt</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this receipt? This action cannot be undone.
          </Typography>
          {selectedReceiptForAction && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                Receipt: {getReceiptData(selectedReceiptForAction).receiptNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vendor: {getReceiptData(selectedReceiptForAction).vendor}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Amount: {formatCurrencyWithTwoDecimals(selectedReceiptForAction.total || 0)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={openDetailDialog} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Receipt Details
          {selectedDocument && (
            <Typography variant="body2" color="text.secondary">
              {selectedDocument.fileName}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent>
          {selectedDocument && (
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

              {/* Tab 0: Document */}
              {dialogTab === 0 && (
                <Box sx={{ mb: 3 }}>
                  <FileViewer document={selectedDocument} compact />
                </Box>
              )}

              {/* Tab 1: Summary */}
              {dialogTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Receipt Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Receipt Number
                        </Typography>
                        <Typography variant="body1">
                          {getReceiptData(selectedDocument).receiptNumber}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Vendor
                        </Typography>
                        <Typography variant="body1">
                          {getReceiptData(selectedDocument).vendor}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Amount
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatCurrencyWithTwoDecimals(getReceiptData(selectedDocument).amount)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Processing Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        {getStatusChip(selectedDocument.status)}
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Confidence Score
                        </Typography>
                        <Typography variant="body1">
                          {selectedDocument.confidence
                            ? `${(selectedDocument.confidence * 100).toFixed(1)}%`
                            : 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Uploaded At
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(selectedDocument.createdAt)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  {/* Items Table */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Items
                    </Typography>
                    {Array.isArray(selectedDocument.items) && selectedDocument.items.length > 0 ? (
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
                          {selectedDocument.items.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{item.name || '—'}</TableCell>
                              <TableCell align="center">{item.quantity ?? '—'}</TableCell>
                              <TableCell align="right">
                                {item.rate ? formatCurrencyWithTwoDecimals(item.rate) : (item.unitPrice ? formatCurrencyWithTwoDecimals(item.unitPrice) : '—')}
                              </TableCell>
                              <TableCell align="right">
                                {item.amount
                                  ? formatCurrencyWithTwoDecimals(item.amount)
                                  : (item.totalPrice ? formatCurrencyWithTwoDecimals(item.totalPrice) : '—')}
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
          <Button onClick={handleCloseDetailDialog}>Close</Button>
          <Button variant="contained" onClick={handleCloseDetailDialog}>
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}