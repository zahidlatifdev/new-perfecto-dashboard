import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';
import axios, { endpoints } from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function QuickUpload() {
    const theme = useTheme();
    const router = useRouter();
    const { selectedCompany } = useAuthContext();

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showTypeDialog, setShowTypeDialog] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [documentType, setDocumentType] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('');
    const [accounts, setAccounts] = useState({ bankAccounts: [], creditCards: [] });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch accounts when component mounts
    useEffect(() => {
        const fetchAccounts = async () => {
            if (!selectedCompany?._id) return;

            try {
                setLoading(true);
                const [bankResponse, creditResponse] = await Promise.all([
                    axios.get(endpoints.bankAccounts.list),
                    axios.get(endpoints.creditCards.list)
                ]);

                setAccounts({
                    bankAccounts: bankResponse.data.data?.bankAccounts || [],
                    creditCards: creditResponse.data.data?.creditCards || []
                });
            } catch (err) {
                console.error('Failed to fetch accounts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, [selectedCompany]);

    const onDrop = useCallback(
        async (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;
            setSelectedFiles(acceptedFiles);
            setShowTypeDialog(true);
        },
        []
    );

    const handleUpload = async () => {
        if (!documentType || !selectedFiles.length) return;

        try {
            setUploading(true);
            setUploadProgress(0);
            setError(null);

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            // Convert file to base64
            const file = selectedFiles[0];
            const convertFileToBase64 = (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = (error) => reject(error);
                });
            };

            const base64String = await convertFileToBase64(file);
            const fileDataWithPrefix = `data:${file.type};base64,${base64String}`;

            let uploadData;
            let endpoint;
            let redirectPath;

            if (documentType === 'bank_statement' || documentType === 'card_statement') {
                if (!selectedAccount) {
                    setError('Please select an account for statement upload');
                    setUploading(false);
                    setUploadProgress(0);
                    return;
                }

                uploadData = {
                    fileName: file.name,
                    fileData: fileDataWithPrefix,
                    accountId: selectedAccount,
                    accountType: documentType === 'bank_statement' ? 'bank_account' : 'credit_card'
                };
                endpoint = endpoints.documents.upload.statement;
                redirectPath = documentType === 'bank_statement' ?
                    paths.dashboard.bank_statements.view :
                    paths.dashboard.card_statements.view;
            } else {
                uploadData = {
                    fileName: file.name,
                    fileData: fileDataWithPrefix,
                    documentType: documentType
                };
                endpoint = endpoints.documents.upload.document;
                redirectPath = paths.dashboard.document_vault;
            }

            const response = await axios.post(endpoint, uploadData);

            if (response.data.success) {
                clearInterval(progressInterval);
                setUploadProgress(100);

                // Close dialog and reset
                setTimeout(() => {
                    setShowTypeDialog(false);
                    setUploading(false);
                    setUploadProgress(0);
                    setSelectedFiles([]);
                    setDocumentType('');
                    setSelectedAccount('');

                    // Redirect to relevant view
                    router.push(redirectPath);
                }, 1000);
            } else {
                throw new Error(response.data.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setError(err.message || 'Upload failed');
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDialogClose = () => {
        if (!uploading) {
            setShowTypeDialog(false);
            setSelectedFiles([]);
            setDocumentType('');
            setSelectedAccount('');
            setError(null);
        }
    };

    const documentTypes = [
        { value: 'receipt', label: 'Receipt', icon: 'ph:receipt-bold' },
        { value: 'invoice', label: 'Invoice', icon: 'ph:invoice-bold' },
        { value: 'bill', label: 'Bill', icon: 'ph:file-text-bold' },
        { value: 'bank_statement', label: 'Bank Statement', icon: 'ph:bank-bold' },
        { value: 'card_statement', label: 'Card Statement', icon: 'ph:credit-card-bold' }
    ];

    const isStatementType = documentType === 'bank_statement' || documentType === 'card_statement';
    const availableAccounts = documentType === 'bank_statement' ?
        accounts.bankAccounts :
        documentType === 'card_statement' ?
            accounts.creditCards :
            [];

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.bmp'],
        },
        multiple: true,
        disabled: uploading,
    });

    return (
        <>
            <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                    Quick Upload
                </Typography>

                <Box
                    {...getRootProps()}
                    sx={{
                        p: 3,
                        border: `2px dashed ${alpha(theme.palette.primary.main, 0.32)}`,
                        borderRadius: 1.5,
                        bgcolor: isDragActive
                            ? alpha(theme.palette.primary.main, 0.08)
                            : alpha(theme.palette.grey[500], 0.04),
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        transition: theme.transitions.create(['background-color', 'border-color']),
                        '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            borderColor: theme.palette.primary.main,
                        },
                    }}
                >
                    <input {...getInputProps()} />

                    <Stack spacing={2} alignItems="center">
                        <Iconify
                            icon="ph:upload-bold"
                            width={48}
                            color={isDragActive ? 'primary.main' : 'text.disabled'}
                        />
                        <Stack spacing={1} sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" color="text.primary" fontWeight="fontWeightMedium">
                                {isDragActive ? 'Drop files here' : 'Drop files here or click to browse'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Supports PDF, images (PNG, JPG, TIFF, BMP)
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                    Select document type and account after dropping files
                </Typography>
            </Card>

            {/* Document Type Selection Dialog */}
            <Dialog open={showTypeDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {uploading ? (
                        <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
                            <Iconify icon="ph:upload-bold" width={48} color="primary.main" />
                            <Typography variant="body1" color="primary.main" fontWeight="fontWeightMedium">
                                Uploading {selectedFiles[0]?.name}...
                            </Typography>
                            <Box sx={{ width: '100%', maxWidth: 300 }}>
                                <LinearProgress variant="determinate" value={uploadProgress} />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                {uploadProgress}% complete
                            </Typography>
                        </Stack>
                    ) : (
                        <Stack spacing={3}>
                            <Typography variant="body2">
                                Selected file: <strong>{selectedFiles[0]?.name}</strong>
                            </Typography>

                            <FormControl fullWidth>
                                <InputLabel>Document Type</InputLabel>
                                <Select
                                    value={documentType}
                                    label="Document Type"
                                    onChange={(e) => {
                                        setDocumentType(e.target.value);
                                        setSelectedAccount(''); // Reset account when type changes
                                    }}
                                >
                                    {documentTypes.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Iconify icon={type.icon} width={20} />
                                                <Typography>{type.label}</Typography>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {isStatementType && (
                                <FormControl fullWidth>
                                    <InputLabel>
                                        Select {documentType === 'bank_statement' ? 'Bank Account' : 'Credit Card'}
                                    </InputLabel>
                                    <Select
                                        value={selectedAccount}
                                        label={`Select ${documentType === 'bank_statement' ? 'Bank Account' : 'Credit Card'}`}
                                        onChange={(e) => setSelectedAccount(e.target.value)}
                                        disabled={loading}
                                    >
                                        {availableAccounts.map((account) => (
                                            <MenuItem key={account._id} value={account._id}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Iconify
                                                        icon={documentType === 'bank_statement' ? 'ph:bank-bold' : 'ph:credit-card-bold'}
                                                        width={16}
                                                    />
                                                    <Typography>
                                                        {documentType === 'bank_statement'
                                                            ? account.accountName
                                                            : account.cardName || `Card ending in ${account.lastFourDigits}`}
                                                    </Typography>
                                                </Stack>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={!documentType || (isStatementType && !selectedAccount) || uploading}
                    >
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
