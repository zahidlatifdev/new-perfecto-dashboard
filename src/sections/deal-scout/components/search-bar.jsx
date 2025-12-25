'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SearchBar({ value, onChange, onSearch, isLoading }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 700, mx: 'auto' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Search for deals... (e.g., 'laptop deals', 'AirPods Pro')"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Iconify icon="solar:magnifer-bold-duotone" width={24} />
                            </InputAdornment>
                        ),
                    }}
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading || !value.trim()}
                    sx={{ minWidth: 120 }}
                >
                    {isLoading ? <CircularProgress size={24} /> : 'Find Deals'}
                </Button>
            </Box>
        </Box>
    );
}
