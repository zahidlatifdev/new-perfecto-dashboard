import { CONFIG } from 'src/config-global';

import { CenteredVerifyView } from 'src/sections/auth/centered';

// ----------------------------------------------------------------------

export const metadata = { title: `Verify email | ${CONFIG.site.name}` };

export default function Page() {
    return <CenteredVerifyView />;
}
