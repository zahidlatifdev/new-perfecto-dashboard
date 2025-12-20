import { CONFIG } from 'src/config-global';

import { CollaborateEnhancedView } from 'src/sections/collaborate/view/collaborate-enhanced-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Users & Collaboration - ${CONFIG.site.name}` };

export default function Page() {
    return <CollaborateEnhancedView />;
}