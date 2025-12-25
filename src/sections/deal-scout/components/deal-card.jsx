'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function DealCard({ deal, index }) {
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        if (deal.couponCode) {
            navigator.clipboard.writeText(deal.couponCode);
            setCopied(true);
            toast.success(`Code "${deal.couponCode}" copied to clipboard`);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getBadgeConfig = () => {
        switch (deal.type) {
            case 'deal':
                return {
                    label: 'Hot Deal',
                    icon: 'solar:bolt-circle-bold-duotone',
                    color: 'error',
                };
            case 'coupon':
                return {
                    label: 'Coupon',
                    icon: 'solar:ticket-bold-duotone',
                    color: 'primary',
                };
            case 'alternative':
                return {
                    label: 'Smart Alternative',
                    icon: 'solar:lightbulb-bolt-bold-duotone',
                    color: 'info',
                };
            default:
                return {
                    label: 'Deal',
                    icon: 'solar:tag-bold-duotone',
                    color: 'default',
                };
        }
    };

    const badge = getBadgeConfig();

    return (
        <Card
            id={`deal-${deal.id}`}
            sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s',
                '&:hover': {
                    boxShadow: (theme) => theme.customShadows.z8,
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
            {/* Top accent bar */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    bgcolor: `${badge.color}.main`,
                }}
            />

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Chip
                    icon={<Iconify icon={badge.icon} width={16} />}
                    label={badge.label}
                    color={badge.color}
                    size="small"
                />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {deal.source}
                </Typography>
            </Box>

            {/* Title */}
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, minHeight: 48 }}>
                {deal.title}
            </Typography>

            {/* Category */}
            <Chip label={deal.category} size="small" variant="outlined" sx={{ mb: 2, width: 'fit-content' }} />

            {/* Description */}
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, flexGrow: 1 }}>
                {deal.description}
            </Typography>

            {/* Pricing */}
            {(deal.originalPrice || deal.dealPrice) && (
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
                        {deal.dealPrice && (
                            <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
                                {deal.dealPrice}
                            </Typography>
                        )}
                        {deal.originalPrice && (
                            <Typography
                                variant="body2"
                                sx={{ color: 'text.disabled', textDecoration: 'line-through' }}
                            >
                                {deal.originalPrice}
                            </Typography>
                        )}
                    </Box>
                    {deal.discount && (
                        <Chip
                            label={deal.discount}
                            color="error"
                            size="small"
                            sx={{ fontWeight: 700 }}
                        />
                    )}
                </Box>
            )}

            {/* Coupon Code */}
            {deal.couponCode && (
                <Box sx={{ mb: 2 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleCopyCode}
                        endIcon={
                            copied ? (
                                <Iconify icon="solar:check-circle-bold" width={20} />
                            ) : (
                                <Iconify icon="solar:copy-bold-duotone" width={20} />
                            )
                        }
                        sx={{
                            borderStyle: 'dashed',
                            borderWidth: 2,
                            bgcolor: 'primary.lighter',
                            '&:hover': {
                                bgcolor: 'primary.light',
                                borderStyle: 'dashed',
                            },
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                            {deal.couponCode}
                        </Typography>
                    </Button>
                </Box>
            )}

            {/* Expiry */}
            {deal.expiresAt && (
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2 }}>
                    <Iconify icon="solar:clock-circle-bold-duotone" width={16} sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    Expires: {deal.expiresAt}
                </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            {/* CTA */}
            <Button
                fullWidth
                variant="contained"
                endIcon={<Iconify icon="solar:link-bold-duotone" width={20} />}
                onClick={() => window.open(deal.sourceUrl, '_blank')}
            >
                {deal.type === 'alternative' ? 'Try Alternative' : 'View Deal'}
            </Button>
        </Card>
    );
}
