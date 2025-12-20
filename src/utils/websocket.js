import { io } from 'socket.io-client';
import { CONFIG } from 'src/config-global';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentCompanyId = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  /**
   * Connect to WebSocket server
   * @param {string} token - JWT token for authentication
   * @param {string} companyId - Current company ID
   */
  connect(token, companyId) {
    if (this.socket && this.isConnected) {
      return;
    }

    try {
      this.socket = io(CONFIG.site.serverUrl, {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        autoConnect: true
      });

      this.currentCompanyId = companyId;
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentCompanyId = null;
    }
  }

  /**
   * Switch to a different company
   * @param {string} companyId - New company ID
   */
  switchCompany(companyId) {
    if (this.socket && this.isConnected && companyId !== this.currentCompanyId) {
      this.socket.emit('switch_company', companyId);
      this.currentCompanyId = companyId;
    }
  }

  /**
   * Subscribe to processing updates for a specific request
   * @param {string} requestId - Request ID to monitor
   */
  subscribeToProcessing(requestId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_processing', requestId);
    }
  }

  /**
   * Unsubscribe from processing updates
   * @param {string} requestId - Request ID to stop monitoring
   */
  unsubscribeFromProcessing(requestId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('unsubscribe_processing', requestId);
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // If socket is already connected, add the listener immediately
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function to remove
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);

      if (this.socket) {
        this.socket.off(event, callback);
      }
    }
  }

  /**
   * Setup internal event listeners for connection management
   */
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000; // Reset delay

      // Switch to current company if set
      if (this.currentCompanyId) {
        this.switchCompany(this.currentCompanyId);
      }

      // Re-register all listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.on(event, callback);
        });
      });
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;

      // Auto-reconnect for certain reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't auto-reconnect
        return;
      }

      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    // Document processing events
    this.socket.on('documentUploaded', (data) => {
      console.log('Document uploaded:', data);
    });

    this.socket.on('documentProcessing', (data) => {
      console.log('Document processing started:', data);
    });

    this.socket.on('documentProcessed', (data) => {
      console.log('Document processed successfully:', data);
    });

    this.socket.on('documentProcessingFailed', (data) => {
      console.error('Document processing failed:', data);
    });

    // Transaction events
    this.socket.on('transactionCreated', (data) => {
      console.log('Transaction created:', data);
    });

    this.socket.on('transactionUpdated', (data) => {
      console.log('Transaction updated:', data);
    });

    this.socket.on('transactionMatched', (data) => {
      console.log('Transaction matched:', data);
    });

    this.socket.on('transactionsImported', (data) => {
      console.log('Transactions imported:', data);
    });

    // Matching events
    this.socket.on('matchingComplete', (data) => {
      console.log('Matching completed:', data);
    });

    // Processing status updates
    this.socket.on('processingStatus', (data) => {
      console.log('Processing status update:', data);
    });
  }

  /**
   * Handle reconnection logic
   */
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

    setTimeout(() => {
      if (this.socket && !this.isConnected) {
        this.socket.connect();
      }
    }, delay);
  }

  /**
   * Get connection status
   * @returns {boolean} Connection status
   */
  isSocketConnected() {
    return this.isConnected;
  }

  /**
   * Get current company ID
   * @returns {string|null} Current company ID
   */
  getCurrentCompanyId() {
    return this.currentCompanyId;
  }

  /**
   * Emit custom event
   * @param {string} event - Event name
   * @param {*} data - Data to send
   */
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Cannot emit event: WebSocket not connected');
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;