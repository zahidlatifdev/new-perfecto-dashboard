'use client';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Chip from '@mui/material/Chip';

import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'description', label: 'Description' },
  { id: 'category', label: 'Category', width: 150 },
  { id: 'quantity', label: 'Qty', align: 'center', width: 80 },
  { id: 'rate', label: 'Rate', align: 'right', width: 100 },
  { id: 'amount', label: 'Amount', align: 'right', width: 120 },
];

// ----------------------------------------------------------------------

export function InvoiceItemsTable({ document }) {
  if (!document) return null;

  // Prepare items array including line items, shipping, and tax
  const items = [];

  // Add regular line items
  if (document.items && Array.isArray(document.items)) {
    items.push(...document.items.map(item => ({
      ...item,
      type: 'item'
    })));
  }

  // Add shipping as an item if it exists (including shipping discount calculation)
  const shippingAmount = (document.shipping || 0) + (document.shippingDiscount || 0);
  if (shippingAmount > 0) {
    items.push({
      description: 'Shipping & Delivery',
      category: 'Shipping & Delivery',
      quantity: 1,
      rate: shippingAmount,
      amount: shippingAmount,
      totalPrice: shippingAmount,
      type: 'shipping'
    });
  }

  // Add tax as an item if it exists
  if (document.tax && document.tax > 0) {
    items.push({
      description: 'Sales Tax',
      category: 'Sales Tax',
      quantity: 1,
      rate: document.tax,
      amount: document.tax,
      totalPrice: document.tax,
      type: 'tax'
    });
  }

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No items found in this document
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {TABLE_HEAD.map((headCell) => (
              <TableCell
                key={headCell.id}
                align={headCell.align || 'left'}
                sx={{
                  width: headCell.width,
                  fontWeight: 'bold',
                  bgcolor: 'background.neutral'
                }}
              >
                {headCell.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => {
            const amount = item.amount || item.totalPrice || 0;
            const quantity = item.quantity || 1;
            const rate = item.rate || item.unitPrice || (quantity > 0 ? amount / quantity : amount);

            return (
              <TableRow key={index} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {item.description || item.name || `Item ${index + 1}`}
                  </Typography>
                </TableCell>

                <TableCell sx={{ width: 150 }}>
                  {item.category && (
                    <Chip
                      label={item.category}
                      size="small"
                      variant="outlined"
                      color={
                        item.type === 'shipping' ? 'info' :
                          item.type === 'tax' ? 'warning' : 'default'
                      }
                      sx={{ fontSize: '0.75rem' }}
                    />
                  )}
                </TableCell>

                <TableCell align="center" sx={{ width: 80 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {quantity}
                  </Typography>
                </TableCell>

                <TableCell align="right" sx={{ width: 100 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {fCurrency(rate)}
                  </Typography>
                </TableCell>

                <TableCell align="right" sx={{ width: 120 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 'medium',
                      color: 'primary.main'
                    }}
                  >
                    {fCurrency(amount)}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}

          {/* Total row */}
          <TableRow sx={{ bgcolor: 'background.neutral' }}>
            <TableCell colSpan={4}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Total
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}
              >
                {fCurrency(document.total || 0)}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}