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

  const { authenticated, loading, user, companies, selectedCompany } = useAuthContext();

  const [isChecking, setIsChecking] = useState(true);

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const normalizePath = (path) => path.replace(/\/+$/, '');

  const checkPermissions = () => {
    if (loading) return;

    if (!authenticated) {
      const { method } = CONFIG.auth;
      const signInPath = {
        jwt: paths.auth.jwt.signIn,
      }[method];
      const href = `${signInPath}?${createQueryString('returnTo', pathname)}`;
      router.replace(href);
      return;
    }

    // If user has no companies, redirect to company creation page (settings with create param)
    if (
      authenticated &&
      user &&
      (!companies || companies.length === 0)
    ) {
      // Redirect to company creation tab in settings (add &create=1 to trigger creation UI if needed)
      router.replace(paths.dashboard.settings + '?tab=companies&create=1');
      return;
    }

    // If user has companies but no company is selected and not on select company page
    if (
      authenticated &&
      user &&
      companies?.length > 0 &&
      !selectedCompany &&
      normalizePath(pathname) !== normalizePath(paths.dashboard.selectCompany)
    ) {
      router.replace(paths.dashboard.selectCompany);
      return;
    }

    // If user is on select company page or settings page, allow rendering
    if (
      authenticated &&
      user &&
      (normalizePath(pathname) === normalizePath(paths.dashboard.selectCompany) ||
        pathname.startsWith('/dashboard/settings'))
    ) {
      setIsChecking(false);
      return;
    }

    // If user has a selected company and is trying to access select company page, redirect to dashboard
    if (
      authenticated &&
      user &&
      selectedCompany &&
      normalizePath(pathname) === normalizePath(paths.dashboard.selectCompany)
    ) {
      router.replace(paths.dashboard.root);
      return;
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading, companies, selectedCompany, pathname]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
