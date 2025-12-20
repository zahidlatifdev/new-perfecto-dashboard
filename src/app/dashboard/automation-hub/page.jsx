import { CONFIG } from 'src/config-global';

import { AutomationHubView } from 'src/sections/automation-hub/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Automation Hub - ${CONFIG.site.name}` };

export default function Page() {
    return <AutomationHubView />;
}