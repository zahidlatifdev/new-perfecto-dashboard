'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function FileViewer({ document, compact = false }) {
    const [openFullScreen, setOpenFullScreen] = useState(false);
    const [loading, setLoading] = useState(true);

    if (!document) {
        return (
            <Card>
                <CardContent sx={{ textAlign: 'center', py: 5 }}>
                    <Typography color="text.secondary">
                        No document available
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const handleImageLoad = () => {
        setLoading(false);
    };

    const handleImageError = () => {
        setLoading(false);
    };

    const getFileUrl = () => {
        // Handle different file path formats
        if (document.filePath?.startsWith('http')) {
            return document.filePath;
        }
        // Construct URL for local files
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${document.filePath}`;
    };

    console.log(document)

    const renderFileContent = (isFullScreen = false) => {
        const fileUrl = getFileUrl();
        const containerHeight = isFullScreen ? '80vh' : compact ? '300px' : '500px';

        if (document.fileType === 'pdf') {
            return (
                <Box sx={{ height: containerHeight, position: 'relative' }}>
                    {loading && (
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 2
                        }}>
                            <CircularProgress />
                        </Box>
                    )}
                    <iframe
                        src={fileUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        title={document.fileName}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                    />
                </Box>
            );
        }

        // Handle images
        return (
            <Box sx={{
                height: containerHeight,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.50'
            }}>
                {loading && (
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2
                    }}>
                        <CircularProgress />
                    </Box>
                )}
                <img
                    src={fileUrl}
                    alt={document.fileName}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
            </Box>
        );
    };

    return (
        <>
            <Card>
                <CardHeader
                    title="Original Document"
                    subheader={`${document.fileName} • ${document.fileType?.toUpperCase()}`}
                    action={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                                size="small"
                                onClick={() => setOpenFullScreen(true)}
                                title="View Full Screen"
                            >
                                <Iconify icon="ph:arrows-out-bold" />
                            </IconButton>
                            <Button
                                size="small"
                                startIcon={<Iconify icon="ph:download-bold" />}
                                onClick={() => window.open(getFileUrl(), '_blank')}
                            >
                                Download
                            </Button>
                        </Box>
                    }
                />
                <CardContent sx={{ p: 0 }}>
                    {renderFileContent()}
                </CardContent>
            </Card>

            {/* Full Screen Dialog */}
            <Dialog
                open={openFullScreen}
                onClose={() => setOpenFullScreen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: { height: '90vh' }
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                        {document.fileName}
                    </Typography>
                    <IconButton onClick={() => setOpenFullScreen(false)}>
                        <Iconify icon="ph:x-bold" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {renderFileContent(true)}
                </DialogContent>
                <DialogActions>
                    <Button
                        startIcon={<Iconify icon="ph:download-bold" />}
                        onClick={() => window.open(getFileUrl(), '_blank')}
                    >
                        Download
                    </Button>
                    <Button onClick={() => setOpenFullScreen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}