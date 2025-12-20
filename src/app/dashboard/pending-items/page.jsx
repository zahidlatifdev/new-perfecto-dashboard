import { CONFIG } from 'src/config-global';

import { PendingItemsView } from 'src/sections/pending-items/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Pending Items - ${CONFIG.site.name}` };

export default function Page() {
    return <PendingItemsView />;
}
