'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { funFacts, getCategoryLabel } from '../data/funFactsData';

export function FunFactsCarousel() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const visibleFacts = 3;

    // Auto-rotate every 5 seconds
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % funFacts.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const handlePrev = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev - 1 + funFacts.length) % funFacts.length);
    };

    const handleNext = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev + 1) % funFacts.length);
    };

    const getVisibleFacts = () => {
        const facts = [];
        for (let i = 0; i < visibleFacts; i++) {
            facts.push(funFacts[(currentIndex + i) % funFacts.length]);
        }
        return facts;
    };

    const getCategoryGradient = (category) => {
        const gradients = {
            spending: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            revenue: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            savings: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            efficiency: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
            milestone: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        };
        return gradients[category] || 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)';
    };

    return (
        <Card sx={{ overflow: 'hidden' }}>
            <CardHeader
                title={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Iconify icon="mdi:sparkles" width={20} sx={{ color: '#f59e0b' }} />
                            <Typography variant="h6" component="span" sx={{ fontSize: '1.125rem' }}>
                                Fun Facts
                            </Typography>
                            <Chip
                                label="Personalized"
                                size="small"
                                sx={{
                                    height: 20,
                                    bgcolor: alpha('#f59e0b', 0.1),
                                    color: '#d97706',
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                <IconButton size="small" onClick={handlePrev} sx={{ width: 32, height: 32 }}>
                                    <Iconify icon="mdi:chevron-left" width={16} />
                                </IconButton>
                                <IconButton size="small" onClick={handleNext} sx={{ width: 32, height: 32 }}>
                                    <Iconify icon="mdi:chevron-right" width={16} />
                                </IconButton>
                            </Box>
                            <Button
                                variant="outlined"
                                size="small"
                                endIcon={<Iconify icon="mdi:arrow-right" width={12} />}
                                onClick={() => router.push(paths.dashboard.funFacts)}
                                sx={{ fontSize: '0.75rem', height: 32, ml: 0.5 }}
                            >
                                View All
                            </Button>
                        </Box>
                    </Box>
                }
                sx={{ pb: 1.5 }}
            />
            <CardContent>
                <Box
                    sx={{
                        display: 'grid',
                        gap: 1.5,
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    }}
                >
                    {getVisibleFacts().map((fact, idx) => (
                        <Box
                            key={`${fact.id}-${idx}`}
                            sx={{
                                position: 'relative',
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                p: 2,
                                background: (theme) => {
                                    if (theme.palette.mode === 'dark') {
                                        const darkGradients = {
                                            spending: `linear-gradient(135deg, ${alpha('#dc2626', 0.1)} 0%, ${alpha('#dc2626', 0.05)} 100%)`,
                                            revenue: `linear-gradient(135deg, ${alpha('#16a34a', 0.1)} 0%, ${alpha('#16a34a', 0.05)} 100%)`,
                                            savings: `linear-gradient(135deg, ${alpha('#2563eb', 0.1)} 0%, ${alpha('#2563eb', 0.05)} 100%)`,
                                            efficiency: `linear-gradient(135deg, ${alpha('#9333ea', 0.1)} 0%, ${alpha('#9333ea', 0.05)} 100%)`,
                                            milestone: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`,
                                        };
                                        return darkGradients[fact.category] || `linear-gradient(135deg, ${alpha('#6b7280', 0.1)} 0%, ${alpha('#6b7280', 0.05)} 100%)`;
                                    }
                                    return getCategoryGradient(fact.category);
                                },
                                transition: 'all 0.3s',
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                },
                            }}
                        >
                            {fact.isNew && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: -4,
                                        right: -4,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        bgcolor: '#f59e0b',
                                        color: 'white',
                                        fontSize: 10,
                                        fontWeight: 700,
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: 10,
                                    }}
                                >
                                    <Iconify icon="mdi:sparkles" width={12} />
                                    NEW
                                </Box>
                            )}

                            <Typography sx={{ fontSize: '2rem', mb: 1 }}>{fact.icon}</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: 10,
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                        color: 'text.secondary',
                                    }}
                                >
                                    {getCategoryLabel(fact.category)}
                                </Typography>
                                <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                                    {fact.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    {fact.description}
                                </Typography>
                                <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                                    {fact.value}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: '0.75rem', fontStyle: 'italic' }}
                                >
                                    {fact.analogy}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* Progress dots */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, mt: 2 }}>
                    {funFacts.map((_, idx) => (
                        <Box
                            key={idx}
                            component="button"
                            onClick={() => {
                                setIsAutoPlaying(false);
                                setCurrentIndex(idx);
                            }}
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                bgcolor:
                                    idx === currentIndex
                                        ? 'primary.main'
                                        : (theme) => alpha(theme.palette.text.secondary, 0.3),
                                ...(idx === currentIndex && {
                                    width: 16,
                                }),
                                '&:hover': {
                                    bgcolor:
                                        idx === currentIndex
                                            ? 'primary.main'
                                            : (theme) => alpha(theme.palette.text.secondary, 0.5),
                                },
                            }}
                        />
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
}
