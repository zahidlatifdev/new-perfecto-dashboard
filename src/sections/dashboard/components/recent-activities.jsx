import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fCurrency } from 'src/utils/format-number';
import { fToNow } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function RecentActivities({ data, loading = false, onViewAll }) {
    const theme = useTheme();

    if (loading) {
        return (
            <Card sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Skeleton variant="text" width={150} height={28} />
                    <Skeleton variant="text" width={80} height={24} />
                </Stack>
                <Stack spacing={2}>
                    {[...Array(6)].map((_, index) => (
                        <Stack key={index} direction="row" spacing={2}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="70%" height={20} />
                                <Skeleton variant="text" width="40%" height={16} />
                            </Box>
                            <Skeleton variant="rectangular" width={60} height={24} />
                        </Stack>
                    ))}
                </Stack>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Typography variant="h6">Recent Activities</Typography>
                </Stack>
                <Box
                    sx={{
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                    }}
                >
                    <Typography>No recent activities</Typography>
                </Box>
            </Card>
        );
    }

    const getActivityIcon = (type) => {
        const iconMap = {
            transaction: 'ph:arrow-up-right-bold',
            document: 'ph:file-pdf-bold',
            statement: 'ph:bank-bold',
            invoice: 'ph:invoice-bold',
            receipt: 'ph:receipt-bold',
            bill: 'ph:file-text-bold',
            matching: 'ph:link-bold',
        };
        return iconMap[type] || 'ph:circle-bold';
    };

    const getStatusColor = (status) => {
        const colorMap = {
            success: 'success',
            completed: 'success',
            processed: 'success',
            pending: 'warning',
            failed: 'error',
            error: 'error',
            info: 'info',
            business: 'info',
            personal: 'warning',
        };
        return colorMap[status?.toLowerCase()] || 'default';
    };

    return (
        <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6">Recent Activities</Typography>
                {onViewAll && (
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'primary.main',
                            cursor: 'pointer',
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        }}
                        onClick={onViewAll}
                    >
                        View All
                    </Typography>
                )}
            </Stack>

            <Stack spacing={2}>
                {data.map((activity, index) => (
                    <Stack key={activity.id || index} direction="row" spacing={2} alignItems="flex-start">
                        {/* Activity Icon */}
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                color: 'primary.main',
                            }}
                        >
                            <Iconify icon={getActivityIcon(activity.type)} width={20} />
                        </Avatar>

                        {/* Activity Details */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 'fontWeightMedium',
                                    mb: 0.5,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {activity.description}
                            </Typography>

                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="caption" color="text.secondary">
                                    {activity.date}
                                </Typography>

                                {activity.amount && (
                                    <>
                                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {fCurrency(activity.amount)}
                                        </Typography>
                                    </>
                                )}
                            </Stack>
                        </Box>

                        {/* Status/Action */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                            {activity.status && (
                                <Chip
                                    size="small"
                                    label={activity.status}
                                    color={getStatusColor(activity.statusColor || activity.status)}
                                    variant="soft"
                                    sx={{ fontSize: '0.75rem' }}
                                />
                            )}

                            {activity.link && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'primary.main',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    {activity.link.text}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                ))}
            </Stack>
        </Card>
    );
}
