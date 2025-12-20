import { CONFIG } from 'src/config-global';

import { SettingsView } from 'src/sections/settings/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Settings - ${CONFIG.site.name}` };

export default function Page() {
    return <SettingsView />;
}