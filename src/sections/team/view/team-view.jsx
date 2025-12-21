'use client';

import { useState, useEffect, useCallback } from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';

import { useAuthContext } from 'src/auth/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

const InviteSchema = zod.object({
  email: zod.string().min(1, { message: 'Email is required!' }).email({ message: 'Invalid email address!' }),
  firstName: zod.string().min(1, { message: 'First name is required!' }),
  lastName: zod.string().min(1, { message: 'Last name is required!' }),
});

// ----------------------------------------------------------------------

export function TeamView() {
  const { company } = useAuthContext();

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const defaultValues = {
    email: '',
    firstName: '',
    lastName: '',
  };

  const methods = useForm({
    resolver: zodResolver(InviteSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const fetchInvitations = useCallback(async () => {
    if (!company?._id) return;

    try {
      setLoading(true);
      const response = await axios.get(endpoints.invitations.company(company._id));
      setInvitations(response.data.invitations || []);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
      setErrorMsg('Failed to load team members');
    } finally {
      setLoading(false);
    }
  }, [company]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const onSubmitInvite = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');

      await axios.post(endpoints.invitations.send(company._id), {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      setSuccessMsg(`Invitation sent to ${data.email}`);
      setShowInviteDialog(false);
      reset();
      fetchInvitations();
    } catch (error) {
      console.error('Failed to send invitation:', error);
      setErrorMsg(error.response?.data?.message || 'Failed to send invitation');
    }
  });

  const handleRevokeInvitation = async (invitationId) => {
    if (!confirm('Are you sure you want to revoke this invitation?')) return;

    try {
      await axios.post(endpoints.invitations.cancel(invitationId));
      setSuccessMsg('Invitation revoked successfully');
      fetchInvitations();
    } catch (error) {
      console.error('Failed to revoke invitation:', error);
      setErrorMsg(error.message || 'Failed to revoke invitation');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'pending':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4">Team</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Manage team members and invitations
            </Typography>
          </div>

          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => setShowInviteDialog(true)}
          >
            Invite Member
          </Button>
        </Stack>

        {!!errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        {!!successMsg && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg('')}>
            {successMsg}
          </Alert>
        )}

        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Invited On</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invitations.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Iconify icon="mdi:account-off" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No Team Members Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Invite team members to collaborate
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                invitations.map((invitation) => (
                  <TableRow key={invitation._id}>
                    <TableCell>
                      {invitation.firstName} {invitation.lastName}
                    </TableCell>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={invitation.status}
                        size="small"
                        color={getStatusColor(invitation.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(invitation.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      {invitation.status === 'pending' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRevokeInvitation(invitation._id)}
                        >
                          <Iconify icon="eva:close-circle-outline" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </Container>

      {/* Invite Dialog */}
      <Dialog
        open={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invite Team Member</DialogTitle>
        <DialogContent>
          <Form methods={methods} onSubmit={onSubmitInvite}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Field.Text name="firstName" label="First Name" InputLabelProps={{ shrink: true }} />
              <Field.Text name="lastName" label="Last Name" InputLabelProps={{ shrink: true }} />
              <Field.Text name="email" label="Email Address" InputLabelProps={{ shrink: true }} />
            </Stack>
          </Form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInviteDialog(false)} color="inherit">
            Cancel
          </Button>
          <LoadingButton onClick={onSubmitInvite} variant="contained" loading={isSubmitting}>
            Send Invitation
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

