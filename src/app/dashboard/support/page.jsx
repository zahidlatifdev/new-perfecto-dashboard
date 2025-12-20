import { CONFIG } from 'src/config-global';

import { SupportView } from 'src/sections/support/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Education & Support - ${CONFIG.site.name}` };

export default function Page() {
    return <SupportView />;
}