'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBookkeepingMode } from 'src/contexts/bookkeeping-mode-context';
import { ScheduleCallModal } from './schedule-call-modal';

const features = [
    {
        icon: 'mdi:message-text',
        title: 'Direct Chat',
        description: 'Message your bookkeeper anytime',
    },
    {
        icon: 'mdi:file-document',
        title: 'Secure Documents',
        description: 'Share files in organized folders',
    },
    {
        icon: 'mdi:checkbox-marked',
        title: 'Shared Tasks',
        description: 'Collaborate on to-dos seamlessly',
    },
    {
        icon: 'mdi:shield-check',
        title: 'Expert Care',
        description: 'Certified professionals handle your books',
    },
];

export function BookkeepingTeaserModal({ open, onOpenChange }) {
    const { activateBookkeepingSubscription } = useBookkeepingMode();
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    const handleUpgrade = () => {
        activateBookkeepingSubscription();
        onOpenChange(false);
        // In a real app, you'd show a toast notification here
    };

    const handleScheduleCall = () => {
        onOpenChange(false);
        setShowScheduleModal(true);
    };

    return (
        <>
            <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
                <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: (theme) =>
                                `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.4)} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                        }}
                    >
                        <Iconify icon="mdi:briefcase" width={32} color="primary.main" />
                    </Box>
                    <DialogTitle sx={{ p: 0, mb: 1 }}>
                        <Typography variant="h5" fontWeight={700}>
                            Upgrade to Perfecto Bookkeeping
                        </Typography>
                    </DialogTitle>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Get your own dedicated bookkeeper and unlock the full client portal experience.
                    </Typography>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 1.5,
                            py: 3,
                        }}
                    >
                        {features.map((feature) => (
                            <Box
                                key={feature.title}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1.5,
                                    p: 1.5,
                                    borderRadius: 1,
                                    border: 1,
                                    borderColor: 'divider',
                                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                                    textAlign: 'left',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 24,
                                        height: 24,
                                        borderRadius: 0.75,
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                        flexShrink: 0,
                                    }}
                                >
                                    <Iconify icon={feature.icon} width={14} color="primary.main" />
                                </Box>
                                <Box>
                                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.25 }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {feature.description}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 1,
                            background: (theme) =>
                                `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 50%, transparent 100%)`,
                            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            mb: 3,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Iconify icon="mdi:sparkles" width={16} color="primary.main" />
                            <Typography variant="subtitle2" fontWeight={600}>
                                Limited Time Offer
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Get your first month of bookkeeping at{' '}
                            <Typography component="span" fontWeight={600} color="primary.main">
                                50% off
                            </Typography>{' '}
                            when you upgrade today.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
                            onClick={handleUpgrade}
                        >
                            Upgrade Now
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            fullWidth
                            startIcon={<Iconify icon="mdi:calendar" width={16} />}
                            onClick={handleScheduleCall}
                        >
                            Schedule a Call First
                        </Button>
                        <Button variant="text" size="small" onClick={() => onOpenChange(false)}>
                            Maybe Later
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            <ScheduleCallModal open={showScheduleModal} onOpenChange={setShowScheduleModal} />
        </>
    );
}
