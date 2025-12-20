'use client';

import React from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export function CategoryUpdateDialog({
  open,
  onClose,
  onUpdateSingle,
  onUpdateAll,
  currentTransaction,
  similarTransactions,
  newCategory,
  loading,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Similar Transactions Found
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Found <strong>{similarTransactions.length}</strong> other transaction(s) with the same description
            <strong> "{currentTransaction?.description}"</strong> but different categories.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You're trying to set the category to <Chip label={newCategory} size="small" color="primary" />.
            Would you like to update just this transaction or all transactions with the same description?
          </Typography>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Current Category</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {similarTransactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.category}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {transaction.debit
                      ? `-${fCurrency(transaction.debit)}`
                      : `+${fCurrency(transaction.credit)}`
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onUpdateSingle}
          variant="outlined"
          disabled={loading}
        >
          Update This One Only
        </Button>
        <Button
          onClick={onUpdateAll}
          variant="contained"
          disabled={loading}
        >
          Update All ({similarTransactions.length + 1} transactions)
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CategoryUpdateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdateSingle: PropTypes.func.isRequired,
  onUpdateAll: PropTypes.func.isRequired,
  currentTransaction: PropTypes.object,
  similarTransactions: PropTypes.array.isRequired,
  newCategory: PropTypes.string.isRequired,
  loading: PropTypes.bool,
};