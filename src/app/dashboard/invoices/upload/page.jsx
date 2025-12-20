import { CONFIG } from 'src/config-global';
import {InvoicesUploadView} from 'src/sections/invoices/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Upload Invoices - ${CONFIG.site.name}` };

export default function Page() {
    return <InvoicesUploadView />;
}