import { useState } from 'react';
import {
    Card,
    CardContent,
    Stack,
    Box,
    Typography,
    Button,
    Paper,
    IconButton,
    Collapse,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';

const getInsightIcon = (type) => {
    const icons = {
        revenue_growth: 'mdi:trending-up',
        burn_rate_warning: 'mdi:fire',
        business_metric: 'mdi:chart-line',
        cost_savings: 'mdi:currency-usd-off',
        seasonal_insight: 'mdi:weather-sunny',
        tax_compliance: 'mdi:file-document',
    };
    return icons[type] || 'mdi:information';
};

const getInsightColor = (type) => {
    const colors = {
        revenue_growth: {
            bg: 'rgba(76, 175, 80, 0.08)',
            border: 'rgba(76, 175, 80, 0.24)',
            text: 'success.main',
        },
        burn_rate_warning: {
            bg: 'rgba(244, 67, 54, 0.08)',
            border: 'rgba(244, 67, 54, 0.24)',
            text: 'error.main',
        },
        business_metric: {
            bg: 'rgba(33, 150, 243, 0.08)',
            border: 'rgba(33, 150, 243, 0.24)',
            text: 'info.main',
        },
        cost_savings: {
            bg: 'rgba(255, 152, 0, 0.08)',
            border: 'rgba(255, 152, 0, 0.24)',
            text: 'warning.main',
        },
        seasonal_insight: {
            bg: 'rgba(156, 39, 176, 0.08)',
            border: 'rgba(156, 39, 176, 0.24)',
            text: 'secondary.main',
        },
        tax_compliance: {
            bg: 'rgba(0, 188, 212, 0.08)',
            border: 'rgba(0, 188, 212, 0.24)',
            text: 'info.main',
        },
    };
    return colors[type] || colors.business_metric;
};

export function AIInsightsSection({ insights = [] }) {
    const [expandedInsights, setExpandedInsights] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    const toggleInsight = (idx) => {
        setExpandedInsights((prev) =>
            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
        );
    };

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    return (
        <Card>
            <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Iconify icon="mdi:lightning-bolt" width={20} sx={{ color: 'primary.main' }} />
                            <Typography variant="h6">AI Insights</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Smart analysis based on your financial data
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        size="small"
                        endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
                        onClick={handleOpenDialog}
                    >
                        View All
                    </Button>
                </Stack>

                <Box
                    sx={{
                        display: 'grid',
                        gap: 1.5,
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                    }}
                >
                    {insights.slice(0, 6).map((insight, idx) => {
                        const isExpanded = expandedInsights.includes(idx);
                        const colors = getInsightColor(insight.type);
                        const icon = getInsightIcon(insight.type);

                        return (
                            <Paper
                                key={idx}
                                sx={{
                                    p: 2,
                                    bgcolor: colors.bg,
                                    border: 1,
                                    borderColor: colors.border,
                                    borderRadius: 2,
                                    backdropFilter: 'blur(8px)',
                                    transition: 'all 0.2s ease-in-out',
                                    cursor: 'pointer',
                                    ...(isExpanded && {
                                        ring: 2,
                                        boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}20`,
                                    }),
                                }}
                                onClick={() => toggleInsight(idx)}
                            >
                                <Stack spacing={0}>
                                    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                                        <Iconify
                                            icon={icon}
                                            width={20}
                                            sx={{ color: colors.text, mt: 0.25, flexShrink: 0 }}
                                        />
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Stack
                                                direction="row"
                                                alignItems="flex-start"
                                                justifyContent="space-between"
                                                spacing={1}
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{ fontWeight: 500, fontSize: '0.875rem' }}
                                                >
                                                    {insight.title}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleInsight(insight.id);
                                                    }}
                                                    sx={{
                                                        p: 0,
                                                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.2s',
                                                        flexShrink: 0,
                                                        color: 'text.secondary',
                                                    }}
                                                >
                                                    <Iconify icon="mdi:chevron-down" width={16} />
                                                </IconButton>
                                            </Stack>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: isExpanded ? 'unset' : 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    mt: 0.5,
                                                    fontSize: '0.75rem',
                                                }}
                                            >
                                                {insight.description}
                                            </Typography>

                                            {insight.metrics && insight.metrics.length > 0 && (
                                                <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                                                    {insight.metrics.map((metric, idx) => {
                                                        let color = 'text.primary';
                                                        let bg = 'background.paper';
                                                        const metricStr = String(metric).replace(/,/g, '');
                                                        let num = null;
                                                        const numberMatch = metricStr.match(/-?\$?-?(\d+(?:\.\d+)?)/);
                                                        if (numberMatch) {
                                                            num = parseFloat(numberMatch[1]);
                                                        } else if (/%/.test(metricStr)) {
                                                            const match = metricStr.match(/(-?\d+(?:\.\d+)?)%/);
                                                            if (match) {
                                                                num = parseFloat(match[1]);
                                                            }
                                                        }
                                                        if (num !== null && !isNaN(num)) {
                                                            if (num > 0) {
                                                                color = 'success.main';
                                                                bg = 'rgba(76, 175, 80, 0.08)';
                                                            } else if (num < 0) {
                                                                color = 'error.main';
                                                                bg = 'rgba(244, 67, 54, 0.08)';
                                                            } else {
                                                                color = 'text.secondary';
                                                                bg = 'rgba(120, 144, 156, 0.08)';
                                                            }
                                                        }
                                                        return (
                                                            <Typography
                                                                key={idx}
                                                                variant="caption"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    bgcolor: bg,
                                                                    color: color,
                                                                    px: 0.75,
                                                                    py: 0.25,
                                                                    borderRadius: 0.5,
                                                                    fontSize: '0.75rem',
                                                                }}
                                                            >
                                                                {metric}
                                                            </Typography>
                                                        );
                                                    })}
                                                </Stack>
                                            )}
                                        </Box>
                                    </Stack>

                                    <Collapse in={isExpanded}>
                                        <Stack
                                            spacing={1.5}
                                            sx={{
                                                mt: 2,
                                                pt: 2,
                                                borderTop: 1,
                                                borderColor: 'divider',
                                            }}
                                        >
                                            {insight.detailedAnalysis && (
                                                <Box>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: 600,
                                                            mb: 0.5,
                                                            display: 'block',
                                                            fontSize: '0.75rem',
                                                        }}
                                                    >
                                                        Detailed Analysis
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ lineHeight: 1.6, fontSize: '0.75rem' }}
                                                    >
                                                        {insight.detailedAnalysis}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {insight.recommendations && insight.recommendations.length > 0 && (
                                                <Box>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: 600,
                                                            mb: 1,
                                                            display: 'block',
                                                            fontSize: '0.75rem',
                                                        }}
                                                    >
                                                        Recommendations
                                                    </Typography>
                                                    <Stack spacing={0.75}>
                                                        {insight.recommendations.map((rec, idx) => (
                                                            <Stack
                                                                key={idx}
                                                                direction="row"
                                                                alignItems="flex-start"
                                                                spacing={1}
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        color: 'primary.main',
                                                                        fontWeight: 700,
                                                                        mt: 0.25,
                                                                        fontSize: '0.75rem',
                                                                    }}
                                                                >
                                                                    •
                                                                </Typography>
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                    sx={{ fontSize: '0.75rem' }}
                                                                >
                                                                    {rec}
                                                                </Typography>
                                                            </Stack>
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            )}

                                            {insight.action && (
                                                <Box>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: 600,
                                                            mb: 0.5,
                                                            display: 'block',
                                                            fontSize: '0.75rem',
                                                        }}
                                                    >
                                                        Recommended Action
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ lineHeight: 1.6, fontSize: '0.75rem' }}
                                                    >
                                                        {insight.action}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Collapse>
                                </Stack>
                            </Paper>
                        );
                    })}
                </Box>

                {/* View All Dialog */}
                <Dialog
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                    maxWidth="lg"
                    fullWidth
                    fullScreen={false}
                    sx={{
                        '& .MuiDialog-paper': {
                            maxHeight: '90vh',
                            m: { xs: 2, sm: 3 },
                            width: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 48px)' },
                        },
                    }}
                >
                    <DialogTitle>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Iconify icon="mdi:lightning-bolt" width={24} sx={{ color: 'primary.main' }} />
                                <Typography variant="h6">All AI Insights</Typography>
                            </Stack>
                            <IconButton
                                onClick={handleCloseDialog}
                                size="small"
                                sx={{ color: 'text.secondary' }}
                            >
                                <Iconify icon="mdi:close" width={24} />
                            </IconButton>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {insights.length} insights based on your financial data
                        </Typography>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2,
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                                pb: 1,
                            }}
                        >
                            {insights.map((insight, idx) => {
                                const isExpanded = expandedInsights.includes(idx);
                                const colors = getInsightColor(insight.type);
                                const icon = getInsightIcon(insight.type);

                                return (
                                    <Paper
                                        key={idx}
                                        sx={{
                                            p: 2,
                                            bgcolor: colors.bg,
                                            border: 1,
                                            borderColor: colors.border,
                                            borderRadius: 2,
                                            backdropFilter: 'blur(8px)',
                                            transition: 'all 0.2s ease-in-out',
                                            cursor: 'pointer',
                                            ...(isExpanded && {
                                                ring: 2,
                                                boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}20`,
                                            }),
                                        }}
                                        onClick={() => toggleInsight(idx)}
                                    >
                                        <Stack spacing={0}>
                                            <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                                                <Iconify
                                                    icon={icon}
                                                    width={20}
                                                    sx={{ color: colors.text, mt: 0.25, flexShrink: 0 }}
                                                />
                                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                    <Stack
                                                        direction="row"
                                                        alignItems="flex-start"
                                                        justifyContent="space-between"
                                                        spacing={1}
                                                    >
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{ fontWeight: 500, fontSize: '0.875rem' }}
                                                        >
                                                            {insight.title}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleInsight(idx);
                                                            }}
                                                            sx={{
                                                                p: 0,
                                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.2s',
                                                                flexShrink: 0,
                                                                color: 'text.secondary',
                                                            }}
                                                        >
                                                            <Iconify icon="mdi:chevron-down" width={16} />
                                                        </IconButton>
                                                    </Stack>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: isExpanded ? 'unset' : 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            mt: 0.5,
                                                            fontSize: '0.75rem',
                                                        }}
                                                    >
                                                        {insight.description}
                                                    </Typography>

                                                    {insight.metrics && insight.metrics.length > 0 && (
                                                        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                                                            {insight.metrics.map((metric, metricIdx) => {
                                                                let color = 'text.primary';
                                                                let bg = 'background.paper';
                                                                const metricStr = String(metric).replace(/,/g, '');
                                                                let num = null;
                                                                const numberMatch = metricStr.match(/-?\$?-?(\d+(?:\.\d+)?)/);
                                                                if (numberMatch) {
                                                                    num = parseFloat(numberMatch[1]);
                                                                } else if (/%/.test(metricStr)) {
                                                                    const match = metricStr.match(/(-?\d+(?:\.\d+)?)%/);
                                                                    if (match) {
                                                                        num = parseFloat(match[1]);
                                                                    }
                                                                }
                                                                if (num !== null && !isNaN(num)) {
                                                                    if (num > 0) {
                                                                        color = 'success.main';
                                                                        bg = 'rgba(76, 175, 80, 0.08)';
                                                                    } else if (num < 0) {
                                                                        color = 'error.main';
                                                                        bg = 'rgba(244, 67, 54, 0.08)';
                                                                    } else {
                                                                        color = 'text.secondary';
                                                                        bg = 'rgba(120, 144, 156, 0.08)';
                                                                    }
                                                                }
                                                                return (
                                                                    <Typography
                                                                        key={metricIdx}
                                                                        variant="caption"
                                                                        sx={{
                                                                            fontWeight: 600,
                                                                            bgcolor: bg,
                                                                            color: color,
                                                                            px: 0.75,
                                                                            py: 0.25,
                                                                            borderRadius: 0.5,
                                                                            fontSize: '0.75rem',
                                                                        }}
                                                                    >
                                                                        {metric}
                                                                    </Typography>
                                                                );
                                                            })}
                                                        </Stack>
                                                    )}
                                                </Box>
                                            </Stack>

                                            <Collapse in={isExpanded}>
                                                <Stack
                                                    spacing={1.5}
                                                    sx={{
                                                        mt: 2,
                                                        pt: 2,
                                                        borderTop: 1,
                                                        borderColor: 'divider',
                                                    }}
                                                >
                                                    {insight.detailedAnalysis && (
                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    mb: 0.5,
                                                                    display: 'block',
                                                                    fontSize: '0.75rem',
                                                                }}
                                                            >
                                                                Detailed Analysis
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                sx={{ lineHeight: 1.6, fontSize: '0.75rem' }}
                                                            >
                                                                {insight.detailedAnalysis}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {insight.recommendations && insight.recommendations.length > 0 && (
                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    mb: 1,
                                                                    display: 'block',
                                                                    fontSize: '0.75rem',
                                                                }}
                                                            >
                                                                Recommendations
                                                            </Typography>
                                                            <Stack spacing={0.75}>
                                                                {insight.recommendations.map((rec, recIdx) => (
                                                                    <Stack
                                                                        key={recIdx}
                                                                        direction="row"
                                                                        alignItems="flex-start"
                                                                        spacing={1}
                                                                    >
                                                                        <Typography
                                                                            sx={{
                                                                                color: 'primary.main',
                                                                                fontWeight: 700,
                                                                                mt: 0.25,
                                                                                fontSize: '0.75rem',
                                                                            }}
                                                                        >
                                                                            •
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="caption"
                                                                            color="text.secondary"
                                                                            sx={{ fontSize: '0.75rem' }}
                                                                        >
                                                                            {rec}
                                                                        </Typography>
                                                                    </Stack>
                                                                ))}
                                                            </Stack>
                                                        </Box>
                                                    )}

                                                    {insight.action && (
                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    mb: 0.5,
                                                                    display: 'block',
                                                                    fontSize: '0.75rem',
                                                                }}
                                                            >
                                                                Recommended Action
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                sx={{ lineHeight: 1.6, fontSize: '0.75rem' }}
                                                            >
                                                                {insight.action}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </Collapse>
                                        </Stack>
                                    </Paper>
                                );
                            })}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={handleCloseDialog} variant="contained">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
}