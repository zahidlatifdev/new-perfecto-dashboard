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
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
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

// Helper for date input formatting
function formatDateForInput(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// ----------------------------------------------------------------------

export function BillsListView() {
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
  const [selectedBillForAction, setSelectedBillForAction] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    vendorName: '',
    billNumber: '',
    total: '',
    billDate: '',
    dueDate: '',
    tax: '',
    subtotal: '',
    fees: '',
    paymentMethod: '',
    recipient: '',
    servicePeriod: '',
    accountNumber: '',
    notesExceptions: '',
    items: [],
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const getTypeChip = (type) => {
    const typeConfig = {
      Bill: { label: 'Bill', color: 'primary' },
      Invoice: { label: 'Invoice', color: 'secondary' },
      expense: { label: 'Expense', color: 'error' },
      income: { label: 'Income', color: 'success' },
    };
    const config = typeConfig[type] || { label: type || 'Document', color: 'default' };
    return <Chip size="small" label={config.label} color={config.color} variant="outlined" />;
  };

  const getBillData = (bill) => ({
    billNumber: bill.billNumber || bill.invoiceNumber || 'N/A',
    amount: bill.total || 0,
    date: bill.billDate || bill.createdAt,
    vendor: bill.vendorName || bill.billingName || 'Unknown',
    dueDate: bill.dueDate,
    lineItems: bill.items || [],
    tax: bill.tax || 0,
    subtotal: bill.subtotal || 0,
    fees: bill.fees || 0,
  });

  useEffect(() => {
    fetchBills();
    // eslint-disable-next-line
  }, [selectedCompany, filter, page, limit]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedCompany?._id) {
        setError('No company selected');
        setLoading(false);
        return;
      }

      // Fetch bill documents using the correct API endpoint
      const response = await axiosInstance.get(endpoints.documents.list, {
        params: {
          type: 'Bill',
          status: filter === 'all' ? undefined : filter,
          page,
          limit,
        },
      });

      // Handle the correct response structure from API documentation
      if (response.data.success) {
        const bills = response.data.data?.documents || [];
        setDocuments(bills);
        const pagination = response.data.data?.pagination;
        if (pagination) {
          setTotal(pagination.total ?? bills.length);
        } else {
          setTotal(bills.length);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch bills');
      }
    } catch (err) {
      console.error('Failed to fetch bills:', err);
      setError(err.response?.data?.message || 'Failed to load bills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (bill) => {
    setSelectedDocument(bill);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedDocument(null);
  };

  const handleExpandRow = (billId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [billId]: !prev[billId],
    }));
  };

  const handleUploadNew = () => {
    router.push('/dashboard/bills/upload');
  };

  const handleRefresh = () => {
    fetchBills();
  };

  const handleMenuOpen = (event, bill) => {
    setAnchorEl(event.currentTarget);
    setSelectedBillForAction(bill);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setSelectedBillForAction(null);
  };

  const handleEditClick = () => {
    if (selectedBillForAction) {
      setEditFormData({
        vendorName: selectedBillForAction.vendorName || '',
        billNumber: selectedBillForAction.billNumber || '',
        total: selectedBillForAction.total || '',
        billDate: selectedBillForAction.billDate
          ? formatDateForInput(selectedBillForAction.billDate)
          : '',
        dueDate: selectedBillForAction.dueDate
          ? formatDateForInput(selectedBillForAction.dueDate)
          : '',
        tax: selectedBillForAction.tax || '',
        subtotal: selectedBillForAction.subtotal || '',
        fees: selectedBillForAction.fees || '',
        paymentMethod: selectedBillForAction.paymentMethod || '',
        recipient: selectedBillForAction.recipient || '',
        servicePeriod: selectedBillForAction.servicePeriod || '',
        accountNumber: selectedBillForAction.accountNumber || '',
        notesExceptions: selectedBillForAction.notesExceptions || '',
        items: selectedBillForAction.items
          ? selectedBillForAction.items.map((item) => ({
            ...item,
            category: item.category || 'Uncategorized',
          }))
          : [],
      });
      setOpenEditDialog(true);
    }
    setAnchorEl(null);
  };

  const handleItemChange = (idx, field, value) => {
    setEditFormData((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };

      // Auto-calculate amount if units or rate changes
      if (field === 'units' || field === 'rate') {
        const units = parseFloat(field === 'units' ? value : items[idx].units) || 0;
        const rate = parseFloat(field === 'rate' ? value : items[idx].rate) || 0;
        items[idx].amount = units * rate;
      }

      // Recalculate totals
      const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      const tax = parseFloat(prev.tax) || 0;
      const fees = parseFloat(prev.fees) || 0;
      const total = subtotal + tax + fees;

      return {
        ...prev,
        items,
        subtotal: subtotal.toFixed(2),
        total: total.toFixed(2),
      };
    });
  };

  const handleAddItem = () => {
    setEditFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          units: 1,
          rate: 0,
          amount: 0,
          category: 'Uncategorized',
        },
      ],
    }));
  };

  const handleDeleteItem = (idx) => {
    setEditFormData((prev) => ({
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
        billNumber: editFormData.billNumber,
        total: parseFloat(editFormData.total) || 0,
        billDate: editFormData.billDate ? new Date(editFormData.billDate) : null,
        dueDate: editFormData.dueDate ? new Date(editFormData.dueDate) : null,
        tax: parseFloat(editFormData.tax) || 0,
        subtotal: parseFloat(editFormData.subtotal) || 0,
        fees: parseFloat(editFormData.fees) || 0,
        paymentMethod: editFormData.paymentMethod,
        recipient: editFormData.recipient,
        servicePeriod: editFormData.servicePeriod,
        accountNumber: editFormData.accountNumber,
        notesExceptions: editFormData.notesExceptions,
        items: editFormData.items,
      };

      const response = await axiosInstance.put(
        endpoints.documents.update(selectedBillForAction._id),
        updateData
      );

      if (response.data.success) {
        toast.success('Bill updated successfully');
        setOpenEditDialog(false);
        fetchBills();
      } else {
        throw new Error(response.data.message || 'Failed to update bill');
      }
    } catch (error) {
      console.error('Failed to update bill:', error);
      toast.error(error.response?.data?.message || 'Failed to update bill');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBillForAction || !selectedBillForAction._id) {
      toast.error('No bill selected for deletion');
      setOpenDeleteDialog(false);
      return;
    }
    try {
      setDeleteLoading(true);

      const response = await axiosInstance.delete(
        endpoints.documents.delete(selectedBillForAction._id)
      );

      if (response.data.success) {
        toast.success('Bill deleted successfully');
        setOpenDeleteDialog(false);
        fetchBills();
      } else {
        throw new Error(response.data.message || 'Failed to delete bill');
      }
    } catch (error) {
      console.error('Failed to delete bill:', error);
      toast.error(error.response?.data?.message || 'Failed to delete bill');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Recalculate total if tax, fees, or subtotal changes
      if (field === 'tax' || field === 'fees' || field === 'subtotal') {
        const subtotal = parseFloat(updated.subtotal) || 0;
        const tax = parseFloat(updated.tax) || 0;
        const fees = parseFloat(updated.fees) || 0;
        updated.total = (subtotal + tax + fees).toFixed(2);
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

  // Pagination handlers
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (page < Math.ceil(total / limit)) setPage(page + 1);
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
        <Typography variant="h4">Bills</Typography>

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
            Upload Bill
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
                icon="ph:file-text-bold"
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
              No Bills Found
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {filter === 'all'
                ? "You haven't uploaded any bills yet. Upload a bill to get started with document processing."
                : `No bills found with status "${filter}". Try changing the filter or upload a new bill.`}
            </Typography>

            <Button
              variant="contained"
              startIcon={<Iconify icon="ph:cloud-arrow-up-bold" />}
              onClick={handleUploadNew}
            >
              Upload Your First Bill
            </Button>
          </Box>
        </Card>
      )}

      {/* Bills Table (matches Invoices UI) */}
      {documents.length > 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell />
                  <TableCell>Bill #</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((bill, index) => {
                  const billData = getBillData(bill);
                  const isExpanded = expandedRows[bill._id];
                  return (
                    <React.Fragment key={bill._id}>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{(page - 1) * limit + index + 1}.</Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleExpandRow(bill._id)}>
                            <Iconify icon={isExpanded ? 'ph:caret-down-bold' : 'ph:caret-right-bold'} />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{billData.billNumber}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{billData.vendor}</Typography>
                        </TableCell>
                        <TableCell>{getTypeChip(bill.documentType || 'Bill')}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(billData.date)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {formatCurrencyWithTwoDecimals(billData.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>{getStatusChip(bill.status)}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton size="small" onClick={() => handleViewDetails(bill)} title="View Details">
                              <Iconify icon="ph:eye-bold" />
                            </IconButton>
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, bill)} title="More Actions">
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
                                    Bill Details
                                  </Typography>
                                  <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" color="text.secondary">File Name:</Typography>
                                      <Typography variant="body2">{bill.fileName}</Typography>
                                    </Box>
                                    {billData.dueDate && (
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Due Date:</Typography>
                                        <Typography variant="body2">{formatDate(billData.dueDate)}</Typography>
                                      </Box>
                                    )}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                                      <Typography variant="body2">{formatCurrencyWithTwoDecimals(billData.subtotal)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" color="text.secondary">Tax:</Typography>
                                      <Typography variant="body2">{formatCurrencyWithTwoDecimals(billData.tax)}</Typography>
                                    </Box>
                                    {billData.fees ? (
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Fees:</Typography>
                                        <Typography variant="body2">{formatCurrencyWithTwoDecimals(billData.fees)}</Typography>
                                      </Box>
                                    ) : null}
                                  </Stack>
                                </Grid>

                                {billData.lineItems.length > 0 && (
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Line Items
                                    </Typography>
                                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                                      {billData.lineItems.slice(0, 5).map((item, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                                          <Typography variant="body2" sx={{ flex: 1 }}>
                                            {item.description || item.name || `Item ${idx + 1}`}
                                            {item.units && (
                                              <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                                                (Units: {item.units})
                                              </Typography>
                                            )}
                                          </Typography>
                                          <Typography variant="body2">
                                            {formatCurrencyWithTwoDecimals(item.amount || item.totalPrice || item.total || 0)}
                                          </Typography>
                                        </Box>
                                      ))}
                                      {billData.lineItems.length > 5 && (
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                          +{billData.lineItems.length - 5} more items
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
              {`Showing ${(documents.length === 0 ? 0 : (page - 1) * limit + 1)}-${Math.min(page * limit, total)} of ${total} bills`}
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
        <MenuItem onClick={() => window.open(selectedBillForAction?.filePath, '_blank')}>
          <Iconify icon="ph:download-bold" sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Iconify icon="ph:trash-bold" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Detail Dialog */}
      <Dialog open={openDetailDialog} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Bill Details
          {selectedDocument && (
            <Typography variant="body2" color="text.secondary">
              {selectedDocument.fileName}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box sx={{ py: 2 }}>
              <Tabs value={dialogTab} onChange={(e, v) => setDialogTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
                <Tab label="Document" />
                <Tab label="Summary" />
              </Tabs>

              {dialogTab === 0 && (
                <Box sx={{ mb: 3 }}>
                  <FileViewer document={selectedDocument} compact />
                </Box>
              )}

              {dialogTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Bill Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Bill Number</Typography>
                        <Typography variant="body1">{getBillData(selectedDocument).billNumber}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Vendor</Typography>
                        <Typography variant="body1">{getBillData(selectedDocument).vendor}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Amount</Typography>
                        <Typography variant="h6" color="primary">{formatCurrencyWithTwoDecimals(getBillData(selectedDocument).amount)}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Processing Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        {getStatusChip(selectedDocument.status)}
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Uploaded At</Typography>
                        <Typography variant="body1">{formatDate(selectedDocument.createdAt)}</Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Items
                    </Typography>
                    {Array.isArray(selectedDocument.items) && selectedDocument.items.length > 0 ? (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell align="center">Units</TableCell>
                            <TableCell align="right">Rate</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell>Category</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedDocument.items.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{item.description || item.name || '—'}</TableCell>
                              <TableCell align="center">{item.units ?? item.quantity ?? '—'}</TableCell>
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
                              <TableCell>{item.category || '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No items found.</Typography>
                    )}
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Close</Button>
          <Button variant="contained" onClick={handleCloseDetailDialog}>Download</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Bill</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Bill Information Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Bill Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Vendor Name"
                value={editFormData.vendorName ?? ''}
                onChange={(e) => handleEditFormChange('vendorName', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Bill Number"
                value={editFormData.billNumber ?? ''}
                onChange={(e) => handleEditFormChange('billNumber', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Bill Date"
                type="date"
                value={editFormData.billDate ?? ''}
                onChange={(e) => handleEditFormChange('billDate', e.target.value)}
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
                onChange={(e) => handleEditFormChange('dueDate', e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Recipient"
                value={editFormData.recipient ?? ''}
                onChange={(e) => handleEditFormChange('recipient', e.target.value)}
                size="small"
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Service Period"
                value={editFormData.servicePeriod ?? ''}
                onChange={(e) => handleEditFormChange('servicePeriod', e.target.value)}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Account Number"
                value={editFormData.accountNumber ?? ''}
                onChange={(e) => handleEditFormChange('accountNumber', e.target.value)}
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
                onChange={(e) => handleEditFormChange('subtotal', e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Tax"
                type="number"
                value={editFormData.tax ?? ''}
                onChange={(e) => handleEditFormChange('tax', e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Fees"
                type="number"
                value={editFormData.fees ?? ''}
                onChange={(e) => handleEditFormChange('fees', e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Total"
                type="number"
                value={editFormData.total ?? ''}
                onChange={(e) => handleEditFormChange('total', e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notes/Exceptions"
                value={editFormData.notesExceptions ?? ''}
                onChange={(e) => handleEditFormChange('notesExceptions', e.target.value)}
                size="small"
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            {/* Line Items Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>
                Line Items
                <Button
                  size="small"
                  onClick={handleAddItem}
                  startIcon={<Iconify icon="ph:plus-bold" />}
                  sx={{ ml: 2 }}
                >
                  Add Item
                </Button>
              </Typography>
            </Grid>

            {editFormData.items.map((item, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Description"
                    value={item.description ?? ''}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="Units"
                    type="number"
                    value={item.units ?? ''}
                    onChange={(e) => handleItemChange(index, 'units', e.target.value)}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="Rate"
                    type="number"
                    value={item.rate ?? ''}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="Amount"
                    type="number"
                    value={item.amount ?? ''}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <CategorySelector
                    value={item.category ?? 'Uncategorized'}
                    onChange={(value) => handleItemChange(index, 'category', value)}
                    transactionType="debit"
                    isPersonal={isPersonalCategory(item.category)}
                    label="Category"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton color="error" onClick={() => handleDeleteItem(index)} size="small">
                    <Iconify icon="ph:trash-bold" />
                  </IconButton>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={editLoading}
            startIcon={
              editLoading ? <CircularProgress size={16} /> : <Iconify icon="ph:check-bold" />
            }
          >
            {editLoading ? 'Updating...' : 'Update Bill'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Bill</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this bill? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={
              deleteLoading ? <CircularProgress size={16} /> : <Iconify icon="ph:trash-bold" />
            }
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}