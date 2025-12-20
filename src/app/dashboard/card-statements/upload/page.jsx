import { CONFIG } from 'src/config-global';

import { CardStatementsUploadView } from 'src/sections/card-statements/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Upload Card Statements - ${CONFIG.site.name}` };

export default function Page() {
    return <CardStatementsUploadView />;
}