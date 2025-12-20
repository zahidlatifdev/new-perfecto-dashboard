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

// Helper for date input formatting
function formatDateForInput(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export function InvoicesListView() {
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
  const [selectedInvoiceForAction, setSelectedInvoiceForAction] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    vendorName: '',
    invoiceNumber: '',
    total: '',
    invoiceDate: '',
    dueDate: '',
    tax: '',
    subtotal: '',
    shipping: '',
    paymentMethod: '',
    billingName: '',
    billingCompany: '',
    billingAddress: '',
    items: [],
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [selectedCompany, filter, page, limit]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedCompany?._id) {
        setError('No company selected');
        setLoading(false);
        return;
      }

      // Fetch invoice documents using the correct API endpoint
      const response = await axiosInstance.get(endpoints.documents.list, {
        params: {
          type: 'Invoice',
          status: filter === 'all' ? undefined : filter,
          page,
          limit,
        },
      });

      // Handle the correct response structure from API documentation
      if (response.data.success) {
        const invoices = response.data.data?.documents || [];
        setDocuments(invoices);
        const pagination = response.data.data?.pagination;
        if (pagination) {
          setTotal(pagination.total ?? invoices.length);
        } else {
          setTotal(invoices.length);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch invoices');
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      setError(err.response?.data?.message || 'Failed to load invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (invoice) => {
    setSelectedDocument(invoice);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedDocument(null);
  };

  const handleExpandRow = (invoiceId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [invoiceId]: !prev[invoiceId],
    }));
  };

  const handleUploadNew = () => {
    router.push('/dashboard/invoices/upload');
  };

  const handleRefresh = () => {
    fetchInvoices();
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    const maxPage = Math.max(1, Math.ceil(total / limit));
    if (page < maxPage) setPage(page + 1);
  };

  const handleMenuOpen = (event, invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoiceForAction(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setSelectedInvoiceForAction(null);
  };

  const handleEditClick = () => {
    if (selectedInvoiceForAction) {
      setEditFormData({
        vendorName: selectedInvoiceForAction.vendorName || '',
        invoiceNumber: selectedInvoiceForAction.invoiceNumber || '',
        total: selectedInvoiceForAction.total || '',
        invoiceDate: selectedInvoiceForAction.invoiceDate ? formatDateForInput(selectedInvoiceForAction.invoiceDate) : '',
        dueDate: selectedInvoiceForAction.dueDate ? formatDateForInput(selectedInvoiceForAction.dueDate) : '',
        tax: selectedInvoiceForAction.tax || '',
        subtotal: selectedInvoiceForAction.subtotal || '',
        shipping: selectedInvoiceForAction.shipping || '',
        paymentMethod: selectedInvoiceForAction.paymentMethod || '',
        billingName: selectedInvoiceForAction.billingName || '',
        billingCompany: selectedInvoiceForAction.billingCompany || '',
        billingAddress: selectedInvoiceForAction.billingAddress || '',
        items: selectedInvoiceForAction.items ? selectedInvoiceForAction.items.map(item => ({
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

      // Auto-calculate amount if quantity or rate changes
      if (field === 'quantity' || field === 'rate') {
        const quantity = parseFloat(field === 'quantity' ? value : items[idx].quantity) || 0;
        const rate = parseFloat(field === 'rate' ? value : items[idx].rate) || 0;
        items[idx].amount = quantity * rate;
      }

      // Recalculate totals
      const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
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
        amount: 0,
        category: 'Uncategorized'
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

      const updateData = {
        vendorName: editFormData.vendorName,
        invoiceNumber: editFormData.invoiceNumber,
        total: parseFloat(editFormData.total) || 0,
        invoiceDate: editFormData.invoiceDate ? new Date(editFormData.invoiceDate) : null,
        dueDate: editFormData.dueDate ? new Date(editFormData.dueDate) : null,
        tax: parseFloat(editFormData.tax) || 0,
        subtotal: parseFloat(editFormData.subtotal) || 0,
        shipping: parseFloat(editFormData.shipping) || 0,
        paymentMethod: editFormData.paymentMethod,
        billingName: editFormData.billingName,
        billingCompany: editFormData.billingCompany,
        billingAddress: editFormData.billingAddress,
        items: editFormData.items,
      };

      const response = await axiosInstance.put(
        endpoints.documents.update(selectedInvoiceForAction._id),
        updateData
      );

      if (response.data.success) {
        toast.success('Invoice updated successfully');
        setOpenEditDialog(false);
        fetchInvoices();
      } else {
        throw new Error(response.data.message || 'Failed to update invoice');
      }
    } catch (error) {
      console.error('Failed to update invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to update invoice');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInvoiceForAction || !selectedInvoiceForAction._id) {
      toast.error('No invoice selected for deletion');
      setOpenDeleteDialog(false);
      return;
    }
    try {
      setDeleteLoading(true);

      const response = await axiosInstance.delete(
        endpoints.documents.delete(selectedInvoiceForAction._id)
      );

      if (response.data.success) {
        toast.success('Invoice deleted successfully');
        setOpenDeleteDialog(false);
        fetchInvoices();
      } else {
        throw new Error(response.data.message || 'Failed to delete invoice');
      }
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to delete invoice');
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

  const getInvoiceData = (invoice) => {
    const isInvoice = invoice.documentType === 'Invoice';

    return {
      invoiceNumber: isInvoice ? (invoice.invoiceNumber || 'N/A') : (invoice.receiptNumber || invoice.invoiceNumber || 'N/A'),
      amount: invoice.total || 0,
      date: isInvoice ? (invoice.invoiceDate || invoice.createdAt) : (invoice.receiptDate || invoice.orderDate || invoice.invoiceDate || invoice.createdAt),
      vendor: isInvoice ? (invoice.billingName || invoice.vendorName || 'Unknown') : (invoice.vendor || invoice.billingName || 'Unknown'),
      dueDate: invoice.dueDate,
      lineItems: invoice.items || [],
      tax: invoice.tax || 0,
      subtotal: invoice.subtotal || 0,
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
        <Typography variant="h4">Invoices</Typography>

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
            Upload Invoice
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
                icon="ph:invoice-bold"
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
              No Invoices Found
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {filter === 'all'
                ? "You haven't uploaded any invoices yet. Upload an invoice to get started with document processing."
                : `No invoices found with status "${filter}". Try changing the filter or upload a new invoice.`}
            </Typography>

            <Button
              variant="contained"
              startIcon={<Iconify icon="ph:cloud-arrow-up-bold" />}
              onClick={handleUploadNew}
            >
              Upload Your First Invoice
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
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Vendor/Customer</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((invoice, index) => {
                  const invoiceData = getInvoiceData(invoice);
                  const isExpanded = expandedRows[invoice._id];

                  return (
                    <React.Fragment key={invoice._id}>
                      <TableRow key={invoice._id}>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {index + 1}.
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleExpandRow(invoice._id)}>
                            <Iconify
                              icon={isExpanded ? 'ph:caret-down-bold' : 'ph:caret-right-bold'}
                            />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {invoiceData.invoiceNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {invoiceData.vendor}
                          </Typography>
                        </TableCell>
                        <TableCell>{getTypeChip(invoice.documentType || 'Invoice')}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(invoiceData.date)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {formatCurrencyWithTwoDecimals(invoiceData.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>{getStatusChip(invoice.status)}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(invoice)}
                              title="View Details"
                            >
                              <Iconify icon="ph:eye-bold" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, invoice)}
                              title="More Actions"
                            >
                              <Iconify icon="ph:dots-three-vertical-bold" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row Details */}
                      <TableRow>
                        <TableCell colSpan={9} sx={{ py: 0 }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 2, px: 1 }}>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Invoice Details
                                  </Typography>
                                  <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" color="text.secondary">
                                        File Name:
                                      </Typography>
                                      <Typography variant="body2">{invoice.fileName}</Typography>
                                    </Box>
                                    {invoiceData.dueDate && (
                                      <Box
                                        sx={{ display: 'flex', justifyContent: 'space-between' }}
                                      >
                                        <Typography variant="body2" color="text.secondary">
                                          Due Date:
                                        </Typography>
                                        <Typography variant="body2">
                                          {formatDate(invoiceData.dueDate)}
                                        </Typography>
                                      </Box>
                                    )}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" color="text.secondary">
                                        Subtotal:
                                      </Typography>
                                      <Typography variant="body2">
                                        {formatCurrencyWithTwoDecimals(invoiceData.subtotal)}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" color="text.secondary">
                                        Tax:
                                      </Typography>
                                      <Typography variant="body2">
                                        {formatCurrencyWithTwoDecimals(invoiceData.tax)}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Grid>

                                {invoiceData.lineItems.length > 0 && (
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Line Items
                                    </Typography>
                                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                                      {invoiceData.lineItems.slice(0, 5).map((item, index) => (
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
                                            {item.description || item.name || `Item ${index + 1}`}
                                            {item.quantity && (
                                              <Typography
                                                variant="caption"
                                                sx={{ color: 'text.secondary', ml: 1 }}
                                              >
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
                                      {invoiceData.lineItems.length > 5 && (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ mt: 1 }}
                                        >
                                          +{invoiceData.lineItems.length - 5} more items
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
              {`Showing ${documents.length === 0 ? 0 : (page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total} invoices`}
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
        </Card >
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
        <MenuItem onClick={() => window.open(selectedInvoiceForAction?.filePath, '_blank')}>
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
        <DialogTitle>Edit Invoice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Invoice Information Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Invoice Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Vendor/Customer Name"
                value={editFormData.vendorName ?? ''}
                onChange={e => handleEditFormChange('vendorName', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Invoice Number"
                value={editFormData.invoiceNumber ?? ''}
                onChange={e => handleEditFormChange('invoiceNumber', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Invoice Date"
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
                label="Due Date"
                type="date"
                value={editFormData.dueDate ?? ''}
                onChange={e => handleEditFormChange('dueDate', e.target.value)}
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
                placeholder="e.g., Credit Card, Bank Transfer, Cash"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Billing Name"
                value={editFormData.billingName ?? ''}
                onChange={e => handleEditFormChange('billingName', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Billing Address"
                value={editFormData.billingAddress ?? ''}
                onChange={e => handleEditFormChange('billingAddress', e.target.value)}
                size="small"
                fullWidth
                multiline
                rows={2}
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
                        value={item.description ?? ''}
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
                        transactionType="credit"
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
                        label="Rate"
                        type="number"
                        value={item.rate ?? ''}
                        onChange={e => handleItemChange(idx, 'rate', e.target.value)}
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
                        label="Amount"
                        type="number"
                        value={item.amount ?? ''}
                        onChange={e => handleItemChange(idx, 'amount', e.target.value)}
                        size="small"
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                        InputProps={{
                          startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>$</Typography>
                        }}
                      />
                    </Grid>
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
                        ${editFormData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)}
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
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this invoice? This action cannot be undone.
          </Typography>
          {selectedInvoiceForAction && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                Invoice: {getInvoiceData(selectedInvoiceForAction).invoiceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vendor: {getInvoiceData(selectedInvoiceForAction).vendor}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Amount: {formatCurrencyWithTwoDecimals(selectedInvoiceForAction.total || 0)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
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
          Invoice Details
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
                      Invoice Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Invoice Number
                        </Typography>
                        <Typography variant="body1">
                          {getInvoiceData(selectedDocument).invoiceNumber}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Vendor/Customer
                        </Typography>
                        <Typography variant="body1">
                          {getInvoiceData(selectedDocument).vendor}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Amount
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatCurrencyWithTwoDecimals(getInvoiceData(selectedDocument).amount)}
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
                              <TableCell>{item.description || item.name || '—'}</TableCell>
                              <TableCell align="center">{item.quantity ?? '—'}</TableCell>
                              <TableCell align="right">
                                {item.rate
                                  ? formatCurrencyWithTwoDecimals(item.rate)
                                  : (item.unitPrice ? formatCurrencyWithTwoDecimals(item.unitPrice) : '—')}
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
    </DashboardContent >
  );
}