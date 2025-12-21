import { CONFIG } from 'src/config-global';

import { CenteredUpdatePasswordView } from 'src/sections/auth/centered';

// ----------------------------------------------------------------------

export const metadata = { title: `Reset password | ${CONFIG.site.name}` };

export default function Page({ params }) {
    return <CenteredUpdatePasswordView token={params.token} />;
}
