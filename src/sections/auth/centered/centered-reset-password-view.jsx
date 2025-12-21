'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import axios, { endpoints } from 'src/utils/axios';

import { PasswordIcon } from 'src/assets/icons';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const ResetPasswordSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
});

// ----------------------------------------------------------------------

export function CenteredResetPasswordView() {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const defaultValues = { email: '' };

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
      await axios.post(endpoints.auth.forgotPassword, { email: data.email });
      setSuccess(true);
      setErrorMsg('');
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'Failed to send reset link');
    }
  });

  const renderHead = (
    <>
      <PasswordIcon sx={{ mx: 'auto' }} />

      <Stack spacing={1} sx={{ mt: 3, mb: 5, textAlign: 'center', whiteSpace: 'pre-line' }}>
        {!success ? (
          <>
            <Typography variant="h5">Forgot your password?</Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {`Please enter the email address associated with your account and we'll email you a link to reset your password.`}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h5">Check your email</Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {`We've sent a password reset link to your email address. Please check your inbox and follow the instructions.`}
            </Typography>
          </>
        )}
      </Stack>
    </>
  );

  const renderForm = (
    <Stack spacing={3}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      {success && (
        <Alert severity="success">
          Password reset link sent! Please check your email.
        </Alert>
      )}

      {!success && (
        <>
          <Field.Text
            name="email"
            label="Email address"
            placeholder="example@gmail.com"
            autoFocus
            InputLabelProps={{ shrink: true }}
          />

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            loadingIndicator="Sending..."
          >
            Send reset link
          </LoadingButton>
        </>
      )}

      <Link
        component={RouterLink}
        href={paths.auth.jwt.signIn}
        color="inherit"
        variant="subtitle2"
        sx={{ mx: 'auto', alignItems: 'center', display: 'inline-flex' }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} sx={{ mr: 0.5 }} />
        Return to sign in
      </Link>
    </Stack>
  );

  return (
    <>
      {renderHead}

      {!success && (
        <Form methods={methods} onSubmit={onSubmit}>
          {renderForm}
        </Form>
      )}

      {success && renderForm}
    </>
  );
}
