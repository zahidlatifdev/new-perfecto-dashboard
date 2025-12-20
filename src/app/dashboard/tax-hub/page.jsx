import { CONFIG } from 'src/config-global';

import { TaxHubView } from 'src/sections/tax-hub/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Tax Hub - ${CONFIG.site.name}` };

export default function Page() {
    return <TaxHubView />;
}