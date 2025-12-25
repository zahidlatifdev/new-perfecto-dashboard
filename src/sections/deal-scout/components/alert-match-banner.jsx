'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AlertMatchBanner({ matches, onDismiss, onViewDeal }) {
    if (matches.length === 0) return null;

    return (
        <Collapse in={matches.length > 0}>
            <Alert
                severity="success"
                icon={<Iconify icon="solar:confetti-bold-duotone" width={28} />}
                action={
                    <IconButton size="small" onClick={onDismiss}>
                        <Iconify icon="solar:close-circle-linear" width={20} />
                    </IconButton>
                }
                sx={{
                    mb: 3,
                    bgcolor: 'success.lighter',
                    '& .MuiAlert-icon': { color: 'success.main' },
                }}
            >
                <Box>
                    <Typography variant="h6" sx={{ color: 'success.dark', mb: 1 }}>
                        🎉 Price Alert Match!
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'success.dark', mb: 2 }}>
                        {matches.length} deal{matches.length > 1 ? 's' : ''} match your price alerts
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {matches.slice(0, 3).map(({ alert, deal }) => (
                            <Button
                                key={`${alert.id}-${deal.id}`}
                                variant="outlined"
                                size="small"
                                onClick={() => onViewDeal(deal)}
                                startIcon={<Iconify icon="solar:bell-bold" width={16} />}
                                sx={{
                                    color: 'success.dark',
                                    borderColor: 'success.main',
                                    '&:hover': {
                                        bgcolor: 'success.main',
                                        color: 'white',
                                    },
                                }}
                            >
                                {alert.keyword} - {deal.dealPrice}
                            </Button>
                        ))}
                        {matches.length > 3 && (
                            <Chip
                                label={`+${matches.length - 3} more`}
                                size="small"
                                sx={{ bgcolor: 'success.dark', color: 'white' }}
                            />
                        )}
                    </Stack>
                </Box>
            </Alert>
        </Collapse>
    );
}
