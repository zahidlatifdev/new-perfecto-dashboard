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
    ],
  },
  {
    subheader: 'Settings',
    items: [
      { title: 'Accounts Management', path: paths.dashboard.accounts_management, icon: <MdAccountBalanceWallet /> },
      { title: 'Integrations', path: paths.dashboard.integrations, icon: <MdExtension /> },
      { title: 'Users & Collaborators', path: paths.dashboard.collaborate, icon: <MdGroups /> },
      { title: 'Settings', path: paths.dashboard.settings, icon: <MdSettings /> },
    ],
  },
];