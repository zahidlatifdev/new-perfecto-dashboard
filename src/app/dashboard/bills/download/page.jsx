import { CONFIG } from 'src/config-global';

import { BillsDownloadView } from 'src/sections/bills/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Download Bills Data - ${CONFIG.site.name}` };

export default function Page() {
    return <BillsDownloadView />;
}