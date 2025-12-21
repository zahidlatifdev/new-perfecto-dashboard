import { CONFIG } from 'src/config-global';

import { CenteredSignUpView } from 'src/sections/auth/centered';

// ----------------------------------------------------------------------

export const metadata = { title: `Sign up | ${CONFIG.site.name}` };

export default function Page() {
  return <CenteredSignUpView />;
}
