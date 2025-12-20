'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';

import axios, { endpoints } from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

import { useAuthContext } from 'src/auth/hooks';
import Link from 'next/link';

// ----------------------------------------------------------------------

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Admin', color: 'error' },
    { value: 'accountant', label: 'Accountant', color: 'warning' },
    { value: 'bookkeeper', label: 'Bookkeeper', color: 'info' },
    { value: 'analyst', label: 'Analyst', color: 'success' },
    { value: 'viewer', label: 'Viewer', color: 'default' },
];

// ----------------------------------------------------------------------

function InvitationCard({ invitation, onAccept, onReject, loading }) {
    const rejectDialog = useBoolean();
    const [rejectionReason, setRejectionReason] = useState('');

    const roleOption = ROLE_OPTIONS.find(option => option.value === invitation.role);
    const isExpired = new Date(invitation.expiresAt) < new Date();

    const handleReject = () => {
        onReject(invitation.invitationToken, rejectionReason);
        rejectDialog.onFalse();
        setRejectionReason('');
    };

    return (
        <>
            <Card sx={{ p: 3, position: 'relative' }}>
                {isExpired && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                        }}
                    >
                        <Label color="error" variant="filled">
                            Expired
                        </Label>
                    </Box>
                )}

                <Stack spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={invitation.company.logo}
                            alt={invitation.company.name}
                            sx={{ width: 56, height: 56 }}
                        >
                            {invitation.company.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                {invitation.company.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {invitation.company.description || 'No description available'}
                            </Typography>
                        </Box>
                    </Box>

                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Invited Role
                            </Typography>
                            <Label variant="soft" color={roleOption?.color || 'default'}>
                                {roleOption?.label || invitation.role}
                            </Label>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Invited By
                            </Typography>
                            <Typography variant="body2">
                                {invitation.invitedBy.name} ({invitation.invitedBy.email})
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Sent Date
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {fDate(invitation.createdAt)}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Expires
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color={isExpired ? 'error.main' : 'text.secondary'}
                                >
                                    {fDate(invitation.expiresAt)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Stack>

                    {!isExpired && (
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Iconify icon="solar:check-circle-bold" />}
                                onClick={() => onAccept(invitation.invitationToken)}
                                disabled={loading}
                                sx={{ flex: 1 }}
                            >
                                Accept
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<Iconify icon="solar:close-circle-bold" />}
                                onClick={rejectDialog.onTrue}
                                disabled={loading}
                                sx={{ flex: 1 }}
                            >
                                Reject
                            </Button>
                        </Stack>
                    )}

                    {isExpired && (
                        <Alert severity="warning">
                            This invitation has expired. Please contact the company admin for a new invitation.
                        </Alert>
                    )}
                </Stack>
            </Card>

            {/* Reject Dialog */}
            <Dialog open={rejectDialog.value} onClose={rejectDialog.onFalse} maxWidth="sm" fullWidth>
                <DialogTitle>Reject Invitation</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Are you sure you want to reject this invitation from {invitation.company.name}?
                    </Typography>
                    <TextField
                        fullWidth
                        label="Reason (optional)"
                        multiline
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide a reason for rejecting this invitation..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={rejectDialog.onFalse}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleReject}
                        disabled={loading}
                    >
                        Reject Invitation
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

// ----------------------------------------------------------------------

export function InvitationsView() {
    const router = useRouter();
    const { user } = useAuthContext();

    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchInvitations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(endpoints.invitations.userPending);
            setInvitations(response.data.data.invitations || []);
        } catch (error) {
            console.error('Failed to fetch invitations:', error);
            setSnackbar({
                open: true,
                message: 'Failed to fetch invitations',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    const handleAcceptInvitation = useCallback(async (token) => {
        try {
            setLoading(true);
            const response = await axios.post(endpoints.invitations.accept(token));
            
            setSnackbar({
                open: true,
                message: 'Invitation accepted successfully!',
                severity: 'success'
            });

            // Refresh invitations
            await fetchInvitations();

            // Redirect to dashboard after a brief delay
            setTimeout(() => {
                router.push(paths.dashboard.root);
            }, 2000);

        } catch (error) {
            console.error('Failed to accept invitation:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to accept invitation',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    }, [fetchInvitations, router]);

    const handleRejectInvitation = useCallback(async (token, reason) => {
        try {
            setLoading(true);
            await axios.post(endpoints.invitations.reject(token), { reason });
            
            setSnackbar({
                open: true,
                message: 'Invitation rejected',
                severity: 'info'
            });

            // Refresh invitations
            await fetchInvitations();

        } catch (error) {
            console.error('Failed to reject invitation:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to reject invitation',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    }, [fetchInvitations]);

    return (
        <DashboardContent>
            <Container maxWidth="lg">

                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Team Invitations
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            You have {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>

                    {invitations.length === 0 && !loading && (
                        <Paper
                            sx={{
                                textAlign: 'center',
                                py: 8,
                                px: 3,
                                bgcolor: 'background.neutral',
                            }}
                        >
                            <Iconify
                                icon="solar:inbox-archive-bold-duotone"
                                width={64}
                                sx={{ color: 'text.disabled', mb: 2 }}
                            />
                            <Typography variant="h6" gutterBottom>
                                No pending invitations
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                When you receive team invitations, they will appear here.
                            </Typography>
                        </Paper>
                    )}

                    {loading && invitations.length === 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <Iconify icon="svg-spinners:8-dots-rotate" width={40} />
                        </Box>
                    )}

                    <Grid container spacing={3}>
                        {invitations.map((invitation) => (
                            <Grid item xs={12} md={6} key={invitation._id}>
                                <InvitationCard
                                    invitation={invitation}
                                    onAccept={handleAcceptInvitation}
                                    onReject={handleRejectInvitation}
                                    loading={loading}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Stack>

                {/* Success/Error Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </DashboardContent>
    );
}