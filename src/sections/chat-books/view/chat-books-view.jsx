'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha } from '@mui/material/styles';

import { useBoolean } from 'src/hooks/use-boolean';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import websocketService from 'src/utils/websocket';
import axios, { endpoints, getCookie } from 'src/utils/axios';
import formatAIResponse from 'src/utils/format-ai-response';
import SidebarContent from '../sidebar';
import ChatHeader from '../chat-header';

// ----------------------------------------------------------------------

const MAX_MESSAGE_LENGTH = 1000;
const SIDEBAR_WIDTH = 320;
const SIDEBAR_COLLAPSED_WIDTH = 80;
const MOBILE_BREAKPOINT = 'md';

// Typing indicator component with dots animation
const TypingIndicator = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        p: { xs: 1.5, sm: 2 },
        '& .dot': {
          width: { xs: 6, sm: 8 },
          height: { xs: 6, sm: 8 },
          borderRadius: '50%',
          backgroundColor: 'primary.main',
          animation: 'typing 1.4s infinite ease-in-out',
          '&:nth-of-type(1)': { animationDelay: '0s' },
          '&:nth-of-type(2)': { animationDelay: '0.2s' },
          '&:nth-of-type(3)': { animationDelay: '0.4s' },
        },
        '@keyframes typing': {
          '0%, 60%, 100%': {
            transform: 'translateY(0)',
            opacity: 0.4,
          },
          '30%': {
            transform: 'translateY(-10px)',
            opacity: 1,
          },
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{ mr: 1, color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
      >
        Perfecto AI is thinking
      </Typography>
      <Box className="dot" />
      <Box className="dot" />
      <Box className="dot" />
    </Box>
  );
};

