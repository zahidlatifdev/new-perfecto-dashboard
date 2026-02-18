import { AuthCenteredLayout } from 'src/layouts/auth-centered';

// GuestGuard is intentionally omitted here: the sign-up flow authenticates
// the user mid-way (after email verification in step 2) and then shows the
// Plaid connection step (step 3) — a GuestGuard would redirect the newly
// authenticated user away before they finish step 3.
// The CenteredSignUpView component handles the "already logged in" redirect.

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return <AuthCenteredLayout sx={{ '--layout-auth-content-width': '520px' }}>
    {children}
  </AuthCenteredLayout>;
}
