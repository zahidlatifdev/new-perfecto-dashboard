'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { fDate } from 'src/utils/format-time';

import axios, { endpoints } from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomPopover, usePopover } from 'src/components/custom-popover';
import { Label } from 'src/components/label';

import {
    TableNoData,
    useTable,
    emptyRows,
    TableEmptyRows,
    TableHeadCustom,
    TableSelectedAction,
} from 'src/components/table';

import { useAuthContext } from 'src/auth/hooks';
import { Grid, List, ListItem, Alert, Paper, Snackbar } from '@mui/material';
import Link from 'next/link';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'name', label: 'Member', width: 220 },
    { id: 'role', label: 'Role', width: 120 },
    { id: 'permissions', label: 'Permissions', width: 200 },
    { id: 'joinedAt', label: 'Joined', width: 120 },
    { id: 'lastLogin', label: 'Last Active', width: 120 },
    { id: '', width: 88 },
];

const ROLE_OPTIONS = [
    { value: 'owner', label: 'Owner', color: 'error' },
    { value: 'admin', label: 'Admin', color: 'warning' },
    { value: 'accountant', label: 'Accountant', color: 'info' },
    { value: 'viewer', label: 'Viewer', color: 'default' },
];

const PERMISSION_OPTIONS = [
    { key: 'canViewTransactions', label: 'View Transactions' },
    { key: 'canUploadDocuments', label: 'Upload Documents' },
    { key: 'canManageUsers', label: 'Manage Users' },
    { key: 'canViewReports', label: 'View Reports' },
    { key: 'canManageIntegrations', label: 'Manage Integrations' },
    { key: 'canExportData', label: 'Export Data' },
];

// ----------------------------------------------------------------------

function CompanyMemberTableRow({ row, selected, onSelectRow, onEditRow, onDeleteRow, currentUserId, canManageUsers }) {
    const popover = usePopover();

    const roleOption = ROLE_OPTIONS.find(option => option.value === row.role);

    const handleDeleteRow = () => {
        onDeleteRow();
        popover.onClose();
    };

    const handleEditRow = () => {
        onEditRow();
        popover.onClose();
    };

    const permissionCount = row.permissions ? Object.values(row.permissions).filter(Boolean).length : 0;
    const isCurrentUser = row._id === currentUserId;
    const isOwner = row.role === 'owner';
    const canEditUser = canManageUsers && !isOwner;
    const canDeleteUser = canManageUsers && !isCurrentUser && !isOwner;

    return (
        <TableRow hover selected={selected}>
            <TableCell padding="checkbox">
                <Checkbox checked={selected} onClick={onSelectRow} />
            </TableCell>

            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                    alt={`${row.firstName} ${row.lastName}`}
                    src={row.avatar}
                    sx={{ mr: 2 }}
                >
                    {row.firstName?.charAt(0)}{row.lastName?.charAt(0)}
                </Avatar>

                <ListItemText
                    primary={`${row.firstName} ${row.lastName}`}
                    secondary={row.email}
                    primaryTypographyProps={{ typography: 'body2' }}
                    secondaryTypographyProps={{
                        component: 'span',
                        color: 'text.disabled',
                    }}
                />
            </TableCell>

            <TableCell>
                <Label variant="soft" color={roleOption?.color || 'default'}>
                    {roleOption?.label || row.role}
                </Label>
            </TableCell>

            <TableCell>
                <Tooltip title={`${permissionCount} permissions granted`}>
                    <Chip
                        size="small"
                        label={`${permissionCount} permissions`}
                        variant="outlined"
                    />
                </Tooltip>
            </TableCell>

            <TableCell>{fDate(row.joinedAt)}</TableCell>

            <TableCell>{row.lastLogin ? fDate(row.lastLogin) : 'Never'}</TableCell>

            <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
                {(canEditUser || canDeleteUser) && (
                    <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
                        <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>
                )}
            </TableCell>

            <CustomPopover
                open={popover.open}
                onClose={popover.onClose}
                arrow="right-top"
                sx={{ width: 140 }}
            >
                {canEditUser && (
                    <MenuItem onClick={handleEditRow}>
                        <Iconify icon="solar:pen-bold" />
                        Edit
                    </MenuItem>
                )}

                {canDeleteUser && (
                    <MenuItem onClick={handleDeleteRow} sx={{ color: 'error.main' }}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                        Remove
                    </MenuItem>
                )}
            </CustomPopover>
        </TableRow>
    );
}

// ----------------------------------------------------------------------

