'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { useDocumentProcessing } from 'src/hooks/use-websocket';

// ----------------------------------------------------------------------

const DEFAULT_ACCOUNT_OPTIONS = [
    { value: 'new', label: '+ Add New Account' },
];

// ----------------------------------------------------------------------

export function BankStatementsUploadView() {
    const router = useRouter();
    const { selectedCompany } = useAuthContext();

    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewAccountForm, setShowNewAccountForm] = useState(false);
    const [processingStatus, setProcessingStatus] = useState(null);
    const [currentUploadId, setCurrentUploadId] = useState(null);
    const [statementPeriod, setStatementPeriod] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [newAccount, setNewAccount] = useState({
        accountName: '',
        accountNumber: '',
        bankName: '',
        accountType: 'checking',
    });

    // Dialog states
    const [viewAccountsDialogOpen, setViewAccountsDialogOpen] = useState(false);
    const [accountFormDialogOpen, setAccountFormDialogOpen] = useState(false);
    const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [accountToDelete, setAccountToDelete] = useState(null);
    const [accountFormData, setAccountFormData] = useState({
        accountName: '',
        accountNumber: '',
        bankName: '',
        accountType: 'checking',
    });
    const [accountFormLoading, setAccountFormLoading] = useState(false);
    const [accountFormSuccess, setAccountFormSuccess] = useState(false);
    const [accountFormError, setAccountFormError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    // WebSocket listeners for real-time updates (background processing)
    useDocumentProcessing({
        onDocumentProcessing: (data) => {
            // Background processing - no UI updates needed since user is redirected
        },
        onDocumentProcessed: (data) => {
            // Background processing - no UI updates needed since user is redirected
        },
        onDocumentProcessingFailed: (data) => {
            // Background processing - no UI updates needed since user is redirected
        }
    });

    // Fetch bank accounts on component mount
    useEffect(() => {
        const fetchBankAccounts = async () => {
            try {
                if (!selectedCompany?._id) {
                    setLoading(false);
                    return;
                }

                const response = await axiosInstance.get(endpoints.bankAccounts.list, {
                    params: {
                        companyId: selectedCompany._id
                    }
                });
                const accounts = response.data.data?.bankAccounts || [];
                setBankAccounts(accounts);
                if (accounts.length > 0) {
                    setSelectedAccount(accounts[0]._id);
                }
            } catch (error) {
                console.error('Failed to fetch bank accounts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBankAccounts();
    }, [selectedCompany]);

    const createNewAccount = async (accountData = newAccount) => {
        try {
            if (!selectedCompany?._id) {
                throw new Error('No company selected');
            }

            const response = await axiosInstance.post(endpoints.bankAccounts.create, {
                accountName: accountData.accountName,
                accountNumber: accountData.accountNumber,
                bankName: accountData.bankName,
                accountType: accountData.accountType,
                companyId: selectedCompany._id
            });
            const newAccountData = response.data.data.bankAccount;
            setBankAccounts([...bankAccounts, newAccountData]);
            return newAccountData;
        } catch (error) {
            console.error('Failed to create bank account:', error);
            throw error;
        }
    };

    const updateAccount = async (accountId, accountData) => {
        try {
            const response = await axiosInstance.put(endpoints.bankAccounts.update(accountId), {
                accountName: accountData.accountName,
                accountNumber: accountData.accountNumber,
                bankName: accountData.bankName,
                accountType: accountData.accountType,
            });
            const updatedAccount = response.data.data.bankAccount;
            setBankAccounts(bankAccounts.map(account => account._id === accountId ? updatedAccount : account));
            return updatedAccount;
        } catch (error) {
            console.error('Failed to update bank account:', error);
            throw error;
        }
    };

    const deleteAccount = async (accountId) => {
        try {
            await axiosInstance.delete(endpoints.bankAccounts.delete(accountId));
            setBankAccounts(bankAccounts.filter(account => account._id !== accountId));
            if (selectedAccount === accountId) {
                setSelectedAccount(bankAccounts.length > 1 ? bankAccounts.find(a => a._id !== accountId)?._id || '' : '');
            }
        } catch (error) {
            console.error('Failed to delete bank account:', error);
            throw error;
        }
    };

    const handleDropFiles = (acceptedFiles) => {
        setFiles([...files, ...acceptedFiles]);
    };

    const handleRemoveFile = (inputFile) => {
        const filesFiltered = files.filter((file) => file !== inputFile);
        setFiles(filesFiltered);
    };

    const handleRemoveAllFiles = () => {
        setFiles([]);
    };

    const handleAccountChange = (event) => {
        const value = event.target.value;
        setSelectedAccount(value);

        if (value === 'new') {
            setEditingAccount(null);
            setAccountFormData({
                accountName: '',
                accountNumber: '',
                bankName: '',
                accountType: 'checking',
            });
            setAccountFormDialogOpen(true);
        } else {
            setShowNewAccountForm(false);
        }
    };

    const handleNewAccountChange = (field) => (event) => {
        setNewAccount({
            ...newAccount,
            [field]: event.target.value,
        });
    };

    const handleAccountFormChange = (field) => (event) => {
        setAccountFormData({
            ...accountFormData,
            [field]: event.target.value,
        });
    };

    const handleViewAccounts = () => {
        setViewAccountsDialogOpen(true);
    };

    const handleAddAccount = () => {
        setEditingAccount(null);
        setAccountFormData({
            accountName: '',
            accountNumber: '',
            bankName: '',
            accountType: 'checking',
        });
        setAccountFormDialogOpen(true);
    };

    const handleEditAccount = (account) => {
        setEditingAccount(account);
        setAccountFormData({
            accountName: account.accountName || '',
            accountNumber: account.accountNumber || '',
            bankName: account.bankName || '',
            accountType: account.accountType || 'checking',
        });
        setAccountFormDialogOpen(true);
    };

    const handleDeleteAccount = (account) => {
        setAccountToDelete(account);
        setDeleteConfirmDialogOpen(true);
    };

    const handleAccountFormSubmit = async () => {
        setAccountFormLoading(true);
        setAccountFormError(null);

        try {
            if (editingAccount) {
                await updateAccount(editingAccount._id, accountFormData);
            } else {
                const newAccountData = await createNewAccount(accountFormData);
                setSelectedAccount(newAccountData._id);
            }

            setAccountFormSuccess(true);

            // Close dialog after showing success message
            setTimeout(() => {
                setAccountFormDialogOpen(false);
                setEditingAccount(null);
                setAccountFormSuccess(false);
            }, 1500);

        } catch (error) {
            console.error('Failed to save account:', error);
            setAccountFormError(error.message || 'Failed to save account. Please try again.');
        } finally {
            setAccountFormLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        setDeleteLoading(true);
        setDeleteError(null);

        try {
            await deleteAccount(accountToDelete._id);

            // Show brief success and close dialog
            setTimeout(() => {
                setDeleteConfirmDialogOpen(false);
                setAccountToDelete(null);
            }, 500);

        } catch (error) {
            console.error('Failed to delete account:', error);
            setDeleteError(error.message || 'Failed to delete account. Please try again.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setUploadError(null);

        try {
            // Simulate progress over 150 seconds (2.5 minutes)
            let progress = 0;
            const totalDuration = 150000;
            const interval = 1000;
            const increment = 100 / (totalDuration / interval);

            const progressInterval = setInterval(() => {
                progress += increment;
                if (progress >= 95) {
                    clearInterval(progressInterval);
                    setUploadProgress(95);
                } else {
                    setUploadProgress(Math.floor(progress));
                }
            }, interval);

            // Create new account if needed
            let accountId = selectedAccount;
            if (selectedAccount === 'new') {
                const newAccountData = await createNewAccount();
                accountId = newAccountData._id;
            }

            // Convert the first file to base64
            const base64String = await convertFileToBase64(files[0]);
            const fileDataWithPrefix = `data:${files[0].type};base64,${base64String}`;

            // Prepare upload data
            const uploadData = {
                fileName: files[0].name,
                fileData: fileDataWithPrefix,
                accountId,
                accountType: 'bank_account',
                statementPeriod: {
                    startDate: statementPeriod.startDate,
                    endDate: statementPeriod.endDate
                }
            };

            // Call backend API
            const response = await axiosInstance.post(endpoints.documents.upload.statement, uploadData);
            const result = response.data;

            if (result.success) {
                clearInterval(progressInterval);
                setProcessingStatus('completed');
                setUploadProgress(100);
                setUploadSuccess(true);

                // Reset states and redirect
                setTimeout(() => {
                    setUploading(false);
                    setFiles([]);
                    setUploadProgress(0);
                    setProcessingStatus(null);
                    setCurrentUploadId(null);
                    router.push('/dashboard/bank-statements/view');
                }, 1500);
            } else {
                clearInterval(progressInterval);
                throw new Error(result.message || 'Failed to process bank statement');
            }
        } catch (error) {
            clearInterval(progressInterval);
            setUploadError(error.message || 'An error occurred while uploading the file');
            setUploadProgress(0);
            setUploading(false);
        }
    };

    const handleViewBankStatements = () => {
        router.push('/dashboard/bank-statements/view');
    };

    return (
        <DashboardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">
                    Upload Bank Statements
                </Typography>
                <Button
                    variant="outlined"
                    onClick={handleViewAccounts}
                    startIcon={<Iconify icon="ph:bank-bold" />}
                >
                    View Accounts
                </Button>
            </Stack>

            <Typography variant="body1" sx={{ mb: 4 }}>
                Upload your bank statements for automatic processing. Supported formats: PDF, CSV, JPG, PNG. Maximum size: 20MB per file.
            </Typography>

            {uploadSuccess && (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    onClose={() => setUploadSuccess(false)}
                >
                    <AlertTitle>Success</AlertTitle>
                    Your bank statements have been processed successfully. Redirecting to view statements...
                </Alert>
            )}

            {uploadError && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    onClose={() => setUploadError(null)}
                >
                    <AlertTitle>Error</AlertTitle>
                    {uploadError}
                </Alert>
            )}

            <Card sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                    Upload Details
                </Typography>

                <Stack spacing={3}>
                    <TextField
                        select
                        label="Select Account"
                        value={selectedAccount}
                        onChange={handleAccountChange}
                        fullWidth
                        disabled={loading}
                    >
                        {bankAccounts.map((account) => (
                            <MenuItem key={account._id} value={account._id}>
                                {account.accountName} ({account.bankName} ...{account.accountNumber})
                            </MenuItem>
                        ))}
                        {DEFAULT_ACCOUNT_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    {showNewAccountForm && (
                        <Box sx={{ my: 2 }}>
                            <Divider sx={{ mb: 3 }} />
                            <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                New Account Details
                            </Typography>
                            <Stack spacing={2}>
                                <TextField
                                    label="Bank Name"
                                    value={newAccount.bankName}
                                    onChange={handleNewAccountChange('bankName')}
                                    fullWidth
                                    required
                                    placeholder="e.g. Chase, Bank of America, Wells Fargo"
                                />
                                <TextField
                                    label="Account Name"
                                    value={newAccount.accountName}
                                    onChange={handleNewAccountChange('accountName')}
                                    fullWidth
                                    required
                                    placeholder="e.g. Business Checking Account"
                                />
                                <TextField
                                    label="Account Number (last 4 digits)"
                                    value={newAccount.accountNumber}
                                    onChange={handleNewAccountChange('accountNumber')}
                                    fullWidth
                                    inputProps={{ maxLength: 4 }}
                                    placeholder="e.g. 1234"
                                />
                                <TextField
                                    select
                                    label="Account Type"
                                    value={newAccount.accountType}
                                    onChange={handleNewAccountChange('accountType')}
                                    fullWidth
                                    required
                                >
                                    <MenuItem value="checking">Checking</MenuItem>
                                    <MenuItem value="savings">Savings</MenuItem>
                                    <MenuItem value="business_checking">Business Checking</MenuItem>
                                    <MenuItem value="business_savings">Business Savings</MenuItem>
                                    <MenuItem value="money_market">Money Market</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </TextField>
                            </Stack>
                        </Box>
                    )}

                    <Upload
                        multiple={true}
                        files={files}
                        onDrop={handleDropFiles}
                        onRemove={handleRemoveFile}
                        accept={{
                            'application/pdf': ['.pdf'],
                            'text/csv': ['.csv'],
                            'application/csv': ['.csv'],
                            'image/jpeg': ['.jpg', '.jpeg'],
                            'image/png': ['.png'],
                        }}
                        sx={{ my: 3 }}
                    />

                    {/* Custom file display if Upload component doesn't show them */}
                    {files.length > 0 && (
                        <Box sx={{ mt: 2, mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Selected Files:
                            </Typography>
                            <Stack spacing={1}>
                                {files.map((file, index) => (
                                    <Card key={index} variant="outlined" sx={{ p: 2 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Iconify
                                                    icon={
                                                        file.type === 'application/pdf' ? 'ph:file-pdf-bold' :
                                                            file.type.includes('image') ? 'ph:image-bold' :
                                                                file.type.includes('csv') ? 'ph:file-csv-bold' :
                                                                    'ph:file-bold'
                                                    }
                                                    sx={{ fontSize: 24, color: 'primary.main' }}
                                                />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {file.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                            <IconButton
                                                onClick={() => handleRemoveFile(file)}
                                                size="small"
                                                color="error"
                                                disabled={uploading}
                                            >
                                                <Iconify icon="ph:x-bold" />
                                            </IconButton>
                                        </Stack>
                                    </Card>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {uploading && (
                        <Box sx={{ width: '100%', mb: 2 }}>
                            <LinearProgress
                                variant="determinate"
                                value={uploadProgress}
                                color={processingStatus === 'failed' ? 'error' : processingStatus === 'completed' ? 'success' : 'primary'}
                            />
                            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                {processingStatus === 'uploaded' && 'File uploaded, processing will begin shortly...'}
                                {processingStatus === 'processing' && 'Extracting transactions...'}
                                {processingStatus === 'completed' && 'Processing completed successfully!'}
                                {processingStatus === 'failed' && 'Processing failed'}
                                {!processingStatus && `Processing... ${uploadProgress}%`}
                            </Typography>
                        </Box>
                    )}

                    {(!selectedAccount || selectedAccount === '') && files.length > 0 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <AlertTitle>Account Selection Required</AlertTitle>
                            Please select a bank account before processing your statement.
                        </Alert>
                    )}

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Button
                            color="error"
                            onClick={handleRemoveAllFiles}
                            disabled={!files.length || uploading}
                        >
                            Remove All
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={
                                !files.length ||
                                uploading ||
                                loading ||
                                !selectedAccount ||
                                selectedAccount === '' ||
                                (selectedAccount === 'new' && (!newAccount.accountName || !newAccount.bankName))
                            }
                            startIcon={<Iconify icon="ph:cloud-arrow-up-bold" />}
                        >
                            {uploading ? "Processing..." : "Process Bank Statement"}
                        </Button>
                    </Stack>
                </Stack>
            </Card>

            <Card sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Alternative Import Methods
                </Typography>

                <Stack spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Iconify icon="ph:bank-bold" />}
                    >
                        Connect Bank Account Directly
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<Iconify icon="ph:repeat-bold" />}
                    >
                        Set Up Automatic Statement Import
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<Iconify icon="ph:arrows-counter-clockwise-bold" />}
                    >
                        Import from Accounting Software
                    </Button>
                </Stack>
            </Card>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button
                    onClick={handleViewBankStatements}
                    startIcon={<Iconify icon="ph:list-bullets-bold" />}
                >
                    View Existing Bank Statements
                </Button>
            </Box>

            {/* View Accounts Dialog */}
            <Dialog
                open={viewAccountsDialogOpen}
                onClose={() => setViewAccountsDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Manage Bank Accounts</Typography>
                        <IconButton onClick={() => setViewAccountsDialogOpen(false)}>
                            <Iconify icon="ph:x-bold" />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Account Name</TableCell>
                                    <TableCell>Bank Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Account Number</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bankAccounts.map((account) => (
                                    <TableRow key={account._id}>
                                        <TableCell>{account.accountName}</TableCell>
                                        <TableCell>{account.bankName}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={account.accountType?.replace('_', ' ')}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>...{account.accountNumber}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                onClick={() => handleEditAccount(account)}
                                                size="small"
                                                color="primary"
                                            >
                                                <Iconify icon="ph:pencil-bold" />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDeleteAccount(account)}
                                                size="small"
                                                color="error"
                                            >
                                                <Iconify icon="ph:trash-bold" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {bankAccounts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                No accounts found. Add your first account to get started.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewAccountsDialogOpen(false)}>
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAddAccount}
                        startIcon={<Iconify icon="ph:plus-bold" />}
                    >
                        Add New Account
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Account Form Dialog */}
            <Dialog
                open={accountFormDialogOpen}
                onClose={() => {
                    if (!accountFormLoading) {
                        setAccountFormDialogOpen(false);
                        setAccountFormError(null);
                        setAccountFormSuccess(false);
                    }
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
                </DialogTitle>
                <DialogContent>
                    {accountFormSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            <AlertTitle>Success</AlertTitle>
                            Account {editingAccount ? 'updated' : 'added'} successfully!
                        </Alert>
                    )}

                    {accountFormError && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                            onClose={() => setAccountFormError(null)}
                        >
                            <AlertTitle>Error</AlertTitle>
                            {accountFormError}
                        </Alert>
                    )}
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Bank Name"
                            value={accountFormData.bankName}
                            onChange={handleAccountFormChange('bankName')}
                            fullWidth
                            required
                            placeholder="e.g. Chase, Bank of America, Wells Fargo"
                        />
                        <TextField
                            label="Account Name"
                            value={accountFormData.accountName}
                            onChange={handleAccountFormChange('accountName')}
                            fullWidth
                            required
                            placeholder="e.g. Business Checking Account"
                        />
                        <TextField
                            label="Account Number (last 4 digits)"
                            value={accountFormData.accountNumber}
                            onChange={handleAccountFormChange('accountNumber')}
                            fullWidth
                            inputProps={{ maxLength: 4 }}
                            placeholder="e.g. 1234"
                        />
                        <TextField
                            select
                            label="Account Type"
                            value={accountFormData.accountType}
                            onChange={handleAccountFormChange('accountType')}
                            fullWidth
                            required
                        >
                            <MenuItem value="checking">Checking</MenuItem>
                            <MenuItem value="savings">Savings</MenuItem>
                            <MenuItem value="business_checking">Business Checking</MenuItem>
                            <MenuItem value="business_savings">Business Savings</MenuItem>
                            <MenuItem value="money_market">Money Market</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setAccountFormDialogOpen(false);
                            setAccountFormError(null);
                            setAccountFormSuccess(false);
                        }}
                        disabled={accountFormLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAccountFormSubmit}
                        disabled={!accountFormData.accountName || !accountFormData.bankName || accountFormLoading}
                        startIcon={accountFormLoading ? <Iconify icon="ph:circle-notch" sx={{ animation: 'spin 1s linear infinite' }} /> : undefined}
                    >
                        {accountFormLoading
                            ? (editingAccount ? 'Updating...' : 'Adding...')
                            : (editingAccount ? 'Update Account' : 'Add Account')
                        }
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmDialogOpen}
                onClose={() => {
                    if (!deleteLoading) {
                        setDeleteConfirmDialogOpen(false);
                        setAccountToDelete(null);
                        setDeleteError(null);
                    }
                }}
                maxWidth="sm"
            >
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="ph:warning-bold" color="error.main" />
                        <Typography variant="h6">Confirm Deletion</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    {deleteError && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                            onClose={() => setDeleteError(null)}
                        >
                            <AlertTitle>Error</AlertTitle>
                            {deleteError}
                        </Alert>
                    )}
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Are you sure you want to delete <strong>{accountToDelete?.accountName}</strong>?
                    </Typography>
                    <Alert severity="warning">
                        <AlertTitle>Warning</AlertTitle>
                        Deleting this account will also permanently remove:
                        <ul>
                            <li>All statements associated with this account</li>
                            <li>All transactions from those statements</li>
                            <li>All matching data from those transactions</li>
                            <li>Any categorization and analysis data</li>
                        </ul>
                        This action cannot be undone.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setDeleteConfirmDialogOpen(false);
                            setAccountToDelete(null);
                            setDeleteError(null);
                        }}
                        disabled={deleteLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmDelete}
                        disabled={deleteLoading}
                        startIcon={deleteLoading ?
                            <Iconify icon="ph:circle-notch" sx={{ animation: 'spin 1s linear infinite' }} /> :
                            <Iconify icon="ph:trash-bold" />
                        }
                    >
                        {deleteLoading ? 'Deleting...' : 'Delete Account'}
                    </Button>
                </DialogActions>
            </Dialog>
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </DashboardContent>
    );
}