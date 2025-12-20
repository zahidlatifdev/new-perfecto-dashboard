import React from 'react';
import { alpha, Box, Button, Chip, CircularProgress, Collapse, Divider, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Tooltip, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';


// Format timestamp
const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
};

const SidebarContent = React.memo(function SidebarContent({
    isMobile,
    sidebarExpanded,
    setSidebarExpanded,
    loading,
    handleCreateChat,
    handleOpenSearchDialog,
    getAllChats,
    currentChat,
    handleChatMenu,
    handleSelectChat,
    theme
}) {
    return (
        <>
            {/* Sidebar Header */}
            <Box sx={{
                p: { xs: 1.5, sm: 2 },
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                display: 'flex',
                alignItems: 'center',
                minHeight: { xs: 56, sm: 64 },
                justifyContent: isMobile || !sidebarExpanded ? 'center' : 'flex-start',
                bgcolor: sidebarExpanded ? 'background.paper' : 'grey.100',
                transition: 'background 0.35s cubic-bezier(.4,0,.2,1)',
            }}>
                {!isMobile && (
                    <Tooltip title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}>
                        <IconButton
                            onClick={() => setSidebarExpanded(!sidebarExpanded)}
                            size="small"
                            sx={{
                                transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)',
                                bgcolor: sidebarExpanded ? 'transparent' : 'grey.200',
                                mr: sidebarExpanded ? 1 : 0,
                                transform: sidebarExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
                            }}
                        >
                            <Iconify icon="ph:sidebar-simple-bold" />
                        </IconButton>
                    </Tooltip>
                )}
                {(isMobile || sidebarExpanded) && (
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                        Chat Sessions
                    </Typography>
                )}
                {isMobile && (
                    <IconButton
                        onClick={() => setMobileDrawerOpen(false)}
                        sx={{ ml: 'auto' }}
                    >
                        <Iconify icon="ph:x-bold" />
                    </IconButton>
                )}
            </Box>

            {/* Expanded Sidebar or Mobile View */}
            <Collapse in={isMobile || sidebarExpanded} orientation="vertical" sx={{ width: '100%' }}>
                <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: { xs: 1.5, sm: 2 }, pb: 1 }}>
                    <Button
                        variant="contained"
                        startIcon={<Iconify icon="ph:plus-bold" />}
                        onClick={handleCreateChat}
                        disabled={loading}
                        fullWidth
                        sx={{
                            mb: 1,
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontWeight: 500,
                            boxShadow: 2,
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                            py: { xs: 1, sm: 1.25 },
                        }}
                    >
                        New Chat
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Iconify icon="ph:magnifying-glass-bold" />}
                        onClick={handleOpenSearchDialog}
                        fullWidth
                        sx={{
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                            py: { xs: 1, sm: 1.25 },
                        }}
                    >
                        Search Chats
                    </Button>
                </Box>
                {/* Chat Sessions List */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', pt: 1 }}>
                    {loading && getAllChats().length === 0 ? (
                        <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : getAllChats().length === 0 ? (
                        <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                No chat sessions yet
                            </Typography>
                        </Box>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {getAllChats().map((chat, index) => (
                                <Collapse key={`chat-${chat._id}-${index}`} in timeout={400}>
                                    <Box>
                                        <ListItem
                                            disablePadding
                                            secondaryAction={
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleChatMenu(e, chat)}
                                                    sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                                                >
                                                    <Iconify icon="ph:dots-three-vertical-bold" />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemButton
                                                selected={currentChat?._id === chat._id}
                                                onClick={() => handleSelectChat(chat)}
                                                sx={{
                                                    pr: 6,
                                                    borderRadius: 1,
                                                    mx: 1,
                                                    my: 0.25,
                                                    py: { xs: 1.5, sm: 1 },
                                                    '&.Mui-selected': {
                                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                        '&:hover': {
                                                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                                                        },
                                                    },
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Typography variant="body2" noWrap sx={{
                                                                fontWeight: 500,
                                                                fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                                                            }}>
                                                                {chat.title}
                                                            </Typography>
                                                            {chat.isLocal && (
                                                                <Chip
                                                                    size="small"
                                                                    label="New"
                                                                    color="primary"
                                                                    sx={{
                                                                        fontSize: { xs: '0.6rem', sm: '0.65rem' },
                                                                        height: { xs: 16, sm: 18 },
                                                                    }}
                                                                />
                                                            )}
                                                        </Stack>
                                                    }
                                                    secondary={
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                                                {chat.isLocal ? 'Just created' : formatTimestamp(chat.updatedAt)}
                                                            </Typography>
                                                            <Chip
                                                                size="small"
                                                                label={chat.messageCount || 0}
                                                                variant="outlined"
                                                                sx={{
                                                                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                                                    height: { xs: 14, sm: 16 },
                                                                    borderRadius: 0.5,
                                                                }}
                                                            />
                                                        </Stack>
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                        {index < getAllChats().length - 1 && (
                                            <Divider sx={{ mx: 2 }} />
                                        )}
                                    </Box>
                                </Collapse>
                            ))}
                        </List>
                    )}
                </Box>
            </Collapse>

            {/* Collapsed Sidebar - Only for non-mobile */}
            {!isMobile && !sidebarExpanded && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        pt: 2,
                        gap: 2,
                        flexGrow: 1,
                    }}
                >
                    <Tooltip title="New Chat">
                        <IconButton
                            onClick={handleCreateChat}
                            disabled={loading}
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                '&:hover': { bgcolor: 'primary.dark' },
                                width: 40,
                                height: 40,
                                boxShadow: 2,
                                mb: 1,
                            }}
                        >
                            <Iconify icon="ph:plus-bold" width={22} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Search Chats">
                        <IconButton
                            onClick={handleOpenSearchDialog}
                            sx={{
                                bgcolor: 'grey.200',
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'grey.300' },
                                width: 40,
                                height: 40,
                                boxShadow: 2,
                            }}
                        >
                            <Iconify icon="ph:magnifying-glass-bold" width={22} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </>
    )
});

export default SidebarContent;