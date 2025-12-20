'use client';

import { useMemo, useEffect, useCallback } from 'react';

import { useSetState } from 'src/hooks/use-set-state';

import axios, { endpoints } from 'src/utils/axios';
import { getCookie } from 'src/utils/axios';

import { STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken, jwtDecode } from './utils';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    companies: [],
    selectedCompany: null,
    loading: true,
  });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = getCookie(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const res = await axios.get(endpoints.auth.me);

        // Handle the API response structure
        const { user, companies } = res.data.data;

        // Extract company context from JWT token
        const decodedToken = jwtDecode(accessToken);
        let selectedCompany = null;

        if (decodedToken?.companyId && companies?.length > 0) {
          selectedCompany = companies.find(company =>
            company._id.toString() === decodedToken.companyId.toString()
          );

          // If selected company found, get user's role in that company
          if (selectedCompany) {
            const userInCompany = selectedCompany.users?.find(u =>
              u.userId._id?.toString() === user._id.toString() ||
              u.userId.toString() === user._id.toString()
            );
            if (userInCompany) {
              selectedCompany.userRole = userInCompany.role;
              selectedCompany.userPermissions = userInCompany.permissions;
            }
          }
        }

        setState({
          user,
          companies,
          selectedCompany,
          loading: false
        });
      } else {
        setState({
          user: null,
          companies: [],
          selectedCompany: null,
          loading: false
        });
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setState({
        user: null,
        companies: [],
        selectedCompany: null,
        loading: false
      });
    }
  }, [setState]);

  const switchCompany = useCallback(async (companyId) => {
    try {
      const res = await axios.post(endpoints.auth.switchCompany, { companyId });

      const { accessToken } = res.data.data.tokens;
      setSession(accessToken);
      localStorage.setItem('selectedCompany', JSON.stringify(res.data.data.company));

      await checkUserSession();

    } catch (error) {
      console.error('Company switch failed:', error);
      throw error;
    }
  }, [checkUserSession]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
          ...state.user,
          role: state.selectedCompany?.userRole ?? 'user',
          permissions: state.selectedCompany?.userPermissions ?? {},
        }
        : null,
      companies: state.companies,
      selectedCompany: state.selectedCompany,
      checkUserSession,
      switchCompany,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, switchCompany, state.user, state.companies, state.selectedCompany, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}