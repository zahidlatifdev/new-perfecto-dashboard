'use client';

import { useState, useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Sample chat messages
const INITIAL_MESSAGES = [
    {
        id: '1',
        sender: 'bookkeeper',
        senderName: 'Sarah M.',
        content: "Hi Jane, just letting you know I've completed the reconciliation for May! Everything looks good.",
        timestamp: '2 hours ago',
    },
    {
        id: '2',
        sender: 'user',
        senderName: 'You',
        content: 'Great, thanks Sarah!',
        timestamp: '1 hour ago',
    },
];

// ----------------------------------------------------------------------

export function BookkeeperView() {
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    
    // Auto scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const message = {
                id: `msg-${Date.now()}`,
                sender: 'user',
                senderName: 'You',
                content: newMessage.trim(),
                timestamp: 'Just now',
            };
            
            setMessages([...messages, message]);
            setNewMessage('');
            
            // Simulate bookkeeper response after a delay
            setTimeout(() => {
                const response = {
                    id: `msg-${Date.now() + 1}`,
                    sender: 'bookkeeper',
                    senderName: 'Sarah M.',
                    content: "I'll be reviewing your June transactions next week. Let me know if there's anything specific you want me to look at.",
                    timestamp: 'Just now',
                };
                setMessages(prev => [...prev, response]);
            }, 3000);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <DashboardContent
            maxWidth="md"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                pb: 0, // Remove default padding at bottom
            }}
        >
            <Card
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'hidden',
                    flexGrow: 1,
                }}
            >
                {/* Bookkeeper Header */}
                <Box
                    sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Avatar
                        sx={{ 
                            bgcolor: 'success.light',
                            color: 'success.dark',
                            width: 40,
                            height: 40,
                            mr: 2,
                        }}
                    >
                        BK
                    </Avatar>
                    
                    <Box>
                        <Typography variant="subtitle1">
                            Your Dedicated Bookkeeper (Sarah M.)
                        </Typography>
                        
                        <Box 
                            sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                color: 'success.main',
                            }}
                        >
                            <Box
                                component="span"
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: 'success.main',
                                    mr: 0.75,
                                    display: 'inline-block',
                                }}
                            />
                            <Typography 
                                variant="caption"
                                sx={{ color: 'success.main' }}
                            >
                                Online
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                
                {/* Chat Messages Area */}
                <Box
                    sx={{
                        p: 2,
                        flexGrow: 1,
                        overflowY: 'auto',
                        bgcolor: 'background.neutral',
                    }}
                >
                    <Stack spacing={2}>
                        {messages.map((message) => (
                            <Box
                                key={message.id}
                                sx={{
                                    maxWidth: '75%',
                                    alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                    ml: message.sender === 'user' ? 'auto' : 0,
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: message.sender === 'user' ? 'primary.lighter' : 'background.paper',
                                        border: '1px solid',
                                        borderColor: message.sender === 'user' ? 'primary.lighter' : 'divider',
                                    }}
                                >
                                    <Typography variant="body2">
                                        {message.content}
                                    </Typography>
                                </Paper>
                                
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        color: 'text.secondary',
                                        mt: 0.5,
                                        textAlign: message.sender === 'user' ? 'right' : 'left',
                                    }}
                                >
                                    {message.senderName} - {message.timestamp}
                                </Typography>
                            </Box>
                        ))}
                        <div ref={messagesEndRef} />
                    </Stack>
                </Box>
                
                {/* Message Input Area */}
                <Box
                    sx={{
                        p: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            placeholder="Type your message to Sarah..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small">
                                            <Iconify icon="ph:paperclip-bold" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<Iconify icon="ph:paper-plane-tilt-bold" />}
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                        >
                            Send
                        </Button>
                    </Box>
                </Box>
            </Card>
        </DashboardContent>
    );
}