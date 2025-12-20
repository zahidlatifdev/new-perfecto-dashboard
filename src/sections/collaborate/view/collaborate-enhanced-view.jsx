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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

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
import Link from 'next/link';

// ----------------------------------------------------------------------

const MEMBER_TABLE_HEAD = [
    { id: 'name', label: 'Member', width: 220 },
    { id: 'role', label: 'Role', width: 120 },
    { id: 'permissions', label: 'Permissions', width: 200 },
    { id: 'joinedAt', label: 'Joined', width: 120 },
    { id: 'lastLogin', label: 'Last Active', width: 120 },
    { id: '', width: 88 },
];

const INVITATION_TABLE_HEAD = [
    { id: 'email', label: 'Email', width: 200 },
    { id: 'role', label: 'Role', width: 120 },
    { id: 'status', label: 'Status', width: 120 },
    { id: 'invitedBy', label: 'Invited By', width: 180 },
    { id: 'createdAt', label: 'Sent', width: 120 },
    { id: 'expiresAt', label: 'Expires', width: 120 },
    { id: '', width: 88 },
];

const ROLE_OPTIONS = [
    {
        value: 'admin',
        label: 'Admin',
        color: 'error',
        description: 'Full access to all features and settings'
    },
    {
        value: 'accountant',
        label: 'Accountant',
        color: 'warning',
        description: 'Full financial management with limited administrative access'
    },
    {
        value: 'bookkeeper',
        label: 'Bookkeeper',
        color: 'info',
        description: 'Data entry and basic financial operations'
    },
    {
        value: 'analyst',
        label: 'Analyst',
        color: 'success',
        description: 'Read-only access with reporting and analytics'
    },
    {
        value: 'viewer',
        label: 'Viewer',
        color: 'default',
        description: 'Basic read-only access to essential information'
    },
];

const PERMISSION_GROUPS = [
    {
        title: 'Financial Data',
        permissions: [
            { key: 'pendingItems', label: 'Pending Items', actions: ['view', 'manage'] },
            { key: 'transactions', label: 'Transactions', actions: ['view', 'create', 'edit', 'delete'] },
            { key: 'generalLedger', label: 'General Ledger', actions: ['view', 'edit'] },
            { key: 'financialAccounts', label: 'Accounts Management', actions: ['view', 'create', 'edit', 'delete'] },
        ]
    },
    {
        title: 'Documents',
        permissions: [
            { key: 'receipts', label: 'Receipts', actions: ['view', 'upload', 'edit', 'delete'] },
            { key: 'invoices', label: 'Invoices', actions: ['view', 'upload', 'edit', 'delete'] },
            { key: 'bills', label: 'Bills', actions: ['view', 'upload', 'edit', 'delete'] },
            { key: 'bankStatements', label: 'Bank Statements', actions: ['view', 'upload', 'edit', 'delete'] },
            { key: 'cardStatements', label: 'Card Statements', actions: ['view', 'upload', 'edit', 'delete'] },
        ]
    },
    {
        title: 'Operations',
        permissions: [
            { key: 'matching', label: 'Matching', actions: ['view', 'process', 'approve'] },
            { key: 'reports', label: 'Reports', actions: ['view', 'generate', 'export'] },
            { key: 'taxHub', label: 'Tax Hub', actions: ['view', 'manage'] },
            { key: 'automationHub', label: 'Automation Hub', actions: ['view', 'create', 'edit', 'delete'] },
            { key: 'integrations', label: 'Integrations', actions: ['view', 'connect', 'manage'] },
        ]
    },
    {
        title: 'Communication & Team',
        permissions: [
            { key: 'chatWithBooks', label: 'Chat with Books', actions: ['access'] },
            { key: 'msgMyBookkeeper', label: 'Message Bookkeeper', actions: ['access'] },
            { key: 'collaboration', label: 'Collaboration', actions: ['view', 'manage'] },
            { key: 'teamManagement', label: 'Team Management', actions: ['viewMembers', 'inviteMembers', 'editRoles', 'removeMembers'] },
        ]
    },
    {
        title: 'Settings & Admin',
        permissions: [
            {
                key: 'settings',
                label: 'Settings',
                actions: [
                    { id: 'company', label: 'company (edit company details)' },
                    { id: 'myCompanies', label: 'myCompanies (view companies list)' },
                    { id: 'billing', label: 'billing (manage billing settings)' }
                ]
            },
            { key: 'subscription', label: 'Subscription', actions: ['view', 'manage'] },
        ]
    }
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

    const permissionCount = row.permissions ?
        Object.values(row.permissions).reduce((count, group) => {
            if (typeof group === 'object') {
                return count + Object.values(group).filter(Boolean).length;
            }
            return count + (group ? 1 : 0);
        }, 0) : 0;

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

            <TableCell>{fDate(row.addedAt)}</TableCell>

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
                anchorEl={popover.anchorEl}
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

function InvitationTableRow({ row, onResend, onCancel, canManageInvitations }) {
    const popover = usePopover();

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'accepted': return 'success';
            case 'rejected': return 'error';
            case 'expired': return 'default';
            default: return 'default';
        }
    };

    const isExpired = new Date(row.expiresAt) < new Date();
    const displayStatus = isExpired && row.status === 'pending' ? 'expired' : row.status;

    return (
        <TableRow hover>
            <TableCell>{row.email}</TableCell>

            <TableCell>
                <Label variant="soft" color={ROLE_OPTIONS.find(r => r.value === row.role)?.color || 'default'}>
                    {ROLE_OPTIONS.find(r => r.value === row.role)?.label || row.role}
                </Label>
            </TableCell>

            <TableCell>
                <Label variant="soft" color={getStatusColor(displayStatus)}>
                    {displayStatus}
                </Label>
            </TableCell>

            <TableCell>{row.invitedBy?.name || 'Unknown'}</TableCell>
            <TableCell>{fDate(row.createdAt)}</TableCell>
            <TableCell>{fDate(row.expiresAt)}</TableCell>

            <TableCell align="right">
                {canManageInvitations && row.status === 'pending' && (
                    <IconButton onClick={popover.onOpen}>
                        <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>
                )}
            </TableCell>

            <CustomPopover
                open={popover.open}
                onClose={popover.onClose}
                arrow="right-top"
                anchorEl={popover.anchorEl}
                sx={{ width: 140 }}
            >
                <MenuItem onClick={() => { onResend(row._id); popover.onClose(); }}>
                    <Iconify icon="solar:restart-bold" />
                    Resend
                </MenuItem>
                <MenuItem onClick={() => { onCancel(row._id); popover.onClose(); }} sx={{ color: 'error.main' }}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                    Cancel
                </MenuItem>
            </CustomPopover>
        </TableRow>
    );
}

