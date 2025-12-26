import { Box, Typography, Stack, Paper, Button } from '@mui/material';
import { differenceInDays } from 'date-fns';
import { Iconify } from 'src/components/iconify';
import { getCategoryInfo } from '../constants';
import { ExpiryBadge } from './expiry-badge';

export function UpcomingExpiries({ documents, onDocumentClick }) {
    const today = new Date();

    // Filter documents with expiry dates within 30 days, sorted by soonest
    const upcomingDocs = documents
        .filter((doc) => {
            if (!doc.expiryDate) return false;
            const days = differenceInDays(doc.expiryDate, today);
            return days >= 0 && days <= 30;
        })
        .sort((a, b) => differenceInDays(a.expiryDate, today) - differenceInDays(b.expiryDate, today));

    if (upcomingDocs.length === 0) return null;

    const urgentCount = upcomingDocs.filter(
        (doc) => differenceInDays(doc.expiryDate, today) <= 7
    ).length;

    return (
        <Paper
            sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                animation: 'fadeIn 0.5s ease-in',
                '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                },
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: urgentCount > 0 ? 'error.lighter' : 'warning.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Iconify
                        icon={
                            urgentCount > 0
                                ? 'solar:danger-triangle-bold-duotone'
                                : 'solar:clock-circle-bold-duotone'
                        }
                        width={24}
                        sx={{
                            color: urgentCount > 0 ? 'error.main' : 'warning.main',
                        }}
                    />
                </Box>
                <Box>
                    <Typography variant="h6">Upcoming Expiries</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {upcomingDocs.length} document{upcomingDocs.length !== 1 ? 's' : ''} expiring in the
                        next 30 days
                    </Typography>
                </Box>
            </Stack>

            <Stack spacing={1.5}>
                {upcomingDocs.slice(0, 5).map((doc) => {
                    const categoryInfo = getCategoryInfo(doc.category);

                    return (
                        <Button
                            key={doc.id}
                            onClick={() => onDocumentClick(doc)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 1.5,
                                textAlign: 'left',
                                justifyContent: 'flex-start',
                                bgcolor: 'background.neutral',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                                textTransform: 'none',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 1.5,
                                    bgcolor: 'primary.lighter',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <Iconify icon={categoryInfo.icon} width={18} sx={{ color: 'primary.main' }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle2" noWrap>
                                    {doc.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {categoryInfo.label}
                                </Typography>
                            </Box>
                            <ExpiryBadge expiryDate={doc.expiryDate} />
                        </Button>
                    );
                })}
            </Stack>

            {upcomingDocs.length > 5 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                    +{upcomingDocs.length - 5} more documents expiring soon
                </Typography>
            )}
        </Paper>
    );
}
