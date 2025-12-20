'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ListItemButton from '@mui/material/ListItemButton';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { fCurrency } from 'src/utils/format-number';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function CreditCardLinkDialog({
    open,
    onClose,
    transaction,
    onLinkSuccess
}) {
    const { selectedCompany } = useAuthContext();
    const [cardStatements, setCardStatements] = useState([]);
    const [selectedStatement, setSelectedStatement] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [linking, setLinking] = useState(false);
    const [statementDetails, setStatementDetails] = useState(null);
    const [adjustmentAmount, setAdjustmentAmount] = useState(0);
    const [existingLinks, setExistingLinks] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const [error, setError] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        if (open && transaction) {
            fetchCardStatements();
            setShowDetails(false);
            setSelectedStatement(null);
            setStatementDetails(null);
            setExistingLinks([]);
            setAdjustmentAmount(0);
            setError(null);
            setSearchQuery('');
        }
    }, [open, transaction]);

    const fetchCardStatements = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(endpoints.documents.statements.list, {
                params: {
                    companyId: selectedCompany._id,
                    accountType: 'credit_card',
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                    limit: 100
                },
            });

            if (response.data.success) {
                setCardStatements(response.data.data.statements || []);
            }
        } catch (err) {
            console.error('Failed to fetch card statements:', err);
            setError('Failed to load credit card statements. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatementDetails = async (statementId) => {
        try {
            setLoadingDetails(true);
            const [transactionsResponse, linksResponse] = await Promise.all([
                axiosInstance.get(endpoints.transactions.list, {
                    params: {
                        companyId: selectedCompany._id,
                        statementId: statementId,
                        limit: 1000
                    },
                }),
                axiosInstance.get(endpoints.matching.creditCardLinks(statementId))
            ]);

            if (transactionsResponse.data.success) {
                const transactions = transactionsResponse.data.data.transactions || [];
                const totalAmount = transactions.reduce((sum, txn) => sum + Math.abs(txn.debit || txn.credit || 0), 0);

                setStatementDetails({
                    transactions,
                    totalAmount,
                    transactionCount: transactions.length
                });
            }

            if (linksResponse.data.success) {
                setExistingLinks(linksResponse.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch statement details:', err);
            setError('Failed to load statement details. Please try again.');
            setStatementDetails(null);
            setExistingLinks([]);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleStatementSelect = (statement) => {
        setSelectedStatement(statement);
        setShowDetails(true);
        fetchStatementDetails(statement._id);
    };

    const handleBackToList = () => {
        setShowDetails(false);
        setSelectedStatement(null);
        setStatementDetails(null);
        setExistingLinks([]);
        setAdjustmentAmount(0);
        setError(null);
    };

    const handleLink = async () => {
        if (!selectedStatement || !transaction) return;

        try {
            setLinking(true);
            setError(null);

            const linkData = {
                transactionId: transaction.id,
                statementId: selectedStatement._id,
                adjustmentAmount: adjustmentAmount || 0,
            };

            const response = await axiosInstance.post(endpoints.matching.linkCreditCard, linkData);

            if (response.data.success) {
                // Pass the full response data to the success handler
                const updateData = {
                    transactionId: transaction.id,
                    transaction: response.data.data.transaction, // Include the full updated transaction
                    linkedCreditCardStatements: response.data.data.transaction.linkedCreditCardStatements
                };

                onLinkSuccess?.(updateData, 'credit_card_link');
                onClose();
            } else {
                throw new Error(response.data.message || 'Failed to link credit card statement');
            }
        } catch (error) {
            console.error('Failed to link credit card statement:', error);
            setError(error.response?.data?.message || 'Failed to link credit card statement. Please try again.');
        } finally {
            setLinking(false);
        }
    };

    const filteredStatements = cardStatements.filter(stmt => {
        if (!searchQuery) return true;
        return stmt.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (stmt.accountInfo?.issuerBank || '').toLowerCase().includes(searchQuery.toLowerCase());
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'No date';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatStatementPeriod = (statement) => {
        if (statement.statementPeriod?.startDate && statement.statementPeriod?.endDate) {
            return `${formatDate(statement.statementPeriod.startDate)} - ${formatDate(statement.statementPeriod.endDate)}`;
        }
        return 'No period specified';
    };

    const calculateDifference = () => {
        if (!statementDetails || !transaction) return { single: 0, combined: 0 };

        const transactionAmount = Math.abs(transaction.debit || transaction.credit || 0);
        const statementTotal = statementDetails.totalAmount;

        const singleDifference = statementTotal - transactionAmount - (adjustmentAmount || 0);

        const existingLinkedAmount = existingLinks.totalLinkedAmount || 0;
        const existingAdjustments = existingLinks.totalAdjustments || 0;
        const combinedAmount = existingLinkedAmount + transactionAmount;
        const combinedAdjustments = existingAdjustments + (adjustmentAmount || 0);
        const combinedDifference = statementTotal - combinedAmount - combinedAdjustments;

        return {
            single: singleDifference,
            combined: combinedDifference,
            hasExistingLinks: (existingLinks.linkCount || 0) > 0
        };
    };

    const differences = calculateDifference();

    const renderStatementsList = () => {
        if (loading) {
            return (
                <Box sx={{ py: 2 }}>
                    {[...Array(5)].map((_, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 2 }}>
                            <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
                                <Skeleton variant="text" width="40%" height={16} />
                            </Box>
                        </Box>
                    ))}
                </Box>
            );
        }

        if (filteredStatements.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Iconify icon="mdi:credit-card-search" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        {searchQuery ? 'No credit card statements match your search' : 'No credit card statements available'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchQuery ?
                            'Try adjusting your search terms or clear the search.' :
                            'Upload credit card statements first to link them with bank transactions.'
                        }
                    </Typography>
                </Box>
            );
        }

        return (
            <List>
                {filteredStatements.map((statement) => (
                    <ListItem key={statement._id} disablePadding>
                        <ListItemButton
                            onClick={() => handleStatementSelect(statement)}
                            sx={{ py: 1.5 }}
                        >
                            <Avatar
                                sx={{
                                    mr: 2,
                                    bgcolor: 'secondary.main',
                                    width: 32,
                                    height: 32
                                }}
                            >
                                <Iconify icon="mdi:credit-card" width={16} />
                            </Avatar>

                            <ListItemText
                                primary={
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="body2" fontWeight="medium">
                                            {statement.fileName}
                                        </Typography>
                                        <Chip
                                            label="Credit Card"
                                            size="small"
                                            variant="outlined"
                                            color="secondary"
                                        />
                                    </Stack>
                                }
                                secondary={
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Period: {formatStatementPeriod(statement)}
                                        </Typography>
                                        <br />
                                        <Typography variant="caption" color="text.secondary">
                                            Uploaded: {formatDate(statement.createdAt)}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        );
    };

    const renderStatementDetails = () => {
        if (loadingDetails) {
            return (
                <Box sx={{ py: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                        <Skeleton variant="circular" width={48} height={48} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="40%" height={16} />
                        </Box>
                    </Stack>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                        {[...Array(4)].map((_, index) => (
                            <Box key={index} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="80%" height={20} />
                            </Box>
                        ))}
                    </Box>
                </Box>
            );
        }

        if (!statementDetails) {
            return (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Iconify icon="mdi:alert-circle" width={48} sx={{ color: 'error.main', mb: 2 }} />
                    <Typography variant="h6" color="error.main" gutterBottom>
                        Failed to Load Statement Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Unable to fetch the statement details. Please try again.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => fetchStatementDetails(selectedStatement._id)}
                        startIcon={<Iconify icon="mdi:refresh" />}
                    >
                        Retry
                    </Button>
                </Box>
            );
        }

        return (
            <>
                <Divider sx={{ mb: 2 }} />

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Statement Summary */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                        <Avatar
                            sx={{
                                width: 48,
                                height: 48,
                                bgcolor: 'secondary.main',
                            }}
                        >
                            <Iconify icon="mdi:credit-card" width={24} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {selectedStatement?.fileName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {formatStatementPeriod(selectedStatement)}
                            </Typography>
                        </Box>
                        <Typography variant="h5" color="secondary.main" fontWeight="bold">
                            {fCurrency(statementDetails.totalAmount)}
                        </Typography>
                    </Stack>

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1, textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    Total Transactions
                                </Typography>
                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                    {statementDetails.transactionCount}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1, textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    Existing Links
                                </Typography>
                                <Typography variant="h6" color="info.main" fontWeight="bold">
                                    {existingLinks.linkCount || 0}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                {/* Linking Details */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Link Details
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Adjustment Amount"
                                type="number"
                                value={adjustmentAmount}
                                onChange={(e) => setAdjustmentAmount(parseFloat(e.target.value) || 0)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                inputProps={{
                                    step: '0.01',
                                    min: '0',
                                }}
                                size="small"
                                helperText="Add adjustment if bank transaction amount differs from statement total"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ p: 2, bgcolor: differences.hasExistingLinks ? 'warning.lighter' : 'success.lighter', borderRadius: 1, textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    {differences.hasExistingLinks ? 'Combined Difference' : 'Difference'}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    color={Math.abs(differences.combined) <= 0.01 ? 'success.main' : 'warning.main'}
                                    fontWeight="bold"
                                >
                                    {fCurrency(Math.abs(differences.combined))}
                                    {differences.combined > 0 ? ' Remaining' : differences.combined < 0 ? ' Overpaid' : ' Perfect'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {differences.hasExistingLinks && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                This statement already has {existingLinks.linkCount} transaction{existingLinks.linkCount > 1 ? 's' : ''} linked.
                                The difference shown is the combined total after adding this transaction.
                            </Typography>
                        </Alert>
                    )}
                </Box>
            </>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { height: '85vh', display: 'flex', flexDirection: 'column' }
            }}
        >
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Link Credit Card Statement</Typography>
                    <IconButton onClick={onClose}>
                        <Iconify icon="mdi:close" />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {/* Transaction Info */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Bank Transaction Details
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="body2" fontWeight="medium">
                                {transaction?.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {transaction?.date} • {transaction?.source}
                            </Typography>
                        </Box>
                        <Chip
                            label={fCurrency(transaction?.debit || transaction?.credit || 0)}
                            color={transaction?.debit ? 'error' : 'success'}
                            variant="outlined"
                        />
                    </Stack>
                </Box>

                {!showDetails ? (
                    <>
                        {/* Search */}
                        <TextField
                            fullWidth
                            placeholder="Search credit card statements by filename or bank..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Iconify icon="mdi:magnify" />
                                    </InputAdornment>
                                )
                            }}
                            sx={{ mb: 2 }}
                        />

                        {/* Statements List */}
                        <Box sx={{ flex: 1, minHeight: 0 }}>
                            <Scrollbar sx={{ height: '100%' }}>
                                {renderStatementsList()}
                            </Scrollbar>
                        </Box>
                    </>
                ) : (
                    <>
                        {/* Back Button and Selected Statement Header */}
                        <Box sx={{ mb: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <IconButton onClick={handleBackToList} size="small">
                                    <Iconify icon="mdi:arrow-left" />
                                </IconButton>
                                <Avatar
                                    sx={{
                                        bgcolor: 'secondary.main',
                                        width: 32,
                                        height: 32
                                    }}
                                >
                                    <Iconify icon="mdi:credit-card" width={16} />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="medium">
                                        {selectedStatement?.fileName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Period: {selectedStatement ? formatStatementPeriod(selectedStatement) : ''}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>

                        {/* Statement Details */}
                        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                            {renderStatementDetails()}
                        </Box>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>

                {showDetails ? (
                    <>
                        <Button onClick={handleBackToList} color="inherit" startIcon={<Iconify icon="mdi:arrow-left" />}>
                            Back to List
                        </Button>
                        <Button
                            onClick={handleLink}
                            variant="contained"
                            disabled={!selectedStatement || linking || !statementDetails || loadingDetails}
                            startIcon={linking ? <CircularProgress size={16} /> : <Iconify icon="mdi:link" />}
                        >
                            {linking ? 'Linking...' : 'Link Statement'}
                        </Button>
                    </>
                ) : (
                    <Button disabled variant="outlined">
                        Select a statement to continue
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}