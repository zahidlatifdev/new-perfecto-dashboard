'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AlternativeCard({ alternative, index }) {
    const getPricingBadgeColor = (type) => {
        switch (type) {
            case 'free':
                return 'success';
            case 'open-source':
                return 'secondary';
            case 'freemium':
                return 'info';
            default:
                return 'warning';
        }
    };

    const getFeatureIcon = (available) => {
        if (available === true)
            return <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: 'success.main' }} />;
        if (available === 'partial')
            return <Iconify icon="solar:minus-circle-bold" width={16} sx={{ color: 'warning.main' }} />;
        return <Iconify icon="solar:close-circle-bold" width={16} sx={{ color: 'error.main' }} />;
    };

    return (
        <Card
            sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.3s',
                '&:hover': {
                    boxShadow: (theme) => theme.customShadows.z16,
                    transform: 'translateY(-4px)',
                },
                animation: 'slideUp 0.5s ease-out',
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'backwards',
                '@keyframes slideUp': {
                    from: {
                        opacity: 0,
                        transform: 'translateY(20px)',
                    },
                    to: {
                        opacity: 1,
                        transform: 'translateY(0)',
                    },
                },
            }}
        >
            {/* Savings Banner */}
            {alternative.comparison.savingsPercent > 0 && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bgcolor: 'success.main',
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderBottomLeftRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                    }}
                >
                    <Iconify icon="solar:graph-down-bold" width={16} />
                    <Typography variant="caption" fontWeight="700">
                        Save {alternative.comparison.savingsPercent}%
                    </Typography>
                </Box>
            )}

            {/* Header */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: 'primary.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        fontWeight: 700,
                        border: (theme) => `1px solid ${theme.palette.primary.light}`,
                    }}
                >
                    {alternative.logo}
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
                            {alternative.name}
                        </Typography>
                        {alternative.isOpenSource && (
                            <Chip
                                icon={<Iconify icon="solar:code-bold-duotone" width={14} />}
                                label="Open Source"
                                size="small"
                                color="secondary"
                                sx={{ height: 20 }}
                            />
                        )}
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {alternative.tagline}
                    </Typography>
                </Box>
            </Stack>

            {/* Pricing */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Chip
                    label={alternative.pricing.type}
                    size="small"
                    color={getPricingBadgeColor(alternative.pricing.type)}
                    sx={{ textTransform: 'capitalize' }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {alternative.pricing.startingPrice}
                </Typography>
                {alternative.pricing.freeTrialDays > 0 && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        ({alternative.pricing.freeTrialDays}-day trial)
                    </Typography>
                )}
            </Stack>

            {/* Savings Comparison */}
            {alternative.comparison.savingsAmount && (
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: 'success.lighter',
                        border: (theme) => `1px solid ${theme.palette.success.light}`,
                        mb: 2,
                    }}
                >
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            vs {alternative.comparison.originalProduct} ({alternative.comparison.originalPrice})
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'success.dark', fontWeight: 700 }}>
                            {alternative.comparison.savingsAmount}
                        </Typography>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={100 - alternative.comparison.savingsPercent}
                        sx={{ height: 6, borderRadius: 1 }}
                        color="success"
                    />
                </Box>
            )}

            {/* Description */}
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {alternative.description}
            </Typography>

            {/* Features Grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 1,
                    mb: 2,
                }}
            >
                {alternative.features.slice(0, 6).map((feature, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            borderRadius: 1,
                            bgcolor: 'background.neutral',
                        }}
                    >
                        {getFeatureIcon(feature.available)}
                        <Typography variant="caption" noWrap>
                            {feature.name}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Pros & Cons */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 2,
                    mb: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'success.main',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mb: 1,
                        }}
                    >
                        <Iconify icon="solar:star-bold-duotone" width={14} /> Pros
                    </Typography>
                    <Stack spacing={0.5}>
                        {alternative.pros.slice(0, 3).map((pro, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                                <Iconify icon="solar:check-circle-bold" width={12} sx={{ color: 'success.main', mt: 0.2 }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                                    {pro}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
                <Box>
                    <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700, mb: 1, display: 'block' }}>
                        Cons
                    </Typography>
                    <Stack spacing={0.5}>
                        {alternative.cons.slice(0, 2).map((con, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                                <Iconify icon="solar:close-circle-bold" width={12} sx={{ color: 'error.main', mt: 0.2 }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                                    {con}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Box>

            {/* Best For */}
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral', mb: 2 }}>
                <Typography variant="caption">
                    <strong>Best for:</strong> {alternative.bestFor}
                </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Divider sx={{ my: 2 }} />

            {/* Rating & CTA */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                    <Rating value={alternative.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {alternative.rating.toFixed(1)}
                    </Typography>
                </Stack>
                <Button
                    variant="contained"
                    endIcon={<Iconify icon="solar:link-bold-duotone" width={20} />}
                    onClick={() => window.open(alternative.url, '_blank')}
                >
                    Try It
                </Button>
            </Stack>
        </Card>
    );
}
