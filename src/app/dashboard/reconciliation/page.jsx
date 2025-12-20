import { CONFIG } from 'src/config-global';

import { ReconciliationView } from 'src/sections/reconciliation/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Reconciliation - ${CONFIG.site.name}` };

export default function Page() {
    return <ReconciliationView />;
}