export function CollaborateView() {
    const table = useTable();
    const router = useRouter();

    const { selectedCompany, user } = useAuthContext();

    const inviteDialog = useBoolean();
    const editDialog = useBoolean();

    const [members, setMembers] = useState([]);
    const [editingMember, setEditingMember] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const { state: inviteForm, setState: setInviteForm } = useSetState({
        email: '',
        role: 'viewer',
        permissions: {
            canViewTransactions: true,
            canUploadDocuments: false,
            canManageUsers: false,
            canViewReports: true,
            canManageIntegrations: false,
            canExportData: false,
        },
    });

    const fetchMembers = useCallback(async () => {
        if (!selectedCompany?._id) return;

        try {
            setLoading(true);
            const response = await axios.get(endpoints.company.users(selectedCompany._id));
            setMembers(response.data.data.users || []);
        } catch (error) {
            console.error('Failed to fetch company members:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCompany]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleInviteMember = useCallback(async () => {
        if (!selectedCompany?._id) return;

        try {
            setLoading(true);
            await axios.post(endpoints.company.inviteUser(selectedCompany._id), {
                email: inviteForm.email,
                role: inviteForm.role,
                permissions: inviteForm.permissions,
            });

            inviteDialog.onFalse();
            setInviteForm({
                email: '',
                role: 'viewer',
                permissions: {
                    canViewTransactions: true,
                    canUploadDocuments: false,
                    canManageUsers: false,
                    canViewReports: true,
                    canManageIntegrations: false,
                    canExportData: false,
                },
            });

            // Refresh members list
            await fetchMembers();
            setSnackbar({ open: true, message: 'Member invited successfully!', severity: 'success' });
        } catch (error) {
            console.error('Failed to invite member:', error);
            setSnackbar({ open: true, message: 'Failed to invite member. Please try again.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [inviteForm, inviteDialog, setInviteForm, selectedCompany, fetchMembers]);

    const handleEditMember = useCallback(async () => {
        if (!selectedCompany?._id || !editingMember) return;

        try {
            setLoading(true);
            await axios.put(
                endpoints.company.updateUserRole(selectedCompany._id, editingMember._id),
                {
                    role: editingMember.role,
                    permissions: editingMember.permissions,
                }
            );

            editDialog.onFalse();
            setEditingMember(null);

            // Refresh members list
            await fetchMembers();
            setSnackbar({ open: true, message: 'Member updated successfully!', severity: 'success' });
        } catch (error) {
            console.error('Failed to update member:', error);
            setSnackbar({ open: true, message: 'Failed to update member. Please try again.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [editingMember, editDialog, selectedCompany, fetchMembers]);

    const handleRemoveMember = useCallback(async (memberId) => {
        if (!selectedCompany?._id) return;

        // Show confirmation dialog
        const confirmed = window.confirm(
            'Are you sure you want to remove this member from the company? This action cannot be undone.'
        );

        if (!confirmed) return;

        try {
            setLoading(true);
            await axios.delete(endpoints.company.removeUser(selectedCompany._id, memberId));

            // Refresh members list
            await fetchMembers();
            setSnackbar({ open: true, message: 'Member removed successfully!', severity: 'success' });
        } catch (error) {
            console.error('Failed to remove member:', error);
            setSnackbar({ open: true, message: 'Failed to remove member. Please try again.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [selectedCompany, fetchMembers]);

    const openEditDialog = useCallback((member) => {
        setEditingMember({ ...member });
        editDialog.onTrue();
    }, [editDialog]);

    const notFound = !members.length;

    const canManageUsers = selectedCompany?.role === 'owner' || selectedCompany?.role === 'admin' || selectedCompany?.permissions?.canManageUsers;

    if (!selectedCompany) {
        return (
            <DashboardContent>
                <Container maxWidth="xl">

                    <Alert severity="warning" sx={{ mt: 3 }}>
                        No company selected. Please select a company to manage its members.
                    </Alert>
                </Container>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent>
            <Container maxWidth="xl">

                <Card>
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Company Members
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Manage your team members and their permissions
                            </Typography>
                        </Box>

                        {canManageUsers && (
                            <Button
                                variant="contained"
                                startIcon={<Iconify icon="mingcute:add-line" />}
                                onClick={inviteDialog.onTrue}
                            >
                                Invite Member
                            </Button>
                        )}
                    </Box>

                    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                        <Scrollbar>
                            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                                <TableHeadCustom
                                    order={table.order}
                                    orderBy={table.orderBy}
                                    headLabel={TABLE_HEAD}
                                    rowCount={members.length}
                                    numSelected={table.selected.length}
                                    onSort={table.onSort}
                                    onSelectAllRows={(checked) =>
                                        table.onSelectAllRows(
                                            checked,
                                            members.map((row) => row._id)
                                        )
                                    }
                                />

                                <TableBody>
                                    {members
                                        .slice(
                                            table.page * table.rowsPerPage,
                                            table.page * table.rowsPerPage + table.rowsPerPage
                                        )
                                        .map((row) => (
                                            <CompanyMemberTableRow
                                                key={row._id}
                                                row={row}
                                                selected={table.selected.includes(row._id)}
                                                onSelectRow={() => table.onSelectRow(row._id)}
                                                onEditRow={() => openEditDialog(row)}
                                                onDeleteRow={() => handleRemoveMember(row._id)}
                                                currentUserId={user?._id}
                                                canManageUsers={canManageUsers}
                                            />
                                        ))}

                                    <TableEmptyRows
                                        height={68}
                                        emptyRows={emptyRows(table.page, table.rowsPerPage, members.length)}
                                    />

                                    <TableNoData notFound={notFound} />
                                </TableBody>
                            </Table>
                        </Scrollbar>
                    </TableContainer>

                    <TablePagination
                        page={table.page}
                        dense={table.dense}
                        count={members.length}
                        rowsPerPage={table.rowsPerPage}
                        onPageChange={table.onChangePage}
                        onRowsPerPageChange={table.onChangeRowsPerPage}
                        onChangeDense={table.onChangeDense}
                    />
                </Card>
            </Container>

            {/* Invite Member Dialog */}
            <Dialog open={inviteDialog.value} onClose={inviteDialog.onFalse} maxWidth="sm" fullWidth>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm({ email: e.target.value })}
                            placeholder="Enter email address"
                        />

                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={inviteForm.role}
                                label="Role"
                                onChange={(e) => setInviteForm({ role: e.target.value })}
                            >
                                {ROLE_OPTIONS.filter(option => {
                                    // Only owner can assign admin role
                                    if (option.value === 'admin' && selectedCompany?.role !== 'owner') {
                                        return false;
                                    }
                                    // Nobody can assign owner role through invite
                                    return option.value !== 'owner';
                                }).map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                Permissions
                            </Typography>
                            <FormGroup>
                                {PERMISSION_OPTIONS.map((permission) => (
                                    <FormControlLabel
                                        key={permission.key}
                                        control={
                                            <Checkbox
                                                checked={inviteForm.permissions[permission.key]}
                                                onChange={(e) =>
                                                    setInviteForm({
                                                        permissions: {
                                                            ...inviteForm.permissions,
                                                            [permission.key]: e.target.checked,
                                                        },
                                                    })
                                                }
                                            />
                                        }
                                        label={permission.label}
                                    />
                                ))}
                            </FormGroup>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={inviteDialog.onFalse}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleInviteMember}
                        disabled={loading || !inviteForm.email.trim()}
                    >
                        Send Invitation
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Member Dialog */}
            {editingMember && (
                <Dialog open={editDialog.value} onClose={editDialog.onFalse} maxWidth="sm" fullWidth>
                    <DialogTitle>Edit Member</DialogTitle>
                    <DialogContent>
                        <Stack spacing={3} sx={{ pt: 1 }}>
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    Member Information
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {editingMember.firstName} {editingMember.lastName} ({editingMember.email})
                                </Typography>
                            </Box>

                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={editingMember.role}
                                    label="Role"
                                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                                >
                                    {ROLE_OPTIONS.filter(option => {
                                        // Only owner can assign admin role
                                        if (option.value === 'admin' && selectedCompany?.role !== 'owner') {
                                            return false;
                                        }
                                        // Nobody can change owner role
                                        return option.value !== 'owner';
                                    }).map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                    Permissions
                                </Typography>
                                <FormGroup>
                                    {PERMISSION_OPTIONS.map((permission) => (
                                        <FormControlLabel
                                            key={permission.key}
                                            control={
                                                <Checkbox
                                                    checked={editingMember.permissions?.[permission.key] || false}
                                                    onChange={(e) =>
                                                        setEditingMember({
                                                            ...editingMember,
                                                            permissions: {
                                                                ...editingMember.permissions,
                                                                [permission.key]: e.target.checked,
                                                            },
                                                        })
                                                    }
                                                />
                                            }
                                            label={permission.label}
                                        />
                                    ))}
                                </FormGroup>
                            </Box>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={editDialog.onFalse}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleEditMember}
                            disabled={loading}
                        >
                            Update Member
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

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
        </DashboardContent>
    );
}

// ----------------------------------------------------------------------

export function CollaborationView() {
    const router = useRouter();
    const { selectedCompany, companies } = useAuthContext();

    const [members, setMembers] = useState([]);
    const [advisorNotes, setAdvisorNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchMembers = useCallback(async () => {
        if (!selectedCompany?._id) return;

        try {
            setLoading(true);
            const response = await axios.get(endpoints.company.users(selectedCompany._id));
            setMembers(response.data.data.users || []);
        } catch (error) {
            console.error('Failed to fetch company members:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCompany]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleNavigateToUserManagement = () => {
        // Navigate directly to the collaborate view for full member management
        router.push('/dashboard/collaborate');
    };

    return (
        <DashboardContent maxWidth="xl">
            <Typography variant="h4" sx={{ mb: 3 }}>
                Users & Collaboration
            </Typography>

            <Grid container spacing={3}>
                {/* Manage Users Card */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: '100%' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2,
                            }}
                        >
                            <Typography variant="h6" sx={{ color: 'text.primary' }}>
                                Company Members ({members.length})
                            </Typography>

                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<Iconify icon="ph:user-plus-bold" />}
                                onClick={handleNavigateToUserManagement}
                                sx={{ fontSize: '0.75rem' }}
                            >
                                Manage Members
                            </Button>
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                <Iconify icon="svg-spinners:8-dots-rotate" width={32} />
                            </Box>
                        ) : (
                            <List disablePadding>
                                {members.slice(0, 5).map((member) => (
                                    <ListItem
                                        key={member._id}
                                        sx={{
                                            p: 1.5,
                                            mb: 1,
                                            bgcolor: 'background.neutral',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Avatar
                                            src={member.avatar}
                                            alt={`${member.firstName} ${member.lastName}`}
                                            sx={{ mr: 2, width: 32, height: 32 }}
                                        >
                                            {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                                        </Avatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2">
                                                    {member.firstName} {member.lastName} ({member.role})
                                                </Typography>
                                            }
                                            secondary={member.email}
                                        />
                                    </ListItem>
                                ))}
                                {members.length === 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                        No members found
                                    </Typography>
                                )}
                                {members.length > 5 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', pt: 1 }}>
                                        +{members.length - 5} more members
                                    </Typography>
                                )}
                            </List>
                        )}
                    </Card>
                </Grid>

                {/* Notes from Advisor Card */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ color: 'text.primary', mb: 2 }}>
                            Notes from Advisor
                        </Typography>

                        {advisorNotes.length > 0 ? (
                            advisorNotes.map((note) => (
                                <Alert
                                    key={note.id}
                                    severity="warning"
                                    variant="outlined"
                                    sx={{
                                        bgcolor: 'warning.lighter',
                                        borderLeftWidth: 4,
                                        borderColor: 'warning.main',
                                        mb: 2,
                                        '& .MuiAlert-message': {
                                            width: '100%',
                                        },
                                    }}
                                >
                                    <Box sx={{ mb: 0.5 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: 'medium',
                                                color: 'warning.dark',
                                            }}
                                        >
                                            {note.author} ({note.date}):
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                        "{note.content}"
                                    </Typography>
                                </Alert>
                            ))
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: 100,
                                }}
                            >
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    No advisor notes yet.
                                </Typography>
                            </Box>
                        )}
                    </Card>
                </Grid>

                {/* Additional Collaboration Features - Optional */}
                <Grid item xs={12}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Collaboration Features
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        textAlign: 'center',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Iconify
                                        icon="ph:calendar-check-bold"
                                        sx={{
                                            fontSize: 40,
                                            color: 'primary.main',
                                            mb: 1,
                                        }}
                                    />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                        Schedule Meeting
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                        Set up a virtual meeting with your advisor
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        textAlign: 'center',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Iconify
                                        icon="ph:share-network-bold"
                                        sx={{
                                            fontSize: 40,
                                            color: 'info.main',
                                            mb: 1,
                                        }}
                                    />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                        Share Reports
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                        Share financial reports with team members
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        textAlign: 'center',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Iconify
                                        icon="ph:note-pencil-bold"
                                        sx={{
                                            fontSize: 40,
                                            color: 'success.main',
                                            mb: 1,
                                        }}
                                    />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                        Shared Notes
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                        Collaborate on financial notes and insights
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
            </Grid>
        </DashboardContent>
    );
}