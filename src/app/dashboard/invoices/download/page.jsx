import { CONFIG } from 'src/config-global';
import {InvoicesDownloadView} from 'src/sections/invoices/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Download Invoices - ${CONFIG.site.name}` };

export default function Page() {
    return <InvoicesDownloadView />;
}