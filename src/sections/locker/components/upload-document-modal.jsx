import { useState, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Checkbox,
    FormControlLabel,
    Box,
    Typography,
    IconButton,
    Stack,
    Alert,
    CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Iconify } from 'src/components/iconify';
import { DOCUMENT_CATEGORIES, isExtractableCategory } from '../constants';

// Allowed file types
const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.csv', '.xls', '.xlsx', '.doc', '.docx'];

export function UploadDocumentModal({ open, onOpenChange, onSave }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [hasExpiry, setHasExpiry] = useState(false);
    const [expiryDate, setExpiryDate] = useState(null);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const resetForm = () => {
        setFile(null);
        setName('');
        setCategory('');
        setHasExpiry(false);
        setExpiryDate(null);
        setNotes('');
    };

    const validateFile = (file) => {
        if (!file) return false;

        // Check by MIME type
        if (ALLOWED_FILE_TYPES.includes(file.type)) {
            return true;
        }

        // Check by extension if MIME type is not in list
        const fileName = file.name.toLowerCase();
        const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));

        return hasValidExtension;
    };

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            // Check by MIME type
            const isValidMimeType = ALLOWED_FILE_TYPES.includes(droppedFile.type);
            // Check by extension if MIME type is not in list
            const fileName = droppedFile.name.toLowerCase();
            const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
            const isValid = isValidMimeType || hasValidExtension;

            if (isValid) {
                setFile(droppedFile);
                setName(droppedFile.name.replace(/\.[^/.]+$/, ''));
                setError(null);
            } else {
                setFile(null);
                setError(`File type not supported. Allowed formats: PDF, Images (JPG, PNG, GIF), CSV, Excel, Word documents`);
            }
        }
    }, []);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
                setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
                setError(null);
            } else {
                setFile(null);
                setName('');
                setError(`File type not supported. Allowed formats: PDF, Images (JPG, PNG, GIF), CSV, Excel, Word documents`);
                // Reset the file input
                e.target.value = '';
            }
        }
    };

    const handleCategoryChange = (value) => {
        setCategory(value);
        const categoryInfo = DOCUMENT_CATEGORIES.find((c) => c.id === value);
        if (categoryInfo?.expiryDefault) {
            setHasExpiry(true);
        }
    };

    const handleSave = async () => {
        if (!file || !name || !category) return;

        try {
            setIsLoading(true);
            setError(null);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', name);
            formData.append('category', category);
            if (hasExpiry && expiryDate) {
                formData.append('expiryDate', expiryDate.toISOString());
            }
            if (notes) {
                formData.append('notes', notes);
            }

            await onSave(formData);

            resetForm();
            onOpenChange(false);
        } catch (err) {
            setError(err.message || 'Failed to upload document');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return; // Prevent closing during upload
        resetForm();
        setError(null);
        onOpenChange(false);
    };

    const isValid = file && name && category && (!hasExpiry || expiryDate);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:upload-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
                    <Typography variant="h6">Upload Document</Typography>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3}>
                    {/* Error Message */}
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                    {/* Drop Zone */}
                    {!file ? (
                        <Box
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            sx={{
                                border: 2,
                                borderStyle: 'dashed',
                                borderColor: isDragOver ? 'primary.main' : 'divider',
                                borderRadius: 2,
                                p: 4,
                                textAlign: 'center',
                                cursor: 'pointer',
                                bgcolor: isDragOver ? 'primary.lighter' : 'background.neutral',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: 'text.secondary',
                                    bgcolor: 'action.hover',
                                },
                            }}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                style={{ display: 'none' }}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={handleFileSelect}
                            />
                            <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                                <Stack spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: '50%',
                                            bgcolor: 'primary.lighter',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Iconify icon="solar:upload-bold" width={24} sx={{ color: 'primary.main' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1">
                                            Drop your file here, or{' '}
                                            <Typography component="span" color="primary" sx={{ fontWeight: 600 }}>
                                                browse
                                            </Typography>
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                            PDF, Word docs, or images up to 20MB
                                        </Typography>
                                    </Box>
                                </Stack>
                            </label>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                p: 2,
                                borderRadius: 1.5,
                                border: 1,
                                borderColor: 'divider',
                                bgcolor: 'background.neutral',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1.5,
                                    bgcolor: 'primary.lighter',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <Iconify icon="solar:document-text-bold" width={20} sx={{ color: 'primary.main' }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle2" noWrap>
                                    {file.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </Typography>
                            </Box>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setFile(null);
                                    setName('');
                                }}
                            >
                                <Iconify icon="solar:close-circle-bold" width={20} />
                            </IconButton>
                        </Box>
                    )}

                    {/* Document Name */}
                    <TextField
                        fullWidth
                        label="Document Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter document name"
                    />

                    {/* Category */}
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            label="Category"
                            onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                            {DOCUMENT_CATEGORIES.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Iconify icon={cat.icon} width={18} />
                                        <span>{cat.label}</span>
                                    </Stack>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Data Extraction Info */}
                    {category && isExtractableCategory(category) && (
                        <Alert
                            severity="info"
                            icon={<Iconify icon="solar:magic-stick-3-bold-duotone" width={22} />}
                            sx={{ borderRadius: 1.5 }}
                        >
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                Smart Data Extraction
                            </Typography>
                            <Typography variant="body2">
                                We&apos;ll automatically extract key details like vendor info, line items, totals, and
                                more from your {category}. The extracted data will be displayed once processing is
                                complete.
                            </Typography>
                        </Alert>
                    )}

                    {/* Expiry Date */}
                    <Box>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={hasExpiry}
                                    onChange={(e) => setHasExpiry(e.target.checked)}
                                />
                            }
                            label="This document has an expiry or renewal date"
                        />

                        {hasExpiry && (
                            <Box sx={{ mt: 2 }}>
                                <DatePicker
                                    label="Expiry Date"
                                    value={expiryDate}
                                    onChange={(newValue) => setExpiryDate(newValue)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                        },
                                    }}
                                />
                            </Box>
                        )}
                    </Box>

                    {/* Notes */}
                    <TextField
                        fullWidth
                        label="Notes (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any relevant notes about this document..."
                        multiline
                        rows={3}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} color="inherit" disabled={isLoading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={!isValid || isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                    {isLoading ? 'Uploading...' : 'Save to Locker'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
