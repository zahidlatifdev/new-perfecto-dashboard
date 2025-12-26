import { Chip } from '@mui/material';
import { differenceInDays } from 'date-fns';

export function ExpiryBadge({ expiryDate }) {
    if (!expiryDate) return null;

    const today = new Date();
    const daysRemaining = differenceInDays(expiryDate, today);

    let color = 'success';
    let label = '';

    if (daysRemaining < 0) {
        color = 'error';
        label = 'Expired';
    } else if (daysRemaining === 0) {
        color = 'error';
        label = 'Expires today';
    } else if (daysRemaining <= 7) {
        color = 'error';
        label = `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`;
    } else if (daysRemaining <= 30) {
        color = 'warning';
        label = `${daysRemaining} days left`;
    } else {
        color = 'success';
        label = `${daysRemaining} days left`;
    }

    return (
        <Chip
            label={label}
            color={color}
            size="small"
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
        />
    );
}
