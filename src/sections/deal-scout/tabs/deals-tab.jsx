'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';

import { Iconify } from 'src/components/iconify';

import axios, { endpoints } from 'src/utils/axios';
import { checkAlertsMatch, getAlerts, parsePrice, parseDiscount } from 'src/utils/price-alerts';
import { SearchBar } from '../components/search-bar';
import { CategoryFilter } from '../components/category-filter';
import { DealGrid } from '../components/deal-grid';
import { LoadingSkeleton } from '../components/loading-skeleton';
import { PriceAlertModal } from '../components/price-alert-modal';
import { PriceAlertsList } from '../components/price-alerts-list';
import { AlertMatchBanner } from '../components/alert-match-banner';

// ----------------------------------------------------------------------

export function DealsTab({ onAlertUpdate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('relevance');
    const [isLoading, setIsLoading] = useState(false);
    const [deals, setDeals] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLiveData, setIsLiveData] = useState(false);

    // Price Alerts State
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [alertMatches, setAlertMatches] = useState([]);
    const [showAlerts, setShowAlerts] = useState(false);

    // Load alerts on mount
    useEffect(() => {
        setAlerts(getAlerts());
    }, []);

    const refreshAlerts = () => {
        setAlerts(getAlerts());
        if (onAlertUpdate) onAlertUpdate();
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setHasSearched(true);

        try {
            const response = await axios.post(endpoints.dealScout.searchDeals, {
                query: searchQuery,
                category: selectedCategory === 'all' ? null : selectedCategory,
            });

            const result = response.data;

            setDeals(result.deals || []);
            setIsLiveData(result.isLive || false);

            // Check for alert matches
            const currentAlerts = getAlerts();
            const matches = checkAlertsMatch(result.deals || [], currentAlerts);
            setAlertMatches(matches);

            if (matches.length > 0) {
                toast.success(
                    `🎉 ${matches.length} deal${matches.length > 1 ? 's' : ''} match your alerts!`
                );
            } else {
                toast.success(
                    `Found ${result.deals?.length || 0} ${result.isLive ? 'live ' : ''}deals matching "${searchQuery}"`
                );
            }
        } catch (error) {
            console.error('Error searching deals:', error);
            toast.error(error.message || 'Failed to search deals. Please try again.');
            setDeals([]);
            setIsLiveData(false);
        }

        setIsLoading(false);
    };

    const filteredDeals = (() => {
        let result =
            selectedCategory === 'all'
                ? [...deals]
                : deals.filter((deal) => deal.category.toLowerCase() === selectedCategory.toLowerCase());

        // Apply sorting
        switch (sortBy) {
            case 'discount':
                result.sort((a, b) => parseDiscount(b.discount) - parseDiscount(a.discount));
                break;
            case 'price-low':
                result.sort((a, b) => parsePrice(a.dealPrice) - parsePrice(b.dealPrice));
                break;
            case 'price-high':
                result.sort((a, b) => parsePrice(b.dealPrice) - parsePrice(a.dealPrice));
                break;
            case 'source':
                result.sort((a, b) => a.source.localeCompare(b.source));
                break;
            default:
                break;
        }

        return result;
    })();

    const handleViewMatchedDeal = (deal) => {
        const element = document.getElementById(`deal-${deal.id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.style.outline = '2px solid #1976d2';
            setTimeout(() => {
                element.style.outline = '';
            }, 2000);
        }
    };

    const popularSearches = ['laptop deals', 'wireless earbuds', 'gaming mouse', 'smart watch'];
    return (
        <Stack spacing={3}>
            {/* Hero Section */}
            <Box sx={{ textAlign: 'center', py: 3 }}>
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                        px: 2,
                        py: 1,
                        borderRadius: 10,
                        mb: 2,
                    }}
                >
                    <Iconify icon="solar:graph-up-bold-duotone" width={20} />
                    <Typography variant="caption" fontWeight="600">
                        Searching 100+ deal sources in real-time
                    </Typography>
                </Box>

                <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                    Save Money With{' '}
                    <Box component="span" sx={{ color: 'primary.main' }}>
                        Deal Scout!
                    </Box>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, maxWidth: 600, mx: 'auto' }}>
                    AI-powered search of Amazon, Best Buy, Target, Walmart, Slickdeals, and 100+ more sites to
                    find you the best deals and coupons.
                </Typography>

                {/* Search Bar */}
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                />

                {/* Popular searches */}
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
                        Popular:
                    </Typography>
                    {popularSearches.map((term) => (
                        <Button
                            key={term}
                            size="small"
                            variant="outlined"
                            onClick={() => setSearchQuery(term)}
                            sx={{ borderRadius: 10, textTransform: 'none' }}
                        >
                            {term}
                        </Button>
                    ))}
                </Stack>

                {isLiveData && (
                    <Alert
                        severity="success"
                        icon={<Iconify icon="solar:check-circle-bold-duotone" width={24} />}
                        sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}
                    >
                        Live data from retailers
                    </Alert>
                )}
            </Box>

            {/* Price Alerts Section */}
            <Box>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setShowAlerts(!showAlerts)}
                    endIcon={
                        <Iconify
                            icon={showAlerts ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
                            width={20}
                        />
                    }
                    sx={{
                        justifyContent: 'space-between',
                        py: 1.5,
                        borderRadius: 2,
                        bgcolor: 'background.neutral',
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Iconify icon="solar:bell-bold-duotone" width={24} sx={{ color: 'warning.main' }} />
                        <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="subtitle2">Your Price Alerts</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {alerts.length === 0
                                    ? 'Set alerts to get notified when prices drop'
                                    : `${alerts.filter((a) => a.isActive).length} active alert${alerts.filter((a) => a.isActive).length !== 1 ? 's' : ''
                                    }`}
                            </Typography>
                        </Box>
                    </Stack>
                    <Button variant="contained" size="small" onClick={() => setIsAlertModalOpen(true)}>
                        New Alert
                    </Button>
                </Button>

                <Collapse in={showAlerts}>
                    <Box sx={{ mt: 2 }}>
                        <PriceAlertsList alerts={alerts} onUpdate={refreshAlerts} />
                    </Box>
                </Collapse>
            </Box>

            {/* Results Section */}
            {hasSearched && (
                <Box>
                    {/* Alert Matches Banner */}
                    <AlertMatchBanner
                        matches={alertMatches}
                        onDismiss={() => setAlertMatches([])}
                        onViewDeal={handleViewMatchedDeal}
                    />

                    {/* Category Filter & Sort */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        sx={{ mb: 3, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
                    >
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                            <Iconify icon="solar:sort-bold-duotone" width={20} />
                            <FormControl size="small" sx={{ minWidth: 160 }}>
                                <InputLabel>Sort by</InputLabel>
                                <Select
                                    value={sortBy}
                                    label="Sort by"
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <MenuItem value="relevance">Relevance</MenuItem>
                                    <MenuItem value="discount">Highest Discount</MenuItem>
                                    <MenuItem value="price-low">Price: Low to High</MenuItem>
                                    <MenuItem value="price-high">Price: High to Low</MenuItem>
                                    <MenuItem value="source">Source A-Z</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Stack>

                    {/* Results */}
                    {isLoading ? <LoadingSkeleton /> : <DealGrid deals={filteredDeals} />}
                </Box>
            )}

            {/* Features Section - shown when no search */}
            {!hasSearched && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    {[
                        {
                            icon: 'solar:bolt-circle-bold-duotone',
                            title: 'Real-Time Deals',
                            description: 'AI searches Amazon, Best Buy, Newegg, Dell and more for the latest discounts',
                        },
                        {
                            icon: 'solar:ticket-bold-duotone',
                            title: 'Coupon Codes',
                            description: 'Finds working coupons from RetailMeNot, Honey, Slickdeals and more',
                        },
                        {
                            icon: 'solar:lightbulb-bolt-bold-duotone',
                            title: 'Smart Alternatives',
                            description: 'Suggests free or cheaper alternatives to expensive software and services',
                        },
                    ].map((feature, index) => (
                        <Box
                            key={index}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                bgcolor: 'background.neutral',
                                textAlign: 'center',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 2,
                                    bgcolor: 'primary.lighter',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2,
                                }}
                            >
                                <Iconify icon={feature.icon} width={32} sx={{ color: 'primary.main' }} />
                            </Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                {feature.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {feature.description}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Price Alert Modal */}
            <PriceAlertModal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
                onAlertCreated={refreshAlerts}
                initialKeyword={searchQuery}
            />
        </Stack>
    );
}
