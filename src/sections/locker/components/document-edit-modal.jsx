import { useState, useEffect } from 'react';
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
    Stack,
    Chip,
    Alert,
    CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { Iconify } from 'src/components/iconify';
import { DOCUMENT_CATEGORIES, getCategoryInfo } from '../constants';
import { ExpiryBadge } from './expiry-badge';

export function DocumentEditModal({ document, open, onOpenChange, onSave, onDelete }) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [hasExpiry, setHasExpiry] = useState(false);
    const [expiryDate, setExpiryDate] = useState(null);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (document) {
            setName(document.name);
            setCategory(document.category);
            setHasExpiry(!!document.expiryDate);
            setExpiryDate(document.expiryDate || null);
            setNotes(document.notes || '');
        }
    }, [document]);

    if (!document) return null;

    const categoryInfo = getCategoryInfo(document.category);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            setError(null);

            await onSave({
                ...document,
                name,
                category,
                expiryDate: hasExpiry ? expiryDate : undefined,
                notes: notes || undefined,
            });

            onOpenChange(false);
        } catch (err) {
            setError(err.message || 'Failed to update document');
        } finally {
            setIsLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:pen-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
                    <Typography variant="h6">Edit Document</Typography>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3}>
                    {/* Document Info Card */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            borderRadius: 1.5,
                            border: 1,
                            borderColor: 'divider',
                            bgcolor: 'background.neutral',
                        }}
                    >
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 1.5,
                                bgcolor: 'primary.lighter',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Iconify icon={categoryInfo.icon} width={24} sx={{ color: 'primary.main' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" fontWeight={600} noWrap>
                                {document.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatFileSize(document.fileSize)} • Uploaded{' '}
                                {format(new Date(document.uploadDate), 'MMM d, yyyy')}
                            </Typography>
                        </Box>
                        {document.expiryDate && <ExpiryBadge expiryDate={document.expiryDate} />}
                    </Box>

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
                        <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
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

                    {/* Error Message */}
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                <Button
                    color="error"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    onClick={() => {
                        onDelete(document.id);
                        onOpenChange(false);
                    }}
                    disabled={isLoading}
                >
                    Delete
                </Button>
                <Stack direction="row" spacing={1}>
                    <Button onClick={() => onOpenChange(false)} color="inherit" disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!name || isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} /> : null}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}
