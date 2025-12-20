import { CONFIG } from 'src/config-global';

import { ReceiptsListView } from 'src/sections/receipts/view';

// ----------------------------------------------------------------------

export const metadata = { title: `View Receipts - ${CONFIG.site.name}` };

export default function Page() {
    return <ReceiptsListView />;
}