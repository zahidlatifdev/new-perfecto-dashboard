import { CONFIG } from 'src/config-global';

import { BillsListView } from 'src/sections/bills/view';

// ----------------------------------------------------------------------

export const metadata = { title: `View Bills - ${CONFIG.site.name}` };

export default function Page() {
    return <BillsListView />;
}