'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { BUSINESS_CATEGORIES } from '../constants';

// ----------------------------------------------------------------------

export function AlternativesCategoryFilter({ selectedCategory, onSelectCategory }) {
    return (
        <Scrollbar sx={{ maxWidth: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, pb: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <Button
                    variant={selectedCategory === null ? 'contained' : 'outlined'}
                    startIcon={<Iconify icon="solar:star-bold-duotone" width={18} />}
                    onClick={() => onSelectCategory(null)}
                    size="small"
                    sx={{
                        borderRadius: 10,
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                        minWidth: 'fit-content',
                        px: 2,
                    }}
                >
                    All Categories
                </Button>

                {BUSINESS_CATEGORIES.map((category) => (
                    <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'contained' : 'outlined'}
                        startIcon={<Box component="span" sx={{ fontSize: 16, lineHeight: 1 }}>{category.icon}</Box>}
                        onClick={() => onSelectCategory(category.id)}
                        size="small"
                        sx={{
                            borderRadius: 10,
                            textTransform: 'none',
                            whiteSpace: 'nowrap',
                            minWidth: 'fit-content',
                            px: 2,
                        }}
                    >
                        {category.name}
                    </Button>
                ))}
            </Box>
        </Scrollbar>
    );
}
