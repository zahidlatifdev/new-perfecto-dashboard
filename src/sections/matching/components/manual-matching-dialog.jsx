'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ListItemButton from '@mui/material/ListItemButton';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { fCurrency } from 'src/utils/format-number';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function ManualMatchingDialog({
  open,
  onClose,
  transaction,
  onMatchSuccess,
  onUploadRequest,
  onCreditCardLink
}) {
  const { selectedCompany } = useAuthContext();
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState(null);
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    validation: null,
    documentsToMatch: []
  });

  useEffect(() => {
    if (open && transaction) {
      fetchUnmatchedDocuments();
    }
    if (open) {
      setSelectedDocuments([]);
      setSearchQuery('');
    }
  }, [open, transaction]);

  const fetchUnmatchedDocuments = async () => {
    try {
      setLoading(true);

      let documentTypeFilter = null;
      if (transaction.debit && transaction.debit > 0) {
        documentTypeFilter = ['Receipt', 'Bill'];
      } else if (transaction.credit && transaction.credit > 0) {
        documentTypeFilter = ['Invoice'];
      }

      const response = await axiosInstance.get(endpoints.matching.unmatchedDocuments, {
        params: {
          companyId: selectedCompany._id,
          transactionId: transaction.id,
          documentType: documentTypeFilter,
          limit: 100
        },
        paramsSerializer: params => {
          return new URLSearchParams(params).toString();
        }
      });

      if (response.data.success) {
        setDocuments(response.data.data.documents);
        setRemainingAmount(response.data.data.remainingAmount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentToggle = (documentId) => {
    setSelectedDocuments(prev =>
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const validateMatches = async (documentIds) => {
    const validations = [];
    let needsWarning = false;

    for (const documentId of documentIds) {
      try {
        const response = await axiosInstance.post(endpoints.matching.validate, {
          transactionId: transaction.id,
          documentId
        });

        if (response.data.success) {
          const validation = response.data.data;
          validations.push({ documentId, ...validation });

          if (validation.recommendation === 'warn' || validation.recommendation === 'caution') {
            needsWarning = true;
          }
        }
      } catch (error) {
        console.error('Validation failed for document:', documentId, error);
        validations.push({
          documentId,
          valid: false,
          score: 0,
          recommendation: 'warn',
          warning: 'Unable to validate this match. Please verify manually.'
        });
        needsWarning = true;
      }
    }

    return { validations, needsWarning };
  };

  const handleMatch = async () => {
    if (selectedDocuments.length === 0) return;

    try {
      setMatching(true);

      const { validations, needsWarning } = await validateMatches(selectedDocuments);

      if (needsWarning) {
        setConfirmationDialog({
          open: true,
          validation: validations,
          documentsToMatch: selectedDocuments
        });
        setMatching(false);
        return;
      }

      await performMatching(selectedDocuments);
    } catch (error) {
      console.error('Failed to match documents:', error);
      setMatching(false);
    }
  };

  const performMatching = async (documentIds, forceMatch = false) => {
    try {
      setMatching(true);

      if (documentIds.length === 1 && forceMatch) {
        const response = await axiosInstance.post(endpoints.matching.apply, {
          transactionId: transaction.id,
          documentId: documentIds[0],
          forceMatch: true
        });

        if (response.data.success) {
          onMatchSuccess?.(transaction.id, documentIds);
          onClose();
        }
      } else {
        const response = await axiosInstance.post(endpoints.matching.bulkMatch, {
          transactionId: transaction.id,
          documentIds
        });

        if (response.data.success) {
          onMatchSuccess?.(transaction.id, documentIds);
          onClose();
        }
      }
    } catch (error) {
      console.error('Failed to match documents:', error);
    } finally {
      setMatching(false);
    }
  };

  const handleConfirmMatch = () => {
    const { documentsToMatch } = confirmationDialog;
    setConfirmationDialog({ open: false, validation: null, documentsToMatch: [] });
    performMatching(documentsToMatch, true);
  };

  const handleCancelMatch = () => {
    setConfirmationDialog({ open: false, validation: null, documentsToMatch: [] });
  };

  // Helper functions
  const getVendorName = (document) => {
    if (document.documentType === 'Invoice' || document.documentType === 'Bill') {
      return document.vendorName || document.billingName || 'Unknown Vendor';
    } else {
      return document.vendor || document.billingName || 'Unknown Vendor';
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

  const filteredDocuments = documents.filter(doc => {
    const vendorName = getVendorName(doc);
    return vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ py: 2 }}>
          {[...Array(5)].map((_, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 2 }}>
              <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
              <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="40%" height={16} />
              </Box>
              <Skeleton variant="text" width={80} height={20} />
            </Box>
          ))}
        </Box>
      );
    }

    if (filteredDocuments.length === 0) {
      return (
        <Box sx={{
          textAlign: 'center',
          py: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}>
          <Iconify icon="mdi:file-search" width={64} sx={{ color: 'text.disabled' }} />
          <Box>
            <Typography variant="h6" gutterBottom>
              {searchQuery ? 'No documents match your search' : 'No unmatched documents available'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery ?
                'Try adjusting your search terms or clear the search to see all documents.' :
                'All available documents have already been matched, or no documents have been uploaded yet.'
              }
            </Typography>
          </Box>
        </Box>
      );
    }

    return (
      <List sx={{ pt: 0 }}>
        {filteredDocuments.map((document) => {
          const exceedsAmount = remainingAmount && document.total > remainingAmount;

          return (
            <ListItem key={document._id} disablePadding>
              <ListItemButton
                onClick={() => handleDocumentToggle(document._id)}
                sx={{
                  py: 1.5,
                  borderLeft: exceedsAmount ? '3px solid' : 'none',
                  borderLeftColor: exceedsAmount ? 'warning.main' : 'transparent',
                  bgcolor: exceedsAmount ? 'warning.lighter' : 'transparent',
                  '&:hover': {
                    bgcolor: exceedsAmount ? 'warning.light' : 'action.hover',
                  }
                }}
              >
                <Checkbox
                  checked={selectedDocuments.includes(document._id)}
                  sx={{ mr: 2 }}
                />

                <Avatar
                  sx={{
                    mr: 2,
                    bgcolor:
                      document.documentType === 'Invoice' ? 'primary.main' :
                        document.documentType === 'Bill' ? 'info.main' :
                          'secondary.main',
                    width: 32,
                    height: 32
                  }}
                >
                  <Iconify
                    icon={
                      document.documentType === 'Invoice' ? 'mdi:file-invoice' :
                        document.documentType === 'Bill' ? 'mdi:file-document' :
                          'mdi:receipt'
                    }
                    width={16}
                  />
                </Avatar>

                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {getVendorName(document)}
                      </Typography>
                      <Chip
                        label={document.documentType}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  }
                  secondary={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(getDocumentDate(document))} • {document.fileName}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" fontWeight="medium">
                          {fCurrency(document.total || 0)}
                        </Typography>
                        {exceedsAmount && (
                          <Chip
                            label="Exceeds Amount"
                            size="small"
                            color="warning"
                            variant="filled"
                            sx={{ fontSize: '0.65rem' }}
                          />
                        )}
                      </Stack>
                    </Stack>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    );
  };

  // Check if transaction has credit card links or document matches
  const hasLinkedCreditCard = transaction?.linkedCreditCardStatements && transaction?.linkedCreditCardStatements?.length > 0;
  const hasDocumentMatches = transaction?.matchedDocuments && transaction?.matchedDocuments?.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '85vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Manual Matching</Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Transaction Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Transaction Details
          </Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {transaction?.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {transaction?.date} • {transaction?.source}
              </Typography>
            </Box>
            <Chip
              label={fCurrency(transaction?.debit || transaction?.credit || 0)}
              color={transaction?.debit ? 'error' : 'success'}
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search documents by vendor or filename..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:magnify" />
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        {/* Documents List - flexible height */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <Scrollbar sx={{ height: '100%' }}>
            {renderContent()}
          </Scrollbar>
        </Box>

        {/* Selected Count */}
        {selectedDocuments.length > 0 && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.lighter', borderRadius: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="primary.main" fontWeight="medium">
                {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} selected
              </Typography>
              <Button
                size="small"
                onClick={() => setSelectedDocuments([])}
                startIcon={<Iconify icon="mdi:close" />}
              >
                Clear
              </Button>
            </Stack>
          </Box>
        )}

        {/* CC Statement Linked Warning */}
        {hasLinkedCreditCard && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Credit Card Statement Linked
            </Typography>
            This transaction has a credit card statement linked to it. Document matching is disabled.
            To match documents, please unlink the credit card statement first.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', px: 3, py: 2 }}>
        {/* Advanced Options - Left Side */}
        <Stack direction="row" spacing={1} sx={{ mr: 'auto' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Iconify icon="mdi:upload" />}
            onClick={() => {
              onClose();
              if (onUploadRequest) {
                onUploadRequest(transaction);
              }
            }}
            size="small"
            sx={{ fontSize: '0.75rem' }}
          >
            Upload Document
          </Button>

          {transaction?.accountType === 'bank_account' &&
            transaction?.debit &&
            transaction?.debit > 0 &&
            !hasLinkedCreditCard &&
            !hasDocumentMatches && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<Iconify icon="mdi:credit-card-plus" />}
                onClick={() => {
                  onClose();
                  onCreditCardLink?.(transaction);
                }}
                size="small"
                sx={{ fontSize: '0.75rem' }}
              >
                Link CC Statement
              </Button>
            )}
        </Stack>

        {/* Main Actions - Right Side */}
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>

        <Button
          onClick={handleMatch}
          variant="contained"
          disabled={
            selectedDocuments.length === 0 ||
            matching ||
            loading ||
            hasLinkedCreditCard
          }
          startIcon={matching ? <CircularProgress size={16} /> : <Iconify icon="mdi:link" />}
        >
          {hasLinkedCreditCard
            ? 'Cannot match - CC Statement linked'
            : matching
              ? 'Matching...'
              : `Match ${selectedDocuments.length} Document${selectedDocuments.length > 1 ? 's' : ''}`
          }
        </Button>
      </DialogActions>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationDialog.open}
        onClose={handleCancelMatch}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:alert" sx={{ color: 'warning.main' }} />
            <Typography variant="h6">Confirm Manual Match</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            The system detected potential issues with this match. Please review the details below.
          </Alert>

          {confirmationDialog.validation?.map((validation, index) => {
            const document = documents.find(d => d._id === validation.documentId);
            return (
              <Box key={validation.documentId} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">
                    {document ? getVendorName(document) : 'Unknown Vendor'}
                  </Typography>
                  <Chip
                    label={`Score: ${(validation.score * 100).toFixed(0)}%`}
                    size="small"
                    color={validation.score < 0.3 ? 'error' : validation.score < 0.5 ? 'warning' : 'success'}
                    variant="outlined"
                  />
                </Stack>

                {validation.warning && (
                  <Alert severity={validation.score < 0.3 ? 'error' : 'warning'} sx={{ mt: 1 }}>
                    {validation.warning}
                  </Alert>
                )}

                {validation.details && (
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Amount: {(validation.details.amountScore * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Vendor: {(validation.details.vendorScore * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Date: {(validation.details.dateScore * 100).toFixed(0)}%
                    </Typography>
                  </Stack>
                )}
              </Box>
            );
          })}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Are you sure you want to proceed with this match?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelMatch} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmMatch}
            variant="contained"
            color="warning"
            startIcon={<Iconify icon="mdi:check" />}
          >
            Proceed Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}