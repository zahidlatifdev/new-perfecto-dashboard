// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/sign-in`,
      signUp: `${ROOTS.AUTH}/sign-up`,
      forgotPassword: `${ROOTS.AUTH}/forgot-password`,
      resetPassword: `${ROOTS.AUTH}/reset-password`,
      verifyEmail: `${ROOTS.AUTH}/verify-email`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    selectCompany: `${ROOTS.DASHBOARD}/select-company`,
    pending_items: `${ROOTS.DASHBOARD}/pending-items`,
    chat_books: `${ROOTS.DASHBOARD}/chat-books`,
    transactions: `${ROOTS.DASHBOARD}/transactions`,
    general_ledger: `${ROOTS.DASHBOARD}/general-ledger`,
    matching: `${ROOTS.DASHBOARD}/matching`,
    reconciliation: `${ROOTS.DASHBOARD}/reconciliation`,

    bank_statements: {
      root: `${ROOTS.DASHBOARD}/bank-statements`,
      upload: `${ROOTS.DASHBOARD}/bank-statements/upload`,
      view: `${ROOTS.DASHBOARD}/bank-statements/view`,
      download: `${ROOTS.DASHBOARD}/bank-statements/download`,
      transactions: (id) => `${ROOTS.DASHBOARD}/bank-statements/${id}/transactions`,
    },

    card_statements: {
      root: `${ROOTS.DASHBOARD}/card-statements`,
      upload: `${ROOTS.DASHBOARD}/card-statements/upload`,
      view: `${ROOTS.DASHBOARD}/card-statements/view`,
      download: `${ROOTS.DASHBOARD}/card-statements/download`,
      transactions: (id) => `${ROOTS.DASHBOARD}/card-statements/${id}/transactions`,
    },

    cash_accounts: {
      root: `${ROOTS.DASHBOARD}/cash-accounts`,
      view: (id) => `${ROOTS.DASHBOARD}/cash-accounts/${id}`,
      transactions: (id) => `${ROOTS.DASHBOARD}/cash-accounts/${id}/transactions`,
      addTransaction: (id) => `${ROOTS.DASHBOARD}/cash-accounts/${id}/add-transaction`,
    },

    receipts: {
      root: `${ROOTS.DASHBOARD}/receipts`,
      upload: `${ROOTS.DASHBOARD}/receipts/upload`,
      view: `${ROOTS.DASHBOARD}/receipts/view`,
      download: `${ROOTS.DASHBOARD}/receipts/download`,
    },

    invoices: {
      root: `${ROOTS.DASHBOARD}/invoices`,
      upload: `${ROOTS.DASHBOARD}/invoices/upload`,
      view: `${ROOTS.DASHBOARD}/invoices/view`,
      download: `${ROOTS.DASHBOARD}/invoices/download`,
    },

    bills: {
      root: `${ROOTS.DASHBOARD}/bills`,
      upload: `${ROOTS.DASHBOARD}/bills/upload`,
      view: `${ROOTS.DASHBOARD}/bills/view`,
      download: `${ROOTS.DASHBOARD}/bills/download`,
    },

    document_vault: `${ROOTS.DASHBOARD}/document-vault`,

    pl_statement: `${ROOTS.DASHBOARD}/pl-statement`,

    reports: `${ROOTS.DASHBOARD}/reports`,
    accounts_management: `${ROOTS.DASHBOARD}/accounts-management`,
    tax_hub: `${ROOTS.DASHBOARD}/tax-hub`,
    automation_hub: `${ROOTS.DASHBOARD}/automation-hub`,
    integrations: `${ROOTS.DASHBOARD}/integrations`,
    subscription: `${ROOTS.DASHBOARD}/subscription`,
    msg_bookeeper: `${ROOTS.DASHBOARD}/msg-bookkeeper`,
    collaborate: `${ROOTS.DASHBOARD}/collaborate`,

    settings: `${ROOTS.DASHBOARD}/settings`,
    support: `${ROOTS.DASHBOARD}/support`,
  },
};