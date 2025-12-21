'use client';

import axios, { endpoints } from 'src/utils/axios';

import { setSession, removeTokens, getRefreshToken } from './utils';

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }) => {
  try {
    const params = { email, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    const { tokens, user, companies } = res.data.data;

    if (!tokens?.accessToken) {
      throw new Error('Access token not found in response');
    }

    await setSession(tokens.accessToken, tokens.refreshToken);

    // Immediately switch to the first company (or preferred logic)
    if (companies && companies.length > 0) {
      await switchCompany({ companyId: companies[0]._id });
    }

    return { user, companies, tokens };
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ 
  email, 
  password, 
  firstName, 
  lastName, 
  phone, 
  companyName, 
  companyType, 
  companySize 
}) => {
  const params = {
    email,
    password,
    firstName,
    lastName,
    phone,
    companyName,
    companyType,
    companySize,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { user, company } = res.data.data;

    // Note: User needs to verify email before they can sign in
    // So we don't set session tokens here
    return { user, company };
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    // Call logout endpoint to invalidate tokens on server
    await axios.post(endpoints.auth.signOut);
  } catch (error) {
    // Continue with local logout even if server call fails
    console.error('Error during server logout:', error);
  } finally {
    await setSession(null);
  }
};

/** **************************************
 * Refresh token
 *************************************** */
export const refreshToken = async () => {
  try {
    const refreshTokenValue = getRefreshToken();

    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    const res = await axios.post(endpoints.auth.refreshToken, {
      refreshToken: refreshTokenValue,
    });

    const { tokens } = res.data.data;

    if (!tokens?.accessToken) {
      throw new Error('Access token not found in refresh response');
    }

    await setSession(tokens.accessToken, tokens.refreshToken);

    return tokens;
  } catch (error) {
    console.error('Error during token refresh:', error);
    removeTokens();
    throw error;
  }
};

/** **************************************
 * Forgot password
 *************************************** */
export const forgotPassword = async ({ email }) => {
  try {
    const res = await axios.post(endpoints.auth.forgotPassword, { email });
    return res.data;
  } catch (error) {
    console.error('Error during forgot password:', error);
    throw error;
  }
};

/** **************************************
 * Reset password
 *************************************** */
export const resetPassword = async ({ token, password }) => {
  try {
    const res = await axios.post(`${endpoints.auth.resetPassword}/${token}`, { password });
    return res.data;
  } catch (error) {
    console.error('Error during reset password:', error);
    throw error;
  }
};

/** **************************************
 * Verify email
 *************************************** */
export const verifyEmail = async ({ token }) => {
  try {
    const res = await axios.get(`${endpoints.auth.verifyEmail}/${token}`);
    return res.data;
  } catch (error) {
    console.error('Error during email verification:', error);
    throw error;
  }
};

/** **************************************
 * Switch company
 *************************************** */
export const switchCompany = async ({ companyId }) => {
  try {
    const res = await axios.post(endpoints.auth.switchCompany, { companyId });

    const { tokens, company } = res.data.data;

    if (!tokens?.accessToken) {
      throw new Error('Access token not found in response');
    }

    await setSession(tokens.accessToken, tokens.refreshToken);
    localStorage.setItem('selectedCompany', JSON.stringify(company));
    return { company, tokens };
  } catch (error) {
    console.error('Error during company switch:', error);
    throw error;
  }
};
