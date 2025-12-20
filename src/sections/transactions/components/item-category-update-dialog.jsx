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

export function ItemCategoryUpdateDialog({
  open,
  onClose,
  onUpdateSingle,
  onUpdateAll,
  currentItem,
  similarItems,
  newCategory,
  loading,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Similar Items Found
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Found <strong>{similarItems.length}</strong> other item(s) with the same description
            <strong> "{currentItem?.description}"</strong> but different categories.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You're trying to set the category to <Chip label={newCategory} size="small" color="primary" />.
            Would you like to update just this item or all items with the same description?
          </Typography>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Document</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Current Category</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {similarItems.map((similarItem, index) => (
                <TableRow key={`${similarItem.documentId}-${similarItem.itemIndex}`}>
                  <TableCell>
                    <Typography variant="body2">
                      {similarItem.documentType}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {similarItem.vendor || 'Unknown'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={similarItem.item.category || 'Uncategorized'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {fCurrency(similarItem.item.amount)}
                  </TableCell>
                  <TableCell align="center">
                    {similarItem.item.quantity}
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
          Update This Item Only
        </Button>
        <Button
          onClick={onUpdateAll}
          variant="contained"
          disabled={loading}
        >
          Update All ({similarItems.length + 1} items)
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ItemCategoryUpdateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdateSingle: PropTypes.func.isRequired,
  onUpdateAll: PropTypes.func.isRequired,
  currentItem: PropTypes.object,
  similarItems: PropTypes.array.isRequired,
  newCategory: PropTypes.string.isRequired,
  loading: PropTypes.bool,
};