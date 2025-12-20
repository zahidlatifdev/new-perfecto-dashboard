import { CONFIG } from 'src/config-global';

import { InvoicesListView } from 'src/sections/invoices/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Invoices - ${CONFIG.site.name}` };

export default function Page() {
    return <InvoicesListView />;
}