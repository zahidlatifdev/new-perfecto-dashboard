'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { sampleActivities } from '../data/bookkeepingData';

const getActivityIcon = (type) => {
    switch (type) {
        case 'message':
            return 'mdi:message-text';
        case 'document':
        case 'upload':
            return 'mdi:file-document';
        case 'task_complete':
            return 'mdi:check-circle';
        case 'status_update':
            return 'mdi:pencil';
        default:
            return 'mdi:circle';
    }
};

const getActivityColor = (type) => {
    switch (type) {
        case 'message':
            return '#2563eb';
        case 'document':
        case 'upload':
            return 'primary.main';
        case 'task_complete':
            return '#16a34a';
        case 'status_update':
            return '#f59e0b';
        default:
            return 'text.secondary';
    }
};

const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

export function ActivityTab() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Iconify icon="mdi:clock-outline" width={16} color="text.secondary" />
                <Typography variant="body2" color="text.secondary">
                    Activity timeline for audit trail and transparency
                </Typography>
            </Box>

            <Box sx={{ position: 'relative' }}>
                {/* Timeline line */}
                <Box
                    sx={{
                        position: 'absolute',
                        left: 19,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        bgcolor: 'divider',
                    }}
                />

                {/* Activities */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {sampleActivities.map((activity) => {
                        const color = getActivityColor(activity.type);
                        const bgColor = typeof color === 'string' && color.startsWith('#')
                            ? alpha(color, 0.1)
                            : (theme) => alpha(theme.palette.primary.main, 0.1);

                        return (
                            <Box key={activity.id} sx={{ position: 'relative', display: 'flex', gap: 2 }}>
                                {/* Icon */}
                                <Box
                                    sx={{
                                        position: 'relative',
                                        zIndex: 10,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        bgcolor: bgColor,
                                        flexShrink: 0,
                                    }}
                                >
                                    <Iconify icon={getActivityIcon(activity.type)} width={16} sx={{ color }} />
                                </Box>

                                {/* Content */}
                                <Box sx={{ flex: 1, pt: 0.75 }}>
                                    <Typography variant="body2">{activity.description}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        {formatRelativeTime(activity.timestamp)} •{' '}
                                        {activity.actor === 'bookkeeper' ? 'Bookkeeper' : 'You'}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            {sampleActivities.length > 8 && (
                <Box sx={{ textAlign: 'center', pt: 2 }}>
                    <Typography
                        variant="body2"
                        color="primary.main"
                        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    >
                        Load more activity
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
