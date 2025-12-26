'use client';

import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Badge,
    Stack,
    Container,
    Grid,
    Chip,
    Link as MuiLink,
    alpha,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { funFacts, getCategoryColor, getCategoryLabel } from 'src/_mock/_funFacts';
import Link from 'next/link';

const categories = ['all', 'spending', 'savings', 'achievement', 'insight', 'milestone'];

export function FunFactsView() {
    const [selectedCategory, setSelectedCategory] = useState('all');


    // Sort: new facts first
    const sortedFacts = [...funFacts].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    const filteredFacts =
        selectedCategory === 'all'
            ? sortedFacts
            : sortedFacts.filter((f) => f.category === selectedCategory);

    const newFactsCount = funFacts.filter((f) => f.isNew).length;

    return (
        <Container maxWidth="xl">
            <Stack spacing={4}>
                {/* Header */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    spacing={2}
                >
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Iconify icon="solar:star-bold-duotone" width={32} sx={{ color: 'warning.main' }} />
                            <Typography variant="h4" component="h1">
                                Your Fun Facts
                            </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Personalized insights from your financial journey with Perfecto
                        </Typography>
                    </Box>
                    {newFactsCount > 0 && (
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: 'amber.500', color: 'common.white', borderRadius: 2, px: 2, py: 0.5, alignSelf: 'flex-start', minHeight: 32 }}>
                            <Iconify icon="solar:sparkles-bold" width={16} sx={{ color: 'inherit' }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 14, color: 'inherit' }}>
                                {newFactsCount} New Facts
                            </Typography>
                        </Stack>
                    )}
                </Stack>

                {/* Category Filter */}
                <Card>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" useFlexGap>
                            <Iconify icon="solar:filter-bold-duotone" width={20} sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                Filter:
                            </Typography>
                            {categories.map((cat) => (
                                <Button
                                    key={cat}
                                    variant={selectedCategory === cat ? 'contained' : 'outlined'}
                                    size="small"
                                    onClick={() => setSelectedCategory(cat)}
                                    sx={{ textTransform: 'capitalize', borderRadius: 1 }}
                                >
                                    {cat === 'all' ? 'All Facts' : getCategoryLabel(cat)}
                                </Button>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>

                {/* Facts Grid */}
                <Grid container spacing={2}>
                    {filteredFacts.map((fact) => {
                        const categoryStyle = getCategoryColor(fact.category);
                        return (
                            <Grid item xs={12} sm={6} lg={4} key={fact.id}>
                                <Card
                                    sx={{
                                        position: 'relative',
                                        overflow: 'visible',
                                        height: '100%',
                                        minHeight: 260,
                                        maxWidth: 340,
                                        mx: 'auto',
                                        background: categoryStyle.gradient,
                                        border: 2,
                                        borderColor: categoryStyle.border,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'scale(1.02)',
                                            boxShadow: (theme) => theme.shadows[8],
                                        },
                                    }}
                                >
                                    {fact.isNew && (
                                        <Chip
                                            icon={<Iconify icon="solar:sparkles-bold" width={14} />}
                                            label="NEW"
                                            color="warning"
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                px: 1,
                                                py: 0,
                                                animation: 'pulse 2s ease-in-out infinite',
                                                '@keyframes pulse': {
                                                    '0%, 100%': {
                                                        opacity: 1,
                                                    },
                                                    '50%': {
                                                        opacity: 0.7,
                                                    },
                                                },
                                            }}
                                        />
                                    )}

                                    <CardContent sx={{ p: 2.2 }}>
                                        <Stack spacing={1.5}>
                                            {/* Icon */}
                                            <Typography variant="h2" component="div" sx={{ fontSize: '2.2rem' }}>
                                                {fact.icon}
                                            </Typography>

                                            {/* Category Label */}
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.1em',
                                                    fontWeight: 700,
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                {getCategoryLabel(fact.category)}
                                            </Typography>

                                            {/* Title */}
                                            <Typography variant="subtitle1" fontWeight={700}>
                                                {fact.title}
                                            </Typography>

                                            {/* Description */}
                                            <Typography variant="body2" color="text.secondary">
                                                {fact.description}
                                            </Typography>

                                            {/* Value */}
                                            <Box sx={{ pt: 0.5 }}>
                                                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.2 }}>
                                                    {fact.value}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontStyle: 'italic' }}
                                                >
                                                    {fact.analogy}
                                                </Typography>
                                            </Box>

                                            {/* Feature Link */}
                                            {fact.featureLink && (
                                                <Link href={fact.featureLink} passHref legacyBehavior>
                                                    <MuiLink
                                                        sx={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 0.5,
                                                            mt: 1,
                                                            color: 'primary.main',
                                                            fontWeight: 600,
                                                            textDecoration: 'none',
                                                            '&:hover': {
                                                                textDecoration: 'underline',
                                                            },
                                                        }}
                                                    >
                                                        Explore {fact.featureName}
                                                        <Iconify icon="solar:arrow-right-linear" width={16} />
                                                    </MuiLink>
                                                </Link>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* Fun Stats Summary */}
                <Card>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Stack spacing={2} alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                                These fun facts are generated from your transaction history. The more accounts you
                                connect, the more insights we can share!
                            </Typography>
                            <Link href="/dashboard/accounts" passHref legacyBehavior>
                                <Button
                                    variant="outlined"
                                    size="medium"
                                    endIcon={<Iconify icon="solar:arrow-right-linear" />}
                                >
                                    Connect More Accounts
                                </Button>
                            </Link>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Container>
    );
}
