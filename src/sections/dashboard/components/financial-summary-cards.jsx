import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNumber, fCurrency, fPercent } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function FinancialSummaryCards({ data, loading = false }) {
    const theme = useTheme();

    if (loading) {
        return (
            <Box sx={{ mb: 3 }}>
                {/* First row skeleton */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 3,
                        mb: 3
                    }}
                >
                    {[...Array(4)].map((_, index) => (
                        <Card key={index} sx={{ p: 3, flex: 1, minWidth: 0 }}>
                            <Stack spacing={2}>
                                <Skeleton variant="text" width="60%" height={24} />
                                <Skeleton variant="text" width="40%" height={32} />
                                <Skeleton variant="text" width="30%" height={20} />
                            </Stack>
                        </Card>
                    ))}
                </Box>
                {/* Second row skeleton */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 3
                    }}
                >
                    {[...Array(4)].map((_, index) => (
                        <Card key={index + 4} sx={{ p: 3, flex: 1, minWidth: 0 }}>
                            <Stack spacing={2}>
                                <Skeleton variant="text" width="60%" height={24} />
                                <Skeleton variant="text" width="40%" height={32} />
                                <Skeleton variant="text" width="30%" height={20} />
                            </Stack>
                        </Card>
                    ))}
                </Box>
            </Box>
        );
    }

    if (!data) return null;

    const cards = [
        {
            title: 'Total Income',
            value: data.income.current,
            trend: data.income.trend,
            icon: 'ph:arrow-up-right-bold',
            color: theme.palette.success.main,
            bgColor: alpha(theme.palette.success.main, 0.08),
        },
        {
            title: 'Total Expenses',
            value: data.expenses.current,
            trend: data.expenses.trend,
            icon: 'ph:arrow-down-left-bold',
            color: theme.palette.error.main,
            bgColor: alpha(theme.palette.error.main, 0.08),
        },
        {
            title: 'Net Profit',
            value: data.netProfit.current,
            trend: data.netProfit.trend,
            icon: 'ph:chart-line-up-bold',
            color: data.netProfit.current >= 0 ? theme.palette.success.main : theme.palette.error.main,
            bgColor: alpha(
                data.netProfit.current >= 0 ? theme.palette.success.main : theme.palette.error.main,
                0.08
            ),
        },
        {
            title: 'Bank Balance',
            value: data.totalBankBalance || 0,
            trend: 0, // Could add trend calculation later
            icon: 'ph:bank-bold',
            color: theme.palette.info.main,
            bgColor: alpha(theme.palette.info.main, 0.08),
        },
        {
            title: 'Cash Balance',
            value: data.totalCashBalance || 0,
            trend: 0, // Could add trend calculation later
            icon: 'ph:money-bold',
            color: theme.palette.warning.main,
            bgColor: alpha(theme.palette.warning.main, 0.08),
        },
        {
            title: 'Total Assets',
            value: data.totalAssets || 0,
            trend: 0, // Could add trend calculation later
            icon: 'ph:wallet-bold',
            color: theme.palette.primary.main,
            bgColor: alpha(theme.palette.primary.main, 0.08),
        },
        {
            title: 'Transactions',
            value: data.transactionCount || 0,
            trend: 0, // Could add trend calculation later
            icon: 'ph:swap-bold',
            color: theme.palette.secondary.main,
            bgColor: alpha(theme.palette.secondary.main, 0.08),
            isCount: true,
        },
        {
            title: 'Matching Rate',
            value: data.matchingRate || 0,
            trend: 0, // Could add trend calculation later
            icon: 'ph:check-circle-bold',
            color: data.matchingRate >= 80 ? theme.palette.success.main :
                data.matchingRate >= 60 ? theme.palette.warning.main : theme.palette.error.main,
            bgColor: alpha(
                data.matchingRate >= 80 ? theme.palette.success.main :
                    data.matchingRate >= 60 ? theme.palette.warning.main : theme.palette.error.main,
                0.08
            ),
            isPercentage: true,
        },
    ];

    const formatValue = (card) => {
        if (card.isPercentage) {
            return `${card.value.toFixed(1)}%`;
        }
        if (card.isCount) {
            return fNumber(card.value);
        }
        return fCurrency(Math.abs(card.value));
    };

    const renderCard = (card) => (
        <Card key={card.title} sx={{ p: 3, flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        bgcolor: card.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Iconify icon={card.icon} width={24} sx={{ color: card.color }} />
                </Box>

                {card.trend !== 0 && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify
                            icon={card.trend > 0 ? 'ph:trend-up-bold' : 'ph:trend-down-bold'}
                            width={16}
                            sx={{ color: card.trend > 0 ? 'success.main' : 'error.main' }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                color: card.trend > 0 ? 'success.main' : 'error.main',
                                fontWeight: 600,
                            }}
                        >
                            {Math.abs(card.trend).toFixed(1)}%
                        </Typography>
                    </Stack>
                )}
            </Stack>

            <Typography variant="h4" sx={{ color: card.color, mb: 0.5 }}>
                {formatValue(card)}
            </Typography>

            <Typography variant="body2" color="text.secondary">
                {card.title}
            </Typography>
        </Card>
    );

    return (
        <Box sx={{ mb: 3 }}>
            {/* First row - 4 cards */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 3,
                    mb: 3
                }}
            >
                {cards.slice(0, 4).map(renderCard)}
            </Box>

            {/* Second row - 4 cards */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 3
                }}
            >
                {cards.slice(4, 8).map(renderCard)}
            </Box>
        </Box>
    );
}
