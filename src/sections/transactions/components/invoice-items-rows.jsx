'use client';

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import { CategorySelector } from 'src/components/category-selector';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { ItemCategoryUpdateDialog } from './item-category-update-dialog';

// ----------------------------------------------------------------------

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

export function InvoiceItemsRows({ document, isInvoice, onDocumentUpdate }) {
  // Bills should be treated like receipts (debit transactions)
  const isBill = document?.documentType === 'Bill';
  const showInCreditColumn = isInvoice && !isBill;
  const showInDebitColumn = !isInvoice || isBill;

  // Allow category editing for all document types
  const allowCategoryEdit = document?.documentType === 'Receipt' || document?.documentType === 'Bill' || document?.documentType === 'Invoice';

  // State for category editing
  const [selectedCategories, setSelectedCategories] = useState({});
  const [modifiedItems, setModifiedItems] = useState({});
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [updateMessage, setUpdateMessage] = useState({});

  // Item Category Update Dialog State
  const [itemCategoryDialog, setItemCategoryDialog] = useState({
    open: false,
    itemIndex: null,
    currentItem: null,
    similarItems: [],
    newCategory: '',
    loading: false,
  });

  // Category change handler
  const handleCategoryChange = useCallback((itemIndex, value) => {
    const itemKey = `${document._id}-${itemIndex}`;
    setSelectedCategories((prev) => ({
      ...prev,
      [itemKey]: value,
    }));
    setModifiedItems((prev) => ({
      ...prev,
      [itemKey]: true,
    }));
  }, [document._id]);

  // Update single item category
  const updateSingleItemCategory = useCallback(async (itemIndex, newCategory) => {
    try {
      const response = await axiosInstance.put(
        endpoints.documents.updateItemCategory(document._id),
        {
          itemIndex,
          category: newCategory,
        }
      );

      if (response.data.success && onDocumentUpdate) {
        onDocumentUpdate(response.data.data.document);
      }

      const itemKey = `${document._id}-${itemIndex}`;
      setUpdateMessage({ [itemKey]: 'success' });
      setModifiedItems((prev) => {
        const updated = { ...prev };
        delete updated[itemKey];
        return updated;
      });
    } catch (err) {
      const itemKey = `${document._id}-${itemIndex}`;
      setUpdateMessage({ [itemKey]: 'error' });
      throw err;
    }
  }, [document._id, onDocumentUpdate]);

  // Update all similar item categories
  const updateAllSimilarItemCategories = useCallback(async (itemIndex, newCategory) => {
    try {
      const response = await axiosInstance.put(
        endpoints.documents.updateSimilarItemCategories(document._id),
        {
          itemIndex,
          category: newCategory,
        }
      );

      if (response.data.success && onDocumentUpdate) {
        // Refresh the document to get updated data
        const docResponse = await axiosInstance.get(endpoints.documents.get(document._id));
        if (docResponse.data.success) {
          onDocumentUpdate(docResponse.data.data.document);
        }
      }

      const itemKey = `${document._id}-${itemIndex}`;
      setUpdateMessage({ [itemKey]: 'success' });
      setModifiedItems((prev) => {
        const updated = { ...prev };
        delete updated[itemKey];
        return updated;
      });

      return response.data.data.updatedCount;
    } catch (err) {
      const itemKey = `${document._id}-${itemIndex}`;
      setUpdateMessage({ [itemKey]: 'error' });
      throw err;
    }
  }, [document._id, onDocumentUpdate]);

  // Main update handler
  const handleUpdateItemCategory = useCallback(async (itemIndex) => {
    const itemKey = `${document._id}-${itemIndex}`;
    const newCategory = selectedCategories[itemKey];
    if (!newCategory) return;

    const currentItem = document.items[itemIndex];
    if (!currentItem) return;

    setUpdatingItemId(itemKey);
    setUpdateMessage({});

    try {
      // For invoices, directly update without checking for similar items
      if (document.documentType === 'Invoice') {
        await updateSingleItemCategory(itemIndex, newCategory);
        return;
      }

      // For receipts and bills, check for similar items
      const similarResponse = await axiosInstance.get(
        endpoints.documents.findSimilarItems(document._id),
        {
          params: {
            itemIndex,
            category: newCategory
          }
        }
      );

      const similarItems = similarResponse.data.data.similarItems || [];

      // If there are similar items, show the dialog
      if (similarItems.length > 0) {
        setItemCategoryDialog({
          open: true,
          itemIndex,
          currentItem: {
            description: currentItem.description || currentItem.name,
            category: currentItem.category,
          },
          similarItems,
          newCategory,
          loading: false,
        });
        setUpdatingItemId(null);
        return;
      }

      // If no similar items, proceed with normal update
      await updateSingleItemCategory(itemIndex, newCategory);
    } catch (err) {
      console.error('Error checking for similar items:', err);
      setUpdateMessage({ [itemKey]: 'error' });
    } finally {
      setUpdatingItemId(null);
    }
  }, [selectedCategories, document, updateSingleItemCategory]);

  // Dialog handlers
  const handleCloseItemCategoryDialog = useCallback(() => {
    setItemCategoryDialog({
      open: false,
      itemIndex: null,
      currentItem: null,
      similarItems: [],
      newCategory: '',
      loading: false,
    });
  }, []);

  const handleUpdateSingleItemCategory = useCallback(async () => {
    const { itemIndex, newCategory } = itemCategoryDialog;
    if (itemIndex === null || !newCategory) return;

    setItemCategoryDialog(prev => ({ ...prev, loading: true }));
    const itemKey = `${document._id}-${itemIndex}`;
    setUpdatingItemId(itemKey);

    try {
      await updateSingleItemCategory(itemIndex, newCategory);
      handleCloseItemCategoryDialog();
    } catch (err) {
      console.error('Error updating single item:', err);
    } finally {
      setUpdatingItemId(null);
      setItemCategoryDialog(prev => ({ ...prev, loading: false }));
    }
  }, [itemCategoryDialog, updateSingleItemCategory, handleCloseItemCategoryDialog, document._id]);

  const handleUpdateAllItemCategories = useCallback(async () => {
    const { itemIndex, newCategory } = itemCategoryDialog;
    if (itemIndex === null || !newCategory) return;

    setItemCategoryDialog(prev => ({ ...prev, loading: true }));
    const itemKey = `${document._id}-${itemIndex}`;
    setUpdatingItemId(itemKey);

    try {
      const updatedCount = await updateAllSimilarItemCategories(itemIndex, newCategory);
      console.log(`Updated ${updatedCount} items`);
      handleCloseItemCategoryDialog();
    } catch (err) {
      console.error('Error updating all similar items:', err);
    } finally {
      setUpdatingItemId(null);
      setItemCategoryDialog(prev => ({ ...prev, loading: false }));
    }
  }, [itemCategoryDialog, updateAllSimilarItemCategories, handleCloseItemCategoryDialog, document._id]);

  if (!document) return null;

  const items = [];

  // Add regular line items
  if (document.items && Array.isArray(document.items)) {
    items.push(
      ...document.items.map((item) => ({
        ...item,
        type: 'item',
      }))
    );
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
      type: 'shipping',
    });
  }

  // Add fees as an item if it exists (for bills)
  if (document.fees && document.fees > 0) {
    items.push({
      description: 'Fees',
      category: 'Fees',
      quantity: 1,
      rate: document.fees,
      amount: document.fees,
      totalPrice: document.fees,
      type: 'fees',
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
      type: 'tax',
    });
  }

  if (items.length === 0) {
    return (
      <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
        <TableCell sx={{ padding: '6px 12px', width: 50 }} />
        <TableCell sx={{ padding: '6px 12px', width: 40 }} />
        <TableCell sx={{ padding: '6px 12px', width: 100 }} />
        <TableCell sx={{ padding: '6px 12px', fontSize: '0.80rem', width: 300 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontStyle: 'italic',
              fontSize: '0.80rem',
              pl: 3,
            }}
          >
            No items found in this document
          </Typography>
        </TableCell>
        <TableCell sx={{ padding: '6px 12px', width: 180 }} />
        <TableCell sx={{ padding: '6px 12px', width: 100 }} />
        <TableCell sx={{ padding: '6px 12px', width: 100 }} />
        <TableCell sx={{ padding: '6px 12px', width: 140 }} />
        <TableCell sx={{ padding: '6px 12px', width: 160 }} />
      </TableRow>
    );
  }

  return (
    <>
      {items.map((item, index) => {
        const amount = item.amount || item.totalPrice || 0;

        return (
          <TableRow
            key={`${document._id}-item-${index}`}
            hover
            sx={{
              bgcolor: 'rgba(0, 0, 0, 0.02)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            {/* Index column - empty for items */}
            <TableCell sx={{ padding: '6px 12px', width: 50 }}>
              <Box />
            </TableCell>

            {/* Expand column - empty for items */}
            <TableCell sx={{ padding: '6px 12px', width: 40 }}>
              <Box />
            </TableCell>

            {/* Date column - empty for items */}
            <TableCell sx={{ padding: '6px 12px', width: 100 }}>
              <Box />
            </TableCell>

            {/* Description column */}
            <TableCell sx={{ padding: '6px 12px', fontSize: '0.80rem', width: 300 }}>
              <Tooltip title={item.description || item.name || `Item ${index + 1}`}>
                <Typography
                  sx={{
                    fontSize: '0.80rem',
                    pl: 3, // Indent to show it's a sub-item
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.description || item.name || `Item ${index + 1}`}
                </Typography>
              </Tooltip>
            </TableCell>

            {/* Category column */}
            <TableCell sx={{ width: 180, padding: '6px 12px', fontSize: '0.80rem' }}>
              {allowCategoryEdit && item.type === 'item' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CategorySelector
                    value={selectedCategories[`${document._id}-${index}`] || item.category || ''}
                    onChange={(value) => handleCategoryChange(index, value)}
                    transactionType={document.documentType === 'Invoice' ? 'credit' : 'debit'}
                    isPersonal={
                      // Determine if personal based on current category, fallback to document type
                      isPersonalCategory(selectedCategories[`${document._id}-${index}`] || item.category) ||
                      (document.documentType === 'Receipt' && !item.category)
                    }
                    size="small"
                    showAddOption={true}
                    showDeleteOption={true}
                    sx={{ minWidth: 120, fontSize: '0.75rem', height: 28 }}
                  />

                  {modifiedItems[`${document._id}-${index}`] && (
                    <Tooltip title="Save category">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleUpdateItemCategory(index)}
                        disabled={updatingItemId === `${document._id}-${index}`}
                        sx={{ p: 0.5 }}
                      >
                        {updatingItemId === `${document._id}-${index}` ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Iconify icon="eva:checkmark-circle-2-fill" width={16} />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}

                  {updateMessage[`${document._id}-${index}`] === 'success' && (
                    <Tooltip title="Updated successfully">
                      <Iconify icon="eva:checkmark-circle-2-fill" width={16} sx={{ color: 'success.main' }} />
                    </Tooltip>
                  )}

                  {updateMessage[`${document._id}-${index}`] === 'error' && (
                    <Tooltip title="Update failed">
                      <Iconify icon="eva:close-circle-fill" width={16} sx={{ color: 'error.main' }} />
                    </Tooltip>
                  )}
                </Box>
              ) : (
                item.category && (
                  <Chip
                    label={item.category}
                    size="small"
                    variant="outlined"
                    color={
                      item.type === 'shipping'
                        ? 'info'
                        : item.type === 'tax'
                          ? 'warning'
                          : item.type === 'fees'
                            ? 'error'
                            : 'default'
                    }
                    sx={{ fontSize: '0.75rem', height: 24 }}
                  />
                )
              )}
            </TableCell>

            {/* Debit column - show amount for receipts and bills */}
            <TableCell align="right" sx={{ padding: '6px 12px', fontSize: '0.80rem', width: 100 }}>
              {showInDebitColumn ? (
                <Typography variant="body2" color="error.main" sx={{ fontSize: '0.80rem' }}>
                  {fCurrency(amount)}
                </Typography>
              ) : (
                '-'
              )}
            </TableCell>

            {/* Credit column - show amount for invoices only */}
            <TableCell align="right" sx={{ padding: '6px 12px', fontSize: '0.80rem', width: 100 }}>
              {showInCreditColumn ? (
                <Typography variant="body2" color="success.main" sx={{ fontSize: '0.80rem' }}>
                  {fCurrency(amount)}
                </Typography>
              ) : (
                '-'
              )}
            </TableCell>

            {/* Matching column - empty for items */}
            <TableCell sx={{ padding: '6px 12px', fontSize: '0.80rem', width: 140 }}>
              <Box />
            </TableCell>

            {/* Actions column - empty for items */}
            <TableCell sx={{ padding: '6px 12px', fontSize: '0.8rem', width: 160 }}>
              <Box />
            </TableCell>
          </TableRow>
        );
      })}

      {/* Item Category Update Dialog */}
      <ItemCategoryUpdateDialog
        open={itemCategoryDialog.open}
        onClose={handleCloseItemCategoryDialog}
        onUpdateSingle={handleUpdateSingleItemCategory}
        onUpdateAll={handleUpdateAllItemCategories}
        currentItem={itemCategoryDialog.currentItem}
        similarItems={itemCategoryDialog.similarItems}
        newCategory={itemCategoryDialog.newCategory}
        loading={itemCategoryDialog.loading}
      />
    </>
  );
}

InvoiceItemsRows.propTypes = {
  document: PropTypes.object,
  isInvoice: PropTypes.bool,
  onDocumentUpdate: PropTypes.func,
};
