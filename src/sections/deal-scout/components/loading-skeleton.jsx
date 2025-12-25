'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

// ----------------------------------------------------------------------

export function LoadingSkeleton() {
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
            {Array.from({ length: 6 }).map((_, i) => (
                <Card
                    key={i}
                    sx={{
                        p: 3,
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: `${i * 0.1}s`,
                        '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                        },
                    }}
                >
                    <Box sx={{ height: 4, bgcolor: 'grey.300', mb: 2, borderRadius: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ height: 24, width: 80, bgcolor: 'grey.300', borderRadius: 1 }} />
                        <Box sx={{ height: 20, width: 60, bgcolor: 'grey.300', borderRadius: 1 }} />
                    </Box>
                    <Box sx={{ height: 28, bgcolor: 'grey.300', borderRadius: 1, mb: 2 }} />
                    <Box sx={{ height: 20, width: 100, bgcolor: 'grey.300', borderRadius: 1, mb: 2 }} />
                    <Box sx={{ height: 40, bgcolor: 'grey.300', borderRadius: 1, mb: 2 }} />
                    <Box sx={{ height: 40, bgcolor: 'grey.300', borderRadius: 1, mb: 2 }} />
                    <Box sx={{ height: 16, bgcolor: 'grey.300', borderRadius: 1, mb: 2 }} />
                    <Box sx={{ height: 40, bgcolor: 'grey.300', borderRadius: 1 }} />
                </Card>
            ))}
        </Box>
    );
}
