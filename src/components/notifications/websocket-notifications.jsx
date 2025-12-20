'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';
import { useDocumentProcessing, useTransactionEvents } from 'src/hooks/use-websocket';

// ----------------------------------------------------------------------

export function WebSocketNotifications() {
  const [notifications, setNotifications] = useState([]);

  // Add notification to queue
  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = { ...notification, id };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after 6 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Track processed events to prevent duplicates
  const processedEventsRef = useRef(new Set());
  const lastEventTimeRef = useRef({});

  // Helper function to create debounced event handler
  const createDebouncedHandler = useCallback((eventType, handler, debounceMs = 2000) => {
    return (data) => {
      const now = Date.now();
      const eventKey = `${eventType}_${data.id}_${data.fileName}`;
      const lastTime = lastEventTimeRef.current[eventKey] || 0;

      // If same event happened recently, ignore it
      if (now - lastTime < debounceMs) {
        return;
      }

      // Update last event time
      lastEventTimeRef.current[eventKey] = now;

      // Clean up old entries after 30 seconds
      setTimeout(() => {
        delete lastEventTimeRef.current[eventKey];
      }, 30000);

      // Call the actual handler
      handler(data);
    };
  }, []);

  // Document processing event handlers
  const handleDocumentUploaded = useCallback(createDebouncedHandler('uploaded', (data) => {
    addNotification({
      type: 'info',
      title: 'Document Uploaded',
      message: `${data.fileName} uploaded successfully. Processing will begin shortly.`,
      icon: 'ph:cloud-arrow-up-bold'
    });
  }), [addNotification, createDebouncedHandler]);

  const handleDocumentProcessing = useCallback(createDebouncedHandler('processing', (data) => {
    addNotification({
      type: 'info',
      title: 'Processing Started',
      message: `Processing ${data.fileName}...`,
      icon: 'ph:gear-bold'
    });
  }), [addNotification, createDebouncedHandler]);

  const handleDocumentProcessed = useCallback(createDebouncedHandler('processed', (data) => {
    addNotification({
      type: 'success',
      title: 'Processing Complete',
      message: `${data.fileName} processed successfully. ${data.transactionCount || 0} transactions extracted.`,
      icon: 'ph:check-circle-bold'
    });

    // Also show a toast for important updates (but only once)
    const toastKey = `toast_processed_${data.id}`;
    if (!lastEventTimeRef.current[toastKey]) {
      toast.success(`Document processed: ${data.fileName}`);
      lastEventTimeRef.current[toastKey] = Date.now();
      setTimeout(() => {
        delete lastEventTimeRef.current[toastKey];
      }, 30000);
    }
  }), [addNotification, createDebouncedHandler]);

  const handleDocumentProcessingFailed = useCallback(createDebouncedHandler('failed', (data) => {
    addNotification({
      type: 'error',
      title: 'Processing Failed',
      message: `Failed to process ${data.fileName}. ${data.error || 'Please try again.'}`,
      icon: 'ph:x-circle-bold'
    });

    // Also show a toast for important updates (but only once)
    const toastKey = `toast_failed_${data.id}`;
    if (!lastEventTimeRef.current[toastKey]) {
      toast.error(`Processing failed: ${data.fileName}`);
      lastEventTimeRef.current[toastKey] = Date.now();
      setTimeout(() => {
        delete lastEventTimeRef.current[toastKey];
      }, 30000);
    }
  }), [addNotification, createDebouncedHandler]);

  const handleMatchingComplete = useCallback((data) => {
    addNotification({
      type: 'success',
      title: 'Matching Complete',
      message: `Found ${data.matchCount || 0} matches for ${data.fileName}.`,
      icon: 'ph:link-bold'
    });
  }, [addNotification]);

  // Setup WebSocket listeners
  useDocumentProcessing({
    onDocumentUploaded: handleDocumentUploaded,
    onDocumentProcessing: handleDocumentProcessing,
    onDocumentProcessed: handleDocumentProcessed,
    onDocumentProcessingFailed: handleDocumentProcessingFailed,
    onMatchingComplete: handleMatchingComplete
  });

  const getAlertColor = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getIcon = (iconName) => {
    return <Iconify icon={iconName} sx={{ fontSize: 20 }} />;
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 16,
        zIndex: 9999,
        maxWidth: 400,
        pointerEvents: 'none' // Allow clicks to pass through empty areas
      }}
    >
      <Stack spacing={1}>
        {notifications.map((notification) => (
          <Alert
            key={notification.id}
            severity={getAlertColor(notification.type)}
            variant="filled"
            sx={{
              width: '100%',
              boxShadow: 3,
              pointerEvents: 'auto', // Re-enable pointer events for notifications
              position: 'relative',
              '& .MuiAlert-icon': {
                alignItems: 'center'
              },
              '& .MuiAlert-action': {
                alignItems: 'flex-start',
                paddingTop: '6px'
              }
            }}
            icon={getIcon(notification.icon)}
            action={
              <IconButton
                size="small"
                color="inherit"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
                sx={{
                  mt: -0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <Iconify icon="ph:x-bold" sx={{ fontSize: 16 }} />
              </IconButton>
            }
          >
            <AlertTitle sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {notification.title}
            </AlertTitle>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
              {notification.message}
            </Typography>
          </Alert>
        ))}
      </Stack>
    </Box>
  );
}