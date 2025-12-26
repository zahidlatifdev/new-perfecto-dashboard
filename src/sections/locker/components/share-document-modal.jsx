import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    Box,
    Typography,
    Stack,
    TextField,
    IconButton,
    Tooltip,
    Grid,
} from '@mui/material';
import toast from 'react-hot-toast';
import { Iconify } from 'src/components/iconify';
import { getCategoryInfo } from '../constants';

export function ShareDocumentModal({ document, open, onOpenChange }) {
    const [copied, setCopied] = useState(false);

    if (!document) return null;

    const categoryInfo = getCategoryInfo(document.category);

    // Generate a mock shareable link
    const shareableLink = `https://app.tryperfecto.ai/locker/shared/${document.id}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareableLink);
            setCopied(true);
            toast.success('Link copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy link');
        }
    };

    const handleEmailShare = () => {
        const subject = encodeURIComponent(`Shared Document: ${document.name}`);
        const body = encodeURIComponent(
            `I'm sharing a document with you from Perfecto Locker:\n\n${document.name}\nCategory: ${categoryInfo.label}\n\nView it here: ${shareableLink}`
        );
        window.open(`mailto:?subject=${subject}&body=${body}`);
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.name,
                    text: `Check out this document from Perfecto Locker: ${document.name}`,
                    url: shareableLink,
                });
            } catch (err) {
                // User cancelled or error
            }
        } else {
            handleCopyLink();
        }
    };

    return (
        <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="xs" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:share-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
                    <Typography variant="h6">Share Document</Typography>
                </Stack>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    {/* Document Info */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            p: 2,
                            borderRadius: 1.5,
                            border: 1,
                            borderColor: 'divider',
                            bgcolor: 'background.neutral',
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                bgcolor: 'primary.lighter',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Iconify icon={categoryInfo.icon} width={20} sx={{ color: 'primary.main' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" noWrap>
                                {document.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {categoryInfo.label}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Copy Link */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Shareable Link
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <TextField
                                fullWidth
                                value={shareableLink}
                                InputProps={{
                                    readOnly: true,
                                }}
                                size="small"
                            />
                            <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
                                <IconButton onClick={handleCopyLink} color="primary">
                                    <Iconify
                                        icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'}
                                        width={20}
                                    />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>

                    {/* Share Options */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                            Share via
                        </Typography>
                        <Grid container spacing={1.5}>
                            <Grid item xs={4}>
                                <Button
                                    variant="outlined"
                                    onClick={handleCopyLink}
                                    sx={{
                                        width: '100%',
                                        height: 80,
                                        flexDirection: 'column',
                                        gap: 1,
                                    }}
                                >
                                    <Iconify icon="solar:link-bold-duotone" width={24} />
                                    <Typography variant="caption">Copy Link</Typography>
                                </Button>
                            </Grid>
                            <Grid item xs={4}>
                                <Button
                                    variant="outlined"
                                    onClick={handleEmailShare}
                                    sx={{
                                        width: '100%',
                                        height: 80,
                                        flexDirection: 'column',
                                        gap: 1,
                                    }}
                                >
                                    <Iconify icon="solar:letter-bold-duotone" width={24} />
                                    <Typography variant="caption">Email</Typography>
                                </Button>
                            </Grid>
                            <Grid item xs={4}>
                                <Button
                                    variant="outlined"
                                    onClick={handleNativeShare}
                                    sx={{
                                        width: '100%',
                                        height: 80,
                                        flexDirection: 'column',
                                        gap: 1,
                                    }}
                                >
                                    <Iconify icon="solar:chat-square-like-bold-duotone" width={24} />
                                    <Typography variant="caption">More</Typography>
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Note */}
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                        Anyone with the link can view this document
                    </Typography>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
