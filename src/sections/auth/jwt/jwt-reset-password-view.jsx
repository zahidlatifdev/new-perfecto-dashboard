'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { resetPassword } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export const ResetPasswordSchema = zod.object({
    password: zod
        .string()
        .min(1, { message: 'Password is required!' })
        .min(6, { message: 'Password must be at least 6 characters!' }),
    confirmPassword: zod.string().min(1, { message: 'Confirm password is required!' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match!',
    path: ['confirmPassword'],
});

// ----------------------------------------------------------------------

export function JwtResetPasswordView({ token }) {
    const router = useRouter();

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const password = useBoolean();
    const confirmPassword = useBoolean();

    const defaultValues = {
        password: '',
        confirmPassword: '',
    };

    const methods = useForm({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = handleSubmit(async (data) => {
        try {
            setErrorMsg('');
            await resetPassword({ token, password: data.password });
            setSuccessMsg('Password has been reset successfully!');

            setTimeout(() => {
                router.push(paths.auth.jwt.signIn);
            }, 2000);
        } catch (error) {
            console.error(error);
            setErrorMsg(
                typeof error === 'string'
                    ? error
                    : error?.message
                        ? error.message
                        : 'Failed to reset password'
            );
        }
    });

    const renderHead = (
        <Stack spacing={1.5} sx={{ mb: 5 }}>
            <Typography variant="h5">Reset password</Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Please enter your new password below.
            </Typography>
        </Stack>
    );

    const renderForm = (
        <Stack spacing={3}>
            <Field.Text
                name="password"
                label="New password"
                placeholder="6+ characters"
                type={password.value ? 'text' : 'password'}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={password.onToggle} edge="end">
                                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            <Field.Text
                name="confirmPassword"
                label="Confirm new password"
                type={confirmPassword.value ? 'text' : 'password'}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={confirmPassword.onToggle} edge="end">
                                <Iconify icon={confirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            <LoadingButton
                fullWidth
                color="inherit"
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
                loadingIndicator="Resetting..."
            >
                Reset password
            </LoadingButton>
        </Stack>
    );

    const renderSignInLink = (
        <Stack direction="row" spacing={0.5} sx={{ mt: 3, justifyContent: 'center' }}>
            <Iconify icon="eva:arrow-ios-back-fill" width={16} />
            <Link
                component={RouterLink}
                href={paths.auth.jwt.signIn}
                variant="subtitle2"
                sx={{ alignItems: 'center', display: 'inline-flex' }}
            >
                Return to sign in
            </Link>
        </Stack>
    );

    return (
        <>
            {renderHead}

            {!!errorMsg && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {errorMsg}
                </Alert>
            )}

            {!!successMsg && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {successMsg}
                </Alert>
            )}

            <Form methods={methods} onSubmit={onSubmit}>
                {renderForm}
            </Form>

            {renderSignInLink}
        </>
    );
}
