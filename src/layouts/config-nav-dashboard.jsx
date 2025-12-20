import { paths } from 'src/routes/paths';
import {
  MdDashboard,
  MdFolder,
  MdAssessment,
  MdSyncAlt,
  MdChat,
  MdLabel,
  MdCompareArrows,
  MdAccountBalance,
  MdShowChart,
  MdMail,
  MdAttachMoney,
  MdCreditCard,
  MdReceipt,
  MdDescription,
  MdSettings,
  MdExtension,
  MdSchool,
  MdRequestQuote,
  MdAutorenew,
  MdDeviceHub,
  MdCardMembership,
  MdGroups,
  MdAccountBalanceWallet,
} from 'react-icons/md';

export const navData = [
  {
    subheader: 'Overview',
    items: [
      { title: 'Dashboard', path: paths.dashboard.root, icon: <MdDashboard /> },
      { title: 'Document Vault', path: paths.dashboard.document_vault, icon: <MdFolder /> },
      { title: 'Reports', path: paths.dashboard.reports, icon: <MdAssessment /> },
      { title: 'Transactions', path: paths.dashboard.transactions, icon: <MdSyncAlt /> },
      { title: 'Chat With Books', path: paths.dashboard.chat_books, icon: <MdChat /> },
      { title: 'Pending Items', path: paths.dashboard.pending_items, icon: <MdLabel /> },
      { title: 'Matching', path: paths.dashboard.matching, icon: <MdCompareArrows /> },
      { title: 'Reconciliation', path: paths.dashboard.reconciliation, icon: <MdAutorenew /> },
      { title: 'P & L Statement', path: paths.dashboard.pl_statement, icon: <MdShowChart /> },
      { title: 'Msg My Bookkeeper', path: paths.dashboard.msg_bookeeper, icon: <MdMail /> },
      { title: 'Cash', path: paths.dashboard.cash_accounts.root, icon: <MdAttachMoney /> },
      {
        title: 'Bank', icon: <MdAccountBalance />,
        path: paths.dashboard.bank_statements.root,
        children: [
          { title: 'View', path: paths.dashboard.bank_statements.view },
          { title: 'Upload', path: paths.dashboard.bank_statements.upload },
          { title: 'Download', path: paths.dashboard.bank_statements.download },
        ],
      },
      {
        title: 'Card', icon: <MdCreditCard />,
        path: paths.dashboard.card_statements.root,
        children: [
          { title: 'View', path: paths.dashboard.card_statements.view },
          { title: 'Upload', path: paths.dashboard.card_statements.upload },
          { title: 'Download', path: paths.dashboard.card_statements.download },
        ],
      },
      {
        title: 'Invoices', icon: <MdRequestQuote />,
        path: paths.dashboard.invoices.root,
        children: [
          { title: 'View', path: paths.dashboard.invoices.view },
          { title: 'Upload', path: paths.dashboard.invoices.upload },
          { title: 'Download', path: paths.dashboard.invoices.download },
        ],
      },
      {
        title: 'Bills', icon: <MdDescription />,
        path: paths.dashboard.bills.root,
        children: [
          { title: 'View', path: paths.dashboard.bills.view },
          { title: 'Upload', path: paths.dashboard.bills.upload },
          { title: 'Download', path: paths.dashboard.bills.download },
        ],
      },
      {
        title: 'Receipts', icon: <MdReceipt />,
        path: paths.dashboard.receipts.root,
        children: [
          { title: 'View', path: paths.dashboard.receipts.view },
          { title: 'Upload', path: paths.dashboard.receipts.upload },
          { title: 'Download', path: paths.dashboard.receipts.download },
        ],
      },
    ],
  },
  {
    subheader: 'Settings',
    items: [
      { title: 'Accounts Management', path: paths.dashboard.accounts_management, icon: <MdAccountBalanceWallet /> },
      { title: 'Automation Hub', path: paths.dashboard.automation_hub, icon: <MdDeviceHub /> },
      { title: 'Integrations', path: paths.dashboard.integrations, icon: <MdExtension /> },
      { title: 'Users & Collaborators', path: paths.dashboard.collaborate, icon: <MdGroups /> },
      { title: 'Subscription Plans', path: paths.dashboard.subscription, icon: <MdCardMembership /> },
      { title: 'Education & Support', path: paths.dashboard.support, icon: <MdSchool /> },
      { title: 'Settings', path: paths.dashboard.settings, icon: <MdSettings /> },
    ],
  },
];