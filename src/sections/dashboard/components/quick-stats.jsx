import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function QuickStats({ pendingItems, loading = false, onViewPending, onNavigate }) {
    const theme = useTheme();

    if (loading) {
        return (
            <Card sx={{ p: 3 }}>
                <Skeleton variant="text" width={120} height={28} sx={{ mb: 3 }} />
                <Stack spacing={3}>
                    {[...Array(4)].map((_, index) => (
                        <Stack key={index} direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Skeleton variant="circular" width={40} height={40} />
                                <Stack>
                                    <Skeleton variant="text" width={120} height={20} />
                                    <Skeleton variant="text" width={80} height={16} />
                                </Stack>
                            </Stack>
                            <Skeleton variant="text" width={40} height={24} />
                        </Stack>
                    ))}
                </Stack>
            </Card>
        );
    }

    const stats = [
        {
            icon: 'ph:clock-bold',
            color: 'warning.main',
            bgColor: alpha(theme.palette.warning.main, 0.08),
            title: 'Pending Items',
            value: pendingItems || 0,
            description: 'Items need attention',
            action: onViewPending,
            actionText: 'Review',
        },
        {
            icon: 'ph:chart-line-up-bold',
            color: 'info.main',
            bgColor: alpha(theme.palette.info.main, 0.08),
            title: 'P&L Statement',
            description: 'View financial summary',
            action: () => onNavigate?.('/dashboard/pl-statement'),
            actionText: 'View',
        },
        {
            icon: 'ph:link-bold',
            color: 'success.main',
            bgColor: alpha(theme.palette.success.main, 0.08),
            title: 'Matching',
            description: 'Match transactions',
            action: () => onNavigate?.('/dashboard/matching'),
            actionText: 'Match',
        },
        {
            icon: 'ph:chat-bold',
            color: 'primary.main',
            bgColor: alpha(theme.palette.primary.main, 0.08),
            title: 'Ask Bookkeeper',
            description: 'Get expert help',
            action: () => onNavigate?.('/dashboard/chat-books'),
            actionText: 'Chat',
        },
    ];

    return (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
                Quick Actions
            </Typography>

            <Stack spacing={3}>
                {stats.map((stat, index) => (
                    <Stack
                        key={index}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            p: 2,
                            borderRadius: 1.5,
                            bgcolor: 'background.neutral',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.grey[500], 0.08),
                            },
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1,
                                    bgcolor: stat.bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Iconify icon={stat.icon} width={20} sx={{ color: stat.color }} />
                            </Box>

                            <Stack>
                                <Typography variant="subtitle2" color="text.primary">
                                    {stat.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {stat.description}
                                </Typography>
                            </Stack>
                        </Stack>

                        <Stack alignItems="flex-end" spacing={0.5}>
                            {stat.value !== undefined && (
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: stat.value > 0 ? stat.color : 'text.secondary',
                                        minWidth: 32,
                                        textAlign: 'right',
                                    }}
                                >
                                    {stat.value}
                                </Typography>
                            )}

                            {stat.action && (
                                <Button
                                    size="small"
                                    variant="soft"
                                    color="primary"
                                    onClick={stat.action}
                                    sx={{ minWidth: 60 }}
                                >
                                    {stat.actionText}
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                ))}
            </Stack>
        </Card>
    );
}
