'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useAuthContext } from 'src/auth/hooks';
import axios, { endpoints } from 'src/utils/axios';

import { EmailInboxIcon } from 'src/assets/icons';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const VerifySchema = zod.object({
  code: zod
    .string()
    .min(1, { message: 'Code is required!' })
    .min(6, { message: 'Code must be 6 digits!' })
    .max(6, { message: 'Code must be 6 digits!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
});

// ----------------------------------------------------------------------

export function CenteredVerifyView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { verifyEmail } = useAuthContext();
  const [errorMsg, setErrorMsg] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  const emailFromUrl = searchParams.get('email') || '';

  const defaultValues = {
    code: '',
    email: emailFromUrl
  };

  const methods = useForm({
    resolver: zodResolver(VerifySchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');

      // Verify email and auto sign-in
      await verifyEmail(data.email, data.code);

      // Redirect to dashboard (user is now authenticated)
      router.push(paths.dashboard.root);
    } catch (error) {
      console.error('Email verification failed:', error);
      setErrorMsg(error.message || 'Invalid verification code. Please check and try again.');
    }
  });

  const handleResend = async () => {
    const email = methods.getValues('email');

    if (!email) {
      setErrorMsg('Please enter your email address');
      return;
    }

    try {
      setErrorMsg('');
      setResendSuccess(false);

      await axios.post(endpoints.auth.resendVerification, { email });
      setResendSuccess(true);
    } catch (error) {
      console.error('Resend verification failed:', error);
      setErrorMsg(error.message || 'Failed to resend verification code');
    }
  };

  const renderHead = (
    <>
      <EmailInboxIcon sx={{ mx: 'auto' }} />

      <Stack spacing={1} sx={{ mt: 3, mb: 5, textAlign: 'center', whiteSpace: 'pre-line' }}>
        <Typography variant="h5">Please check your email!</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {`We've emailed a 6-digit confirmation code to ${emailFromUrl || 'your email address'}. \nPlease enter the code in the box below to verify your email.`}
        </Typography>
      </Stack>
    </>
  );

  const renderForm = (
    <Stack spacing={3}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      {resendSuccess && (
        <Alert severity="success">
          Verification code sent! Please check your email.
        </Alert>
      )}

      <Field.Text
        name="email"
        label="Email address"
        placeholder="example@gmail.com"
        InputLabelProps={{ shrink: true }}
        disabled={!!emailFromUrl}
      />

      <Field.Code name="code" />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Verifying..."
      >
        Verify
      </LoadingButton>

      <Typography variant="body2" sx={{ mx: 'auto' }}>
        {`Don't have a code? `}
        <Link
          href="#"
          variant="subtitle2"
          sx={{ cursor: 'pointer' }}
          onClick={handleResend}
        >
          Resend code
        </Link>
      </Typography>

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

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>
    </>
  );
}
