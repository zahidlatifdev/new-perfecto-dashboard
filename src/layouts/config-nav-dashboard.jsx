import { paths } from 'src/routes/paths';
import {
  MdDashboard,
  MdAssessment,
  MdChat,
  MdAccountBalanceWallet,
  MdReceipt,
  MdGroups,
  MdBusiness,
  MdSettings,
  MdLock,
} from 'react-icons/md';
import { FaSearchDollar } from 'react-icons/fa';

/**
 * Each nav item includes an optional `module` key that maps to the
 * permission module in src/auth/permissions.js.
 * The layout filters items based on the user's role.
 */
export const navData = [
  {
    subheader: 'Services',
    items: [
      { title: 'My Bookkeeping', path: paths.dashboard.bookkeeping, icon: <MdDashboard />, module: 'bookkeeping' },
    ],
  },
  {
    subheader: 'Insights',
    items: [
      { title: 'Dashboard', path: paths.dashboard.root, icon: <MdDashboard />, module: 'dashboard' },
      { title: 'AI Forecasting', path: paths.dashboard.forecasting, icon: <MdAssessment />, module: 'forecasting' },
      { title: 'Business Simulator', path: paths.dashboard.simulator, icon: <MdAssessment />, module: 'simulator' },
      { title: 'Savings Scan', path: paths.dashboard.saving, icon: <MdAssessment />, module: 'savingScan' },
      { title: 'AI Chats', path: paths.dashboard.chat, icon: <MdChat />, module: 'chat' },
      { title: 'Reports', path: paths.dashboard.reports, icon: <MdAssessment />, module: 'reports' },
    ],
  },
  {
    subheader: 'Discover',
    items: [
      { title: 'Fun Facts', path: paths.dashboard.funFacts, icon: <MdDashboard />, module: 'funFacts' },
      { title: 'Deal Scout', path: paths.dashboard.dealScout, icon: <FaSearchDollar />, module: 'dealScout' },
    ]
  },
  {
    subheader: 'Data',
    items: [
      { title: 'Locker', path: paths.dashboard.locker, icon: <MdLock />, module: 'locker' },
      { title: 'Accounts', path: paths.dashboard.accounts, icon: <MdAccountBalanceWallet />, module: 'accounts' },
      { title: 'Transactions', path: paths.dashboard.transactions, icon: <MdReceipt />, module: 'transactions' },
    ],
  },
  {
    subheader: 'Settings',
    items: [
      { title: 'Company', path: paths.dashboard.company, icon: <MdBusiness />, module: 'company' },
      { title: 'Team', path: paths.dashboard.team, icon: <MdGroups />, module: 'team' },
      { title: 'Profile', path: paths.dashboard.settings, icon: <MdSettings />, module: 'settings' },
    ],
  },
];
