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

// Response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401 Unauthorized, clear session and redirect to login
    if (error.response?.status === 401) {
      // Only redirect if not already on auth pages
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        removeCookie('accessToken');
        localStorage.removeItem('selectedCompany');
        window.location.href = '/auth/sign-in';
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
    signOut: '/api/v1/auth/sign-out',
    forgotPassword: '/api/v1/auth/forgot-password',
    resetPassword: '/api/v1/auth/reset-password',
    verifyEmail: '/api/v1/auth/verify-email',
    resendVerification: '/api/v1/auth/resend-verification',
    switchCompany: '/api/v1/auth/switch-company',
  },
  company: {
    list: '/api/v1/companies',
    create: '/api/v1/companies',
    details: (id) => `/api/v1/companies/${id}`,
    update: (id) => `/api/v1/companies/${id}`,
    delete: (id) => `/api/v1/companies/${id}`,
    team: (id) => `/api/v1/companies/${id}/team`,
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
  transactions: {
    list: '/api/v1/transactions',
    create: '/api/v1/transactions',
    get: (id) => `/api/v1/transactions/${id}`,
    update: (id) => `/api/v1/transactions/${id}`,
    delete: (id) => `/api/v1/transactions/${id}`,
    categories: '/api/v1/transactions/categories',
    findSimilar: (id) => `/api/v1/transactions/${id}/similar`,
    updateSimilarCategories: (id) => `/api/v1/transactions/${id}/update-similar-categories`,
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
  plaid: {
    createLinkToken: '/api/v1/plaid/link-token',
    exchangeToken: '/api/v1/plaid/exchange-token',
    accounts: (companyId) => `/api/v1/plaid/accounts/${companyId}`,
    disconnect: (accountId) => `/api/v1/plaid/disconnect/${accountId}`,
    integrations: (companyId) => `/api/v1/plaid/integrations/${companyId}`,
    reauthLinkToken: (accountId) => `/api/v1/plaid/reauth/link-token/${accountId}`,
    completeReauth: (accountId) => `/api/v1/plaid/reauth/complete/${accountId}`,
  },
  accounts: {
    list: '/api/v1/accounts',
    create: '/api/v1/accounts',
    get: (id) => `/api/v1/accounts/${id}`,
    update: (id) => `/api/v1/accounts/${id}`,
    delete: (id) => `/api/v1/accounts/${id}`,
  },
  dealScout: {
    searchDeals: '/api/v1/deal-scout/search-deals',
    searchAlternatives: '/api/v1/deal-scout/search-alternatives',
  },
  documents: {
    list: '/api/v1/documents',
    create: '/api/v1/documents',
    get: (id) => `/api/v1/documents/${id}`,
    update: (id) => `/api/v1/documents/${id}`,
    delete: (id) => `/api/v1/documents/${id}`,
    stats: '/api/v1/documents/stats',
    uploadVersion: (id) => `/api/v1/documents/${id}/versions`,
    download: (id) => `/api/v1/documents/${id}/download`,
  },
  forcast: {
    get: (companyId) => `/api/v1/forecasting/${companyId}`,
  },
  savingScan: {
    get: (companyId) => `/api/v1/savings-scan/${companyId}`,
  },
  simulator: {
    baseline: '/api/v1/simulator/baseline',
    list: '/api/v1/simulator',
    create: '/api/v1/simulator',
    get: (id) => `/api/v1/simulator/${id}`,
    update: (id) => `/api/v1/simulator/${id}`,
    delete: (id) => `/api/v1/simulator/${id}`,
    duplicate: (id) => `/api/v1/simulator/${id}/duplicate`,
    stats: '/api/v1/simulator/stats',
    compare: '/api/v1/simulator/compare',
  },
};

// Export cookie utilities for use in other files
export { getCookie, setCookie, removeCookie };
