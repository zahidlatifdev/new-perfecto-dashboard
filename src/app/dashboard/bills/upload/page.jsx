import { CONFIG } from 'src/config-global';

import { BillsUploadView } from 'src/sections/bills/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Upload Bills - ${CONFIG.site.name}` };

export default function Page() {
    return <BillsUploadView />;
}