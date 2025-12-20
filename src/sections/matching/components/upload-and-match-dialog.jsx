'use client';

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------


// Determine available document types based on transaction type
const getAvailableDocumentTypes = (transaction) => {
  if (!transaction) return ['Receipt'];

  if (transaction.debit && transaction.debit > 0) {
    // Debit transactions: show Bills and Receipts
    return ['Bill', 'Receipt'];
  } else if (transaction.credit && transaction.credit > 0) {
    // Credit transactions: show Invoices only
    return ['Invoice'];
  }

  // Default fallback
  return ['Receipt'];
};

export function UploadAndMatchDialog({ open, onClose, transaction, onUploadSuccess }) {
  const { selectedCompany } = useAuthContext();
  const availableDocumentTypes = getAvailableDocumentTypes(transaction);
  const [documentType, setDocumentType] = useState(availableDocumentTypes[0]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Reset document type when transaction changes or dialog opens
  useEffect(() => {
    if (open && transaction) {
      const types = getAvailableDocumentTypes();
      setDocumentType(types[0]);
      setFile(null); // Also clear any selected file
    }
  }, [open, transaction]);

  const handleFileSelect = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) {
      // 10MB limit
      setFile(selectedFile);
    } else {
      alert('File size must be less than 10MB');
    }
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleFileInput = useCallback(
    (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect]
  );

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!file || !transaction) return;

    try {
      setUploading(true);

      // Convert file to base64
      const base64File = await convertToBase64(file);

      // Upload document
      const uploadResponse = await axiosInstance.post(endpoints.documents.upload.document, {
        fileName: file.name,
        fileData: base64File,
        documentType,
        companyId: selectedCompany._id,
      });

      if (uploadResponse.data.success) {
        const documentId = uploadResponse.data.data.document._id;

        // Automatically match with the transaction
        try {
          await axiosInstance.post(endpoints.matching.apply, {
            transactionId: transaction.id,
            documentId,
          });

          onUploadSuccess?.(transaction.id, documentId);
        } catch (matchError) {
          console.warn('Auto-matching failed, but document uploaded successfully:', matchError);
          onUploadSuccess?.(transaction.id, null);
        }

        onClose();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Upload & Match Document</Typography>
          <IconButton onClick={handleClose} disabled={uploading}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* Transaction Info */}
        {transaction && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Transaction Details
            </Typography>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {transaction.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {transaction.date} • {transaction.source}
                </Typography>
              </Box>
              <Typography variant="h6" color={transaction.debit ? 'error.main' : 'success.main'}>
                {fCurrency(transaction.debit || transaction.credit || 0)}
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Document Type Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Document Type</InputLabel>
          <Select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            label="Document Type"
          >
            {availableDocumentTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Transaction Type Info */}
        {transaction && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="body2" color="info.main">
              <Iconify icon="mdi:information" width={16} sx={{ mr: 1, verticalAlign: 'middle' }} />
              {transaction.debit && transaction.debit > 0
                ? 'For debit transactions, you can upload Bills or Receipts'
                : 'For credit transactions, you can upload Invoices'
              }
            </Typography>
          </Box>
        )}

        {/* File Upload Area */}
        <Box
          sx={{
            p: 3,
            border: '2px dashed',
            borderColor: dragActive ? 'primary.main' : 'divider',
            borderRadius: 2,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: dragActive ? 'primary.lighter' : 'background.paper',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />

          {file ? (
            <Stack alignItems="center" spacing={1}>
              <Iconify icon="mdi:file-check" width={40} color="success.main" />
              <Typography variant="body2" fontWeight="medium">
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
              <Button
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
              >
                Remove
              </Button>
            </Stack>
          ) : (
            <Stack alignItems="center" spacing={1}>
              <Iconify
                icon="mdi:cloud-upload"
                width={40}
                color={dragActive ? 'primary.main' : 'text.secondary'}
              />
              <Typography variant="body2">Drag and drop or click to upload</Typography>
              <Typography variant="caption" color="text.secondary">
                Supports JPG, PNG, PDF (max 10MB)
              </Typography>
            </Stack>
          )}
        </Box>

        {/* Upload Info */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
          <Typography variant="body2" color="info.main">
            <Iconify icon="mdi:information" width={16} sx={{ mr: 1, verticalAlign: 'middle' }} />
            The document will be automatically processed and matched to this transaction.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={uploading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!file || uploading}
          startIcon={uploading ? <CircularProgress size={16} /> : <Iconify icon="mdi:upload" />}
        >
          {uploading ? 'Uploading...' : 'Upload & Match'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
