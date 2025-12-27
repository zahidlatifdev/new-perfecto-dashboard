import { Card, CardContent, Box, Typography, alpha, Grid } from '@mui/material';
import { Iconify } from 'src/components/iconify';

export function StatsCards({ totalPotentialSavings, implementedSavings, opportunitiesCount, categoriesCount }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const stats = [
        {
            title: 'Potential Savings',
            value: formatCurrency(totalPotentialSavings),
            subtitle: 'per year',
            icon: 'mdi:currency-usd',
            color: '#10b981', // green
        },
        {
            title: 'Already Saved',
            value: formatCurrency(implementedSavings),
            subtitle: 'implemented this year',
            icon: 'mdi:check-circle',
            color: '#6366f1', // indigo
        },
        {
            title: 'Opportunities Found',
            value: opportunitiesCount,
            subtitle: `across ${categoriesCount} categories`,
            icon: 'mdi:trending-down',
            color: '#f59e0b', // amber
        },
    ];

    return (
        <>
            {stats.map((stat, index) => (
                <Grid item xs={12} md={4} key={index}>
                    <Card
                        key={index}
                        sx={{
                            background: (theme) =>
                                `linear-gradient(135deg, ${alpha(stat.color, 0.12)} 0%, ${alpha(stat.color, 0.04)} 100%)`,
                            border: (theme) => `1px solid ${alpha(stat.color, 0.2)}`,
                            overflow: 'hidden',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 500,
                                            color: 'text.secondary',
                                            mb: 1,
                                            opacity: 0.9,
                                        }}
                                    >
                                        {stat.title}
                                    </Typography>
                                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>
                                        {stat.subtitle}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: alpha(stat.color, 0.16),
                                        backdropFilter: 'blur(6px)',
                                    }}
                                >
                                    <Iconify icon={stat.icon} width={32} sx={{ color: stat.color }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </>
    );
}
