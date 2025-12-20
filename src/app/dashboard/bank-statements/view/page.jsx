import { CONFIG } from 'src/config-global';

import { BankStatementsListView } from 'src/sections/bank-statements/view';

// ----------------------------------------------------------------------

export const metadata = { title: `View Bank Statements - ${CONFIG.site.name}` };

export default function Page() {
    return <BankStatementsListView />;
}