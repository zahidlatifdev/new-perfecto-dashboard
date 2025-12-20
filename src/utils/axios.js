import axios from 'axios';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

// Helper function to get cookie value
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

// Helper function to set cookie
const setCookie = (name, value, days = 7) => {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
};

// Helper function to remove cookie
const removeCookie = (name) => {
  if (typeof document === 'undefined') return;

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

const axiosInstance = axios.create({ baseURL: CONFIG.site.serverUrl });

// Request interceptor to add auth token and company ID
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add company ID from localStorage to all requests
    const selectedCompany = localStorage.getItem('selectedCompany');
    if (selectedCompany) {
      try {
        const company = JSON.parse(selectedCompany);
        if (company && company._id) {
          // Add companyId as custom header
          config.headers['X-Company-Id'] = company._id;

          // Also add to query params if not already present (for GET requests)
          if (config.method === 'get' && !config.params?.companyId) {
            config.params = config.params || {};
            config.params.companyId = company._id;
          }

          // Add to request body if not already present (for POST/PUT requests)
          if (
            ['post', 'put', 'patch'].includes(config.method) &&
            config.data &&
            typeof config.data === 'object' &&
            !config.data.companyId
          ) {
            config.data.companyId = company._id;
          }
        }
      } catch (error) {
        console.warn('Failed to parse selectedCompany from localStorage:', error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getCookie('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${CONFIG.site.serverUrl}/api/v1/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

          setCookie('accessToken', accessToken);
          if (newRefreshToken) {
            setCookie('refreshToken', newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        removeCookie('accessToken');
        removeCookie('refreshToken');
        window.location.href = '/auth/sign-in';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject((error.response && error.response.data) || 'Something went wrong!');
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/api/v1/auth/profile',
    signIn: '/api/v1/auth/login',
    signUp: '/api/v1/auth/register',
    signOut: '/api/v1/auth/logout',
    refreshToken: '/api/v1/auth/refresh-token',
    forgotPassword: '/api/v1/auth/forgot-password',
    resetPassword: '/api/v1/auth/reset-password',
    verifyEmail: '/api/v1/auth/verify-email',
    switchCompany: '/api/v1/auth/switch-company',
  },
  company: {
    list: '/api/v1/companies',
    create: '/api/v1/companies',
    details: (id) => `/api/v1/companies/${id}`,
    update: (id) => `/api/v1/companies/${id}`,
    delete: (id) => `/api/v1/companies/${id}`,
    users: (id) => `/api/v1/companies/${id}/users`,
    inviteUser: (id) => `/api/v1/companies/${id}/users/invite`,
    updateUserRole: (id, userId) => `/api/v1/companies/${id}/users/${userId}/role`,
    removeUser: (id, userId) => `/api/v1/companies/${id}/users/${userId}`,
    stats: (id) => `/api/v1/companies/${id}/stats`,
    migratePermissions: (id) => `/api/v1/companies/${id}/migrate-permissions`,
  },
  invitations: {
    company: (id) => `/api/v1/invitations/company/${id}`,
    send: (id) => `/api/v1/invitations/company/${id}/send`,
    userPending: '/api/v1/invitations/user/pending',
    accept: (token) => `/api/v1/invitations/accept/${token}`,
    reject: (token) => `/api/v1/invitations/reject/${token}`,
    resend: (id) => `/api/v1/invitations/${id}/resend`,
    cancel: (id) => `/api/v1/invitations/${id}/cancel`,
  },
  user: {
    profile: '/api/v1/users/profile',
    updateProfile: '/api/v1/users/profile',
    updatePreferences: '/api/v1/users/preferences',
    changePassword: '/api/v1/users/change-password',
  },
  documents: {
    list: '/api/v1/documents/documents',
    bank: '/api/v1/documents/document-bank',
    get: (id) => `/api/v1/documents/documents/${id}`,
    update: (id) => `/api/v1/documents/documents/${id}`,
    delete: (id) => `/api/v1/documents/documents/${id}`,
    reprocess: (id) => `/api/v1/documents/documents/${id}/reprocess`,
    findSimilarItems: (id) => `/api/v1/documents/documents/${id}/items/similar`,
    updateSimilarItemCategories: (id) =>
      `/api/v1/documents/documents/${id}/items/update-similar-categories`,
    updateItemCategory: (id) => `/api/v1/documents/documents/${id}/items/update-category`,

    statements: {
      list: '/api/v1/documents/statements',
      get: (id) => `/api/v1/documents/statements/${id}`,
      delete: (id) => `/api/v1/documents/statements/${id}`,
      reprocess: (id) => `/api/v1/documents/statements/${id}/reprocess`,
    },

    upload: {
      statement: '/api/v1/documents/upload/statements',
      document: '/api/v1/documents/upload/documents',
    },
  },
  transactions: {
    list: '/api/v1/transactions',
    create: '/api/v1/transactions',
    get: (id) => `/api/v1/transactions/${id}`,
    update: (id) => `/api/v1/transactions/${id}`,
    delete: (id) => `/api/v1/transactions/${id}`,
    import: '/api/v1/transactions/import',
    stats: '/api/v1/transactions/stats',
    liabilities: '/api/v1/transactions/liabilities',
    match: (id) => `/api/v1/transactions/${id}/match`,
    findSimilar: (id) => `/api/v1/transactions/${id}/similar`,
    updateSimilarCategories: (id) => `/api/v1/transactions/${id}/update-similar-categories`,
  },
  bankAccounts: {
    list: '/api/v1/bank-accounts',
    create: '/api/v1/bank-accounts',
    get: (id) => `/api/v1/bank-accounts/${id}`,
    update: (id) => `/api/v1/bank-accounts/${id}`,
    delete: (id) => `/api/v1/bank-accounts/${id}`,
  },
  creditCards: {
    list: '/api/v1/credit-cards',
    create: '/api/v1/credit-cards',
    get: (id) => `/api/v1/credit-cards/${id}`,
    update: (id) => `/api/v1/credit-cards/${id}`,
    delete: (id) => `/api/v1/credit-cards/${id}`,
  },
  cashAccounts: {
    list: '/api/v1/cash-accounts',
    create: '/api/v1/cash-accounts',
    get: (id) => `/api/v1/cash-accounts/${id}`,
    update: (id) => `/api/v1/cash-accounts/${id}`,
    delete: (id) => `/api/v1/cash-accounts/${id}`,
    addTransaction: (id) => `/api/v1/cash-accounts/${id}/transactions`,
    transactions: (id) => `/api/v1/cash-accounts/${id}/transactions`,
    balance: (id) => `/api/v1/cash-accounts/${id}/balance`,
  },
  matching: {
    list: '/api/v1/matching',
    debug: '/api/v1/matching/debug',
    testMatch: '/api/v1/matching/test-match',
    transaction: (id) => `/api/v1/matching/transactions/${id}`,
    document: (id) => `/api/v1/matching/documents/${id}`,
    unmatchedDocuments: '/api/v1/matching/unmatched-documents',
    unmatchedTransactions: '/api/v1/matching/unmatched-transactions',
    statistics: '/api/v1/matching/statistics',
    validate: '/api/v1/matching/validate',
    apply: '/api/v1/matching/apply',
    remove: '/api/v1/matching/remove',
    bulkMatch: '/api/v1/matching/bulk-match',
    toggleAutoMatching: '/api/v1/matching/toggle-auto-matching',
    batchAutoMatch: '/api/v1/matching/batch-auto-match',
    linkCreditCard: '/api/v1/matching/link-credit-card',
    updateCreditCardAdjustment: '/api/v1/matching/update-credit-card-adjustment',
    unlinkCreditCard: '/api/v1/matching/unlink-credit-card',
    creditCardLinks: (statementId) => `/api/v1/matching/credit-card-links/${statementId}`,
  },
  chat: {
    list: '/api/v1/chat',
    create: '/api/v1/chat',
    get: (id) => `/api/v1/chat/${id}`,
    search: '/api/v1/chat/search',
    update: (id) => `/api/v1/chat/${id}`,
    delete: (id) => `/api/v1/chat/${id}`,
    sendMessage: (id) => `/api/v1/chat/${id}/messages`,
  },
  categories: {
    list: '/api/v1/categories',
    createCustom: '/api/v1/categories/custom',
    delete: '/api/v1/categories/delete',
  },
  dashboard: {
    stats: '/api/v1/dashboard/stats',
  },
  plStatement: {
    get: '/api/v1/pl-statement',
  },
};

// Export cookie utilities for use in other files
export { getCookie, setCookie, removeCookie };
