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

const DEFAULT_CARD_OPTIONS = [
    { value: 'new', label: '+ Add New Card' },
];

// ----------------------------------------------------------------------

export function CardStatementsUploadView() {
    const router = useRouter();
    const { selectedCompany } = useAuthContext();

    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [selectedCard, setSelectedCard] = useState('');
    const [creditCards, setCreditCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewCardForm, setShowNewCardForm] = useState(false);
    const [processingStatus, setProcessingStatus] = useState(null);
    const [currentUploadId, setCurrentUploadId] = useState(null);
    const [statementPeriod, setStatementPeriod] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [newCard, setNewCard] = useState({
        cardName: '',
        lastFourDigits: '',
        cardType: 'visa',
        issuerBank: '',
    });

    // Dialog states
    const [viewCardsDialogOpen, setViewCardsDialogOpen] = useState(false);
    const [cardFormDialogOpen, setCardFormDialogOpen] = useState(false);
    const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [cardFormData, setCardFormData] = useState({
        cardName: '',
        lastFourDigits: '',
        cardType: 'visa',
        issuerBank: '',
    });
    const [cardFormLoading, setCardFormLoading] = useState(false);
    const [cardFormSuccess, setCardFormSuccess] = useState(false);
    const [cardFormError, setCardFormError] = useState(null);
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

    // Fetch credit cards on component mount
    useEffect(() => {
        const fetchCreditCards = async () => {
            try {
                if (!selectedCompany?._id) {
                    setLoading(false);
                    return;
                }

                const response = await axiosInstance.get(endpoints.creditCards.list, {
                    params: {
                        companyId: selectedCompany._id
                    }
                });
                const cards = response.data.data?.creditCards || [];
                setCreditCards(cards);
                if (cards.length > 0) {
                    setSelectedCard(cards[0]._id);
                }
            } catch (error) {
                console.error('Failed to fetch credit cards:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCreditCards();
    }, [selectedCompany]);

    const createNewCard = async (cardData = newCard) => {
        try {
            if (!selectedCompany?._id) {
                throw new Error('No company selected');
            }

            const response = await axiosInstance.post(endpoints.creditCards.create, {
                cardName: cardData.cardName,
                lastFourDigits: cardData.lastFourDigits,
                cardType: cardData.cardType,
                issuerBank: cardData.issuerBank,
                companyId: selectedCompany._id
            });
            const newCardData = response.data.data.creditCard;
            setCreditCards([...creditCards, newCardData]);
            return newCardData;
        } catch (error) {
            console.error('Failed to create credit card:', error);
            throw error;
        }
    };

    const updateCard = async (cardId, cardData) => {
        try {
            const response = await axiosInstance.put(endpoints.creditCards.update(cardId), {
                cardName: cardData.cardName,
                lastFourDigits: cardData.lastFourDigits,
                cardType: cardData.cardType,
                issuerBank: cardData.issuerBank,
            });
            const updatedCard = response.data.data.creditCard;
            setCreditCards(creditCards.map(card => card._id === cardId ? updatedCard : card));
            return updatedCard;
        } catch (error) {
            console.error('Failed to update credit card:', error);
            throw error;
        }
    };

    const deleteCard = async (cardId) => {
        try {
            await axiosInstance.delete(endpoints.creditCards.delete(cardId));
            setCreditCards(creditCards.filter(card => card._id !== cardId));
            if (selectedCard === cardId) {
                setSelectedCard(creditCards.length > 1 ? creditCards.find(c => c._id !== cardId)?._id || '' : '');
            }
        } catch (error) {
            console.error('Failed to delete credit card:', error);
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

    const handleCardChange = (event) => {
        const value = event.target.value;
        setSelectedCard(value);

        if (value === 'new') {
            setEditingCard(null);
            setCardFormData({
                cardName: '',
                lastFourDigits: '',
                cardType: 'visa',
                issuerBank: '',
            });
            setCardFormDialogOpen(true);
        } else {
            setShowNewCardForm(false);
        }
    };

    const handleNewCardChange = (field) => (event) => {
        setNewCard({
            ...newCard,
            [field]: event.target.value,
        });
    };

    const handleCardFormChange = (field) => (event) => {
        setCardFormData({
            ...cardFormData,
            [field]: event.target.value,
        });
    };

    const handleViewCards = () => {
        setViewCardsDialogOpen(true);
    };

    const handleAddCard = () => {
        setEditingCard(null);
        setCardFormData({
            cardName: '',
            lastFourDigits: '',
            cardType: 'visa',
            issuerBank: '',
        });
        setCardFormDialogOpen(true);
    };

    const handleEditCard = (card) => {
        setEditingCard(card);
        setCardFormData({
            cardName: card.cardName || '',
            lastFourDigits: card.lastFourDigits || '',
            cardType: card.cardType || 'visa',
            issuerBank: card.issuerBank || '',
        });
        setCardFormDialogOpen(true);
    };

    const handleDeleteCard = (card) => {
        setCardToDelete(card);
        setDeleteConfirmDialogOpen(true);
    };

    const handleCardFormSubmit = async () => {
        setCardFormLoading(true);
        setCardFormError(null);

        try {
            if (editingCard) {
                await updateCard(editingCard._id, cardFormData);
            } else {
                const newCardData = await createNewCard(cardFormData);
                setSelectedCard(newCardData._id);
            }

            setCardFormSuccess(true);

            // Close dialog after showing success message
            setTimeout(() => {
                setCardFormDialogOpen(false);
                setEditingCard(null);
                setCardFormSuccess(false);
            }, 1500);

        } catch (error) {
            console.error('Failed to save card:', error);
            setCardFormError(error.message || 'Failed to save card. Please try again.');
        } finally {
            setCardFormLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        setDeleteLoading(true);
        setDeleteError(null);

        try {
            await deleteCard(cardToDelete._id);

            // Show brief success and close dialog
            setTimeout(() => {
                setDeleteConfirmDialogOpen(false);
                setCardToDelete(null);
            }, 500);

        } catch (error) {
            console.error('Failed to delete card:', error);
            setDeleteError(error.message || 'Failed to delete card. Please try again.');
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

            // Create new card if needed
            let cardId = selectedCard;
            if (selectedCard === 'new') {
                const newCardData = await createNewCard();
                cardId = newCardData._id;
            }

            // Convert the first file to base64
            const base64String = await convertFileToBase64(files[0]);
            const fileDataWithPrefix = `data:${files[0].type};base64,${base64String}`;

            // Prepare upload data
            const uploadData = {
                fileName: files[0].name,
                fileData: fileDataWithPrefix,
                accountId: cardId,
                accountType: 'credit_card',
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
                    router.push('/dashboard/card-statements/view');
                }, 1500);
            } else {
                clearInterval(progressInterval);
                throw new Error(result.message || 'Failed to process credit card statement');
            }
        } catch (error) {
            clearInterval(progressInterval);
            setUploadError(error.message || 'An error occurred while uploading the file');
            setUploadProgress(0);
            setUploading(false);
        }
    };

    const handleViewCardStatements = () => {
        router.push('/dashboard/card-statements/view');
    };

    return (
        <DashboardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">
                    Upload Card Statements
                </Typography>
                <Button
                    variant="outlined"
                    onClick={handleViewCards}
                    startIcon={<Iconify icon="ph:credit-card-bold" />}
                >
                    View Cards
                </Button>
            </Stack>

            <Typography variant="body1" sx={{ mb: 4 }}>
                Upload your credit card statements for automatic processing. Supported formats: PDF, CSV, JPG, PNG. Maximum size: 20MB per file.
            </Typography>

            {uploadSuccess && (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    onClose={() => setUploadSuccess(false)}
                >
                    <AlertTitle>Success</AlertTitle>
                    Your card statements have been processed successfully. Redirecting to view statements...
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
                        label="Select Card"
                        value={selectedCard}
                        onChange={handleCardChange}
                        fullWidth
                        disabled={loading}
                    >
                        {creditCards.map((card) => (
                            <MenuItem key={card._id} value={card._id}>
                                {card.cardName} ({card.cardType} ...{card.lastFourDigits})
                            </MenuItem>
                        ))}
                        {DEFAULT_CARD_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    {showNewCardForm && (
                        <Box sx={{ my: 2 }}>
                            <Divider sx={{ mb: 3 }} />
                            <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                New Card Details
                            </Typography>
                            <Stack spacing={2}>
                                <TextField
                                    label="Card Provider"
                                    value={newCard.issuerBank}
                                    onChange={handleNewCardChange('issuerBank')}
                                    fullWidth
                                    required
                                    placeholder="e.g. Chase, Amex, Capital One"
                                />
                                <TextField
                                    label="Card Name"
                                    value={newCard.cardName}
                                    onChange={handleNewCardChange('cardName')}
                                    fullWidth
                                    required
                                    placeholder="e.g. Business Rewards Card"
                                />
                                <TextField
                                    label="Last 4 Digits"
                                    value={newCard.lastFourDigits}
                                    onChange={handleNewCardChange('lastFourDigits')}
                                    fullWidth
                                    required
                                    inputProps={{ maxLength: 4 }}
                                    placeholder="e.g. 1234"
                                />
                                <TextField
                                    select
                                    label="Card Type"
                                    value={newCard.cardType}
                                    onChange={handleNewCardChange('cardType')}
                                    fullWidth
                                    required
                                >
                                    <MenuItem value="visa">Visa</MenuItem>
                                    <MenuItem value="mastercard">Mastercard</MenuItem>
                                    <MenuItem value="amex">American Express</MenuItem>
                                    <MenuItem value="discover">Discover</MenuItem>
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

                    {(!selectedCard || selectedCard === '') && files.length > 0 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <AlertTitle>Card Selection Required</AlertTitle>
                            Please select a credit card before processing your statement.
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
                                !selectedCard ||
                                selectedCard === '' ||
                                (selectedCard === 'new' && (!newCard.cardName || !newCard.lastFourDigits || !newCard.issuerBank))
                            }
                            startIcon={<Iconify icon="ph:cloud-arrow-up-bold" />}
                        >
                            {uploading ? "Processing..." : "Process Card Statement"}
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
                        startIcon={<Iconify icon="ph:credit-card-bold" />}
                    >
                        Connect Card Provider Directly
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
                    onClick={handleViewCardStatements}
                    startIcon={<Iconify icon="ph:list-bullets-bold" />}
                >
                    View Existing Card Statements
                </Button>
            </Box>

            {/* View Cards Dialog */}
            <Dialog
                open={viewCardsDialogOpen}
                onClose={() => setViewCardsDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Manage Credit Cards</Typography>
                        <IconButton onClick={() => setViewCardsDialogOpen(false)}>
                            <Iconify icon="ph:x-bold" />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Card Name</TableCell>
                                    <TableCell>Provider</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Last 4 Digits</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {creditCards.map((card) => (
                                    <TableRow key={card._id}>
                                        <TableCell>{card.cardName}</TableCell>
                                        <TableCell>{card.issuerBank}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={card.cardType}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>...{card.lastFourDigits}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                onClick={() => handleEditCard(card)}
                                                size="small"
                                                color="primary"
                                            >
                                                <Iconify icon="ph:pencil-bold" />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDeleteCard(card)}
                                                size="small"
                                                color="error"
                                            >
                                                <Iconify icon="ph:trash-bold" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {creditCards.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                No cards found. Add your first card to get started.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewCardsDialogOpen(false)}>
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAddCard}
                        startIcon={<Iconify icon="ph:plus-bold" />}
                    >
                        Add New Card
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Card Form Dialog */}
            <Dialog
                open={cardFormDialogOpen}
                onClose={() => {
                    if (!cardFormLoading) {
                        setCardFormDialogOpen(false);
                        setCardFormError(null);
                        setCardFormSuccess(false);
                    }
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editingCard ? 'Edit Credit Card' : 'Add New Credit Card'}
                </DialogTitle>
                <DialogContent>
                    {cardFormSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            <AlertTitle>Success</AlertTitle>
                            Card {editingCard ? 'updated' : 'added'} successfully!
                        </Alert>
                    )}

                    {cardFormError && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                            onClose={() => setCardFormError(null)}
                        >
                            <AlertTitle>Error</AlertTitle>
                            {cardFormError}
                        </Alert>
                    )}
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Card Provider"
                            value={cardFormData.issuerBank}
                            onChange={handleCardFormChange('issuerBank')}
                            fullWidth
                            required
                            placeholder="e.g. Chase, Amex, Capital One"
                        />
                        <TextField
                            label="Card Name"
                            value={cardFormData.cardName}
                            onChange={handleCardFormChange('cardName')}
                            fullWidth
                            required
                            placeholder="e.g. Business Rewards Card"
                        />
                        <TextField
                            label="Last 4 Digits"
                            value={cardFormData.lastFourDigits}
                            onChange={handleCardFormChange('lastFourDigits')}
                            fullWidth
                            required
                            inputProps={{ maxLength: 4 }}
                            placeholder="e.g. 1234"
                        />
                        <TextField
                            select
                            label="Card Type"
                            value={cardFormData.cardType}
                            onChange={handleCardFormChange('cardType')}
                            fullWidth
                            required
                        >
                            <MenuItem value="visa">Visa</MenuItem>
                            <MenuItem value="mastercard">Mastercard</MenuItem>
                            <MenuItem value="amex">American Express</MenuItem>
                            <MenuItem value="discover">Discover</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setCardFormDialogOpen(false);
                            setCardFormError(null);
                            setCardFormSuccess(false);
                        }}
                        disabled={cardFormLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCardFormSubmit}
                        disabled={!cardFormData.cardName || !cardFormData.lastFourDigits || !cardFormData.issuerBank || cardFormLoading}
                        startIcon={cardFormLoading ? <Iconify icon="ph:circle-notch" sx={{ animation: 'spin 1s linear infinite' }} /> : undefined}
                    >
                        {cardFormLoading
                            ? (editingCard ? 'Updating...' : 'Adding...')
                            : (editingCard ? 'Update Card' : 'Add Card')
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
                        setCardToDelete(null);
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
                        Are you sure you want to delete <strong>{cardToDelete?.cardName}</strong>?
                    </Typography>
                    <Alert severity="warning">
                        <AlertTitle>Warning</AlertTitle>
                        Deleting this card will also permanently remove:
                        <ul>
                            <li>All statements associated with this card</li>
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
                            setCardToDelete(null);
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
                        {deleteLoading ? 'Deleting...' : 'Delete Card'}
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