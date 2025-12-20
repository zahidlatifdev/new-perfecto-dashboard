import { useEffect, useCallback, useRef } from 'react';
import websocketService from 'src/utils/websocket';
import { useAuthContext } from 'src/auth/hooks';
import { getCookie } from 'src/utils/axios';

/**
 * Hook for managing WebSocket connections and events
 * @param {Array} events - Array of event objects {event: string, handler: function}
 * @param {Array} dependencies - Dependencies for effect
 * @returns {Object} WebSocket utilities
 */
export function useWebSocket(events = [], dependencies = []) {
  const { user, selectedCompany } = useAuthContext();
  const listenersRef = useRef(new Map());

  // Connect to WebSocket when user and company are available
  useEffect(() => {
    if (user && selectedCompany) {
      const token = getCookie('accessToken');
      if (token) {
        websocketService.connect(token, selectedCompany._id);
      }
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive for other components
    };
  }, [user, selectedCompany]);

  // Switch company when selected company changes
  useEffect(() => {
    if (selectedCompany && websocketService.isSocketConnected()) {
      websocketService.switchCompany(selectedCompany._id);
    }
  }, [selectedCompany]);

  // Register event listeners
  useEffect(() => {
    events.forEach(({ event, handler }) => {
      if (typeof handler !== 'function') {
        console.warn(`WebSocket handler for event "${event}" is not a function`);
        return;
      }

      // Remove previous listener if exists
      const previousHandler = listenersRef.current.get(event);
      if (previousHandler) {
        websocketService.off(event, previousHandler);
      }

      // Add new listener
      websocketService.on(event, handler);
      listenersRef.current.set(event, handler);
    });

    // Cleanup function
    return () => {
      events.forEach(({ event }) => {
        const handler = listenersRef.current.get(event);
        if (handler) {
          websocketService.off(event, handler);
          listenersRef.current.delete(event);
        }
      });
    };
  }, [events, ...dependencies]);

  // Memoized utilities
  const emit = useCallback((event, data) => {
    websocketService.emit(event, data);
  }, []);

  const subscribeToProcessing = useCallback((requestId) => {
    websocketService.subscribeToProcessing(requestId);
  }, []);

  const unsubscribeFromProcessing = useCallback((requestId) => {
    websocketService.unsubscribeFromProcessing(requestId);
  }, []);

  const isConnected = useCallback(() => {
    return websocketService.isSocketConnected();
  }, []);

  return {
    emit,
    subscribeToProcessing,
    unsubscribeFromProcessing,
    isConnected,
    currentCompanyId: selectedCompany?._id
  };
}

/**
 * Hook specifically for document processing events
 * @param {Object} callbacks - Callback functions for different events
 * @returns {Object} Document processing utilities
 */
export function useDocumentProcessing(callbacks = {}) {
  const {
    onDocumentUploaded,
    onDocumentProcessing,
    onDocumentProcessed,
    onDocumentProcessingFailed,
    onMatchingComplete
  } = callbacks;

  const events = [
    { event: 'documentUploaded', handler: onDocumentUploaded },
    { event: 'documentProcessing', handler: onDocumentProcessing },
    { event: 'documentProcessed', handler: onDocumentProcessed },
    { event: 'documentProcessingFailed', handler: onDocumentProcessingFailed },
    { event: 'matchingComplete', handler: onMatchingComplete }
  ].filter(({ handler }) => typeof handler === 'function');

  const websocket = useWebSocket(events, [
    onDocumentUploaded,
    onDocumentProcessing,
    onDocumentProcessed,
    onDocumentProcessingFailed,
    onMatchingComplete
  ]);

  return websocket;
}

/**
 * Hook for processing status updates with automatic subscription
 * @param {string} requestId - Request ID to monitor
 * @param {function} onStatusUpdate - Callback for status updates
 * @returns {Object} Processing utilities
 */
export function useProcessingStatus(requestId, onStatusUpdate) {
  const websocket = useWebSocket(
    [{ event: 'processingStatus', handler: onStatusUpdate }],
    [onStatusUpdate]
  );

  useEffect(() => {
    if (requestId && websocket.isConnected()) {
      websocket.subscribeToProcessing(requestId);

      return () => {
        websocket.unsubscribeFromProcessing(requestId);
      };
    }
  }, [requestId, websocket]);

  return websocket;
}