import { Box, Button, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';

export function EmptyState({ onUpload, can }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 10,
                animation: 'fadeIn 0.5s ease-in',
                '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                },
            }}
        >
            <Box
                sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                }}
            >
                <Iconify icon="solar:folder-open-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
            </Box>
            <Typography variant="h5" gutterBottom>
                Your Locker is empty
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: 'center', maxWidth: 400, mb: 3 }}
            >
                Keep your important business documents safe and never miss a renewal. Upload your first
                document to get started.
            </Typography>
            {can('locker', 'create') && (
                <Button variant="contained" size="large" startIcon={<Iconify icon="solar:upload-bold" />} onClick={onUpload}>
                    Upload Document
                </Button>
            )}
        </Box>
    );
}
