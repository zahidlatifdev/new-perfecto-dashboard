import { CONFIG } from 'src/config-global';

import { ReportsView } from 'src/sections/reports/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Reports - ${CONFIG.site.name}` };

export default function Page() {
    return <ReportsView />;
}