export function ChatBooksView() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const isMobile = useMediaQuery(theme.breakpoints.down(MOBILE_BREAKPOINT));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [chatSessions, setChatSessions] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(!isMobile);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [localEmptyChat, setLocalEmptyChat] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Search states
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchDebounceRef = useRef();

  // Dialog states
  const renameChatDialog = useBoolean();
  const [renameTitle, setRenameTitle] = useState('');

  // Menu states
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedChatForMenu, setSelectedChatForMenu] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarExpanded(false);
    }
  }, [isMobile]);

  // Get selected company from localStorage
  useEffect(() => {
    const company = localStorage.getItem('selectedCompany');
    if (company) {
      try {
        setSelectedCompany(JSON.parse(company));
      } catch (error) {
        console.error('Failed to parse selected company:', error);
      }
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (user && selectedCompany) {
      const token = getCookie('accessToken');
      if (token) {
        websocketService.connect(token, selectedCompany._id);
      }
    }

    return () => {
      websocketService.disconnect();
    };
  }, [user, selectedCompany]);

  // WebSocket event listeners
  useEffect(() => {
    const handleMessageReceived = (data) => {
      if (data.chatId === currentChat?._id) {
        if (!data.isUserMessage) {
          setMessages((prev) => [...prev, data.message]);
        }
      }
    };

    const handleAITyping = (data) => {
      if (data.chatId === currentChat?._id) {
        setIsTyping(data.isTyping);
      }
    };

    const handleChatSessionCreated = (data) => {
      setChatSessions((prev) => {
        const exists = prev.find((chat) => chat._id === data.chat._id);
        if (exists) return prev;
        return [data.chat, ...prev];
      });
    };

    const handleChatSessionUpdated = (data) => {
      setChatSessions((prev) =>
        prev.map((chat) => (chat._id === data.chat._id ? { ...chat, ...data.chat } : chat))
      );
      if (currentChat?._id === data.chat._id) {
        setCurrentChat((prev) => ({ ...prev, ...data.chat }));
      }
    };

    const handleChatSessionDeleted = (data) => {
      setChatSessions((prev) => prev.filter((chat) => chat._id !== data.chatId));
      if (currentChat?._id === data.chatId) {
        setCurrentChat(null);
        setMessages([]);
      }
    };

    const handleChatError = (data) => {
      if (data.chatId === currentChat?._id) {
        setError(data.message);
        setIsTyping(false);
      }
    };

    websocketService.on('messageReceived', handleMessageReceived);
    websocketService.on('aiTyping', handleAITyping);
    websocketService.on('chatSessionCreated', handleChatSessionCreated);
    websocketService.on('chatSessionUpdated', handleChatSessionUpdated);
    websocketService.on('chatSessionDeleted', handleChatSessionDeleted);
    websocketService.on('chatError', handleChatError);

    return () => {
      websocketService.off('messageReceived', handleMessageReceived);
      websocketService.off('aiTyping', handleAITyping);
      websocketService.off('chatSessionCreated', handleChatSessionCreated);
      websocketService.off('chatSessionUpdated', handleChatSessionUpdated);
      websocketService.off('chatSessionDeleted', handleChatSessionDeleted);
      websocketService.off('chatError', handleChatError);
    };
  }, [currentChat]);

  // Load chat sessions
  const loadChatSessions = useCallback(async () => {
    if (!selectedCompany) return;

    try {
      setLoading(true);
      const response = await axios.get(endpoints.chat.list);
      setChatSessions(response.data.data.chats || []);
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      setError('Failed to load chat sessions');
    } finally {
      setLoading(false);
    }
  }, [selectedCompany]);

  // Load chat sessions on mount
  useEffect(() => {
    loadChatSessions();
  }, [loadChatSessions]);

  // Load specific chat session
  const loadChatSession = useCallback(
    async (chatId) => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(endpoints.chat.get(chatId));
        const chat = response.data.data.chat;
        setCurrentChat(chat);
        setMessages(chat.messages || []);
        // Close mobile drawer when chat is selected
        if (isMobile) {
          setMobileDrawerOpen(false);
        }
      } catch (error) {
        console.error('Failed to load chat session:', error);
        setError('Failed to load chat session');
      } finally {
        setLoading(false);
      }
    },
    [isMobile]
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

  // Focus input when chat changes
  useEffect(() => {
    if (currentChat && inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [currentChat, isMobile]);

  // Create new chat session with automatic naming
  const handleCreateChat = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if there's already an empty local chat
      if (localEmptyChat) {
        setCurrentChat(localEmptyChat);
        setMessages(localEmptyChat.messages || []);
        if (isMobile) {
          setMobileDrawerOpen(false);
        }
        return;
      }

      const defaultAiMessage = {
        content: 'Hello! How can I help you with your books today?',
        sender: 'assistant',
        timestamp: new Date(),
      };

      // Create a new local empty chat
      const newLocalChat = {
        _id: `local_${Date.now()}`,
        title: 'New Chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 0,
        isLocal: true,
        messages: [defaultAiMessage],
      };

      setLocalEmptyChat(newLocalChat);
      setCurrentChat(newLocalChat);
      setMessages([defaultAiMessage]);

      if (isMobile) {
        setMobileDrawerOpen(false);
      }
    } catch (error) {
      console.error('Failed to create local chat session:', error);
      setError('Failed to create chat session');
    } finally {
      setLoading(false);
    }
  };

  // Select chat session
  const handleSelectChat = (chat) => {
    if (chat._id !== currentChat?._id) {
      if (chat.isLocal) {
        setCurrentChat(chat);
        setMessages(chat.messages || []);
      } else {
        loadChatSession(chat._id);
      }
    }
  };

  // Handle input change
  const handleInputChange = (event) => {
    const value = event.target.value;
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setInput(value);
    }
  };

  // Handle message send
  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const messageContent = input.trim();
    setInput('');
    setError(null);

    const userMessage = {
      content: messageContent,
      sender: 'user',
      timestamp: new Date(),
    };

    if (currentChat?.isLocal) {
      try {
        setLoading(true);

        const response = await axios.post(endpoints.chat.create, {
          title: 'New Chat',
        });

        const newChat = response.data.data.chat;

        setCurrentChat(newChat);
        setLocalEmptyChat(null);
        setMessages([userMessage]);

        await axios.post(endpoints.chat.sendMessage(newChat._id), {
          message: messageContent,
        });
      } catch (error) {
        console.error('Failed to create chat and send message:', error);
        setError('Failed to send message. Please try again.');
        setIsTyping(false);
        setMessages([]);
        return;
      } finally {
        setLoading(false);
      }
    } else {
      if (!currentChat) return;
      setMessages((prev) => [...prev, userMessage]);
      try {
        await axios.post(endpoints.chat.sendMessage(currentChat._id), {
          message: messageContent,
        });

        // Move the chat to the top of chatSessions
        setChatSessions((prev) => {
          const idx = prev.findIndex((chat) => chat._id === currentChat._id);
          if (idx === -1) return prev;
          const updated = [...prev];
          const [chat] = updated.splice(idx, 1);
          chat.updatedAt = new Date();
          chat.messageCount = (chat.messageCount || 0) + 1;
          updated.unshift(chat);
          return updated;
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        setError('Failed to send message. Please try again.');
        setIsTyping(false);
        setMessages((prev) => prev.slice(0, -1));
      }
    }
  };

  // Handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatMenu = (event, chat) => {
    event.stopPropagation();
    setSelectedChatForMenu(chat);
    if (isMobile) {
      setMenuAnchor({ top: 0, left: 0 });
    } else {
      setMenuAnchor(event.currentTarget);
    }
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  // Handle rename chat
  const handleRenameChat = async () => {
    if (!selectedChatForMenu || !renameTitle.trim()) return;

    if (selectedChatForMenu.isLocal) {
      const updatedTitle = renameTitle.trim();
      setLocalEmptyChat((prev) => (prev ? { ...prev, title: updatedTitle } : null));
      if (currentChat?.isLocal && currentChat._id === selectedChatForMenu._id) {
        setCurrentChat((prev) => ({ ...prev, title: updatedTitle }));
      }
      setRenameTitle('');
      renameChatDialog.onFalse();
      handleCloseMenu();
      return;
    }
    try {
      setLoading(true);
      await axios.put(endpoints.chat.update(selectedChatForMenu._id), {
        title: renameTitle.trim(),
      });
      setRenameTitle('');
      renameChatDialog.onFalse();
      handleCloseMenu();
    } catch (error) {
      console.error('Failed to rename chat:', error);
      setError('Failed to rename chat');
    } finally {
      setLoading(false);
    }
  };

  const getAllChats = () => {
    return [...chatSessions];
  };

  // Handle delete chat
  const handleDeleteChat = async () => {
    if (!selectedChatForMenu) return;

    if (selectedChatForMenu.isLocal) {
      setLocalEmptyChat(null);
      if (currentChat?._id === selectedChatForMenu._id) {
        setCurrentChat(null);
        setMessages([]);
      }
      handleCloseMenu();
      setDeleteDialogOpen(false);
      setSelectedChatForMenu(null);
      return;
    }

    try {
      setLoading(true);
      await axios.delete(endpoints.chat.delete(selectedChatForMenu._id));
      handleCloseMenu();
      setDeleteDialogOpen(false);
      setSelectedChatForMenu(null);
    } catch (error) {
      console.error('Failed to delete chat:', error);
      setError('Failed to delete chat');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSearchDialog = () => {
    setSearchDialogOpen(true);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleCloseSearchDialog = () => {
    setSearchDialogOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSearchChats = async (term) => {
    setSearching(true);
    try {
      const response = await axios.get(endpoints.chat.search, {
        params: { q: term, limit: 20 },
      });
      setSearchResults(response.data.data.chats || []);
    } catch (error) {
      setSearchResults([]);
    }
    setSearching(false);
  };

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    if (searchTerm.trim()) {
      setSearching(true);
      searchDebounceRef.current = setTimeout(() => {
        handleSearchChats(searchTerm);
      }, 400);
    } else {
      setSearchResults([]);
      setSearching(false);
    }
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchTerm]);

  const handleSelectSearchChat = (chat) => {
    handleCloseSearchDialog();
    handleSelectChat(chat);
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedChatForMenu(null);
  };

  // Confirm delete
  const handleConfirmDeleteChat = async () => {
    await handleDeleteChat();
  };

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

  const sidebarContent = useMemo(
    () => (
      <SidebarContent
        isMobile={isMobile}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        loading={loading}
        handleCreateChat={handleCreateChat}
        handleOpenSearchDialog={handleOpenSearchDialog}
        getAllChats={getAllChats}
        currentChat={currentChat}
        handleChatMenu={handleChatMenu}
        handleSelectChat={handleSelectChat}
        theme={theme}
      />
    ),
    [
      isMobile,
      sidebarExpanded,
      loading,
      handleCreateChat,
      handleOpenSearchDialog,
      getAllChats,
      currentChat,
      handleChatMenu,
      handleSelectChat,
      theme,
    ]
  );

  return (
    <DashboardContent
      sx={{
        display: 'flex',
        height: '100%',
        p: 0,
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: { xs: 'calc(100vh - 60px)', sm: 'calc(100vh - 80px)', md: 'calc(100vh - 100px)' },
          position: 'relative',
        }}
      >
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Paper
            elevation={sidebarExpanded ? 4 : 1}
            sx={{
              width: sidebarExpanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
              flexShrink: 0,
              flexBasis: sidebarExpanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
              transition:
                'width 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s cubic-bezier(.4,0,.2,1), background 0.35s cubic-bezier(.4,0,.2,1)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              mr: 0,
              boxShadow: sidebarExpanded ? 4 : 1,
              bgcolor: sidebarExpanded ? 'background.paper' : 'grey.100',
              borderRight: `2px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              position: 'relative',
              zIndex: 2,
            }}
          >
            {sidebarContent}
          </Paper>
        )}

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: Math.min(SIDEBAR_WIDTH, window.innerWidth * 0.85),
              borderRadius: 0,
            },
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {sidebarContent}
          </Box>
        </Drawer>

        {/* Search Dialog */}
        <Dialog
          open={searchDialogOpen}
          onClose={handleCloseSearchDialog}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              m: { xs: 2, sm: 'auto' },
              width: { xs: '100%', sm: 400 },
              maxWidth: '100vw',
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              fontSize: { xs: 18, sm: 20 },
              pb: 1,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              background: 'transparent',
              px: { xs: 2, sm: 3 },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify
                  icon="ph:magnifying-glass-bold"
                  sx={{ color: 'primary.main', fontSize: { xs: 20, sm: 22 } }}
                />
                <span>Search Chats</span>
              </Stack>
              {isMobile && (
                <IconButton onClick={handleCloseSearchDialog} size="small">
                  <Iconify icon="ph:x-bold" />
                </IconButton>
              )}
            </Stack>
          </DialogTitle>
          <DialogContent
            sx={{
              pt: 2,
              pb: 1,
              px: { xs: 2, sm: 2 },
              minHeight: isMobile ? 'auto' : 180,
              maxHeight: isMobile ? 'none' : 420,
              overflowY: 'auto',
              flex: isMobile ? 1 : 'none',
            }}
          >
            <TextField
              autoFocus={!isMobile}
              margin="dense"
              label="Search by chat title"
              fullWidth
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.neutral, 0.4),
                },
              }}
              InputProps={{
                startAdornment: (
                  <Iconify
                    icon="ph:magnifying-glass-bold"
                    sx={{ mr: 1, color: 'text.secondary' }}
                  />
                ),
                endAdornment: searching && <CircularProgress size={18} sx={{ mr: 1 }} />,
              }}
            />
            <Divider sx={{ mb: 1.5 }} />
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{
                letterSpacing: 1,
                fontWeight: 600,
                mb: 0.5,
                display: 'block',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
              }}
            >
              Results
            </Typography>
            {searching ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            ) : searchTerm && searchResults.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                <Iconify
                  icon="ph:chat-circle-dots"
                  width={38}
                  sx={{ mb: 1, color: 'primary.light', opacity: 0.7 }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
                >
                  No chats found.
                </Typography>
              </Box>
            ) : (
              <List dense sx={{ px: 0, pt: 0 }}>
                {searchResults.map((chat) => (
                  <ListItem
                    button
                    key={chat._id}
                    onClick={() => handleSelectSearchChat(chat)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      px: 2,
                      py: { xs: 1.5, sm: 1.1 },
                      bgcolor: 'background.neutral',
                      boxShadow: 1,
                      transition: 'box-shadow 0.2s, background 0.2s',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.07),
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                          }}
                        >
                          {chat.title}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {chat.updatedAt ? new Date(chat.updatedAt).toLocaleString() : ''}
                        </Typography>
                      }
                    />
                    <Chip
                      size="small"
                      label={chat.messageCount}
                      variant="outlined"
                      sx={{
                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
                        height: { xs: 16, sm: 18 },
                        borderRadius: 0.5,
                        ml: 1,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          {!isMobile && (
            <DialogActions sx={{ px: 2, pb: 2, pt: 0 }}>
              <Button
                onClick={handleCloseSearchDialog}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
              >
                Close
              </Button>
            </DialogActions>
          )}
        </Dialog>

        {/* Chat Area */}
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: { xs: 0, sm: 2 },
            border: { xs: 'none', sm: `2px solid ${alpha(theme.palette.primary.main, 0.08)}` },
            backgroundColor: 'background.default',
            overflow: 'hidden',
            boxShadow: 0,
            position: 'relative',
            zIndex: 1,
            ml: { xs: 0, md: 0.5 },
          }}
        >
          {currentChat ? (
            <>
              <ChatHeader
                currentChat={currentChat}
                isMobile={isMobile}
                setMobileDrawerOpen={setMobileDrawerOpen}
                theme={theme}
              />

              {/* Error Alert */}
              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError(null)}
                  sx={{ m: { xs: 1.5, sm: 2 }, mb: 0, borderRadius: 1.5 }}
                >
                  {error}
                </Alert>
              )}

              {/* Chat Messages */}
              <Box
                sx={{
                  flexGrow: 1,
                  p: { xs: 1.5, sm: 3 },
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: { xs: 1.5, sm: 2 },
                  background: `linear-gradient(180deg, ${alpha(theme.palette.background.neutral, 0.3)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                }}
              >
                {messages.map((message, index) => (
                  <Box
                    key={`message-${message.timestamp}-${index}`}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        maxWidth: { xs: '90%', sm: '85%', md: '75%' },
                        minWidth: { xs: '150px', sm: '200px' },
                        backgroundColor:
                          message.sender === 'user'
                            ? 'primary.main'
                            : alpha(theme.palette.background.neutral, 0.7),
                        color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2.5,
                        p: { xs: 2, sm: 2.5 },
                        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: theme.shadows[4],
                        },
                      }}
                    >
                      {/* Message Content */}
                      <Box sx={{ mb: { xs: 1, sm: 1.5 } }}>
                        {message.sender === 'assistant' ? (
                          formatAIResponse(message.content)
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: 'pre-line',
                              lineHeight: 1.6,
                              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                            }}
                          >
                            {message.content}
                          </Typography>
                        )}
                      </Box>

                      {/* Message Footer */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography
                          variant="caption"
                          sx={{
                            color:
                              message.sender === 'user'
                                ? alpha(theme.palette.primary.contrastText, 0.7)
                                : 'text.secondary',
                            fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          }}
                        >
                          {formatTimestamp(message.timestamp)}
                        </Typography>

                        {/* Relevant Documents Chip */}
                        {message.relevantDocuments > 0 && (
                          <Chip
                            size="small"
                            label={`${message.relevantDocuments} docs`}
                            variant="outlined"
                            sx={{
                              fontSize: { xs: '0.6rem', sm: '0.65rem' },
                              height: { xs: 18, sm: 20 },
                              borderRadius: 1,
                              borderColor:
                                message.sender === 'user'
                                  ? alpha(theme.palette.primary.contrastText, 0.3)
                                  : 'primary.main',
                              color:
                                message.sender === 'user'
                                  ? alpha(theme.palette.primary.contrastText, 0.8)
                                  : 'primary.main',
                            }}
                          />
                        )}
                      </Stack>
                    </Paper>
                  </Box>
                ))}

                {isTyping && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        backgroundColor: alpha(theme.palette.background.neutral, 0.7),
                        borderRadius: 2.5,
                        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      }}
                    >
                      <TypingIndicator />
                    </Paper>
                  </Box>
                )}

                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box
                sx={{
                  px: { xs: 1.5, sm: 3 },
                  py: { xs: 1, sm: 1 },
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                  backgroundColor: 'background.paper',
                  pb: { xs: isMobile ? 2 : 1, sm: 1 }, // Extra bottom padding on mobile for safe area
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="flex-end">
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder="Type your question..."
                      value={input}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      inputRef={inputRef}
                      disabled={isTyping}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: alpha(theme.palette.background.neutral, 0.4),
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                          '& fieldset': {
                            borderColor: alpha(theme.palette.divider, 0.2),
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: 2,
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'background.paper',
                            boxShadow: theme.shadows[4],
                          },
                        },
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.875rem', sm: '0.95rem' },
                          lineHeight: 1.5,
                        },
                      }}
                    />

                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isTyping}
                      startIcon={<Iconify icon="ph:paper-plane-tilt-bold" />}
                      sx={{
                        minWidth: 'auto',
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.2 },
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                        boxShadow: theme.shadows[2],
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                        },
                      }}
                    >
                      {isMobile ? '' : 'Send'}
                    </Button>
                  </Stack>

                  {/* Character Counter */}
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                      {input.length}/{MAX_MESSAGE_LENGTH} characters
                    </Typography>
                    {input.length > MAX_MESSAGE_LENGTH * 0.9 && (
                      <Typography
                        variant="caption"
                        color={input.length >= MAX_MESSAGE_LENGTH ? 'error.main' : 'warning.main'}
                        sx={{ fontWeight: 500, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      >
                        {input.length >= MAX_MESSAGE_LENGTH
                          ? 'Character limit reached'
                          : 'Approaching character limit'}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>
            </>
          ) : (
            /* No Chat Selected */
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                p: { xs: 2, sm: 3 },
              }}
            >
              <Stack spacing={{ xs: 2, sm: 3 }} alignItems="center">
                <Box
                  sx={{
                    width: { xs: 60, sm: 80 },
                    height: { xs: 60, sm: 80 },
                    borderRadius: '50%',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Iconify
                    icon="ph:chat-circle-text"
                    width={{ xs: 30, sm: 40 }}
                    color="primary.main"
                  />
                </Box>
                <Stack spacing={1} alignItems="center">
                  <Typography
                    variant="h6"
                    color="text.primary"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    }}
                  >
                    Welcome to Perfecto AI
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      maxWidth: { xs: 280, sm: 400 },
                      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    }}
                  >
                    {isMobile
                      ? 'Tap the chat icon to view sessions or start a new conversation.'
                      : 'Select a chat session from the sidebar or create a new one to start asking questions about your finances.'}
                  </Typography>
                </Stack>
                <Button
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  startIcon={<Iconify icon="ph:plus-bold" />}
                  onClick={handleCreateChat}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: { xs: 3, sm: 4 },
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  Start New Chat
                </Button>
                {isMobile && (
                  <Button
                    variant=""
                    size={isMobile ? 'medium' : 'large'}
                    startIcon={<Iconify icon="ph:chat-circle-text-bold" />}
                    onClick={() => setMobileDrawerOpen(true)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: { xs: 3, sm: 4 },
                      py: { xs: 1.25, sm: 1.5 },
                      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      boxShadow: theme.shadows[4],
                      '&:hover': {
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    Chat Sessions
                  </Button>
                )}
              </Stack>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Rename Chat Dialog */}
      <Dialog
        open={renameChatDialog.value}
        onClose={renameChatDialog.onFalse}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            m: { xs: 2, sm: 'auto' },
            width: { xs: '100%', sm: 400 },
            maxWidth: '100vw',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            px: { xs: 2, sm: 3 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          Rename Chat Session
          {isMobile && (
            <IconButton onClick={renameChatDialog.onFalse} size="small">
              <Iconify icon="ph:x-bold" />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <TextField
            autoFocus={!isMobile}
            margin="dense"
            label="New Title"
            fullWidth
            variant="outlined"
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
          {!isMobile && (
            <Button onClick={renameChatDialog.onFalse} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleRenameChat}
            variant="contained"
            disabled={loading || !renameTitle.trim()}
            sx={{
              textTransform: 'none',
              borderRadius: 1.5,
              flex: isMobile ? 1 : 'none',
            }}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat Menu */}
      <Menu
        anchorEl={isMobile ? undefined : menuAnchor}
        anchorReference={isMobile ? 'anchorPosition' : 'anchorEl'}
        anchorPosition={isMobile ? { top: 0, left: 0 } : undefined}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            borderRadius: 1.5,
            minWidth: { xs: 120, sm: 140 },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setRenameTitle(selectedChatForMenu?.title || '');
            renameChatDialog.onTrue();
          }}
          sx={{ borderRadius: 1, mx: 1, my: 0.25, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
        >
          <Iconify icon="ph:pencil" sx={{ mr: 1.5 }} />
          Rename
        </MenuItem>
        <MenuItem
          onClick={handleOpenDeleteDialog}
          sx={{
            color: 'error.main',
            borderRadius: 1,
            mx: 1,
            my: 0.25,
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
          }}
        >
          <Iconify icon="ph:trash" sx={{ mr: 1.5 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            m: { xs: 2, sm: 'auto' },
            width: { xs: '100%', sm: 400 },
            maxWidth: '100vw',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            px: { xs: 2, sm: 3 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          Delete Chat Session
          {isMobile && (
            <IconButton onClick={handleCloseDeleteDialog} size="small">
              <Iconify icon="ph:x-bold" />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <DialogContentText sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
            Are you sure you want to delete this chat session? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            p: { xs: 2, sm: 3 },
            pt: 0,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0,
          }}
        >
          <Button
            onClick={handleCloseDeleteDialog}
            sx={{
              textTransform: 'none',
              flex: isMobile ? 1 : 'none',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteChat}
            color="error"
            variant="contained"
            disabled={loading}
            sx={{
              textTransform: 'none',
              flex: isMobile ? 1 : 'none',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
