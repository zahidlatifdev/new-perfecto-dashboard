import { useState, useCallback } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Stack,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';

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

export function UploadNewVersionModal({ document, open, onOpenChange, onSave }) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [notes, setNotes] = useState('');
    const [hasExpiry, setHasExpiry] = useState(!!document?.expiryDate);
    const [expiryDate, setExpiryDate] = useState(document?.expiryDate || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            // Check by MIME type
            const isValidMimeType = ALLOWED_FILE_TYPES.includes(droppedFile.type);
            // Check by extension if MIME type is not in list
            const fileName = droppedFile.name.toLowerCase();
            const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
            const isValid = isValidMimeType || hasValidExtension;

            if (isValid) {
                setSelectedFile(droppedFile);
                setError(null);
            } else {
                setSelectedFile(null);
                setError(`File type not supported. Allowed formats: PDF, Images (JPG, PNG, GIF), CSV, Excel, Word documents`);
            }
        }
    }, []);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                setSelectedFile(selectedFile);
                setError(null);
            } else {
                setSelectedFile(null);
                setError(`File type not supported. Allowed formats: PDF, Images (JPG, PNG, GIF), CSV, Excel, Word documents`);
                // Reset the file input
                e.target.value = '';
            }
        }
    };

    const handleSubmit = async () => {
        if (!document || !selectedFile) return;

        try {
            setIsLoading(true);
            setError(null);

            // Pass the actual file object to parent
            await onSave(document.id, selectedFile, notes || undefined, hasExpiry ? expiryDate : undefined);

            // Reset form
            setSelectedFile(null);
            setNotes('');
            setHasExpiry(!!document?.expiryDate);
            setExpiryDate(document?.expiryDate || null);
            onOpenChange(false);
        } catch (err) {
            setError(err.message || 'Failed to upload new version');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return; // Prevent closing during upload
        setSelectedFile(null);
        setNotes('');
        setHasExpiry(!!document?.expiryDate);
        setExpiryDate(document?.expiryDate || null);
        setError(null);
        onOpenChange(false);
    };

    if (!document) return null;

    const currentVersionNumber =
        document.versions?.filter((v) => v.action === 'uploaded' || v.action === 'new_version').length || 1;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:upload-square-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
                    <Typography variant="h6">Upload New Version</Typography>
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
                    {/* Document info */}
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 1.5,
                            bgcolor: 'background.neutral',
                        }}
                    >
                        <Typography variant="subtitle2">{document.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            Current version: v{currentVersionNumber} • New version will be v
                            {currentVersionNumber + 1}
                        </Typography>
                    </Box>

                    {/* Drag and drop zone */}
                    <Box
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        sx={{
                            position: 'relative',
                            border: 2,
                            borderStyle: 'dashed',
                            borderColor: dragActive ? 'primary.main' : 'divider',
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: dragActive ? 'primary.lighter' : 'background.neutral',
                            transition: 'all 0.2s',
                            '&:hover': {
                                borderColor: 'text.secondary',
                            },
                        }}
                    >
                        <input
                            type="file"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer',
                            }}
                            onChange={handleFileSelect}
                        />

                        {selectedFile ? (
                            <Stack spacing={1} alignItems="center">
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Iconify icon="solar:upload-bold" width={32} sx={{ color: 'primary.main' }} />
                                </Box>
                                <Typography variant="subtitle1">{selectedFile.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    color="inherit"
                                    startIcon={<Iconify icon="solar:close-circle-bold" />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(null);
                                    }}
                                    sx={{ mt: 1 }}
                                >
                                    Remove
                                </Button>
                            </Stack>
                        ) : (
                            <Stack spacing={1.5} alignItems="center">
                                <Iconify
                                    icon="solar:upload-bold"
                                    width={40}
                                    sx={{ color: 'text.secondary' }}
                                />
                                <Box>
                                    <Typography variant="subtitle1">Drop your new version here</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        or click to browse files
                                    </Typography>
                                </Box>
                            </Stack>
                        )}
                    </Box>

                    {/* Expiry Date for new version */}
                    <Box>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={hasExpiry}
                                onChange={(e) => setHasExpiry(e.target.checked)}
                                style={{ marginRight: 8 }}
                            />
                            <Typography variant="body2">This version has an expiry or renewal date</Typography>
                        </label>
                        {hasExpiry && (
                            <Box sx={{ mt: 2 }}>
                                <DatePicker
                                    label="Expiry Date"
                                    value={expiryDate}
                                    onChange={(newValue) => setExpiryDate(newValue)}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Box>
                        )}
                    </Box>

                    {/* Version notes */}
                    <TextField
                        fullWidth
                        label="Version Notes (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Describe what changed in this version..."
                        multiline
                        rows={2}
                    />

                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} color="inherit" disabled={isLoading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!selectedFile || isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <Iconify icon="solar:upload-bold" />}
                >
                    {isLoading ? 'Uploading...' : `Upload v${currentVersionNumber + 1}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
