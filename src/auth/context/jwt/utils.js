import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';
import { getCookie, setCookie, removeCookie } from 'src/utils/axios';

import { STORAGE_KEY, REFRESH_TOKEN_KEY } from './constant';

// ----------------------------------------------------------------------

export function jwtDecode(token) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid token!');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    if (!decoded || !('exp' in decoded)) {
      return false;
    }

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}

// ----------------------------------------------------------------------

export function tokenExpired(exp) {
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  setTimeout(() => {
    try {
      alert('Token expired!');
      removeTokens();
      window.location.href = paths.auth.jwt.signIn;
    } catch (error) {
      console.error('Error during token expiration:', error);
      throw error;
    }
  }, timeLeft);
}

// ----------------------------------------------------------------------

export function removeTokens() {
  removeCookie(STORAGE_KEY);
  removeCookie(REFRESH_TOKEN_KEY);
  delete axios.defaults.headers.common.Authorization;
}

// ----------------------------------------------------------------------

export async function setSession(accessToken, refreshToken = null) {
  try {
    if (accessToken) {
      setCookie(STORAGE_KEY, accessToken);

      if (refreshToken) {
        setCookie(REFRESH_TOKEN_KEY, refreshToken);
      }

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const decodedToken = jwtDecode(accessToken);

      if (decodedToken && 'exp' in decodedToken) {
        tokenExpired(decodedToken.exp);
      } else {
        throw new Error('Invalid access token!');
      }
    } else {
      removeTokens();
    }
  } catch (error) {
    console.error('Error during set session:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export function getRefreshToken() {
  return getCookie(REFRESH_TOKEN_KEY);
}

// ----------------------------------------------------------------------

export function getAccessToken() {
  return getCookie(STORAGE_KEY);
}