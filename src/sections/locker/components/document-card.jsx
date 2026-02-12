import {
    Box,
    Card,
    Typography,
    IconButton,
    Chip,
    Stack,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import { useState } from 'react';
import { format } from 'date-fns';
import { Iconify } from 'src/components/iconify';
import { getCategoryInfo, isExtractableCategory } from '../constants';
import { ExpiryBadge } from './expiry-badge';

export function DocumentCard({
    document,
    onView,
    onEdit,
    onDelete,
    onDownload,
    onShare,
    onUploadNewVersion,
}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const categoryInfo = getCategoryInfo(document.category);

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMenuAction = (action) => {
        handleMenuClose();
        action();
    };

    return (
        <>
            <Card
                sx={{
                    p: 2.5,
                    borderRadius: 2,
                    animation: 'fadeIn 0.5s ease-in',
                    '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(10px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                    },
                    transition: 'all 0.2s',
                    '&:hover': {
                        boxShadow: (theme) => theme.customShadows.z8,
                        '& .quick-actions': {
                            opacity: 1,
                        },
                    },
                }}
            >
                <Stack direction="row" spacing={2}>
                    {/* Category Icon */}
                    <Box
                        onClick={() => onView(document)}
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1.5,
                            bgcolor: 'primary.lighter',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: 'primary.light',
                                transform: 'scale(1.05)',
                            },
                        }}
                    >
                        <Iconify icon={categoryInfo.icon} width={24} sx={{ color: 'primary.main' }} />
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="subtitle1"
                                    onClick={() => onView(document)}
                                    sx={{
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        '&:hover': {
                                            color: 'primary.main',
                                        },
                                        transition: 'color 0.2s',
                                    }}
                                    title={document.name}
                                >
                                    {document.name}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 0.5 }}>
                                    <Chip label={categoryInfo.label} size="small" sx={{ fontSize: '0.7rem' }} />
                                    <Typography variant="caption" color="text.secondary">
                                        •
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {format(new Date(document.uploadDate), 'MMM d, yyyy')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        •
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatFileSize(document.fileSize)}
                                    </Typography>
                                </Stack>
                            </Box>

                            {/* Quick Actions */}
                            <Stack
                                direction="row"
                                spacing={0.5}
                                className="quick-actions"
                                sx={{
                                    opacity: { xs: 1, md: 0 },
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                <Tooltip title="View">
                                    <IconButton size="small" onClick={() => onView(document)}>
                                        <Iconify icon="solar:eye-bold" width={18} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Download">
                                    <IconButton size="small" onClick={() => onDownload(document)}>
                                        <Iconify icon="solar:download-bold" width={18} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Share">
                                    <IconButton size="small" onClick={() => onShare(document)}>
                                        <Iconify icon="solar:share-bold" width={18} />
                                    </IconButton>
                                </Tooltip>
                                <IconButton size="small" onClick={handleMenuOpen}>
                                    <Iconify icon="solar:menu-dots-bold" width={18} />
                                </IconButton>
                            </Stack>
                        </Stack>

                        {/* Expiry Badge */}
                        {document.expiryDate && (
                            <Box sx={{ mt: 1.5 }}>
                                <ExpiryBadge expiryDate={document.expiryDate} />
                            </Box>
                        )}

                        {/* Processing Status for extractable documents */}
                        {isExtractableCategory(document.category) && document.processingStatus && document.processingStatus !== 'none' && (
                            <Box sx={{ mt: 1 }}>
                                {(document.processingStatus === 'pending' || document.processingStatus === 'processing') && (
                                    <Chip
                                        icon={<CircularProgress size={12} thickness={5} />}
                                        label="Extracting data..."
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem' }}
                                    />
                                )}
                                {document.processingStatus === 'completed' && document.extractedData && (
                                    <Chip
                                        icon={<Iconify icon="solar:check-circle-bold" width={14} />}
                                        label="Data extracted"
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem' }}
                                    />
                                )}
                                {document.processingStatus === 'completed' && !document.extractedData && (
                                    <Chip
                                        icon={<Iconify icon="solar:info-circle-bold" width={14} />}
                                        label="No data extracted"
                                        size="small"
                                        color="warning"
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem' }}
                                    />
                                )}
                                {document.processingStatus === 'failed' && (
                                    <Chip
                                        icon={<Iconify icon="solar:danger-triangle-bold" width={14} />}
                                        label="Extraction failed"
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem' }}
                                    />
                                )}
                            </Box>
                        )}

                        {/* Notes */}
                        {document.notes && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {document.notes}
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </Card>

            {/* More Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: { width: 200 },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => handleMenuAction(() => onView(document))}>
                    <ListItemIcon>
                        <Iconify icon="solar:eye-bold" width={20} />
                    </ListItemIcon>
                    <ListItemText>View</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleMenuAction(() => onDownload(document))}>
                    <ListItemIcon>
                        <Iconify icon="solar:download-bold" width={20} />
                    </ListItemIcon>
                    <ListItemText>Download</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleMenuAction(() => onShare(document))}>
                    <ListItemIcon>
                        <Iconify icon="solar:share-bold" width={20} />
                    </ListItemIcon>
                    <ListItemText>Share</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleMenuAction(() => onUploadNewVersion(document))}>
                    <ListItemIcon>
                        <Iconify icon="solar:upload-square-bold" width={20} />
                    </ListItemIcon>
                    <ListItemText>Upload New Version</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleMenuAction(() => onEdit(document))}>
                    <ListItemIcon>
                        <Iconify icon="solar:pen-bold" width={20} />
                    </ListItemIcon>
                    <ListItemText>Edit Details</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => handleMenuAction(() => onDelete(document.id))}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon>
                        <Iconify icon="solar:trash-bin-trash-bold" width={20} sx={{ color: 'error.main' }} />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}
