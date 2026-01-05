'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { sampleMessages } from '../data/bookkeepingData';

export function ChatTab() {
    const [messages, setMessages] = useState(sampleMessages);
    const [newMessage, setNewMessage] = useState('');

    const handleSend = () => {
        if (!newMessage.trim()) return;

        setMessages([
            ...messages,
            {
                id: Date.now().toString(),
                content: newMessage,
                sender: 'user',
                timestamp: new Date(),
                read: false,
            },
        ]);
        setNewMessage('');
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const formatDate = (date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <Card sx={{ display: 'flex', flexDirection: 'column', height: 500 }}>
            {/* Messages */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {messages.length === 0 ? (
                    <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">
                            Start a conversation with your bookkeeper
                        </Typography>
                    </Box>
                ) : (
                    messages.map((message, index) => {
                        const showDate =
                            index === 0 ||
                            formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

                        return (
                            <Box key={message.id}>
                                {showDate && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                bgcolor: 'action.hover',
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 10,
                                                fontSize: '0.75rem',
                                            }}
                                        >
                                            {formatDate(message.timestamp)}
                                        </Typography>
                                    </Box>
                                )}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            maxWidth: '70%',
                                            borderRadius: 2,
                                            px: 2,
                                            py: 1.25,
                                            ...(message.sender === 'user'
                                                ? {
                                                    bgcolor: 'primary.main',
                                                    color: 'primary.contrastText',
                                                    borderBottomRightRadius: 4,
                                                }
                                                : {
                                                    bgcolor: 'action.hover',
                                                    color: 'text.primary',
                                                    borderBottomLeftRadius: 4,
                                                }),
                                        }}
                                    >
                                        <Typography variant="body2">{message.content}</Typography>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                mt: 0.5,
                                                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: 10,
                                                    opacity: message.sender === 'user' ? 0.7 : 0.6,
                                                }}
                                            >
                                                {formatTime(message.timestamp)}
                                            </Typography>
                                            {message.sender === 'user' && (
                                                <Iconify
                                                    icon={message.read ? 'mdi:check-all' : 'mdi:check'}
                                                    width={12}
                                                    sx={{ opacity: 0.7 }}
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })
                )}
            </Box>

            {/* Input */}
            <Box sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small">
                        <Iconify icon="mdi:paperclip" width={20} />
                    </IconButton>
                    <TextField
                        fullWidth
                        size="small"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                    >
                        <Iconify icon="mdi:send" width={20} />
                    </IconButton>
                </Box>
            </Box>
        </Card>
    );
}
