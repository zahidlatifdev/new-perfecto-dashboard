import { CONFIG } from 'src/config-global';

import { MatchingView } from 'src/sections/matching/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Matching - ${CONFIG.site.name}` };

export default function Page() {
    return <MatchingView />;
}
