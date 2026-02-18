'use client';

import { useMemo, useEffect, useCallback } from 'react';

import { useSetState } from 'src/hooks/use-set-state';

import axios, { endpoints } from 'src/utils/axios';
import { getCookie } from 'src/utils/axios';

import { STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken } from './utils';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    company: null, // Selected company (with role)
    companies: [], // All companies the user belongs to
    loading: true,
  });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = getCookie(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const res = await axios.get(endpoints.auth.me);

        // Backend returns: { user, companies, selectedCompany }
        const { user, companies, selectedCompany } = res.data.data;

        setState({
          user,
          company: selectedCompany,
          companies: companies || [],
          loading: false
        });
      } else {
        setState({
          user: null,
          company: null,
          companies: [],
          loading: false
        });
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setState({
        user: null,
        company: null,
        companies: [],
        loading: false
      });
    }
  }, [setState]);

  // Keep switchCompany for future multi-company support
  // Currently, users only have one company
  const switchCompany = useCallback(async (companyId) => {
    try {
      const { switchCompany: switchCompanyAction } = await import('./action');
      const { company } = await switchCompanyAction({ companyId });

      // Update state with new company
      setState(prev => ({
        ...prev,
        company
      }));

      // Refresh session to get updated user data
      await checkUserSession();

    } catch (error) {
      console.error('Company switch failed:', error);
      throw error;
    }
  }, [checkUserSession, setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const signIn = useCallback(async (email, password) => {
    const { signInWithPassword } = await import('./action');
    const data = await signInWithPassword({ email, password });
    await checkUserSession();
    return data;
  }, [checkUserSession]);

  const signUp = useCallback(async (
    email,
    password,
    firstName,
    lastName,
    phone,
    companyName,
    companyType,
    companySize
  ) => {
    const { signUp: signUpAction } = await import('./action');
    return signUpAction({
      email,
      password,
      firstName,
      lastName,
      phone,
      companyName,
      companyType,
      companySize
    });
  }, []);

  const signOut = useCallback(async () => {
    const { signOut: signOutAction } = await import('./action');
    await signOutAction();
    setState({
      user: null,
      company: null,
      loading: false,
    });
  }, [setState]);

  const verifyEmail = useCallback(async (email, code) => {
    const { verifyEmail: verifyEmailAction } = await import('./action');
    const data = await verifyEmailAction({ email, code });
    // Refresh session so the context picks up the new authenticated state
    await checkUserSession();
    return data;
  }, [checkUserSession]);

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
          ...state.user,
          // Add role from company context
          role: state.company?.role ?? 'user',
        }
        : null,
      company: state.company, // Selected company
      selectedCompany: state.company, // Alias for backward compatibility
      companies: state.companies, // All companies for workspace switching
      checkUserSession,
      switchCompany,
      signIn,
      signUp,
      signOut,
      verifyEmail,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [
      checkUserSession,
      switchCompany,
      signIn,
      signUp,
      signOut,
      verifyEmail,
      state.user,
      state.company,
      state.companies,
      status
    ]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
