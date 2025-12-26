import { Box, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import { format } from 'date-fns';
import { Iconify } from 'src/components/iconify';

export function VersionHistory({ versions, onDownloadVersion }) {
    if (!versions || versions.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                    No version history available
                </Typography>
            </Box>
        );
    }

    const getActionIcon = (action) => {
        switch (action) {
            case 'uploaded':
                return 'solar:upload-bold-duotone';
            case 'edited':
                return 'solar:pen-bold-duotone';
            case 'renamed':
                return 'solar:pen-new-square-bold-duotone';
            case 'category_changed':
                return 'solar:tag-bold-duotone';
            case 'expiry_updated':
                return 'solar:calendar-mark-bold-duotone';
            case 'new_version':
                return 'solar:layers-bold-duotone';
            default:
                return 'solar:document-text-bold-duotone';
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'uploaded':
            case 'new_version':
                return 'success.main';
            case 'edited':
            case 'renamed':
                return 'info.main';
            case 'category_changed':
            case 'expiry_updated':
                return 'warning.main';
            default:
                return 'text.secondary';
        }
    };

    return (
        <Stack spacing={2}>
            {[...versions].reverse().map((version, index) => (
                <Box
                    key={version.id}
                    sx={{
                        display: 'flex',
                        gap: 2,
                        pb: index !== versions.length - 1 ? 2 : 0,
                        borderBottom:
                            index !== versions.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                    }}
                >
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: 'background.neutral',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Iconify
                            icon={getActionIcon(version.action)}
                            width={20}
                            sx={{ color: getActionColor(version.action) }}
                        />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600}>
                            {version.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {format(new Date(version.timestamp), 'MMM d, yyyy h:mm a')}
                        </Typography>

                        {version.fileVersion && (
                            <Box
                                sx={{
                                    mt: 1,
                                    p: 1.5,
                                    bgcolor: 'background.neutral',
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Iconify
                                    icon="solar:document-text-bold-duotone"
                                    width={18}
                                    sx={{ color: 'primary.main' }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="caption" fontWeight={600} noWrap>
                                        v{version.fileVersion.versionNumber} •{' '}
                                        {version.fileVersion.fileName}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                    >
                                        {(version.fileVersion.fileSize / (1024 * 1024)).toFixed(2)}{' '}
                                        MB
                                    </Typography>
                                </Box>
                                {onDownloadVersion && (
                                    <Tooltip title="Download this version">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDownloadVersion(version);
                                            }}
                                        >
                                            <Iconify icon="solar:download-bold" width={18} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>
            ))}
        </Stack>
    );
}
