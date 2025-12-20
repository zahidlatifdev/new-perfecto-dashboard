import { CONFIG } from 'src/config-global';

import { AccountsManagementView } from 'src/sections/accounts-management/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Accounts Management - ${CONFIG.site.name}` };

export default function Page() {
    return <AccountsManagementView />;
}