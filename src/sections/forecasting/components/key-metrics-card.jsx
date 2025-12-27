import { Card, CardContent, Stack, Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';

export function KeyMetricsCard({ title, value, change, trend, icon, iconColor, iconBg }) {
    const formatValue = (val, isMonths = false) => {
        if (isMonths) return `${val} months`;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    const getTrendColor = (trendValue) => {
        if (!trendValue) return 'text.secondary';
        if (trendValue === 'up') return 'success.main';
        if (trendValue === 'down') return 'error.main';
        return 'text.secondary';
    };

    const getTrendIcon = (trendValue) => {
        if (trendValue === 'up') return 'mdi:trending-up';
        if (trendValue === 'down') return 'mdi:trending-down';
        return 'mdi:minus';
    };

    return (
        <Card>
            <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" sx={{ mb: 0.5 }}>
                            {formatValue(value, title.includes('Runway'))}
                        </Typography>
                        {change && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Iconify icon={getTrendIcon(trend)} width={14} sx={{ color: getTrendColor(trend) }} />
                                <Typography variant="caption" color={getTrendColor(trend)}>
                                    {change}
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: iconBg || 'primary.lighter',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Iconify icon={icon} width={24} sx={{ color: iconColor || 'primary.main' }} />
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
