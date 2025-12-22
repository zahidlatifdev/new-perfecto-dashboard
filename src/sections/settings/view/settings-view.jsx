'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';

import { useAuthContext } from 'src/auth/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import axios, { endpoints } from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SettingsView() {
    const { user, checkUserSession } = useAuthContext();
    const loading = useBoolean();
    const changePasswordDialog = useBoolean();
    const [success, setSuccess] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { state: profile, setState: setProfile } = useSetState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        avatar: user?.avatar || '',
    });

    const { state: passwordForm, setState: setPasswordForm } = useSetState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleSaveProfile = useCallback(async () => {
        try {
            loading.onTrue();
            setSuccess(false);
            await axios.put(endpoints.user.update, profile);
            await checkUserSession();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            loading.onFalse();
        }
    }, [profile, loading, checkUserSession]);

    const handleChangePassword = useCallback(async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            loading.onTrue();
            await axios.post(endpoints.user.changePassword, {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            changePasswordDialog.onFalse();
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            alert('Password changed successfully');
        } catch (error) {
            console.error('Failed to change password:', error);
            alert(error.message || 'Failed to change password');
        } finally {
            loading.onFalse();
        }
    }, [passwordForm, loading, changePasswordDialog, setPasswordForm]);

    return (
        <DashboardContent>
            <Container maxWidth="lg">
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <div>
                        <Typography variant="h4">Profile Settings</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                            Manage your personal information and security
                        </Typography>
                    </div>
                </Stack>

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Profile updated successfully!
                    </Alert>
                )}

                <Card sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                        Personal Information
                    </Typography>

                    <Stack spacing={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Avatar
                                src={profile.avatar}
                                alt={`${profile.firstName} ${profile.lastName}`}
                                sx={{ width: 80, height: 80 }}
                            >
                                {profile.firstName?.[0]}
                                {profile.lastName?.[0]}
                            </Avatar>
                            <Stack spacing={1}>
                                <Typography variant="subtitle1">
                                    {profile.firstName} {profile.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {profile.email}
                                </Typography>
                            </Stack>
                        </Box>

                        <Divider />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    value={profile.firstName}
                                    onChange={(e) => setProfile({ firstName: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    value={profile.lastName}
                                    onChange={(e) => setProfile({ lastName: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Email" value={profile.email} disabled />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ phone: e.target.value })}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ textAlign: 'right', mt: 3 }}>
                            <Button
                                variant="contained"
                                onClick={handleSaveProfile}
                                disabled={loading.value}
                                startIcon={loading.value ? <Iconify icon="svg-spinners:8-dots-rotate" /> : undefined}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </Stack>
                </Card>

                <Card sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                        Security
                    </Typography>

                    <Stack spacing={3}>
                        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="subtitle1">Password</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Update your password to keep your account secure
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<Iconify icon="solar:lock-password-bold" />}
                                onClick={changePasswordDialog.onTrue}
                            >
                                Change Password
                            </Button>
                        </Stack>
                    </Stack>
                </Card>
            </Container>

            {/* Change Password Dialog */}
            <Dialog
                open={changePasswordDialog.value}
                onClose={changePasswordDialog.onFalse}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Current Password"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ currentPassword: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            edge="end"
                                        >
                                            <Iconify icon={showCurrentPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="New Password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ newPassword: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            edge="end"
                                        >
                                            <Iconify icon={showNewPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ confirmPassword: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            <Iconify icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={changePasswordDialog.onFalse} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleChangePassword}
                        variant="contained"
                        disabled={
                            loading.value ||
                            !passwordForm.currentPassword ||
                            !passwordForm.newPassword ||
                            !passwordForm.confirmPassword
                        }
                    >
                        Change Password
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardContent>
    );
}
