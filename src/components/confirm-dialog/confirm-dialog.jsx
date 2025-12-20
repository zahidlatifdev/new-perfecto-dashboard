import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';

export function ConfirmDialog({ open, onClose, title, content, action }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {typeof content === 'string' ? (
                    <Typography>{content}</Typography>
                ) : (
                    content
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                {action}
            </DialogActions>
        </Dialog>
    );
}