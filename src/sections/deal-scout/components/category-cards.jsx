'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { BUSINESS_CATEGORIES, POPULAR_PRODUCTS } from '../constants';

// ----------------------------------------------------------------------

export function CategoryCards({ onSelectProduct, selectedCategory }) {
    const filteredCategories = selectedCategory
        ? BUSINESS_CATEGORIES.filter((c) => c.id === selectedCategory)
        : BUSINESS_CATEGORIES;

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                },
                gap: 3,
            }}
        >
            {filteredCategories.map((category) => (
                <Card
                    key={category.id}
                    sx={{
                        p: 3,
                        transition: 'all 0.3s',
                        '&:hover': {
                            boxShadow: (theme) => theme.customShadows.z16,
                            transform: 'translateY(-4px)',
                        },
                    }}
                >
                    <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 1.5,
                                bgcolor: 'primary.lighter',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 24,
                            }}
                        >
                            {category.icon}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                                {category.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                                {category.description}
                            </Typography>
                        </Box>
                    </Stack>

                    <Chip
                        icon={<Iconify icon="solar:dollar-bold-duotone" width={16} />}
                        label={`Save ${category.potentialSavings}`}
                        size="small"
                        color="success"
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {POPULAR_PRODUCTS.filter((p) => p.categoryId === category.id).map((product) => (
                            <Button
                                key={product.name}
                                variant="outlined"
                                size="small"
                                onClick={() => onSelectProduct(product.name)}
                                startIcon={<span>{product.icon}</span>}
                                sx={{
                                    borderRadius: 10,
                                    textTransform: 'none',
                                    fontSize: 12,
                                    bgcolor: 'background.neutral',
                                    '&:hover': {
                                        bgcolor: 'primary.lighter',
                                        borderColor: 'primary.main',
                                    },
                                }}
                            >
                                {product.name}
                            </Button>
                        ))}
                    </Box>
                </Card>
            ))}
        </Box>
    );
}
