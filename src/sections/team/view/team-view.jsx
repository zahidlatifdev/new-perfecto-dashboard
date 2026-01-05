'use client';

import { useState, useEffect, useCallback } from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { alpha } from '@mui/material/styles';

import { useAuthContext } from 'src/auth/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import axios, { endpoints } from 'src/utils/axios';
import { Tooltip } from '@mui/material';

// ----------------------------------------------------------------------

const InviteSchema = zod.object({
  email: zod.string().min(1, { message: 'Email is required!' }).email({ message: 'Invalid email address!' }),
  firstName: zod.string().min(1, { message: 'First name is required!' }),
  lastName: zod.string().min(1, { message: 'Last name is required!' }),
  role: zod.enum(['owner', 'admin', 'member'], { message: 'Role is required!' }),
});

// ----------------------------------------------------------------------

export function TeamView() {
  const { company } = useAuthContext();

  const [invitations, setInvitations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const defaultValues = {
    email: '',
    firstName: '',
    lastName: '',
    role: 'member',
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

      // Fetch pending invitations
      const invitationsResponse = await axios.get(endpoints.invitations.company(company._id));
      setInvitations(invitationsResponse.data.data.invitations || []);

      // Fetch company users (accepted members)
      const usersResponse = await axios.get(endpoints.company.team(company._id));
      setUsers(usersResponse.data.data.users || []);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
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

      await axios.post(endpoints.company.inviteUser(company._id), {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
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

  const handleResendInvitation = async (invitationId) => {
    try {
      setErrorMsg('');
      await axios.post(endpoints.invitations.resend(invitationId));
      setSuccessMsg('Invitation resent successfully');
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      setErrorMsg(error.response?.data?.message || 'Failed to resend invitation');
    }
  };

  const handleRevokeInvitation = async (invitationId) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;

    try {
      setErrorMsg('');
      await axios.delete(endpoints.invitations.cancel(invitationId));
      setSuccessMsg('Invitation revoked successfully');
      fetchInvitations();
    } catch (error) {
      console.error('Failed to revoke invitation:', error);
      setErrorMsg(error.response?.data?.message || 'Failed to revoke invitation');
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user from the team?')) return;

    try {
      setErrorMsg('');
      await axios.delete(endpoints.company.removeUser(company._id, userId));
      setSuccessMsg('User removed successfully');
      fetchInvitations();
    } catch (error) {
      console.error('Failed to remove user:', error);
      setErrorMsg(error.response?.data?.message || 'Failed to remove user');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      setErrorMsg('');
      await axios.patch(endpoints.company.updateUserRole(company._id, userId), {
        role: newRole,
      });
      setSuccessMsg(`Role updated to ${newRole} successfully`);
      setAnchorEl(null);
      fetchInvitations();
    } catch (error) {
      console.error('Failed to update role:', error);
      setErrorMsg(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleOpenMenu = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedMember(null);
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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return 'mdi:shield-crown';
      case 'admin':
        return 'mdi:shield-account';
      default:
        return 'mdi:account';
    }
  };

  // Combine users and invitations for display
  const allMembers = [
    ...users.map(user => ({ ...user, status: 'accepted', isUser: true })),
    ...invitations.map(inv => ({ ...inv, status: inv.status, isUser: false }))
  ];

  const activeMembers = allMembers.filter((m) => m.status === 'accepted').length;
  const pendingInvites = allMembers.filter((m) => m.status === 'pending').length;

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Hero */}
          <Card
            sx={{
              p: 4,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'primary.contrastText',
              animation: 'fadeIn 0.6s ease-in',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Iconify icon="mdi:account-group" width={24} />
                  <Typography variant="h4" fontWeight={700}>
                    Team
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                  Manage your team members and their access permissions. Invite new members to
                  collaborate on your financial data.
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon="mdi:plus" width={16} />}
                onClick={() => setShowInviteDialog(true)}
                sx={{
                  bgcolor: 'background.paper',
                  color: 'primary.main',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                Invite Member
              </Button>
            </Box>
          </Card>

          {!!errorMsg && (
            <Alert severity="error" onClose={() => setErrorMsg('')}>
              {errorMsg}
            </Alert>
          )}

          {!!successMsg && (
            <Alert severity="success" onClose={() => setSuccessMsg('')}>
              {successMsg}
            </Alert>
          )}

          {/* Stats */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon="mdi:account-group" width={20} color="primary.main" />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Members
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {allMembers.length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: alpha('#16a34a', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon="mdi:account-check" width={20} sx={{ color: '#16a34a' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Active
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {activeMembers}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: alpha('#f59e0b', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon="mdi:clock-outline" width={20} sx={{ color: '#f59e0b' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Pending Invites
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {pendingInvites}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Team Members List */}
          <Card>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                Team Members
              </Typography>
              <Typography variant="body2" color="text.secondary">
                People with access to your Perfecto account
              </Typography>
            </Box>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {allMembers.length === 0 && !loading ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Iconify
                      icon="mdi:account-off"
                      width={64}
                      sx={{ color: 'text.disabled', mb: 2 }}
                    />
                    <Typography variant="h6" gutterBottom>
                      No Team Members Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Invite team members to collaborate
                    </Typography>
                  </Box>
                ) : (
                  allMembers.map((member) => (
                    <Box
                      key={member._id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: 1.5,
                        border: 1,
                        borderColor: 'divider',
                        transition: 'all 0.3s',
                        '&:hover': {
                          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05),
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          fontWeight: 600,
                        }}
                      >
                        {member.firstName?.charAt(0)}
                        {member.lastName?.charAt(0)}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {member.firstName} {member.lastName}
                          </Typography>
                          <Chip
                            label={member.status}
                            size="small"
                            color={getStatusColor(member.status)}
                            sx={{ height: 20, fontSize: '0.75rem' }}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Iconify icon="mdi:email" width={12} color="text.secondary" />
                            <Typography variant="caption" color="text.secondary">
                              {member.email}
                            </Typography>
                          </Box>
                          {member.role && (
                            <>
                              <Typography variant="caption" color="text.secondary">
                                •
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Iconify
                                  icon={getRoleIcon(member.role)}
                                  width={12}
                                  color="text.secondary"
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {member.role}
                                </Typography>
                              </Box>
                            </>
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography variant="caption" color="text.secondary">
                          {member.status === 'accepted' ? 'Joined' : 'Invited'}{' '}
                          {new Date(member.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>

                      {member.status === 'pending' && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Resend invitation">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleResendInvitation(member._id)}
                              title="Resend invitation"
                            >
                              <Iconify icon="mdi:email-send" width={20} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Revoke invitation">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRevokeInvitation(member._id)}
                              title="Revoke invitation"
                            >
                              <Iconify icon="mdi:close-circle-outline" width={20} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}

                      {member.status === 'accepted' && member.isUser && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, member)}
                        >
                          <Iconify icon="mdi:dots-vertical" width={20} />
                        </IconButton>
                      )}
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Roles Info */}
          <Card>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={600}>
                Role Permissions
              </Typography>
            </Box>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05),
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Iconify icon="mdi:shield-crown" width={20} color="primary.main" />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Owner
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Full access to all features including billing, team management, and account
                      settings.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05),
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Iconify icon="mdi:shield-account" width={20} sx={{ color: '#f59e0b' }} />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Admin
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Can manage transactions, reports, and team members. Cannot access billing.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05),
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Iconify icon="mdi:account" width={20} color="text.secondary" />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Member
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      View-only access to financial data. Can create reports and use AI features.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
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
              <Field.Select name="role" label="Role" InputLabelProps={{ shrink: true }}>
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="owner">Owner</MenuItem>
              </Field.Select>
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

      {/* User Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled sx={{ opacity: 0.6, cursor: 'default' }}>
          <ListItemText
            primary="Change Role"
            primaryTypographyProps={{ variant: 'caption', fontWeight: 600 }}
          />
        </MenuItem>
        <MenuItem onClick={() => {
          handleUpdateRole(selectedMember?._id, 'owner');
        }}>
          <ListItemIcon>
            <Iconify icon="mdi:shield-crown" width={18} />
          </ListItemIcon>
          <ListItemText primary="Owner" />
        </MenuItem>
        <MenuItem onClick={() => {
          handleUpdateRole(selectedMember?._id, 'admin');
        }}>
          <ListItemIcon>
            <Iconify icon="mdi:shield-account" width={18} />
          </ListItemIcon>
          <ListItemText primary="Admin" />
        </MenuItem>
        <MenuItem onClick={() => {
          handleUpdateRole(selectedMember?._id, 'member');
        }}>
          <ListItemIcon>
            <Iconify icon="mdi:account" width={18} />
          </ListItemIcon>
          <ListItemText primary="Member" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            handleRemoveUser(selectedMember?._id);
          }}
          sx={{ color: 'error.main', mt: 1 }}
        >
          <ListItemIcon>
            <Iconify icon="mdi:delete-outline" width={18} color="error.main" />
          </ListItemIcon>
          <ListItemText primary="Remove User" />
        </MenuItem>
      </Menu>
    </DashboardContent>
  );
}

