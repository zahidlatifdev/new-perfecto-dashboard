import { CONFIG } from 'src/config-global';

import { BankStatementsDownloadView } from 'src/sections/bank-statements/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Download Bank Statements - ${CONFIG.site.name}` };

export default function Page() {
    return <BankStatementsDownloadView />;
}