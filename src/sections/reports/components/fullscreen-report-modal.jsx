import { Dialog, DialogContent, DialogTitle, IconButton, Button, Stack } from '@mui/material';
import { Iconify } from 'src/components/iconify';

export function FullScreenReportModal({ open, onOpenChange, title, children, onExport }) {
    return (
        <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <span>{title}</span>
                    <Stack direction="row" spacing={1}>
                        {onExport && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Iconify icon="solar:download-linear" />}
                                onClick={onExport}
                            >
                                Export
                            </Button>
                        )}
                        <IconButton size="small" onClick={() => onOpenChange(false)}>
                            <Iconify icon="solar:close-circle-linear" width={20} />
                        </IconButton>
                    </Stack>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ height: '70vh', p: 3 }}>{children}</DialogContent>
        </Dialog>
    );
}
