import { CONFIG } from 'src/config-global';

import { BusinessSimulatorView } from 'src/sections/simulator/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Business Simulator - ${CONFIG.site.name}` };

export default function Page() {
    return <BusinessSimulatorView />;
}
