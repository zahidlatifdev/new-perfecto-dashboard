'use client';

import toast from 'react-hot-toast';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

import { deleteAlert, toggleAlert } from 'src/utils/price-alerts';

// ----------------------------------------------------------------------

export function PriceAlertsList({ alerts, onUpdate }) {
    const handleDelete = (id, keyword) => {
        deleteAlert(id);
        toast.success(`Alert for "${keyword}" has been removed`);
        onUpdate();
    };

    const handleToggle = (id) => {
        toggleAlert(id);
        onUpdate();
    };

    if (alerts.length === 0) {
        return (
            <Box
                sx={{
                    p: 4,
                    borderRadius: 2,
                    border: (theme) => `1px dashed ${theme.palette.divider}`,
                    bgcolor: 'background.neutral',
                    textAlign: 'center',
                }}
            >
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: 'warning.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                    }}
                >
                    <Iconify icon="solar:bell-bold-duotone" width={28} sx={{ color: 'warning.main' }} />
                </Box>
                <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                    No price alerts yet
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Create alerts to get notified when prices drop
                </Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={1.5}>
            {alerts.map((alert) => (
                <Box
                    key={alert.id}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        bgcolor: alert.isActive ? 'warning.lighter' : 'background.neutral',
                        opacity: alert.isActive ? 1 : 0.6,
                        transition: 'all 0.3s',
                        '&:hover': {
                            bgcolor: alert.isActive ? 'warning.light' : 'background.paper',
                            boxShadow: (theme) => theme.customShadows.z8,
                        },
                    }}
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1.5,
                                    bgcolor: alert.isActive ? 'warning.main' : 'grey.400',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Iconify icon="solar:bell-bold" width={20} sx={{ color: 'white' }} />
                            </Box>

                            <Box sx={{ flexGrow: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                    <Typography variant="subtitle2">{alert.keyword}</Typography>
                                    <Chip
                                        label={`≤ $${alert.targetPrice}`}
                                        size="small"
                                        color="warning"
                                        sx={{ height: 20 }}
                                    />
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                                        {alert.category}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                        •
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        Created {new Date(alert.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={0.5}>
                            <IconButton
                                size="small"
                                onClick={() => handleToggle(alert.id)}
                                title={alert.isActive ? 'Pause alert' : 'Activate alert'}
                                color={alert.isActive ? 'warning' : 'default'}
                            >
                                <Iconify
                                    icon={
                                        alert.isActive
                                            ? 'solar:pause-circle-bold-duotone'
                                            : 'solar:play-circle-bold-duotone'
                                    }
                                    width={24}
                                />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => handleDelete(alert.id, alert.keyword)}
                                title="Delete alert"
                                color="error"
                            >
                                <Iconify icon="solar:trash-bin-trash-bold-duotone" width={24} />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Box>
            ))}
        </Stack>
    );
}
