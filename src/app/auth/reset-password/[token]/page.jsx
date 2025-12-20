import { JwtResetPasswordView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export const metadata = { title: 'Jwt: Reset password' };

export default function Page({ params }) {
    return <JwtResetPasswordView token={params.token} />;
}
