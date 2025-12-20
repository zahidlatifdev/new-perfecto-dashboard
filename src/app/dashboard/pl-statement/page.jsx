import { CONFIG } from 'src/config-global';

import { PLStatementView } from 'src/sections/pl-statement/view';

// ----------------------------------------------------------------------

export const metadata = { title: `P&L Statement - ${CONFIG.site.name}` };

export default function PLStatement() {
    return <PLStatementView />;
}