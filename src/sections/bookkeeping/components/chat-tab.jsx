'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { Iconify } from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useWebSocket } from 'src/hooks/use-websocket';
import axios, { endpoints } from 'src/utils/axios';

export function ChatTab() {
    const { user, company } = useAuthContext();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        if (!company?._id) return;

        try {
            setLoading(true);
            const response = await axios.get(endpoints.bookkeeping.messages(company._id));
            setMessages(response.data.data.messages || []);
            setError('');
        } catch (err) {
            console.error('Failed to fetch messages:', err);
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, [company]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // WebSocket for real-time messages
    const handleNewMessage = useCallback((data) => {
        if (data.message && data.message.senderId._id !== user._id) {
            setMessages((prev) => [...prev, data.message]);
        }
    }, [user]);

    const handleMessageDeleted = useCallback((data) => {
        setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
    }, []);

    useWebSocket([
        { event: 'bookkeeping:message', handler: handleNewMessage },
        { event: 'bookkeeping:message:deleted', handler: handleMessageDeleted },
    ], [handleNewMessage, handleMessageDeleted]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;

        try {
            setSending(true);
            const response = await axios.post(endpoints.bookkeeping.sendMessage(company._id), {
                message: newMessage.trim()
            });

            // Add message optimistically
            setMessages((prev) => [...prev, response.data.data.message]);
            setNewMessage('');
            setError('');
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (date) => {
        const messageDate = typeof date === 'string' ? new Date(date) : date;
        return messageDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const formatDate = (date) => {
        const messageDate = typeof date === 'string' ? new Date(date) : date;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) return 'Today';
        if (messageDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <Card sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 500 }}>
                <CircularProgress />
            </Card>
        );
    }

    return (
        <Card sx={{ display: 'flex', flexDirection: 'column', height: 500 }}>
            {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ m: 2 }}>
                    {error}
                </Alert>
            )}

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
                            formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);

                        const isOwnMessage = message.senderId._id === user._id;

                        return (
                            <Box key={message._id}>
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
                                            {formatDate(message.createdAt)}
                                        </Typography>
                                    </Box>
                                )}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            maxWidth: '70%',
                                            borderRadius: 2,
                                            px: 2,
                                            py: 1.25,
                                            ...(isOwnMessage
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
                                        {!isOwnMessage && (
                                            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                                                {message.senderId.firstName} {message.senderId.lastName}
                                            </Typography>
                                        )}
                                        <Typography variant="body2">{message.message}</Typography>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                mt: 0.5,
                                                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: 10,
                                                    opacity: isOwnMessage ? 0.7 : 0.6,
                                                }}
                                            >
                                                {formatTime(message.createdAt)}
                                            </Typography>
                                            {isOwnMessage && (
                                                <Iconify
                                                    icon={message.isRead ? 'mdi:check-all' : 'mdi:check'}
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
                <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" disabled>
                        <Iconify icon="mdi:paperclip" width={20} />
                    </IconButton>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sending}
                        multiline
                        maxRows={4}
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sending}
                    >
                        {sending ? (
                            <CircularProgress size={20} />
                        ) : (
                            <Iconify icon="mdi:send" width={20} />
                        )}
                    </IconButton>
                </Box>
            </Box>
        </Card>
    );
}
