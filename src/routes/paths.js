// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/sign-in`,
      signUp: `${ROOTS.AUTH}/sign-up`,
      forgotPassword: `${ROOTS.AUTH}/forgot-password`,
      resetPassword: `${ROOTS.AUTH}/reset-password`,
      verifyEmail: `${ROOTS.AUTH}/verify-email`,
      connectAccount: `${ROOTS.AUTH}/connect-account`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    chat: `${ROOTS.DASHBOARD}/chat`,
    reports: `${ROOTS.DASHBOARD}/reports`,
    accounts: `${ROOTS.DASHBOARD}/accounts`,
    transactions: `${ROOTS.DASHBOARD}/transactions`,
    dealScout: `${ROOTS.DASHBOARD}/deal-scout`,
    locker: `${ROOTS.DASHBOARD}/locker`,
    funFacts: `${ROOTS.DASHBOARD}/fun-facts`,
    team: `${ROOTS.DASHBOARD}/team`,
    company: `${ROOTS.DASHBOARD}/company`,
    settings: `${ROOTS.DASHBOARD}/settings`,
  },
};
