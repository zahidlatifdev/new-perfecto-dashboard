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
} from 'react-icons/md';

export const navData = [
  {
    subheader: 'Overview',
    items: [
      { title: 'Dashboard', path: paths.dashboard.root, icon: <MdDashboard /> },
      { title: 'Chat With Books', path: paths.dashboard.chat, icon: <MdChat /> },
      { title: 'Reports', path: paths.dashboard.reports, icon: <MdAssessment /> },
    ],
  },
  {
    subheader: 'Management',
    items: [
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
