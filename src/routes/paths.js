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
  // Invitations
  invitation: {
    accept: (token) => `/invitation/accept/${token}`,
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    bookkeeping: `${ROOTS.DASHBOARD}/bookkeeping`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    reports: `${ROOTS.DASHBOARD}/reports`,
    forecasting: `${ROOTS.DASHBOARD}/forecasting`,
    saving: `${ROOTS.DASHBOARD}/saving`,
    simulator: `${ROOTS.DASHBOARD}/simulator`,
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
