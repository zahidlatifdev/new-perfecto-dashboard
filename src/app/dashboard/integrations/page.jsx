import { CONFIG } from 'src/config-global';

import { IntegrationsView } from 'src/sections/integrations/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Integrations & Exports - ${CONFIG.site.name}` };

export default function Page() {
    return <IntegrationsView />;
}