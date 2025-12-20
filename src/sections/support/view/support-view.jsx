'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Support resources categories
const SUPPORT_RESOURCES = [
    {
        id: 'knowledge-base',
        title: 'Knowledge Base',
        description: 'Find articles & guides.',
        icon: 'ph:books-bold',
    },
    {
        id: 'video-tutorials',
        title: 'Video Tutorials',
        description: 'Watch onboarding videos.',
        icon: 'ph:video-camera-bold',
    },
    {
        id: 'community-forum',
        title: 'Community Forum',
        description: 'Ask questions & share tips.',
        icon: 'ph:chats-teardrop-bold',
    },
];

// Ticket priorities
const TICKET_PRIORITIES = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

// Ticket types
const TICKET_TYPES = [
    { value: 'question', label: 'General Question' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'billing', label: 'Billing Issue' },
    { value: 'technical', label: 'Technical Support' },
];

// ----------------------------------------------------------------------

export function SupportView() {
    const [message, setMessage] = useState('');
    const [openNewTicketDialog, setOpenNewTicketDialog] = useState(false);
    const [newTicket, setNewTicket] = useState({
        subject: '',
        type: '',
        priority: 'medium',
        description: '',
    });
    
    const handleResourceClick = (resourceId) => {
        // In a real app, this would navigate to the specific resource section
        console.log(`Clicked on ${resourceId}`);
    };
    
    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };
    
    const handleSendMessage = () => {
        if (message.trim()) {
            console.log('Sending message:', message);
            // In a real app, this would send the message to support
            setMessage('');
        }
    };
    
    const handleAttachFile = () => {
        // In a real app, this would open a file picker
        console.log('Attaching file');
    };
    
    const handleOpenNewTicketDialog = () => {
        setOpenNewTicketDialog(true);
    };
    
    const handleCloseNewTicketDialog = () => {
        setOpenNewTicketDialog(false);
        setNewTicket({
            subject: '',
            type: '',
            priority: 'medium',
            description: '',
        });
    };
    
    const handleNewTicketChange = (e) => {
        const { name, value } = e.target;
        setNewTicket({
            ...newTicket,
            [name]: value,
        });
    };
    
    const handleCreateTicket = () => {
        console.log('Creating ticket:', newTicket);
        // In a real app, this would submit the ticket to support
        handleCloseNewTicketDialog();
    };
    
    const isValidNewTicket = newTicket.subject && newTicket.type && newTicket.description;

    return (
        <DashboardContent 
            maxWidth="xl" 
            sx={{ 
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            {/* Resource Categories */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {SUPPORT_RESOURCES.map((resource) => (
                    <Grid item xs={12} md={4} key={resource.id}>
                        <Card 
                            onClick={() => handleResourceClick(resource.id)}
                            sx={{
                                p: 2,
                                textAlign: 'center',
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: 'success.lighter',
                                },
                                transition: 'background-color 0.3s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Iconify 
                                icon={resource.icon} 
                                sx={{ 
                                    fontSize: 48, 
                                    color: 'success.main',
                                    mb: 1,
                                }} 
                            />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                {resource.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {resource.description}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Support Tickets & Chat Interface */}
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', lg: 'row' }, 
                    gap: 3,
                    flexGrow: 1,
                }}
            >
                {/* Support Tickets */}
                <Card 
                    sx={{ 
                        width: { xs: '100%', lg: '33.333%' }, 
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box 
                        sx={{ 
                            p: 2, 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                            Your Support Tickets
                        </Typography>
                        
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<Iconify icon="ph:plus-bold" />}
                            onClick={handleOpenNewTicketDialog}
                            sx={{ fontSize: '0.75rem' }}
                        >
                            New Ticket
                        </Button>
                    </Box>
                    
                    <Box 
                        sx={{ 
                            flexGrow: 1,
                            overflowY: 'auto',
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: 'text.secondary',
                                textAlign: 'center',
                            }}
                        >
                            No support tickets yet.
                        </Typography>
                    </Box>
                </Card>

                {/* Chat Interface */}
                <Card 
                    sx={{ 
                        width: { xs: '100%', lg: '66.666%' }, 
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box 
                        sx={{ 
                            p: 2, 
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                            Start a New Conversation
                        </Typography>
                    </Box>
                    
                    <Box 
                        sx={{ 
                            flexGrow: 1,
                            overflowY: 'auto',
                            p: 2,
                            bgcolor: 'background.neutral',
                        }}
                    >
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Describe your issue or question below.
                        </Typography>
                    </Box>
                    
                    <Box 
                        sx={{ 
                            p: 2, 
                            borderTop: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Type your message..."
                            value={message}
                            onChange={handleMessageChange}
                            variant="outlined"
                            size="small"
                            sx={{ mb: 2 }}
                        />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="small"
                                startIcon={<Iconify icon="ph:paperclip-bold" />}
                                onClick={handleAttachFile}
                                sx={{ fontSize: '0.75rem' }}
                            >
                                Attach File
                            </Button>
                            
                            <Button
                                variant="contained"
                                color="primary"
                                endIcon={<Iconify icon="ph:paper-plane-tilt-bold" />}
                                onClick={handleSendMessage}
                                disabled={!message.trim()}
                            >
                                Send Message
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </Box>

            {/* New Ticket Dialog */}
            <Dialog
                open={openNewTicketDialog}
                onClose={handleCloseNewTicketDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Create Support Ticket</DialogTitle>
                
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Subject"
                            name="subject"
                            value={newTicket.subject}
                            onChange={handleNewTicketChange}
                            placeholder="Brief description of your issue"
                        />
                        
                        <FormControl fullWidth>
                            <InputLabel>Ticket Type</InputLabel>
                            <Select
                                name="type"
                                value={newTicket.type}
                                label="Ticket Type"
                                onChange={handleNewTicketChange}
                            >
                                {TICKET_TYPES.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                name="priority"
                                value={newTicket.priority}
                                label="Priority"
                                onChange={handleNewTicketChange}
                            >
                                {TICKET_PRIORITIES.map((priority) => (
                                    <MenuItem key={priority.value} value={priority.value}>
                                        {priority.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Description"
                            name="description"
                            value={newTicket.description}
                            onChange={handleNewTicketChange}
                            placeholder="Please provide as much detail as possible"
                        />
                    </Stack>
                </DialogContent>
                
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseNewTicketDialog} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateTicket}
                        disabled={!isValidNewTicket}
                    >
                        Create Ticket
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardContent>
    );
}