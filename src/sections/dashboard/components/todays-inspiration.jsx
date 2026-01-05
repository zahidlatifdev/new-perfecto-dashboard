'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';

const quotes = [
    {
        text: 'The way to get started is to quit talking and begin doing.',
        author: 'Walt Disney',
        role: 'Founder, The Walt Disney Company',
    },
    {
        text: 'Stay hungry. Stay foolish.',
        author: 'Steve Jobs',
        role: 'Co-founder, Apple',
    },
    {
        text: "It's not about ideas. It's about making ideas happen.",
        author: 'Scott Belsky',
        role: 'Co-founder, Behance',
    },
    {
        text: 'Chase the vision, not the money; the money will end up following you.',
        author: 'Tony Hsieh',
        role: 'Former CEO, Zappos',
    },
    {
        text: "If you're not embarrassed by the first version of your product, you've launched too late.",
        author: 'Reid Hoffman',
        role: 'Co-founder, LinkedIn',
    },
    {
        text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
        author: 'Winston Churchill',
        role: 'Former Prime Minister, UK',
    },
    {
        text: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
        role: 'Co-founder, Apple',
    },
    {
        text: 'Your most unhappy customers are your greatest source of learning.',
        author: 'Bill Gates',
        role: 'Co-founder, Microsoft',
    },
    {
        text: "Don't be afraid to give up the good to go for the great.",
        author: 'John D. Rockefeller',
        role: 'Founder, Standard Oil',
    },
    {
        text: 'The best time to plant a tree was 20 years ago. The second best time is now.',
        author: 'Chinese Proverb',
    },
    {
        text: 'Risk more than others think is safe. Dream more than others think is practical.',
        author: 'Howard Schultz',
        role: 'Former CEO, Starbucks',
    },
    {
        text: 'In the middle of difficulty lies opportunity.',
        author: 'Albert Einstein',
        role: 'Theoretical Physicist',
    },
];

// Get a consistent quote for the day based on date
const getDailyQuoteIndex = () => {
    const today = new Date();
    const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return dayOfYear % quotes.length;
};

export function TodaysInspiration() {
    const [currentQuote, setCurrentQuote] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [quoteIndex, setQuoteIndex] = useState(getDailyQuoteIndex());

    useEffect(() => {
        // Check if user has seen today's quote
        const lastSeenDate = localStorage.getItem('perfecto_inspiration_date');
        const today = new Date().toDateString();

        if (lastSeenDate !== today) {
            setIsNew(true);
            localStorage.setItem('perfecto_inspiration_date', today);
        }

        setCurrentQuote(quotes[quoteIndex]);
    }, [quoteIndex]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setIsNew(false);

        // Get a random different quote
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * quotes.length);
        } while (newIndex === quoteIndex && quotes.length > 1);

        setTimeout(() => {
            setQuoteIndex(newIndex);
            setIsRefreshing(false);
        }, 500);
    };

    if (!currentQuote) {
        return (
            <Card
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2,
                    background: (theme) =>
                        `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 50%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    p: 3,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                    <Iconify icon="mdi:refresh" width={20} sx={{ animation: 'spin 1s linear infinite' }} />
                    <Typography variant="body2" color="text.secondary">
                        Loading today's inspiration...
                    </Typography>
                </Box>
            </Card>
        );
    }

    return (
        <Card
            sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                background: (theme) =>
                    `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 50%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
        >
            {/* Decorative elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 256,
                    height: 256,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    transform: 'translate(50%, -50%)',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: 192,
                    height: 192,
                    bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.05),
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    transform: 'translate(-50%, 50%)',
                }}
            />

            <Box sx={{ position: 'relative', p: { xs: 3, md: 4 } }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: 1,
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            }}
                        >
                            <Iconify icon="mdi:sparkles" width={16} color="primary.main" />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                            Today's Inspiration
                        </Typography>
                        {isNew && (
                            <Box
                                sx={{
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
                                    animation: 'pulse 2s ease-in-out infinite',
                                }}
                            >
                                <Iconify icon="mdi:sparkles" width={12} />
                                NEW
                            </Box>
                        )}
                    </Box>
                    <IconButton
                        size="small"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        sx={{
                            color: 'text.secondary',
                            '&:hover': {
                                color: 'text.primary',
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            },
                        }}
                    >
                        <Iconify
                            icon="mdi:refresh"
                            width={16}
                            sx={{
                                ...(isRefreshing && {
                                    animation: 'spin 1s linear infinite',
                                }),
                            }}
                        />
                    </IconButton>
                </Box>

                {/* Quote */}
                <Box sx={{ display: 'flex', gap: { xs: 2, md: 3 } }}>
                    <Iconify
                        icon="mdi:format-quote-close"
                        width={{ xs: 32, md: 40 }}
                        sx={{
                            color: (theme) => alpha(theme.palette.primary.main, 0.3),
                            flexShrink: 0,
                            transform: 'rotate(180deg)',
                        }}
                    />
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: { xs: '1.125rem', md: '1.25rem', lg: '1.5rem' },
                                fontWeight: 500,
                                fontStyle: 'italic',
                                lineHeight: 1.6,
                                mb: 2,
                                opacity: isRefreshing ? 0.5 : 1,
                                transition: 'opacity 0.3s',
                            }}
                        >
                            "{currentQuote.text}"
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { sm: 'center' },
                                gap: { xs: 0.5, sm: 1.5 },
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight={600}>
                                — {currentQuote.author}
                            </Typography>
                            {currentQuote.role && (
                                <Typography variant="body2" color="text.secondary">
                                    {currentQuote.role}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}
