import { GuestGuard } from 'src/auth/guard';
import { CenteredConnectAccountView } from 'src/sections/auth/centered/centered-connect-account-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Connect Account | Perfecto` };

export default function Page() {
    return (
        <GuestGuard>
            <CenteredConnectAccountView />
        </GuestGuard>
    );
}

