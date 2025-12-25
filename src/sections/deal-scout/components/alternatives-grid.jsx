'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { Iconify } from 'src/components/iconify';

import { AlternativeCard } from './alternative-card';
import { AlternativesTable } from './alternatives-table';

// ----------------------------------------------------------------------

export function AlternativesGrid({ originalProduct, alternatives, summary, isLive }) {
    const [viewMode, setViewMode] = useState('grid');

    // Calculate stats
    const freeAlternatives = alternatives.filter(
        (a) => a.pricing.type === 'free' || a.pricing.type === 'open-source'
    ).length;

    const avgSavings =
        alternatives.reduce((acc, a) => acc + (a.comparison.savingsPercent || 0), 0) /
        alternatives.length;

    const openSourceCount = alternatives.filter((a) => a.isOpenSource).length;

    const stats = [
        {
            icon: 'solar:graph-down-bold-duotone',
            value: `${Math.round(avgSavings)}%`,
            label: 'Avg. Savings',
            color: 'success',
        },
        {
            icon: 'solar:bolt-circle-bold-duotone',
            value: alternatives.length,
            label: 'Alternatives',
            color: 'info',
        },
        {
            icon: 'solar:dollar-bold-duotone',
            value: freeAlternatives,
            label: 'Free Options',
            color: 'secondary',
        },
        {
            icon: 'solar:users-group-two-rounded-bold-duotone',
            value: openSourceCount,
            label: 'Open Source',
            color: 'warning',
        },
    ];

    return (
        <Stack spacing={3}>
            {/* Header Stats */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 2,
                }}
            >
                {stats.map((stat, index) => (
                    <Card
                        key={index}
                        sx={{
                            p: 2.5,
                            bgcolor: `${stat.color}.lighter`,
                            border: (theme) => `1px solid ${theme.palette[stat.color].light}`,
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 1.5,
                                    bgcolor: `${stat.color}.main`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                }}
                            >
                                <Iconify icon={stat.icon} width={28} />
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {stat.label}
                                </Typography>
                            </Box>
                        </Stack>
                    </Card>
                ))}
            </Box>

            {/* Original Product Info with View Toggle */}
            <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ md: 'center' }}
                    spacing={2}
                >
                    <Box sx={{ flexGrow: 1 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                Alternatives to {originalProduct.name}
                            </Typography>
                            {isLive && (
                                <Chip
                                    icon={<Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', animation: 'pulse 2s ease-in-out infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.5 } } }} />}
                                    label="Live Data"
                                    size="small"
                                    color="success"
                                />
                            )}
                        </Stack>
                        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {originalProduct.category}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                •
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Typical cost: {originalProduct.estimatedPrice}
                            </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 800 }}>
                            {summary}
                        </Typography>
                    </Box>

                    {/* View Toggle */}
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(e, newValue) => newValue && setViewMode(newValue)}
                        size="small"
                    >
                        <ToggleButton value="grid">
                            <Iconify icon="solar:widget-5-bold-duotone" width={20} sx={{ mr: 1 }} />
                            Cards
                        </ToggleButton>
                        <ToggleButton value="table">
                            <Iconify icon="solar:list-bold-duotone" width={20} sx={{ mr: 1 }} />
                            Compare
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
            </Card>

            {/* View Content */}
            {viewMode === 'grid' ? (
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
                    {alternatives.map((alternative, index) => (
                        <AlternativeCard key={alternative.id} alternative={alternative} index={index} />
                    ))}
                </Box>
            ) : (
                <AlternativesTable originalProduct={originalProduct} alternatives={alternatives} />
            )}
        </Stack>
    );
}
