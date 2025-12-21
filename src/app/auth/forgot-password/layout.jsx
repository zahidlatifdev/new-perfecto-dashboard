import { AuthCenteredLayout } from 'src/layouts/auth-centered';

import { GuestGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return (
    <GuestGuard>
      <AuthCenteredLayout section={{ title: 'Forgot your password?' }}>{children}</AuthCenteredLayout>
    </GuestGuard>
  );
}
