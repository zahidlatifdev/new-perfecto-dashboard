import { CONFIG } from 'src/config-global';

import { BankStatementsUploadView } from 'src/sections/bank-statements/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Upload Bank Statements - ${CONFIG.site.name}` };

export default function Page() {
    return <BankStatementsUploadView />;
}