// ----------------------------------------------------------------------

export function CollaborateEnhancedView() {
    const memberTable = useTable();
    const invitationTable = useTable();
    const router = useRouter();

    const { selectedCompany, user } = useAuthContext();

    const inviteDialog = useBoolean();
    const editDialog = useBoolean();

    const [currentTab, setCurrentTab] = useState(0);
    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [editingMember, setEditingMember] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const { state: inviteForm, setState: setInviteForm } = useSetState({
        email: '',
        role: 'viewer',
        permissions: {},
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

    const fetchInvitations = useCallback(async () => {
        if (!selectedCompany?._id) return;

        try {
            const response = await axios.get(endpoints.invitations.company(selectedCompany._id));
            setInvitations(response.data.data.invitations || []);
        } catch (error) {
            console.error('Failed to fetch invitations:', error);
        }
    }, [selectedCompany]);

    useEffect(() => {
        fetchMembers();
        fetchInvitations();
    }, [fetchMembers, fetchInvitations]);

    const handleSendInvitation = useCallback(async () => {
        if (!selectedCompany?._id) return;

        try {
            setLoading(true);
            await axios.post(endpoints.invitations.send(selectedCompany._id), inviteForm);

            inviteDialog.onFalse();
            setInviteForm({
                email: '',
                role: 'viewer',
                permissions: {},
            });

            await fetchInvitations();
            setSnackbar({ open: true, message: 'Invitation sent successfully!', severity: 'success' });
        } catch (error) {
            console.error('Failed to send invitation:', error);
            setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to send invitation', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [inviteForm, inviteDialog, setInviteForm, selectedCompany, fetchInvitations]);

    const handleResendInvitation = useCallback(async (invitationId) => {
        try {
            await axios.post(endpoints.invitations.resend(invitationId));
            await fetchInvitations();
            setSnackbar({ open: true, message: 'Invitation resent successfully!', severity: 'success' });
        } catch (error) {
            console.error('Failed to resend invitation:', error);
            setSnackbar({ open: true, message: 'Failed to resend invitation', severity: 'error' });
        }
    }, [fetchInvitations]);

    const handleCancelInvitation = useCallback(async (invitationId) => {
        try {
            await axios.delete(endpoints.invitations.cancel(invitationId));
            await fetchInvitations();
            setSnackbar({ open: true, message: 'Invitation cancelled successfully!', severity: 'success' });
        } catch (error) {
            console.error('Failed to cancel invitation:', error);
            setSnackbar({ open: true, message: 'Failed to cancel invitation', severity: 'error' });
        }
    }, [fetchInvitations]);

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
            await fetchMembers();
            setSnackbar({ open: true, message: 'Member updated successfully!', severity: 'success' });
        } catch (error) {
            console.error('Failed to update member:', error);
            setSnackbar({ open: true, message: 'Failed to update member', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [editingMember, editDialog, selectedCompany, fetchMembers]);

    const handleRemoveMember = useCallback(async (memberId) => {
        if (!selectedCompany?._id) return;

        const confirmed = window.confirm(
            'Are you sure you want to remove this member from the company?'
        );

        if (!confirmed) return;

        try {
            setLoading(true);
            await axios.delete(endpoints.company.removeUser(selectedCompany._id, memberId));
            await fetchMembers();
            setSnackbar({ open: true, message: 'Member removed successfully!', severity: 'success' });
        } catch (error) {
            console.error('Failed to remove member:', error);
            setSnackbar({ open: true, message: 'Failed to remove member', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [selectedCompany, fetchMembers]);

    const openEditDialog = useCallback((member) => {
        setEditingMember({ ...member });
        editDialog.onTrue();
    }, [editDialog]);

    const getDefaultPermissions = (role) => {
        const defaults = {
            admin: {
                pendingItems: { view: true, manage: true },
                transactions: { view: true, create: true, edit: true, delete: true },
                generalLedger: { view: true, edit: true },
                financialAccounts: { view: true, create: true, edit: true, delete: true },
                receipts: { view: true, upload: true, edit: true, delete: true },
                invoices: { view: true, upload: true, edit: true, delete: true },
                bills: { view: true, upload: true, edit: true, delete: true },
                bankStatements: { view: true, upload: true, edit: true, delete: true },
                cardStatements: { view: true, upload: true, edit: true, delete: true },
                matching: { view: true, process: true, approve: true },
                reports: { view: true, generate: true, export: true },
                chatWithBooks: { access: true },
                taxHub: { view: true, manage: true },
                automationHub: { view: true, create: true, edit: true, delete: true },
                integrations: { view: true, connect: true, manage: true },
                msgMyBookkeeper: { access: true },
                collaboration: { view: true, manage: true },
                settings: { company: true, myCompanies: true, billing: true },
                subscription: { view: true, manage: true },
                teamManagement: { viewMembers: true, inviteMembers: true, editRoles: true, removeMembers: true }
            },
            accountant: {
                pendingItems: { view: true, manage: true },
                transactions: { view: true, create: true, edit: true, delete: false },
                generalLedger: { view: true, edit: true },
                financialAccounts: { view: true, create: true, edit: true, delete: false },
                receipts: { view: true, upload: true, edit: true, delete: false },
                invoices: { view: true, upload: true, edit: true, delete: false },
                bills: { view: true, upload: true, edit: true, delete: false },
                bankStatements: { view: true, upload: true, edit: true, delete: false },
                cardStatements: { view: true, upload: true, edit: true, delete: false },
                matching: { view: true, process: true, approve: true },
                reports: { view: true, generate: true, export: true },
                chatWithBooks: { access: true },
                taxHub: { view: true, manage: true },
                automationHub: { view: true, create: false, edit: false, delete: false },
                integrations: { view: true, connect: false, manage: false },
                msgMyBookkeeper: { access: true },
                collaboration: { view: true, manage: false },
                settings: { company: false, myCompanies: true, billing: false },
                subscription: { view: false, manage: false },
                teamManagement: { viewMembers: true, inviteMembers: false, editRoles: false, removeMembers: false }
            },
            bookkeeper: {
                pendingItems: { view: true, manage: false },
                transactions: { view: true, create: true, edit: false, delete: false },
                generalLedger: { view: true, edit: false },
                financialAccounts: { view: true, create: false, edit: false, delete: false },
                receipts: { view: true, upload: true, edit: false, delete: false },
                invoices: { view: true, upload: true, edit: false, delete: false },
                bills: { view: true, upload: true, edit: false, delete: false },
                bankStatements: { view: true, upload: true, edit: false, delete: false },
                cardStatements: { view: true, upload: true, edit: false, delete: false },
                matching: { view: true, process: true, approve: false },
                reports: { view: true, generate: false, export: false },
                chatWithBooks: { access: false },
                taxHub: { view: false, manage: false },
                automationHub: { view: false, create: false, edit: false, delete: false },
                integrations: { view: false, connect: false, manage: false },
                msgMyBookkeeper: { access: true },
                collaboration: { view: true, manage: false },
                settings: { company: false, myCompanies: true, billing: false },
                subscription: { view: false, manage: false },
                teamManagement: { viewMembers: true, inviteMembers: false, editRoles: false, removeMembers: false }
            },
            analyst: {
                pendingItems: { view: true, manage: false },
                transactions: { view: true, create: false, edit: false, delete: false },
                generalLedger: { view: true, edit: false },
                financialAccounts: { view: true, create: false, edit: false, delete: false },
                receipts: { view: true, upload: false, edit: false, delete: false },
                invoices: { view: true, upload: false, edit: false, delete: false },
                bills: { view: true, upload: false, edit: false, delete: false },
                bankStatements: { view: true, upload: false, edit: false, delete: false },
                cardStatements: { view: true, upload: false, edit: false, delete: false },
                matching: { view: true, process: false, approve: false },
                reports: { view: true, generate: true, export: true },
                chatWithBooks: { access: true },
                taxHub: { view: true, manage: false },
                automationHub: { view: true, create: false, edit: false, delete: false },
                integrations: { view: true, connect: false, manage: false },
                msgMyBookkeeper: { access: true },
                collaboration: { view: true, manage: false },
                settings: { company: false, myCompanies: true, billing: false },
                subscription: { view: false, manage: false },
                teamManagement: { viewMembers: true, inviteMembers: false, editRoles: false, removeMembers: false }
            },
            viewer: {
                pendingItems: { view: true, manage: false },
                transactions: { view: true, create: false, edit: false, delete: false },
                generalLedger: { view: true, edit: false },
                financialAccounts: { view: true, create: false, edit: false, delete: false },
                receipts: { view: true, upload: false, edit: false, delete: false },
                invoices: { view: true, upload: false, edit: false, delete: false },
                bills: { view: true, upload: false, edit: false, delete: false },
                bankStatements: { view: true, upload: false, edit: false, delete: false },
                cardStatements: { view: true, upload: false, edit: false, delete: false },
                matching: { view: true, process: false, approve: false },
                reports: { view: true, generate: false, export: false },
                chatWithBooks: { access: false },
                taxHub: { view: false, manage: false },
                automationHub: { view: false, create: false, edit: false, delete: false },
                integrations: { view: false, connect: false, manage: false },
                msgMyBookkeeper: { access: false },
                collaboration: { view: true, manage: false },
                settings: { company: false, myCompanies: true, billing: false },
                subscription: { view: false, manage: false },
                teamManagement: { viewMembers: true, inviteMembers: false, editRoles: false, removeMembers: false }
            }
        };
        return defaults[role] || defaults.viewer;
    };

    const canManageUsers = selectedCompany?.role === 'owner' ||
        selectedCompany?.permissions?.teamManagement?.inviteMembers ||
        selectedCompany?.permissions?.teamManagement?.editRoles ||
        selectedCompany?.permissions?.teamManagement?.removeMembers;

    const canManageInvitations = selectedCompany?.role === 'owner' ||
        selectedCompany?.permissions?.teamManagement?.inviteMembers;

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
                                Team Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Manage your team members, invitations, and permissions
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

                    <Box sx={{ borderBottom: 1, paddingInlineStart: 2, borderColor: 'divider' }}>
                        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
                            <Tab label={`Members (${members.length})`} />
                            <Tab label={`Invitations (${invitations.length})`} />
                        </Tabs>
                    </Box>

                    {/* Members Tab */}
                    {currentTab === 0 && (
                        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                            <Scrollbar>
                                <Table size={memberTable.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                                    <TableHeadCustom
                                        order={memberTable.order}
                                        orderBy={memberTable.orderBy}
                                        headLabel={MEMBER_TABLE_HEAD}
                                        rowCount={members.length}
                                        numSelected={memberTable.selected.length}
                                        onSort={memberTable.onSort}
                                        onSelectAllRows={(checked) =>
                                            memberTable.onSelectAllRows(
                                                checked,
                                                members.map((row) => row._id)
                                            )
                                        }
                                    />

                                    <TableBody>
                                        {members
                                            .slice(
                                                memberTable.page * memberTable.rowsPerPage,
                                                memberTable.page * memberTable.rowsPerPage + memberTable.rowsPerPage
                                            )
                                            .map((row) => (
                                                <CompanyMemberTableRow
                                                    key={row._id}
                                                    row={row}
                                                    selected={memberTable.selected.includes(row._id)}
                                                    onSelectRow={() => memberTable.onSelectRow(row._id)}
                                                    onEditRow={() => openEditDialog(row)}
                                                    onDeleteRow={() => handleRemoveMember(row._id)}
                                                    currentUserId={user?._id}
                                                    canManageUsers={canManageUsers}
                                                />
                                            ))}

                                        <TableEmptyRows
                                            height={68}
                                            emptyRows={emptyRows(memberTable.page, memberTable.rowsPerPage, members.length)}
                                        />

                                        <TableNoData notFound={!members.length} />
                                    </TableBody>
                                </Table>
                            </Scrollbar>
                        </TableContainer>
                    )}

                    {/* Invitations Tab */}
                    {currentTab === 1 && (
                        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                            <Scrollbar>
                                <Table size={invitationTable.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                                    <TableHeadCustom
                                        order={invitationTable.order}
                                        orderBy={invitationTable.orderBy}
                                        headLabel={INVITATION_TABLE_HEAD}
                                        rowCount={invitations.length}
                                        numSelected={0}
                                        onSort={invitationTable.onSort}
                                    />

                                    <TableBody>
                                        {invitations
                                            .slice(
                                                invitationTable.page * invitationTable.rowsPerPage,
                                                invitationTable.page * invitationTable.rowsPerPage + invitationTable.rowsPerPage
                                            )
                                            .map((row) => (
                                                <InvitationTableRow
                                                    key={row._id}
                                                    row={row}
                                                    onResend={handleResendInvitation}
                                                    onCancel={handleCancelInvitation}
                                                    canManageInvitations={canManageInvitations}
                                                />
                                            ))}

                                        <TableEmptyRows
                                            height={68}
                                            emptyRows={emptyRows(invitationTable.page, invitationTable.rowsPerPage, invitations.length)}
                                        />

                                        <TableNoData notFound={!invitations.length} />
                                    </TableBody>
                                </Table>
                            </Scrollbar>
                        </TableContainer>
                    )}

                    <TablePagination
                        page={currentTab === 0 ? memberTable.page : invitationTable.page}
                        dense={currentTab === 0 ? memberTable.dense : invitationTable.dense}
                        count={currentTab === 0 ? members.length : invitations.length}
                        rowsPerPage={currentTab === 0 ? memberTable.rowsPerPage : invitationTable.rowsPerPage}
                        onPageChange={currentTab === 0 ? memberTable.onChangePage : invitationTable.onChangePage}
                        onRowsPerPageChange={currentTab === 0 ? memberTable.onChangeRowsPerPage : invitationTable.onChangeRowsPerPage}
                        onChangeDense={currentTab === 0 ? memberTable.onChangeDense : invitationTable.onChangeDense}
                    />
                </Card>
            </Container>

            {/* Invite Member Dialog */}
            <Dialog open={inviteDialog.value} onClose={inviteDialog.onFalse} maxWidth="md" fullWidth>
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
                                onChange={(e) => {
                                    const role = e.target.value;
                                    setInviteForm({
                                        role,
                                        permissions: getDefaultPermissions(role)
                                    });
                                }}
                            >
                                {ROLE_OPTIONS.filter(option => {
                                    // Only owner can assign admin role
                                    if (option.value === 'admin' && selectedCompany?.role !== 'owner') {
                                        return false;
                                    }
                                    return true;
                                }).map((option) => (
                                    <MenuItem key={option.value} value={option.value} sx={{ py: 1.5 }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {option.label}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.description}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2">
                                    Permissions (customize as needed)
                                </Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Iconify icon="solar:restart-bold" />}
                                    onClick={() => setInviteForm({
                                        ...inviteForm,
                                        permissions: getDefaultPermissions(inviteForm.role)
                                    })}
                                >
                                    Reset to Default
                                </Button>
                            </Box>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                <Typography variant="caption">
                                    Note: Profile, Security, and Notifications are personal user settings and don't require company permissions.
                                </Typography>
                            </Alert>

                            {PERMISSION_GROUPS.map((group) => (
                                <Box key={group.title} sx={{ mb: 3 }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            mb: 1,
                                            color: 'primary.main',
                                            fontWeight: 'bold',
                                            borderBottom: 1,
                                            borderColor: 'divider',
                                            pb: 0.5
                                        }}
                                    >
                                        {group.title}
                                    </Typography>
                                    <FormGroup sx={{ ml: 1 }}>
                                        {group.permissions.map((permission) => (
                                            <Box key={permission.key} sx={{ mb: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                                                    {permission.label}
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, ml: 1, mt: 0.5 }}>
                                                    {permission.actions.map((action) => {
                                                        const actionId = typeof action === 'string' ? action : action.id;
                                                        const actionLabel = typeof action === 'string' ? action : action.label;

                                                        return (
                                                            <FormControlLabel
                                                                key={`${permission.key}.${actionId}`}
                                                                control={
                                                                    <Checkbox
                                                                        size="small"
                                                                        checked={inviteForm.permissions[permission.key]?.[actionId] || false}
                                                                        onChange={(e) =>
                                                                            setInviteForm({
                                                                                permissions: {
                                                                                    ...inviteForm.permissions,
                                                                                    [permission.key]: {
                                                                                        ...inviteForm.permissions[permission.key],
                                                                                        [actionId]: e.target.checked,
                                                                                    },
                                                                                },
                                                                            })
                                                                        }
                                                                    />
                                                                }
                                                                label={<Typography variant="caption">{actionLabel}</Typography>}
                                                            />
                                                        );
                                                    })}
                                                </Box>
                                            </Box>
                                        ))}
                                    </FormGroup>
                                </Box>
                            ))}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={inviteDialog.onFalse}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSendInvitation}
                        disabled={loading || !inviteForm.email.trim()}
                    >
                        Send Invitation
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Member Dialog - Similar structure but for editing existing members */}
            {editingMember && (
                <Dialog open={editDialog.value} onClose={editDialog.onFalse} maxWidth="md" fullWidth>
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
                                    onChange={(e) => {
                                        const role = e.target.value;
                                        setEditingMember({
                                            ...editingMember,
                                            role,
                                            permissions: getDefaultPermissions(role)
                                        });
                                    }}
                                >
                                    {ROLE_OPTIONS.filter(option => {
                                        if (option.value === 'admin' && selectedCompany?.role !== 'owner') {
                                            return false;
                                        }
                                        return option.value !== 'owner';
                                    }).map((option) => (
                                        <MenuItem key={option.value} value={option.value} sx={{ py: 1.5 }}>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {option.label}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {option.description}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle2">
                                        Permissions
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<Iconify icon="solar:restart-bold" />}
                                        onClick={() => setEditingMember({
                                            ...editingMember,
                                            permissions: getDefaultPermissions(editingMember.role)
                                        })}
                                    >
                                        Reset to Default
                                    </Button>
                                </Box>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    <Typography variant="caption">
                                        Note: Profile, Security, and Notifications are personal user settings and don't require company permissions.
                                    </Typography>
                                </Alert>

                                {PERMISSION_GROUPS.map((group) => (
                                    <Box key={group.title} sx={{ mb: 3 }}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                mb: 1,
                                                color: 'primary.main',
                                                fontWeight: 'bold',
                                                borderBottom: 1,
                                                borderColor: 'divider',
                                                pb: 0.5
                                            }}
                                        >
                                            {group.title}
                                        </Typography>
                                        <FormGroup sx={{ ml: 1 }}>
                                            {group.permissions.map((permission) => (
                                                <Box key={permission.key} sx={{ mb: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                                                        {permission.label}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, ml: 1, mt: 0.5 }}>
                                                        {permission.actions.map((action) => {
                                                            const actionId = typeof action === 'string' ? action : action.id;
                                                            const actionLabel = typeof action === 'string' ? action : action.label;

                                                            return (
                                                                <FormControlLabel
                                                                    key={`${permission.key}.${actionId}`}
                                                                    control={
                                                                        <Checkbox
                                                                            size="small"
                                                                            checked={editingMember.permissions?.[permission.key]?.[actionId] || false}
                                                                            onChange={(e) =>
                                                                                setEditingMember({
                                                                                    ...editingMember,
                                                                                    permissions: {
                                                                                        ...editingMember.permissions,
                                                                                        [permission.key]: {
                                                                                            ...editingMember.permissions?.[permission.key],
                                                                                            [actionId]: e.target.checked,
                                                                                        },
                                                                                    },
                                                                                })
                                                                            }
                                                                        />
                                                                    }
                                                                    label={<Typography variant="caption">{actionLabel}</Typography>}
                                                                />
                                                            );
                                                        })}
                                                    </Box>
                                                </Box>
                                            ))}
                                        </FormGroup>
                                    </Box>
                                ))}
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