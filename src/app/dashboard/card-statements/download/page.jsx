import { CONFIG } from 'src/config-global';

import { CardStatementsDownloadView } from 'src/sections/card-statements/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Download Card Statements - ${CONFIG.site.name}` };

export default function Page() {
    return <CardStatementsDownloadView />;
}