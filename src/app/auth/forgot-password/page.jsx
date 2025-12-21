import { CONFIG } from 'src/config-global';

import { CenteredResetPasswordView } from 'src/sections/auth/centered';

// ----------------------------------------------------------------------

export const metadata = { title: `Forgot password | ${CONFIG.site.name}` };

export default function Page() {
    return <CenteredResetPasswordView />;
}
