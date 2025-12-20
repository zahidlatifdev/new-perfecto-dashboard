'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import { useAuthContext } from 'src/auth/hooks';
import websocketService from 'src/utils/websocket';
import { getCookie } from 'src/utils/axios';
import { WebSocketNotifications } from 'src/components/notifications/websocket-notifications';

// ----------------------------------------------------------------------

export function WebSocketProvider({ children }) {
  const { user, selectedCompany } = useAuthContext();

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    if (user && selectedCompany) {
      const token = getCookie('accessToken');
      if (token && !websocketService.isSocketConnected()) {
        console.log('Initializing WebSocket connection...');
        websocketService.connect(token, selectedCompany._id);
      }
    }

    // Cleanup on unmount - disconnect when user logs out
    return () => {
      if (!user) {
        websocketService.disconnect();
      }
    };
  }, [user, selectedCompany]);

  // Handle company switching
  useEffect(() => {
    if (selectedCompany && websocketService.isSocketConnected()) {
      websocketService.switchCompany(selectedCompany._id);
    }
  }, [selectedCompany]);

  return (
    <>
      {children}

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4caf50',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#f44336',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* WebSocket-based notifications */}
      <WebSocketNotifications />
    </>
  );
}