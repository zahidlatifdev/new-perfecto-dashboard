'use client';

import axios, { endpoints } from 'src/utils/axios';

import { setSession, removeTokens } from './utils';

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }) => {
  try {
    const params = { email, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    // Backend returns: { user, companies, selectedCompany, token }
    const { token, user, companies, selectedCompany } = res.data.data;

    if (!token) {
      throw new Error('Access token not found in response');
    }

    // Set session with only access token (no refresh token)
    await setSession(token);

    // Store selected company in localStorage
    if (selectedCompany) {
      localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
    } else if (companies && companies.length > 0) {
      // Fallback: if no selectedCompany but has companies, use first one
      localStorage.setItem('selectedCompany', JSON.stringify(companies[0]));
    }

    return { user, companies, selectedCompany };
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
  companySize,
  skipCompanyCreation = false
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
    skipCompanyCreation,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    // Backend returns: { user, company }
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
    // Call logout endpoint to invalidate session on server
    await axios.post(endpoints.auth.signOut);
  } catch (error) {
    // Continue with local logout even if server call fails
    console.error('Error during server logout:', error);
  } finally {
    // Clear all session data
    removeTokens();
    localStorage.removeItem('selectedCompany');
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
 * Verify email with code
 *************************************** */
export const verifyEmail = async ({ email, code }) => {
  try {
    const res = await axios.post(endpoints.auth.verifyEmail, { email, code });
    return res.data;
  } catch (error) {
    console.error('Error during email verification:', error);
    throw error;
  }
};

/** **************************************
 * Switch company (kept for future multi-company support)
 * Currently simplified for single company per user
 *************************************** */
export const switchCompany = async ({ companyId }) => {
  try {
    const res = await axios.post(endpoints.auth.switchCompany, { companyId });

    // Backend returns: { company, token }
    const { token, company } = res.data.data;

    if (!token) {
      throw new Error('Access token not found in response');
    }

    // Set new session with new token
    await setSession(token);

    // Update selected company in localStorage
    localStorage.setItem('selectedCompany', JSON.stringify(company));

    return { company };
  } catch (error) {
    console.error('Error during company switch:', error);
    throw error;
  }
};
