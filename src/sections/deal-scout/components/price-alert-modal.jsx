'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

import { saveAlert } from 'src/utils/price-alerts';
import { DEAL_CATEGORIES } from '../constants';

// ----------------------------------------------------------------------

export function PriceAlertModal({ isOpen, onClose, onAlertCreated, initialKeyword = '' }) {
    const [keyword, setKeyword] = useState(initialKeyword);
    const [targetPrice, setTargetPrice] = useState('');
    const [category, setCategory] = useState('all');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!keyword.trim() || !targetPrice) {
            toast.error('Please fill in all required fields');
            return;
        }

        const price = parseFloat(targetPrice);
        if (Number.isNaN(price) || price <= 0) {
            toast.error('Please enter a valid target price');
            return;
        }

        const newAlert = saveAlert({
            keyword: keyword.trim(),
            targetPrice: price,
            category,
            isActive: true,
        });

        if (newAlert) {
            toast.success(`Alert created! We'll notify you when "${keyword}" drops below $${price}`);
            onAlertCreated(newAlert);
            setKeyword('');
            setTargetPrice('');
            setCategory('all');
            onClose();
        } else {
            toast.error('Failed to create alert. Please try again.');
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            bgcolor: 'warning.lighter',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Iconify icon="solar:bell-bold-duotone" width={24} sx={{ color: 'warning.main' }} />
                    </Box>
                    <Box>
                        <Typography variant="h6">Create Price Alert</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Get notified when prices drop
                        </Typography>
                    </Box>
                </Stack>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <Iconify icon="solar:close-circle-linear" width={24} />
                </IconButton>
            </DialogTitle>

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={3}>
                        {/* Keyword */}
                        <TextField
                            fullWidth
                            label="Product or Keyword"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="e.g., MacBook Pro, gaming mouse"
                            required
                        />

                        {/* Target Price */}
                        <TextField
                            fullWidth
                            label="Target Price"
                            type="number"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            placeholder="500"
                            inputProps={{ min: 0, step: 0.01 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Iconify icon="solar:dollar-bold-duotone" width={20} />
                                    </InputAdornment>
                                ),
                            }}
                            helperText="Alert when price is at or below this amount"
                            required
                        />

                        {/* Category */}
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select value={category} onChange={(e) => setCategory(e.target.value)} label="Category">
                                {DEAL_CATEGORIES.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <span>{cat.icon}</span>
                                            <span>{cat.label}</span>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button variant="outlined" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Iconify icon="solar:bell-bold-duotone" width={20} />}
                    >
                        Create Alert
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
