'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

import { Iconify } from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import axios, { endpoints } from 'src/utils/axios';
import { paths } from 'src/routes/paths';

export function InvitationAcceptView() {
    const router = useRouter();
    const params = useParams();
    const { authenticated } = useAuthContext();
    const [invitation, setInvitation] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);

    const invitationId = params?.token;

    useEffect(() => {
        if (invitationId) {
            fetchInvitationDetails();
        }
    }, [invitationId]);

    const fetchInvitationDetails = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(endpoints.invitations.info(invitationId));
            setInvitation(data.invitation);
            setCompany(data.company);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch invitation:', err);
            setError('Failed to load invitation details');
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!authenticated) {
            // Store invitation token and redirect to sign in
            sessionStorage.setItem('pendingInvitation', invitationId);
            router.push(paths.auth.jwt.signIn);
            return;
        }

        try {
            setProcessing(true);
            setError('');

            const response = await axios.post(endpoints.invitations.accept(invitationId));

            setSuccess('Invitation accepted successfully! Redirecting to dashboard...');

            // Redirect to dashboard with the new company
            setTimeout(() => {
                router.push(paths.dashboard.root);
                window.location.reload(); // Refresh to load new company data
            }, 2000);
        } catch (err) {
            console.error('Failed to accept invitation:', err);
            setError(err.response?.data?.message || 'Failed to accept invitation');
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!authenticated) {
            router.push(paths.auth.jwt.signIn);
            return;
        }
        setConfirmOpen(true);
    };

    const handleConfirmReject = async () => {
        try {
            setProcessing(true);
            setError('');
            setConfirmOpen(false);
            await axios.post(endpoints.invitations.reject(invitationId));
            setSuccess('Invitation declined.');
            setTimeout(() => {
                router.push(authenticated ? paths.dashboard.root : paths.auth.jwt.signIn);
            }, 2000);
        } catch (err) {
            console.error('Failed to reject invitation:', err);
            setError(err.response?.data?.message || 'Failed to decline invitation');
            setProcessing(false);
            setConfirmOpen(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="sm">
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4,
                }}
            >
                <Card sx={{ width: '100%' }}>
                    <CardContent sx={{ p: 4 }}>
                        {/* Header */}
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2,
                                }}
                            >
                                <Iconify icon="mdi:email-open" width={40} color="primary.main" />
                            </Box>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                                Team Invitation
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                You've been invited to join a team on Perfecto
                            </Typography>
                        </Box>

                        {/* Success Message */}
                        {success && (
                            <Alert severity="success" sx={{ mb: 3 }}>
                                {success}
                            </Alert>
                        )}

                        {/* Error Message */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Invitation & Company Details */}
                        {invitation && company && (
                            <>
                                {/* Company Header */}
                                <Box sx={{ textAlign: 'center', mb: 3 }}>
                                    {company.logo ? (
                                        <Avatar
                                            src={company.logo}
                                            alt={company.name}
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                mx: 'auto',
                                                mb: 2,
                                                border: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                            }}
                                        />
                                    ) : (
                                        <Avatar
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                mx: 'auto',
                                                mb: 2,
                                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                                color: 'primary.main',
                                                fontSize: 32,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {company.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                    )}
                                    <Typography variant="h4" fontWeight={700} gutterBottom>
                                        {company.name}
                                    </Typography>
                                    {company.description && (
                                        <Typography variant="body2" color="text.secondary">
                                            {company.description}
                                        </Typography>
                                    )}
                                </Box>

                                <Divider sx={{ mb: 3 }} />

                                {/* Invitation Details */}
                                <Stack spacing={2.5} sx={{ mb: 3 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                            Invited Team Member
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                                    color: 'primary.main',
                                                }}
                                            >
                                                {invitation?.firstName?.charAt(0)}{invitation?.lastName?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    {invitation.firstName} {invitation.lastName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {invitation.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                            Role
                                        </Typography>
                                        <Chip
                                            label={invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                                            color="primary"
                                            size="small"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Box>

                                    {invitation.invitedBy && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                                Invited By
                                            </Typography>
                                            <Typography variant="body2">
                                                {invitation.invitedBy.firstName} {invitation.invitedBy.lastName}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                            Invitation Date
                                        </Typography>
                                        <Typography variant="body2">
                                            {new Date(invitation.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Typography>
                                    </Box>

                                    {invitation.status === 'expired' && (
                                        <Alert severity="warning">
                                            This invitation has expired. Please contact the company owner for a new invitation.
                                        </Alert>
                                    )}
                                </Stack>

                                {/* Action Buttons */}
                                {invitation.status !== 'expired' && (
                                    <Stack spacing={2}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="large"
                                            fullWidth
                                            onClick={handleAccept}
                                            disabled={processing}
                                            startIcon={<Iconify icon="mdi:check" />}
                                        >
                                            {authenticated ? 'Accept Invitation' : 'Sign In to Accept'}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="inherit"
                                            size="large"
                                            fullWidth
                                            onClick={handleReject}
                                            disabled={processing}
                                            startIcon={<Iconify icon="mdi:close" />}
                                        >
                                            Decline
                                        </Button>
                                    </Stack>
                                )}

                                {/* Sign Up Link */}
                                {!authenticated && invitation.status !== 'expired' && (
                                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Don't have an account?{' '}
                                            <Box
                                                component="span"
                                                sx={{
                                                    color: 'primary.main',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    '&:hover': { textDecoration: 'underline' },
                                                }}
                                                onClick={() => {
                                                    sessionStorage.setItem('pendingInvitation', invitationId);
                                                    router.push(paths.auth.jwt.signUp);
                                                }}
                                            >
                                                Sign Up
                                            </Box>
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                        {/* Reject Confirmation Dialog */}
                        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                            <DialogTitle>Decline Invitation</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Are you sure you want to decline this invitation?
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setConfirmOpen(false)} color="inherit">
                                    Cancel
                                </Button>
                                <Button onClick={handleConfirmReject} color="error" autoFocus disabled={processing}>
                                    Decline
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}
