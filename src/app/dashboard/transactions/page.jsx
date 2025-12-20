import { CONFIG } from 'src/config-global';

import { TransactionsView } from 'src/sections/transactions/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Transactions - ${CONFIG.site.name}` };

export default function Page() {
    return <TransactionsView />;
}
