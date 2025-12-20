import { CONFIG } from 'src/config-global';

import { ReceiptsDownloadView } from 'src/sections/receipts/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Download Receipts - ${CONFIG.site.name}` };

export default function Page() {
    return <ReceiptsDownloadView />;
}