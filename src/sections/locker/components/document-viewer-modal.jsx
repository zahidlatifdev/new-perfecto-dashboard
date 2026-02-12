import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Tabs,
    Tab,
    Stack,
    Grid,
    IconButton,
    CircularProgress,
    Badge,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Iconify } from 'src/components/iconify';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { getCategoryInfo, isExtractableCategory } from '../constants';
import { ExpiryBadge } from './expiry-badge';
import { VersionHistory } from './version-history';
import { ExtractedDataDisplay } from './extracted-data-display';

export function DocumentViewerModal({
    document,
    open,
    onOpenChange,
    onDownload,
    onShare,
    onUploadNewVersion,
    onDownloadVersion,
    onReprocess,
}) {
    const [currentTab, setCurrentTab] = useState('preview');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // Reset tab and fetch preview URL when document changes
    useEffect(() => {
        if (document) {
            setCurrentTab('preview');

            // Fetch signed URL for preview if it's a displayable format
            const canPreview = canDisplayFile(document);

            if (canPreview) {
                fetchPreviewUrl();
            } else {
                setPreviewUrl(null);
            }
        }
    }, [document?.id]);

    // Check if file can be displayed in browser
    const canDisplayFile = (doc) => {
        if (!doc) return false;

        const mimeType = doc.mimeType?.toLowerCase() || '';
        const fileType = doc.fileType?.toLowerCase() || '';

        // Images
        if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(fileType)) {
            return true;
        }

        // PDFs
        if (mimeType === 'application/pdf' || fileType === 'pdf') {
            return true;
        }

        return false;
    };

    // Determine file type for rendering
    const getFileType = (doc) => {
        const mimeType = doc.mimeType?.toLowerCase() || '';
        const fileType = doc.fileType?.toLowerCase() || '';

        if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(fileType)) {
            return 'image';
        }

        if (mimeType === 'application/pdf' || fileType === 'pdf') {
            return 'pdf';
        }

        return 'other';
    };

    const fetchPreviewUrl = async () => {
        try {
            setLoadingPreview(true);
            const response = await axiosInstance.get(endpoints.documents.download(document.id));
            if (response.data.success) {
                setPreviewUrl(response.data.data.url);
            }
        } catch (error) {
            console.error('Error fetching preview URL:', error);
            setPreviewUrl(null);
        } finally {
            setLoadingPreview(false);
        }
    };

    if (!document) return null;

    const categoryInfo = getCategoryInfo(document.category);

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="md" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="solar:document-text-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
                        <Typography variant="h6">Document Details</Typography>
                    </Stack>
                    <IconButton
                        onClick={() => onOpenChange(false)}
                        size="small"
                        sx={{
                            color: 'text.secondary',
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                    >
                        <Iconify icon="solar:close-circle-bold" width={24} />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
                <Tabs
                    value={currentTab}
                    onChange={(e, newValue) => setCurrentTab(newValue)}
                    sx={{
                        px: 3,
                        bgcolor: 'background.neutral',
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Tab label="Preview" value="preview" />
                    {isExtractableCategory(document.category) && (
                        <Tab
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Iconify icon="solar:magic-stick-3-bold-duotone" width={16} />
                                    <span>Extracted Data</span>
                                    {(document.processingStatus === 'pending' || document.processingStatus === 'processing') && (
                                        <CircularProgress size={12} thickness={5} />
                                    )}
                                    {document.processingStatus === 'completed' && document.extractedData?.documentType && (
                                        <Badge color="success" variant="dot" />
                                    )}
                                </Stack>
                            }
                            value="extracted"
                        />
                    )}
                    <Tab
                        label={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Iconify icon="solar:history-bold" width={16} />
                                <span>History ({document.versions?.length || 0})</span>
                            </Stack>
                        }
                        value="history"
                    />
                </Tabs>

                <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
                    {currentTab === 'preview' && (
                        <Stack spacing={3}>
                            {/* Document Preview Area */}
                            <Box
                                sx={{
                                    position: 'relative',
                                    borderRadius: 2,
                                    border: 1,
                                    borderColor: 'divider',
                                    bgcolor: 'background.neutral',
                                    minHeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                }}
                            >
                                {loadingPreview ? (
                                    <CircularProgress />
                                ) : previewUrl ? (
                                    getFileType(document) === 'pdf' ? (
                                        <Box
                                            component="iframe"
                                            src={previewUrl}
                                            title={document.name}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                minHeight: 500,
                                                border: 'none',
                                            }}
                                        />
                                    ) : getFileType(document) === 'image' ? (
                                        <Box
                                            component="img"
                                            src={previewUrl}
                                            alt={document.name}
                                            sx={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    ) : null
                                ) : (
                                    <Stack spacing={2} alignItems="center" sx={{ p: 3 }}>
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: 2,
                                                bgcolor: 'primary.lighter',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Iconify
                                                icon={categoryInfo.icon}
                                                width={40}
                                                sx={{ color: 'primary.main' }}
                                            />
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {document.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {document.fileType.toUpperCase()} •{' '}
                                                {formatFileSize(document.fileSize)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                                Preview not available for this file type
                                            </Typography>
                                        </Box>
                                    </Stack>
                                )}
                            </Box>

                            {/* Document Details */}
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            textTransform="uppercase"
                                            fontWeight={600}
                                        >
                                            Category
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                            <Iconify icon={categoryInfo.icon} width={16} sx={{ color: 'primary.main' }} />
                                            <Typography variant="body2" fontWeight={600}>
                                                {categoryInfo.label}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Grid>

                                <Grid item xs={6}>
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            textTransform="uppercase"
                                            fontWeight={600}
                                        >
                                            Uploaded
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                                            {format(new Date(document.uploadDate), 'MMM d, yyyy')}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={6}>
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            textTransform="uppercase"
                                            fontWeight={600}
                                        >
                                            File Size
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                                            {formatFileSize(document.fileSize)}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={6}>
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            textTransform="uppercase"
                                            fontWeight={600}
                                        >
                                            Expiry Status
                                        </Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            {document.expiryDate ? (
                                                <ExpiryBadge expiryDate={document.expiryDate} />
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    No expiry date
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Notes */}
                            {document.notes && (
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        textTransform="uppercase"
                                        fontWeight={600}
                                    >
                                        Notes
                                    </Typography>
                                    <Box
                                        sx={{
                                            mt: 0.5,
                                            p: 2,
                                            bgcolor: 'background.neutral',
                                            borderRadius: 1.5,
                                        }}
                                    >
                                        <Typography variant="body2">{document.notes}</Typography>
                                    </Box>
                                </Box>
                            )}
                        </Stack>
                    )}

                    {currentTab === 'extracted' && isExtractableCategory(document.category) && (
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: 'background.neutral',
                                borderRadius: 2,
                            }}
                        >
                            <ExtractedDataDisplay
                                document={document}
                                onReprocess={onReprocess ? () => onReprocess(document) : undefined}
                            />
                        </Box>
                    )}

                    {currentTab === 'history' && (
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: 'background.neutral',
                                borderRadius: 2,
                            }}
                        >
                            {document.versions && document.versions.length > 0 ? (
                                <VersionHistory
                                    versions={document.versions}
                                    onDownloadVersion={onDownloadVersion}
                                />
                            ) : (
                                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                                    No version history available
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:upload-square-bold" />}
                    onClick={() => onUploadNewVersion(document)}
                    sx={{ flex: 1 }}
                >
                    Upload New Version
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:share-bold" />}
                    onClick={() => onShare(document)}
                    sx={{ flex: 1 }}
                >
                    Share
                </Button>
                <Button
                    variant="contained"
                    startIcon={<Iconify icon="solar:download-bold" />}
                    onClick={() => onDownload(document)}
                    sx={{ flex: 1 }}
                >
                    Download
                </Button>
            </DialogActions>
        </Dialog>
    );
}
