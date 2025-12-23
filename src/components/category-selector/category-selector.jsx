'use client';

import { memo, useMemo, useState, useCallback } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListSubheader,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useCategoryContext } from 'src/contexts/category-context';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import toast from 'react-hot-toast';

// ----------------------------------------------------------------------

const CategorySelector = memo(function CategorySelector({
  value,
  onChange,
  transactionType = null,
  label = 'Category',
  fullWidth = true,
  size = 'small',
  disabled = false,
  showAddOption = true,
  showDeleteOption = true,
  ...other
}) {
  const { categories, loading, createCustomCategory, deleteCustomCategory } = useCategoryContext();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    type: 'Expense',
  });
  const [submitting, setSubmitting] = useState(false);

  // Handle add category
  const handleAddCategory = useCallback(async () => {
    if (!newCategoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      await createCustomCategory(newCategoryForm);
      toast.success('Category created successfully');
      setAddDialogOpen(false);
      setNewCategoryForm({
        name: '',
        type: 'Expense',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  }, [newCategoryForm, createCustomCategory]);

  // Handle delete category
  const handleDeleteCategory = useCallback(async () => {
    if (!categoryToDelete) return;

    setSubmitting(true);
    try {
      await deleteCustomCategory(categoryToDelete.name);
      toast.success('Category deleted successfully');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);

      // If the deleted category was selected, reset to Uncategorized
      if (value === categoryToDelete.name) {
        onChange('Uncategorized');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setSubmitting(false);
    }
  }, [categoryToDelete, deleteCustomCategory, value, onChange]);

  // Check if category can be deleted (custom categories only)
  const canDeleteCategory = useCallback(
    (category) => {
      return !category.isDefault && showDeleteOption;
    },
    [showDeleteOption]
  );

  // Memoize filtered and grouped categories
  const displayCategories = useMemo(() => {
    if (!categories.length) return { items: [] };

    let filteredCategories = categories;

    // Filter by transaction type - show Expense for debits, Income for credits
    if (transactionType) {
      if (transactionType === 'credit') {
        // Show Income categories for credits
        filteredCategories = categories.filter(
          (cat) => cat.type === 'Income' || cat.name === 'Uncategorized'
        );
      } else {
        // Show Expense categories for debits
        filteredCategories = categories.filter(
          (cat) => cat.type === 'Expense' || cat.name === 'Uncategorized'
        );
      }
    }

    // Always ensure Uncategorized is included
    const hasUncategorized = filteredCategories.some((cat) => cat.name === 'Uncategorized');
    if (!hasUncategorized) {
      const uncategorized = categories.find((cat) => cat.name === 'Uncategorized');
      if (uncategorized) {
        filteredCategories = [...filteredCategories, uncategorized];
      }
    }

    // Group categories
    const grouped = {
      Expense: [],
      Income: [],
      Uncategorized: [],
      Other: [],
    };

    filteredCategories.forEach((category) => {
      if (category.type && grouped[category.type]) {
        grouped[category.type].push(category);
      } else if (category.name === 'Uncategorized') {
        grouped.Uncategorized.push(category);
      } else {
        // Put other categories in Other group
        grouped.Other.push(category);
      }
    });

    // Create flat array with headers for rendering
    const items = [];

    if (grouped['Expense'].length > 0) {
      items.push({ type: 'header', key: 'expense-header', label: 'Expense' });
      grouped['Expense'].forEach((cat) => {
        items.push({ type: 'item', key: cat._id || cat.name, category: cat });
      });
    }

    if (grouped['Income'].length > 0) {
      if (items.length > 0) items.push({ type: 'divider', key: 'income-divider' });
      items.push({ type: 'header', key: 'income-header', label: 'Income' });
      grouped['Income'].forEach((cat) => {
        items.push({ type: 'item', key: cat._id || cat.name, category: cat });
      });
    }

    if (grouped['Uncategorized'].length > 0) {
      if (items.length > 0) items.push({ type: 'divider', key: 'uncategorized-divider' });
      items.push({ type: 'header', key: 'uncategorized-header', label: 'Uncategorized' });
      grouped['Uncategorized'].forEach((cat) => {
        items.push({ type: 'item', key: cat._id || cat.name, category: cat });
      });
    }

    if (grouped['Other'].length > 0) {
      if (items.length > 0) items.push({ type: 'divider', key: 'other-divider' });
      items.push({ type: 'header', key: 'other-header', label: 'Other' });
      grouped['Other'].forEach((cat) => {
        items.push({ type: 'item', key: cat._id || cat.name, category: cat });
      });
    }

    // Add "Add Category" option
    if (showAddOption) {
      if (items.length > 0) items.push({ type: 'divider', key: 'add-divider' });
      items.push({ type: 'add', key: 'add-category' });
    }

    return { items };
  }, [categories, transactionType, showAddOption]);

  // Memoize the change handler
  const handleChange = useMemo(
    () => (e) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  if (loading) {
    return (
      <FormControl fullWidth={fullWidth} size={size} disabled>
        <InputLabel>{label}</InputLabel>
        <Select value="" label={label} {...other}>
          <MenuItem disabled>Loading categories...</MenuItem>
        </Select>
      </FormControl>
    );
  }

  return (
    <>
      <FormControl fullWidth={fullWidth} size={size} disabled={disabled}>
        <Select
          value={value || ''}
          onChange={handleChange}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return <span style={{ color: '#9ca3af', fontSize: '0.72rem' }}>{label}</span>;
            }
            return (
              <Tooltip title={selected} arrow>
                <span
                  style={{
                    display: 'inline-block',
                    maxWidth: 140,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    verticalAlign: 'middle',
                    fontSize: '0.8rem',
                  }}
                >
                  {selected}
                </span>
              </Tooltip>
            );
          }}
          sx={{
            fontSize: '0.8rem',
            minHeight: 32,
            height: 32,
            '& .MuiSelect-select': {
              fontSize: '0.8rem',
              paddingRight: '32px',
              minHeight: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiSelect-icon': {
              right: '8px',
            },
          }}
          {...other}
        >
          {displayCategories.items.map((item) => {
            if (item.type === 'header') {
              return (
                <ListSubheader key={item.key} sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  {item.label}
                </ListSubheader>
              );
            }
            if (item.type === 'divider') {
              return <Divider key={item.key} />;
            }
            if (item.type === 'add') {
              return (
                <MenuItem
                  key={item.key}
                  onClick={() => setAddDialogOpen(true)}
                  sx={{ fontSize: '0.75rem', color: 'primary.main' }}
                >
                  <Iconify icon="solar:add-circle-outline" sx={{ mr: 1 }} />
                  Add Category
                </MenuItem>
              );
            }
            return (
              <MenuItem key={item.key} value={item.category.name} sx={{ fontSize: '0.75rem' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <span>{item.category.name}</span>
                  {canDeleteCategory(item.category) && (
                    <Tooltip title="Delete category">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategoryToDelete(item.category);
                          setDeleteDialogOpen(true);
                        }}
                        sx={{ ml: 1, p: 0.5 }}
                      >
                        <Iconify icon="solar:trash-bin-minimalistic-outline" width={14} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl >

      {/* Add Category Dialog */}
      < Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth >
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={newCategoryForm.name}
            onChange={(e) => setNewCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
            margin="normal"
            autoFocus
            size="small"
          />

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={newCategoryForm.type}
              onChange={(e) =>
                setNewCategoryForm((prev) => ({ ...prev, type: e.target.value }))
              }
              label="Type"
            >
              <MenuItem value="Expense">Expense</MenuItem>
              <MenuItem value="Income">Income</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddCategory}
            variant="contained"
            disabled={submitting || !newCategoryForm.name.trim()}
          >
            {submitting ? <CircularProgress size={20} /> : 'Add Category'}
          </Button>
        </DialogActions>
      </Dialog >

      {/* Delete Category Confirmation Dialog */}
      < ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Category"
        content={
          < div >
            <p>Are you sure you want to delete the category "{categoryToDelete?.name}"?</p>
            <Alert severity="warning" sx={{ mt: 2 }}>
              This action will change all transactions with this category to "Uncategorized" and
              cannot be undone.
            </Alert>
          </div >
        }
        action={
          < Button
            onClick={handleDeleteCategory}
            variant="contained"
            color="error"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Delete'}
          </Button >
        }
      />
    </>
  );
});

export { CategorySelector };
