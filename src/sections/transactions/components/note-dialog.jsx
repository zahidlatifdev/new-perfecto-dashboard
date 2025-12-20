'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function NoteDialog({
    open,
    onClose,
    onSave,
    transaction,
    loading = false,
}) {
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        if (transaction && open) {
            setNoteText(transaction.note || '');
        }
    }, [transaction, open]);

    const handleSave = () => {
        onSave(noteText.trim());
    };

    const handleRemove = () => {
        onSave('');
    };

    const hasExistingNote = transaction?.note && transaction.note.trim().length > 0;
    const hasChanges = noteText.trim() !== (transaction?.note || '').trim();
    const canSave = hasChanges && noteText.trim().length > 0;
    const canRemove = hasExistingNote;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="mdi:note-text" width={24} />
                        <Typography variant="h6">
                            {hasExistingNote ? 'Edit Note' : 'Add Note'}
                        </Typography>
                    </Stack>
                    <IconButton onClick={onClose} disabled={loading}>
                        <Iconify icon="mdi:close" />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                        Transaction: {transaction?.description}
                    </Typography>

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Note"
                        placeholder="Add a note for this transaction..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        disabled={loading}
                        inputProps={{ maxLength: 500 }}
                        helperText={`${noteText.length}/500 characters`}
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="inherit" disabled={loading}>
                    Cancel
                </Button>

                {canRemove && (
                    <Button
                        onClick={handleRemove}
                        color="error"
                        disabled={loading}
                        startIcon={
                            loading ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : (
                                <Iconify icon="mdi:delete" />
                            )
                        }
                    >
                        Remove Note
                    </Button>
                )}

                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={!canSave || loading}
                    startIcon={
                        loading ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : (
                            <Iconify icon="mdi:content-save" />
                        )
                    }
                >
                    {hasExistingNote ? 'Update Note' : 'Add Note'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}