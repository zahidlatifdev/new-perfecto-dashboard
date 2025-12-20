import { CONFIG } from "src/config-global";
import { CompanySelectorView } from "src/sections/company-selector/view";

// ----------------------------------------------------------------------

export const metadata = { title: `Select Company - ${CONFIG.site.name}` };

export default function Page() {
    return <CompanySelectorView />;
}