import { CONFIG } from 'src/config-global';

import { CenteredSignInView } from 'src/sections/auth/centered';

// ----------------------------------------------------------------------

export const metadata = { title: `Sign in | ${CONFIG.site.name}` };

export default function Page() {
  return <CenteredSignInView />;
}
