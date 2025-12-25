import { CONFIG } from 'src/config-global';

import { DealScoutView } from 'src/sections/deal-scout/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Deal Scout - ${CONFIG.site.name}` };

export default function Page() {
    return <DealScoutView />;
}
