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

export const navData = [
  {
    subheader: 'Services',
    items: [
      { title: 'My Bookkeeping', path: paths.dashboard.bookkeeping, icon: <MdDashboard /> },
    ],
  },
  {
    subheader: 'Insights',
    items: [
      { title: 'Dashboard', path: paths.dashboard.root, icon: <MdDashboard /> },
      { title: 'AI Forecasting', path: paths.dashboard.forecasting, icon: <MdAssessment /> },
      { title: 'Business Simulator', path: paths.dashboard.simulator, icon: <MdAssessment /> },
      { title: 'Savings Scan', path: paths.dashboard.saving, icon: <MdAssessment /> },
      { title: 'AI Chats', path: paths.dashboard.chat, icon: <MdChat /> },
      { title: 'Reports', path: paths.dashboard.reports, icon: <MdAssessment /> },
    ],
  },
  {
    subheader: 'Discover',
    items: [
      { title: 'Fun Facts', path: paths.dashboard.funFacts, icon: <MdDashboard /> },
      { title: 'Deal Scout', path: paths.dashboard.dealScout, icon: <FaSearchDollar /> },
    ]
  },
  {
    subheader: 'Data',
    items: [
      { title: 'Locker', path: paths.dashboard.locker, icon: <MdLock /> },
      { title: 'Accounts', path: paths.dashboard.accounts, icon: <MdAccountBalanceWallet /> },
      { title: 'Transactions', path: paths.dashboard.transactions, icon: <MdReceipt /> },
    ],
  },
  {
    subheader: 'Settings',
    items: [
      { title: 'Company', path: paths.dashboard.company, icon: <MdBusiness /> },
      { title: 'Team', path: paths.dashboard.team, icon: <MdGroups /> },
      { title: 'Profile', path: paths.dashboard.settings, icon: <MdSettings /> },
    ],
  },
];
