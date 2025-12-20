import { CONFIG } from 'src/config-global';

import { SubscriptionView } from 'src/sections/subscription/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Subscription - ${CONFIG.site.name}` };

export default function Page() {
    return <SubscriptionView />;
}