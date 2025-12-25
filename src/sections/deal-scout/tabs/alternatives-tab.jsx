'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import axios, { endpoints } from 'src/utils/axios';
import { POPULAR_PRODUCTS, BUSINESS_CATEGORIES } from '../constants';
import { AlternativesCategoryFilter } from '../components/alternatives-category-filter';
import { CategoryCards } from '../components/category-cards';
import { AlternativesGrid } from '../components/alternatives-grid';

// ----------------------------------------------------------------------

export function AlternativesTab() {
    const [selectedProduct, setSelectedProduct] = useState('');
    const [customProduct, setCustomProduct] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async (product) => {
        if (!product.trim()) return;

        setIsLoading(true);
        setError(null);
        setSelectedProduct(product.trim());

        try {
            const response = await axios.post(endpoints.dealScout.searchAlternatives, {
                product,
            });

            setData(response.data);
            toast.success(`Found ${response.data.alternatives?.length || 0} alternatives for ${product}`);
        } catch (err) {
            console.error('Error searching alternatives:', err);
            const errorMessage = err.message || 'Failed to search alternatives. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
            setData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCustomSearch = (e) => {
        e.preventDefault();
        handleSearch(customProduct);
    };

    const handleRandomProduct = () => {
        const filteredProducts = selectedCategory
            ? POPULAR_PRODUCTS.filter((p) => p.categoryId === selectedCategory)
            : POPULAR_PRODUCTS;
        const randomIndex = Math.floor(Math.random() * filteredProducts.length);
        const product = filteredProducts[randomIndex];
        setCustomProduct(product.name);
        handleSearch(product.name);
    };

    const handleProductSelect = (product) => {
        setCustomProduct(product);
        handleSearch(product);
    };

    const handleClearSearch = () => {
        setSelectedProduct('');
        setCustomProduct('');
        setData(null);
        setError(null);
    };

    return (
        <Stack spacing={3}>
            {/* Hero Section */}
            <Box sx={{ textAlign: 'center', py: 3 }}>
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: 'success.lighter',
                        color: 'success.main',
                        px: 2,
                        py: 1,
                        borderRadius: 10,
                        mb: 2,
                    }}
                >
                    <Iconify icon="solar:graph-down-bold-duotone" width={20} />
                    <Typography variant="caption" fontWeight="600">
                        AI-Powered Business Tool Comparison
                    </Typography>
                </Box>

                <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                    Save Money With{' '}
                    <Box component="span" sx={{ color: 'primary.main' }}>
                        Scout Alternatives!
                    </Box>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, maxWidth: 600, mx: 'auto' }}>
                    The AI-powered search to find cost-effective alternatives for payment processors, VoIP
                    services, marketing tools, and 100+ more business categories.
                </Typography>

                {/* Search Form */}
                <Box component="form" onSubmit={handleCustomSearch} sx={{ maxWidth: 700, mx: 'auto' }}>
                    <Stack direction="row" spacing={1}>
                        <TextField
                            fullWidth
                            value={customProduct}
                            onChange={(e) => setCustomProduct(e.target.value)}
                            placeholder="Search any business tool (e.g., Stripe, Zoom, Mailchimp...)"
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
                            disabled={isLoading || !customProduct.trim()}
                            sx={{ minWidth: 100 }}
                        >
                            {isLoading ? <CircularProgress size={24} /> : 'Find'}
                        </Button>
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={handleRandomProduct}
                            title="Random product"
                            disabled={isLoading}
                            sx={{ minWidth: 56 }}
                        >
                            <Iconify icon="solar:restart-bold-duotone" width={24} />
                        </Button>
                    </Stack>
                </Box>

                {/* Category Filter */}
                {!selectedProduct && (
                    <Box sx={{ mt: 3 }}>
                        <AlternativesCategoryFilter
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />
                    </Box>
                )}
            </Box>

            {/* Category Cards or Quick Products */}
            {!selectedProduct && (
                <Box>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Iconify icon="solar:layers-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
                        <Typography variant="h6">
                            {selectedCategory
                                ? BUSINESS_CATEGORIES.find((c) => c.id === selectedCategory)?.name
                                : 'Browse by Category'}
                        </Typography>
                        {selectedCategory && (
                            <Button variant="text" size="small" onClick={() => setSelectedCategory(null)}>
                                View All Categories
                            </Button>
                        )}
                    </Stack>

                    <CategoryCards onSelectProduct={handleProductSelect} selectedCategory={selectedCategory} />
                </Box>
            )}

            {/* Results Section */}
            {selectedProduct && (
                <Box>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleClearSearch}
                        startIcon={<Iconify icon="solar:arrow-left-linear" width={20} />}
                        sx={{ mb: 3 }}
                    >
                        Back to Categories
                    </Button>

                    {/* Loading State */}
                    {isLoading && (
                        <Box sx={{ textAlign: 'center', py: 10 }}>
                            <CircularProgress size={48} sx={{ mb: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Searching for alternatives to <strong>{selectedProduct}</strong>...
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Analyzing 10+ comparison sites and AI-powered insights
                            </Typography>

                            {/* Loading skeleton */}
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                                    gap: 3,
                                    mt: 4,
                                }}
                            >
                                {[...Array(3)].map((_, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            p: 3,
                                            borderRadius: 2,
                                            bgcolor: 'background.neutral',
                                            animation: 'pulse 1.5s ease-in-out infinite',
                                            '@keyframes pulse': {
                                                '0%, 100%': { opacity: 1 },
                                                '50%': { opacity: 0.5 },
                                            },
                                        }}
                                    >
                                        <Box sx={{ height: 120 }} />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <Alert
                            severity="error"
                            action={
                                <Button color="inherit" size="small" onClick={() => handleSearch(selectedProduct)}>
                                    Try Again
                                </Button>
                            }
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Results */}
                    {!isLoading && data && data.alternatives && data.alternatives.length > 0 && (
                        <AlternativesGrid
                            originalProduct={data.originalProduct}
                            alternatives={data.alternatives}
                            summary={data.summary}
                            isLive={data.isLive}
                        />
                    )}

                    {/* No Results */}
                    {!isLoading && data && data.alternatives && data.alternatives.length === 0 && !error && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                py: 10,
                                textAlign: 'center',
                            }}
                        >
                            <Box sx={{ fontSize: 64, mb: 2 }}>🔍</Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                No alternatives found
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                                Try searching for a different product or check back later.
                            </Typography>
                            <Button variant="contained" onClick={handleClearSearch}>
                                Search Again
                            </Button>
                        </Box>
                    )}
                </Box>
            )}
        </Stack>
    );
}
