import { CONFIG } from 'src/config-global';

import { ReceiptsUploadView } from 'src/sections/receipts/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Upload Receipts - ${CONFIG.site.name}` };

export default function Page() {
    return <ReceiptsUploadView />;
}