'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';

export function BookkeeperProfile({ name, photoUrl, onMessage }) {
    return (
        <Card
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
            }}
        >
            <Box sx={{ position: 'relative' }}>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: (theme) =>
                            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.4)} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                >
                    {photoUrl ? (
                        <Box
                            component="img"
                            src={photoUrl}
                            alt={name}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <Typography variant="h5" fontWeight={600} color="primary.main">
                            {name.charAt(0)}
                        </Typography>
                    )}
                </Box>
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: '#16a34a',
                        border: '2px solid',
                        borderColor: 'background.paper',
                    }}
                />
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                    {name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Iconify icon="mdi:certificate" width={14} sx={{ color: '#f59e0b' }} />
                    <Typography variant="caption" color="text.secondary">
                        Certified Bookkeeper
                    </Typography>
                </Box>
            </Box>
            <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:message-text" width={16} />}
                onClick={onMessage}
            >
                Message
            </Button>
        </Card>
    );
}
