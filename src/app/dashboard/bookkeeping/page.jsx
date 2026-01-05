import { CONFIG } from 'src/config-global';

import { BookkeepingView } from 'src/sections/bookkeeping/view';

// ----------------------------------------------------------------------

export const metadata = { title: `My Bookkeeping - ${CONFIG.site.name}` };

export default function Page() {
    return <BookkeepingView />;
}
