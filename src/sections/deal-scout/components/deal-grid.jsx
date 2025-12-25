'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { DealCard } from './deal-card';

// ----------------------------------------------------------------------

export function DealGrid({ deals }) {
    if (deals.length === 0) {
        return (
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
                    No deals found
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Try searching for something else or adjust your filters
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                },
                gap: 3,
            }}
        >
            {deals.map((deal, index) => (
                <DealCard key={deal.id} deal={deal} index={index} />
            ))}
        </Box>
    );
}
