import React from "react";

const { alpha, Box, Typography, IconButton } = require("@mui/material");
const { Iconify } = require("src/components/iconify");

const ChatHeader = React.memo(function ChatHeader({ currentChat, isMobile, setMobileDrawerOpen, theme }) {
    return (
        <Box sx={{
            p: { xs: 2, sm: 3 },
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}>
            <Box>
                <Typography variant="h6" sx={{
                    color: 'text.primary',
                    mb: 0.5,
                    fontWeight: 600,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}>
                    {currentChat.title}
                </Typography>
                <Typography variant="caption" sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}>
                    Ask Perfecto AI about your finances
                </Typography>
            </Box>
            {isMobile && (
                <IconButton
                    onClick={() => setMobileDrawerOpen(true)}
                    sx={{ ml: 1 }}
                >
                    <Iconify icon="ph:chat-circle-text-bold" width={24} />
                </IconButton>
            )}
        </Box>
    );
});

export default ChatHeader;