import { CONFIG } from 'src/config-global';

import { CardStatementsListView } from 'src/sections/card-statements/view';

// ----------------------------------------------------------------------

export const metadata = { title: `View Card Statements - ${CONFIG.site.name}` };

export default function Page() {
    return <CardStatementsListView />;
}