'use client';

import { useState, useEffect, useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname, useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

export function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { authenticated, loading, user, company } = useAuthContext();

  const [isChecking, setIsChecking] = useState(true);

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const checkPermissions = () => {
    if (loading) return;

    // Not authenticated - redirect to login
    if (!authenticated) {
      const { method } = CONFIG.auth;
      const signInPath = {
        jwt: paths.auth.jwt.signIn,
      }[method];
      const href = `${signInPath}?${createQueryString('returnTo', pathname)}`;
      router.replace(href);
      return;
    }

    // Authenticated but no company - shouldn't happen in signup flow
    // but handle gracefully by redirecting to settings
    if (authenticated && user && !company) {
      console.warn('User authenticated but no company found');
      router.replace(paths.dashboard.settings);
      return;
    }

    // All checks passed - allow access
    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading, company, pathname]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
