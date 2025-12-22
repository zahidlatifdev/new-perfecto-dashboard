import { CONFIG } from 'src/config-global';

import { CompanyView } from 'src/sections/company/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Company Information - ${CONFIG.site.name}` };

export default function Page() {
    return <CompanyView />;
}

