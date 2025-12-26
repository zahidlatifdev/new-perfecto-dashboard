import { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    IconButton,
    Chip,
    Box,
    Stack,
    Tooltip,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';

export function ReportCard({
    title,
    summary,
    summaryLabel,
    isPremium = false,
    isLocked = false,
    children,
    onExport,
    onFullScreen,
    onDrillDown,
    drillDownLabel = 'View Details',
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Card
            sx={{
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                transition: 'all 0.3s ease',
                ...(isHovered &&
                    !isLocked && {
                    transform: 'scale(1.01)',
                    boxShadow: (theme) => theme.shadows[8],
                }),
                ...(isLocked && {
                    opacity: 0.75,
                }),
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isPremium && (
                <Chip
                    icon={<Iconify icon="solar:chart-2-bold" width={14} />}
                    label="Premium"
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 10,
                        background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                    }}
                />
            )}

            {isLocked && (
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 20,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: 'action.hover',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Iconify icon="solar:lock-bold" width={24} sx={{ color: 'text.secondary' }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        Upgrade to Premium
                    </Typography>
                </Box>
            )}

            <CardHeader
                title={
                    <Typography variant="subtitle1" fontWeight={600}>
                        {title}
                    </Typography>
                }
                sx={{ pb: 1 }}
            />

            <CardContent>
                <Stack spacing={2}>
                    {/* Chart Area */}
                    <Box sx={{ height: 192, width: '100%' }}>{children}</Box>

                    {/* Summary Metric */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}
                    >
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                {summaryLabel}
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                                {summary}
                            </Typography>
                        </Box>

                        {/* Actions */}
                        <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Export CSV/PDF">
                                <span>
                                    <IconButton size="small" onClick={onExport} disabled={isLocked}>
                                        <Iconify icon="solar:download-linear" width={18} />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            <Tooltip title="Full Screen">
                                <span>
                                    <IconButton size="small" onClick={onFullScreen} disabled={isLocked}>
                                        <Iconify icon="solar:maximize-linear" width={18} />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            {onDrillDown && (
                                <Tooltip title={drillDownLabel}>
                                    <span>
                                        <IconButton size="small" onClick={onDrillDown} disabled={isLocked}>
                                            <Iconify icon="solar:arrow-right-up-linear" width={18} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
