'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { DEAL_CATEGORIES } from '../constants';

// ----------------------------------------------------------------------

export function CategoryFilter({ selected, onChange }) {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {DEAL_CATEGORIES.map((category) => (
                <Button
                    key={category.id}
                    variant={selected === category.id ? 'contained' : 'outlined'}
                    onClick={() => onChange(category.id)}
                    startIcon={<span>{category.icon}</span>}
                    size="small"
                    sx={{
                        borderRadius: 10,
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                            bgcolor: selected === category.id ? 'primary.dark' : 'action.hover',
                        },
                    }}
                >
                    {category.label}
                </Button>
            ))}
        </Box>
    );
}
