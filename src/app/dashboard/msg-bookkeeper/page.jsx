import { CONFIG } from 'src/config-global';

import { BookkeeperView } from 'src/sections/bookkeeper/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Message Your Bookkeeper - ${CONFIG.site.name}` };

export default function Page() {
    return <BookkeeperView />;
}