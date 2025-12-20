import { JwtVerifyEmailView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export const metadata = { title: 'Jwt: Verify email' };

export default function Page({ params }) {
    return <JwtVerifyEmailView token={params.token} />;
}
