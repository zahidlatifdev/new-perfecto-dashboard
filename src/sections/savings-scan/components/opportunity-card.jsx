import { useState } from 'react';
import { Card, CardContent, Box, Typography, Chip, Button, alpha, Collapse } from '@mui/material';
import { Iconify } from 'src/components/iconify';

const difficultyColors = {
    easy: 'success',
    medium: 'warning',
    hard: 'error',
};

const statusIcons = {
    new: 'mdi:sparkles',
    reviewing: 'mdi:clock-outline',
    implemented: 'mdi:check-circle',
    dismissed: 'mdi:close',
};

const cardGradients = [
    { primary: '#6366f1', secondary: '#818cf8' }, // indigo
    { primary: '#10b981', secondary: '#34d399' }, // green
    { primary: '#f59e0b', secondary: '#fbbf24' }, // amber
    { primary: '#8b5cf6', secondary: '#a78bfa' }, // purple
    { primary: '#3b82f6', secondary: '#60a5fa' }, // blue
    { primary: '#ec4899', secondary: '#f472b6' }, // pink
];

export function OpportunityCard({ opportunity, index }) {
    const [expanded, setExpanded] = useState(false);
    const gradient = cardGradients[index % cardGradients.length];
    const statusIcon = statusIcons[opportunity.status];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card
            sx={{
                height: '100%',
                minHeight: 280,
                background: (theme) =>
                    `linear-gradient(135deg, ${alpha(gradient.primary, 0.08)} 0%, ${alpha(gradient.secondary, 0.04)} 50%, transparent 100%)`,
                border: (theme) => `1px solid ${alpha(gradient.primary, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => `0 12px 24px ${alpha(gradient.primary, 0.15)}`,
                },
            }}
        >
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: (theme) =>
                                opportunity.status === 'implemented'
                                    ? alpha(theme.palette.success.main, 0.16)
                                    : alpha(gradient.primary, 0.16),
                            flexShrink: 0,
                        }}
                    >
                        <Iconify
                            icon={statusIcon}
                            width={24}
                            sx={{
                                color:
                                    opportunity.status === 'implemented'
                                        ? 'success.main'
                                        : gradient.primary,
                            }}
                        />
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', lineHeight: 1.2 }}>
                            {formatCurrency(opportunity.estimated_annual_savings)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            per year
                        </Typography>
                    </Box>
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>
                        {opportunity.title}
                    </Typography>
                    {opportunity.vendor && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {opportunity.vendor}
                        </Typography>
                    )}
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.5,
                        }}
                    >
                        {opportunity.description}
                    </Typography>
                </Box>

                {/* Footer */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap',
                        pt: 2,
                        borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    }}
                >
                    {opportunity.category && (
                        <Chip label={opportunity.category} size="small" variant="outlined" />
                    )}
                    {opportunity.difficulty && (
                        <Chip
                            label={opportunity.difficulty}
                            size="small"
                            color={difficultyColors[opportunity.difficulty] || 'default'}
                            sx={{ textTransform: 'capitalize' }}
                        />
                    )}
                    {opportunity.confidence_level && (
                        <Chip
                            label={opportunity.confidence_level}
                            size="small"
                            variant="outlined"
                            color={
                                opportunity.confidence_level === 'high' ? 'success' :
                                    opportunity.confidence_level === 'medium' ? 'warning' : 'default'
                            }
                            sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}
                        />
                    )}
                    {opportunity.effort_level && opportunity.effort_level !== opportunity.difficulty && (
                        <Chip
                            label={`Effort: ${opportunity.effort_level}`}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}
                        />
                    )}
                    {opportunity.action_recommended && (
                        <Button
                            size="small"
                            endIcon={<Iconify icon={expanded ? 'eva:arrow-up-fill' : 'eva:arrow-forward-fill'} />}
                            sx={{ ml: 'auto', minWidth: 'auto', px: 1.5, py: 0.5, fontSize: '0.75rem' }}
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? 'Less' : 'Action'}
                        </Button>
                    )}
                </Box>

                {/* Expandable action details */}
                <Collapse in={expanded}>
                    <Box sx={{ pt: 2, mt: 2, borderTop: (theme) => `1px dashed ${alpha(theme.palette.divider, 0.5)}` }}>
                        {opportunity.action_recommended && (
                            <Box sx={{ mb: 1.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.5 }}>
                                    Recommended Action
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                    {opportunity.action_recommended}
                                </Typography>
                            </Box>
                        )}
                        {opportunity.relevant_transactions?.length > 0 && (
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.5 }}>
                                    Related Transactions
                                </Typography>
                                {opportunity.relevant_transactions.map((t, i) => (
                                    <Typography key={i} variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.8 }}>
                                        • {t}
                                    </Typography>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
}
