import { Paper, Typography } from '@mui/material';

export function CustomTooltip({ active, payload, label, formatter }) {
    if (active && payload && payload.length) {
        return (
            <Paper
                sx={{
                    p: 1.5,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    boxShadow: 3,
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {label}
                </Typography>
                {payload.map((entry, index) => (
                    <Typography key={index} variant="body2" sx={{ color: entry.color, fontSize: 11 }}>
                        {entry.name}: {formatter ? formatter(entry.value) : entry.value}
                    </Typography>
                ))}
            </Paper>
        );
    }
    return null;
}
