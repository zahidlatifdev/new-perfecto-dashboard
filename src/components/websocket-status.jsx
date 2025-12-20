'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import websocketService from 'src/utils/websocket';

// ----------------------------------------------------------------------

export function WebSocketStatus({ showLabel = false, size = 'small' }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check connection status every second
    const interval = setInterval(() => {
      setIsConnected(websocketService.isSocketConnected());
    }, 1000);

    // Initial check
    setIsConnected(websocketService.isSocketConnected());

    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    if (isConnected) {
      return {
        color: 'success',
        icon: 'ph:wifi-high-bold',
        label: 'Connected',
        tooltip: 'Real-time updates active'
      };
    }
    
    return {
      color: 'error',
      icon: 'ph:wifi-slash-bold',
      label: 'Disconnected',
      tooltip: 'Real-time updates unavailable'
    };
  };

  const config = getStatusConfig();

  if (showLabel) {
    return (
      <Tooltip title={config.tooltip}>
        <Chip
          size={size}
          variant="outlined"
          color={config.color}
          icon={<Iconify icon={config.icon} />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption">
                Live Updates
              </Typography>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: isConnected ? 'success.main' : 'error.main',
                  animation: isConnected ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                    '100%': { opacity: 1 }
                  }
                }}
              />
            </Box>
          }
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={config.tooltip}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: isConnected ? 'success.lighter' : 'error.lighter',
          border: 1,
          borderColor: isConnected ? 'success.main' : 'error.main'
        }}
      >
        <Iconify 
          icon={config.icon} 
          sx={{ 
            fontSize: 16, 
            color: isConnected ? 'success.main' : 'error.main'
          }} 
        />
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: isConnected ? 'success.main' : 'error.main',
            animation: isConnected ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 }
            }
          }}
        />
      </Box>
    </Tooltip>
  );
}