import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

export function SimulatorMetricCard({ title, value, change, changeLabel, icon: Icon, variant = 'default' }) {
    const variantStyles = {
        default: {
            bgcolor: 'background.paper',
            borderColor: 'divider',
        },
        success: {
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
            borderColor: (theme) => alpha(theme.palette.success.main, 0.3),
        },
        warning: {
            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
            borderColor: (theme) => alpha(theme.palette.warning.main, 0.3),
        },
        danger: {
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
            borderColor: (theme) => alpha(theme.palette.error.main, 0.3),
        },
    };

    const iconStyles = {
        default: {
            color: 'primary.main',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
        },
        success: {
            color: 'success.main',
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
        },
        warning: {
            color: 'warning.main',
            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
        },
        danger: {
            color: 'error.main',
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
        },
    };

    return (
        <Card
            sx={{
                p: 2,
                border: 1,
                transition: 'all 0.3s',
                ...variantStyles[variant],
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: change !== undefined ? 0.5 : 0 }}>
                        {value}
                    </Typography>
                    {change !== undefined && (
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 500,
                                color:
                                    change > 0
                                        ? 'success.main'
                                        : change < 0
                                            ? 'error.main'
                                            : 'text.secondary',
                            }}
                        >
                            {change > 0 ? '+' : ''}
                            {change}% {changeLabel}
                        </Typography>
                    )}
                </Box>
                <Box
                    sx={{
                        p: 1,
                        borderRadius: 1.5,
                        ...iconStyles[variant],
                    }}
                >
                    <Icon sx={{ fontSize: 24 }} />
                </Box>
            </Box>
        </Card>
    );
}
