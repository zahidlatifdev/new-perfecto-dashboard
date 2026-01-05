'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { useBookkeepingMode } from 'src/contexts/bookkeeping-mode-context';
import { BookkeeperProfile } from 'src/sections/bookkeeping/components/bookkeeper-profile';
import { ChatTab } from 'src/sections/bookkeeping/components/chat-tab';
import { DocumentsTab } from 'src/sections/bookkeeping/components/documents-tab';
import { TasksTab } from 'src/sections/bookkeeping/components/tasks-tab';
import { ActivityTab } from 'src/sections/bookkeeping/components/activity-tab';
import { BookkeepingTeaserModal } from 'src/sections/bookkeeping/components/bookkeeping-teaser-modal';
import { ScheduleCallModal } from 'src/sections/bookkeeping/components/schedule-call-modal';

const statusCards = [
    {
        title: 'Bookkeeping Status',
        value: 'Up to date through Nov 2024',
        icon: 'mdi:check-circle',
        iconColor: '#16a34a',
        borderColor: '#16a34a',
    },
    {
        title: 'Next Deadline',
        value: 'Quarterly taxes due Jan 15',
        icon: 'mdi:calendar',
        iconColor: '#f59e0b',
        borderColor: '#f59e0b',
    },
    {
        title: 'Open Tasks',
        value: '4 tasks pending',
        icon: 'mdi:alert-circle',
        iconColor: '#7c3aed',
        borderColor: '#7c3aed',
    },
    {
        title: 'Last Message',
        value: "Sarah: I'll have Q4 estimates ready by end of week",
        icon: 'mdi:message-text',
        iconColor: '#2563eb',
        borderColor: '#2563eb',
    },
];

