'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';

import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import axios, { endpoints } from 'src/utils/axios';

import { AnimateLogo2 } from 'src/components/animate';
import { Form, Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const STEPS = ['Create Account', 'Verify Email', 'Connect Accounts'];

// ----------------------------------------------------------------------

const RegisterSchema = zod.object({
  firstName: zod.string().min(1, { message: 'First name is required!' }),
  lastName: zod.string().min(1, { message: 'Last name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  phone: zod.string().optional(),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(8, { message: 'Password must be at least 8 characters!' }),
  companyName: zod.string().min(1, { message: 'Company name is required!' }),
  companyType: zod.string().min(1, { message: 'Company type is required!' }),
  companySize: zod.string().min(1, { message: 'Company size is required!' }),
});

const VerifySchema = zod.object({
  code: zod
    .string()
    .min(1, { message: 'Code is required!' })
    .min(6, { message: 'Code must be 6 digits!' })
    .max(6, { message: 'Code must be 6 digits!' }),
});

// ----------------------------------------------------------------------

export const SignUpSchema = RegisterSchema;

// ----------------------------------------------------------------------

const COMPANY_TYPES = [
  { value: 'Sole Proprietorship', label: 'Sole Proprietorship' },
  { value: 'Partnership', label: 'Partnership' },
  { value: 'LLC', label: 'Limited Liability Company (LLC)' },
  { value: 'Corporation', label: 'Corporation' },
  { value: 'Non-Profit', label: 'Non-Profit Organization' },
  { value: 'Other', label: 'Other' },
];

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

// ----------------------------------------------------------------------

function StepCreateAccount({ onSuccess }) {
  const { signUp } = useAuthContext();
  const [errorMsg, setErrorMsg] = useState('');
  const password = useBoolean();

  const methods = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      companyName: '',
      companyType: '',
      companySize: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      const pendingInvitation = sessionStorage.getItem('pendingInvitation');

      await signUp(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.phone,
        data.companyName,
        data.companyType,
        data.companySize,
        !!pendingInvitation
      );

      onSuccess(data.email);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'Failed to create account');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          Personal Information
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Field.Text name="firstName" label="First name" InputLabelProps={{ shrink: true }} />
          <Field.Text name="lastName" label="Last name" InputLabelProps={{ shrink: true }} />
        </Stack>

        <Field.Text name="email" label="Email address" InputLabelProps={{ shrink: true }} />

        <Field.Text name="phone" label="Phone number (optional)" InputLabelProps={{ shrink: true }} />

        <Field.Text
          name="password"
          label="Password"
          placeholder="8+ characters"
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

        <Divider sx={{ my: 0.5 }} />

        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          Company Information
        </Typography>

        <Field.Text name="companyName" label="Company name" InputLabelProps={{ shrink: true }} />

        <Field.Select name="companyType" label="Company type" InputLabelProps={{ shrink: true }}>
          <MenuItem value="">
            <em>Select company type</em>
          </MenuItem>
          {COMPANY_TYPES.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Field.Select>

        <Field.Select name="companySize" label="Company size" InputLabelProps={{ shrink: true }}>
          <MenuItem value="">
            <em>Select company size</em>
          </MenuItem>
          {COMPANY_SIZES.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Field.Select>

        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          loadingIndicator="Creating account..."
        >
          Create account
        </LoadingButton>
      </Stack>
    </Form>
  );
}

// ----------------------------------------------------------------------

function StepVerifyEmail({ email, onSuccess }) {
  const { verifyEmail } = useAuthContext();
  const [errorMsg, setErrorMsg] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  const methods = useForm({
    resolver: zodResolver(VerifySchema),
    defaultValues: { code: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      await verifyEmail(email, data.code);
      onSuccess();
    } catch (error) {
      console.error('Email verification failed:', error);
      setErrorMsg(error.message || 'Invalid verification code. Please check and try again.');
    }
  });

  const handleResend = async () => {
    try {
      setErrorMsg('');
      setResendSuccess(false);
      setResending(true);

      await axios.post(endpoints.auth.resendVerification, { email });
      setResendSuccess(true);
    } catch (error) {
      console.error('Resend verification failed:', error);
      setErrorMsg(error.message || 'Failed to resend verification code');
    } finally {
      setResending(false);
    }
  };

  return (
    <Stack spacing={3} alignItems="center">
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          bgcolor: 'primary.lighter',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon="eva:email-fill" width={36} sx={{ color: 'primary.main' }} />
      </Box>

      <Stack spacing={1} sx={{ textAlign: 'center' }}>
        <Typography variant="h6">Check your email</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          We&apos;ve sent a 6-digit verification code to
        </Typography>
        <Typography variant="subtitle2">{email}</Typography>
      </Stack>

      <Form methods={methods} onSubmit={onSubmit} style={{ width: '100%' }}>
        <Stack spacing={3}>
          {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          {resendSuccess && (
            <Alert severity="success">
              Verification code resent! Please check your email.
            </Alert>
          )}

          <Field.Code name="code" />

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            loadingIndicator="Verifying..."
          >
            Verify & Sign In
          </LoadingButton>

          <Stack direction="row" justifyContent="center" spacing={0.5}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Didn&apos;t receive the code?
            </Typography>
            <LoadingButton
              variant="text"
              size="small"
              loading={resending}
              onClick={handleResend}
              sx={{ minWidth: 'auto', p: 0, height: 'auto', fontSize: 'inherit', fontWeight: 600 }}
            >
              Resend
            </LoadingButton>
          </Stack>
        </Stack>
      </Form>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function StepConnectAccounts({ onComplete }) {
  const { company } = useAuthContext();
  const companyId = company?._id;

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [linkToken, setLinkToken] = useState(null);

  const onPlaidSuccess = useCallback(async (publicToken, metadata) => {
    try {
      setLoading(true);
      setErrorMsg('');

      const response = await axios.post(endpoints.plaid.exchangeToken, {
        publicToken,
        companyId,
        metadata,
      });

      if (response.data.success) {
        setConnectedAccounts(response.data.accounts || []);
      }
    } catch (error) {
      console.error('Plaid connection error:', error);
      setErrorMsg(error.message || 'Failed to connect accounts');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const config = {
    token: linkToken,
    onSuccess: onPlaidSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  const handleConnectPlaid = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      if (!companyId) {
        setErrorMsg('Company information not found. Please try again.');
        setLoading(false);
        return;
      }

      const response = await axios.post(endpoints.plaid.createLinkToken, { companyId });

      if (response.data.success && response.data.linkToken) {
        setLinkToken(response.data.linkToken);
        setTimeout(() => setLoading(false), 500);
      }
    } catch (error) {
      console.error('Failed to create link token:', error);
      setErrorMsg(error.message || 'Failed to initialize Plaid connection');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  return (
    <Stack spacing={3}>
      <Stack alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'success.lighter',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon="eva:checkmark-circle-2-fill" width={36} sx={{ color: 'success.main' }} />
        </Box>
        <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Connect Your Accounts</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Link your bank accounts, credit cards, or loans to get the most out of Perfecto.
            You can also skip this and connect later.
          </Typography>
        </Stack>
      </Stack>

      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      {connectedAccounts.length > 0 && (
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Connected Accounts</Typography>
          {connectedAccounts.map((account) => (
            <Card key={account._id} variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Iconify
                      icon={
                        account.accountType === 'bank_account'
                          ? 'mdi:bank'
                          : account.accountType === 'credit_line'
                            ? 'mdi:credit-card'
                            : 'mdi:cash'
                      }
                      width={28}
                    />
                    <Stack>
                      <Typography variant="subtitle2">{account.accountName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {account.institutionName}
                        {account.accountNumber && ` • ****${account.accountNumber.slice(-4)}`}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main' }} width={22} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <LoadingButton
        fullWidth
        size="large"
        variant="contained"
        onClick={handleConnectPlaid}
        loading={loading}
        disabled={!companyId}
        startIcon={<Iconify icon="simple-icons:plaid" />}
      >
        {loading ? 'Initializing...' : connectedAccounts.length > 0 ? 'Connect Another Account' : 'Connect with Plaid'}
      </LoadingButton>

      {connectedAccounts.length > 0 && (
        <LoadingButton
          fullWidth
          size="large"
          variant="contained"
          color="primary"
          onClick={onComplete}
        >
          Continue to Dashboard
        </LoadingButton>
      )}

      <Button
        fullWidth
        size="large"
        variant="text"
        color="inherit"
        onClick={onComplete}
        sx={{ color: 'text.secondary' }}
      >
        {connectedAccounts.length > 0 ? 'Skip' : 'Skip for now'}
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function CenteredSignUpView() {
  const router = useRouter();
  const { authenticated } = useAuthContext();
  const [activeStep, setActiveStep] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // If the user is already authenticated and hasn't started the signup flow,
  // redirect them to the dashboard (handles direct navigation by logged-in users).
  useEffect(() => {
    if (authenticated && activeStep === 0) {
      router.replace(paths.dashboard.root);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  const handleRegisterSuccess = (email) => {
    setRegisteredEmail(email);
    setActiveStep(1);
  };

  const handleVerifySuccess = () => {
    // If there's a pending invitation, skip Plaid step and redirect to accept it
    const pendingInvitation = sessionStorage.getItem('pendingInvitation');
    if (pendingInvitation) {
      router.push(paths.invitation.accept(pendingInvitation));
      return;
    }
    setActiveStep(2);
  };

  const handleComplete = () => {
    router.push(paths.dashboard.root);
  };

  const renderLogo = <AnimateLogo2 sx={{ mb: 3, mx: 'auto' }} />;

  const renderHead = (
    <Stack alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
      <Typography variant="h5">
        {activeStep === 0 && 'Get started absolutely free'}
        {activeStep === 1 && 'Verify your email'}
        {activeStep === 2 && "You're almost there!"}
      </Typography>

      {activeStep === 0 && (
        <Stack direction="row" spacing={0.5}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Already have an account?
          </Typography>
          <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
            Sign in
          </Link>
        </Stack>
      )}
    </Stack>
  );

  const renderStepper = (
    <Box sx={{ mb: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );

  const renderTerms = activeStep === 0 && (
    <Typography
      component="div"
      sx={{
        mt: 3,
        textAlign: 'center',
        typography: 'caption',
        color: 'text.secondary',
      }}
    >
      {'By signing up, I agree to '}
      <Link href="#" underline="always" color="text.primary">
        Terms of service
      </Link>
      {' and '}
      <Link href="#" underline="always" color="text.primary">
        Privacy policy
      </Link>
      .
    </Typography>
  );

  return (
    <>
      {renderLogo}
      {renderHead}
      {renderStepper}

      {activeStep === 0 && (
        <StepCreateAccount onSuccess={handleRegisterSuccess} />
      )}

      {activeStep === 1 && (
        <StepVerifyEmail email={registeredEmail} onSuccess={handleVerifySuccess} />
      )}

      {activeStep === 2 && (
        <StepConnectAccounts onComplete={handleComplete} />
      )}

      {renderTerms}
    </>
  );
}