const upgradeFeatures = [
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

export function BookkeepingView() {
    const [activeTab, setActiveTab] = useState(0);
    const [showTeaserModal, setShowTeaserModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const { hasBookkeepingSubscription, activateBookkeepingSubscription } = useBookkeepingMode();

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <ChatTab />;
            case 1:
                return <DocumentsTab />;
            case 2:
                return <TasksTab />;
            case 3:
                return <ActivityTab />;
            default:
                return null;
        }
    };

    // Self-Managed Mode - Show upgrade prompt
    if (!hasBookkeepingSubscription) {
        return (
            <DashboardContent maxWidth="lg">
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Hero Section */}
                        <Card
                            sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: 3,
                                background: (theme) =>
                                    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                p: { xs: 4, lg: 6 },
                                color: 'primary.contrastText',
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    backgroundImage:
                                        'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%)',
                                    backgroundSize: '20px 20px',
                                    opacity: 0.3,
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    right: -80,
                                    top: -80,
                                    width: 240,
                                    height: 240,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    filter: 'blur(60px)',
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: -80,
                                    left: -80,
                                    width: 240,
                                    height: 240,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    filter: 'blur(60px)',
                                }}
                            />

                            <Box sx={{ position: 'relative', textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: 10,
                                        px: 2,
                                        py: 1,
                                        mb: 3,
                                    }}
                                >
                                    <Iconify icon="mdi:sparkles" width={16} />
                                    <Typography variant="body2" fontWeight={500}>
                                        Limited Time: 50% Off First Month
                                    </Typography>
                                </Box>

                                <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
                                    Get Your Own Dedicated Bookkeeper
                                </Typography>
                                <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 800, mx: 'auto', mb: 4 }}>
                                    Let a certified professional handle your books while you focus on growing your
                                    business
                                </Typography>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 2,
                                    }}
                                >
                                    <Button
                                        size="large"
                                        variant="contained"
                                        color="inherit"
                                        endIcon={<Iconify icon="mdi:arrow-right" width={20} />}
                                        onClick={() => {
                                            activateBookkeepingSubscription();
                                        }}
                                        sx={{
                                            bgcolor: 'white',
                                            color: 'primary.main',
                                            fontWeight: 600,
                                            px: 4,
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.9)',
                                            },
                                        }}
                                    >
                                        Upgrade Now
                                    </Button>
                                    <Button
                                        size="large"
                                        variant="outlined"
                                        startIcon={<Iconify icon="mdi:phone" width={20} />}
                                        onClick={() => setShowScheduleModal(true)}
                                        sx={{
                                            borderColor: 'rgba(255,255,255,0.3)',
                                            color: 'white',
                                            '&:hover': {
                                                borderColor: 'rgba(255,255,255,0.5)',
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                            },
                                        }}
                                    >
                                        Schedule a Call
                                    </Button>
                                </Box>
                            </Box>
                        </Card>

                        {/* Features Grid */}
                        <Grid container spacing={2}>
                            {upgradeFeatures.map((feature) => (
                                <Grid item xs={12} md={6} key={feature.title}>
                                    <Card
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 2,
                                            p: 2.5,
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
                                                boxShadow: 2,
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 48,
                                                height: 48,
                                                borderRadius: 1.5,
                                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Iconify icon={feature.icon} width={24} color="primary.main" />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                                                {feature.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {feature.description}
                                            </Typography>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Meet Your Bookkeeper Preview */}
                        <Card
                            sx={{
                                p: { xs: 3, lg: 4 },
                                background: (theme) =>
                                    `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', lg: 'row' },
                                    alignItems: 'center',
                                    gap: 3,
                                }}
                            >
                                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                                    <Box
                                        sx={{
                                            width: 96,
                                            height: 96,
                                            borderRadius: '50%',
                                            background: (theme) =>
                                                `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.4)} 100%)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                        }}
                                    >
                                        <Typography variant="h3" fontWeight={700} color="primary.main">
                                            S
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: -4,
                                            right: -4,
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            bgcolor: '#16a34a',
                                            border: '2px solid',
                                            borderColor: 'background.paper',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Iconify icon="mdi:check-circle" width={16} sx={{ color: 'white' }} />
                                    </Box>
                                </Box>
                                <Box sx={{ textAlign: { xs: 'center', lg: 'left' }, flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', lg: 'flex-start' }, gap: 1, mb: 1 }}>
                                        <Iconify icon="mdi:certificate" width={16} sx={{ color: '#f59e0b' }} />
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 500 }}>
                                            Meet Your Future Bookkeeper
                                        </Typography>
                                    </Box>
                                    <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                                        Sarah Mitchell
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Certified Bookkeeper with 8+ years of experience helping small businesses like yours
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
                                    onClick={() => setShowTeaserModal(true)}
                                    sx={{ alignSelf: { lg: 'center' } }}
                                >
                                    Learn More
                                </Button>
                            </Box>
                        </Card>

                        <BookkeepingTeaserModal open={showTeaserModal} onOpenChange={setShowTeaserModal} />
                        <ScheduleCallModal open={showScheduleModal} onOpenChange={setShowScheduleModal} />
                    </Box>
                </Container>
            </DashboardContent>
        );
    }

    // Bookkeeping Client Mode - Full interface with Sarah
    return (
        <DashboardContent maxWidth="xl">
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Prominent Bookkeeper CTA Banner */}
                    <Card
                        sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 2,
                            background: (theme) =>
                                `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            p: 3,
                            color: 'primary.contrastText',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage:
                                    'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%)',
                                backgroundSize: '20px 20px',
                                opacity: 0.3,
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                right: -40,
                                top: -40,
                                width: 160,
                                height: 160,
                                borderRadius: '50%',
                                bgcolor: 'rgba(255,255,255,0.1)',
                                filter: 'blur(60px)',
                            }}
                        />

                        <Box
                            sx={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: { xs: 'column', lg: 'row' },
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 3,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            backdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                        }}
                                    >
                                        <Typography variant="h4" fontWeight={700}>
                                            S
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: -2,
                                            right: -2,
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            bgcolor: '#10b981',
                                            border: '2px solid',
                                            borderColor: 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Iconify icon="mdi:check-circle" width={14} sx={{ color: '#064e3b' }} />
                                    </Box>
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Iconify icon="mdi:certificate" width={16} sx={{ color: '#fbbf24' }} />
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                textTransform: 'uppercase',
                                                letterSpacing: 1.2,
                                                fontWeight: 500,
                                                opacity: 0.9,
                                            }}
                                        >
                                            Your Dedicated Bookkeeper
                                        </Typography>
                                    </Box>
                                    <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                                        Sarah Is Your Professional Bookkeeper
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Certified expert ready to help manage your finances
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                                <Button
                                    size="large"
                                    variant="contained"
                                    color="inherit"
                                    startIcon={<Iconify icon="mdi:message-text" width={20} />}
                                    endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
                                    onClick={() => setActiveTab(0)}
                                    sx={{
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                        fontWeight: 600,
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.9)',
                                        },
                                    }}
                                >
                                    Message Her Now
                                </Button>
                                <Button
                                    size="large"
                                    variant="outlined"
                                    startIcon={<Iconify icon="mdi:phone" width={20} />}
                                    onClick={() => setShowScheduleModal(true)}
                                    sx={{
                                        borderColor: 'rgba(255,255,255,0.3)',
                                        color: 'white',
                                        '&:hover': {
                                            borderColor: 'rgba(255,255,255,0.5)',
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                        },
                                    }}
                                >
                                    Schedule Call
                                </Button>
                            </Box>
                        </Box>
                    </Card>

                    {/* Hero Header */}
                    <Card
                        sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 2,
                            background: (theme) =>
                                `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                            p: 3,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', lg: 'row' },
                                alignItems: { lg: 'center' },
                                justifyContent: 'space-between',
                                gap: 3,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Box
                                    sx={{
                                        display: { xs: 'none', sm: 'flex' },
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 56,
                                        height: 56,
                                        borderRadius: 2,
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                    }}
                                >
                                    <Iconify icon="mdi:briefcase" width={28} color="primary.main" />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                                        Welcome back, Alex!
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Your books are being professionally managed
                                    </Typography>
                                </Box>
                            </Box>
                            <BookkeeperProfile name="Sarah Mitchell" onMessage={() => setActiveTab(0)} />
                        </Box>
                    </Card>

                    {/* Status Cards */}
                    <Grid container spacing={2}>
                        {statusCards.map((card) => (
                            <Grid item xs={12} sm={6} lg={3} key={card.title}>
                                <Card
                                    sx={{
                                        position: 'relative',
                                        overflow: 'hidden',
                                        p: 2,
                                        transition: 'all 0.3s',
                                        borderColor: (theme) => alpha(card.borderColor, 0.3),
                                        cursor: 'pointer',
                                        '&:hover': {
                                            transform: 'scale(1.02)',
                                            boxShadow: 3,
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 40,
                                                height: 40,
                                                borderRadius: 1,
                                                bgcolor: alpha(card.iconColor, 0.1),
                                                border: '1px solid',
                                                borderColor: (theme) => alpha(theme.palette.divider, 0.5),
                                                backdropFilter: 'blur(10px)',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Iconify icon={card.icon} width={20} sx={{ color: card.iconColor }} />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                {card.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                                sx={{
                                                    mt: 0.25,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {card.value}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={activeTab}
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab
                                icon={<Iconify icon="mdi:message-text" width={20} />}
                                iconPosition="start"
                                label="Chat"
                            />
                            <Tab
                                icon={<Iconify icon="mdi:file-document" width={20} />}
                                iconPosition="start"
                                label="Documents"
                            />
                            <Tab
                                icon={<Iconify icon="mdi:checkbox-marked" width={20} />}
                                iconPosition="start"
                                label="Tasks"
                            />
                            <Tab
                                icon={<Iconify icon="mdi:activity" width={20} />}
                                iconPosition="start"
                                label="Activity Log"
                            />
                        </Tabs>
                    </Box>

                    {/* Tab Content */}
                    <Card
                        sx={{
                            minHeight: 500,
                            p: { xs: 2, lg: 3 },
                            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.5),
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        {renderTabContent()}
                    </Card>

                    {/* Floating Quick Upload Button */}
                    <Fab
                        color="primary"
                        sx={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                            boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                            '&:hover': {
                                transform: 'scale(1.1)',
                            },
                            transition: 'transform 0.3s',
                        }}
                        onClick={() => setActiveTab(1)}
                    >
                        <Iconify icon="mdi:upload" width={24} />
                    </Fab>

                    <ScheduleCallModal open={showScheduleModal} onOpenChange={setShowScheduleModal} />
                </Box>
            </Container>
        </DashboardContent>
    );
}
