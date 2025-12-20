'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { useRouter } from 'next/navigation';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import toast from 'react-hot-toast';
import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

// Helper function to format date string from API
const formatDateString = (apiDate) => {
  if (!apiDate) return '';
  return new Date(apiDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Helper function to sort statements by statement period start date (oldest first)
const sortStatementsByPeriod = (statements) => {
  return statements.sort((a, b) => {
    // If both statements have statement periods, sort by start date
    if (a.statementPeriod?.startDate && b.statementPeriod?.startDate) {
      return new Date(a.statementPeriod.startDate) - new Date(b.statementPeriod.startDate);
    }

    // If only one has statement period, prioritize the one with period
    if (a.statementPeriod?.startDate && !b.statementPeriod?.startDate) {
      return -1;
    }
    if (!a.statementPeriod?.startDate && b.statementPeriod?.startDate) {
      return 1;
    }

    // If neither has statement period, fall back to creation date (oldest first)
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
};

export function BankStatementsListView() {
  const router = useRouter();
  const { selectedCompany } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [statements, setStatements] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, statement: null });
  const [viewDialog, setViewDialog] = useState({ open: false, statement: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedCompany?._id) {
      fetchBankStatements();
    }
  }, [selectedCompany]);

  const fetchBankStatements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Make single API call
      const response = await axiosInstance.get(endpoints.documents.statements.list, {
        params: {
          companyId: selectedCompany._id,
          accountType: 'bank_account',
          // Remove sortBy and sortOrder from API params as we'll sort locally
          page: 1,
          limit: 100, // Increase limit to get more statements for proper sorting
        },
      });

      const bankStatements = response.data.data?.statements || [];

      // Sort statements by statement period start date (oldest first)
      const sortedStatements = sortStatementsByPeriod(bankStatements);
      setStatements(sortedStatements);
    } catch (err) {
      console.error('Failed to fetch bank statements:', err);
      setError('Failed to load bank statements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStatement = async (statement) => {
    try {
      await axiosInstance.delete(endpoints.documents.statements.delete(statement._id));

      // Remove from local state
      setStatements((prev) => prev.filter((s) => s._id !== statement._id));
      setDeleteDialog({ open: false, statement: null });

      toast.success('Bank statement deleted successfully');
    } catch (err) {
      console.error('Failed to delete statement:', err);
      setError('Failed to delete statement. Please try again.');
    }
  };

  const handleViewTransactions = (statement) => {
    router.push(`/dashboard/bank-statements/${statement._id}/transactions?statementId=${statement._id}&type=bank`);
  };

  const handleViewStatement = (statement) => {
    setViewDialog({ open: true, statement });
  };

  const handleUploadNew = () => {
    router.push('/dashboard/bank-statements/upload');
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: 'Processing', color: 'warning', icon: 'ph:clock-bold' },
      processing: { label: 'Processing', color: 'info', icon: 'ph:circle-notch' },
      completed: { label: 'Completed', color: 'success', icon: 'ph:check-circle-bold' },
      failed: { label: 'Failed', color: 'error', icon: 'ph:x-circle-bold' },
    };

    const config = statusConfig[status] || { label: status, color: 'default', icon: 'ph:question' };
    return (
      <Chip
        size="small"
        label={config.label}
        color={config.color}
        icon={<Iconify icon={config.icon} sx={{ fontSize: 16 }} />}
      />
    );
  };

  const renderEmptyState = () => (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center',
        bgcolor: 'background.neutral',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Iconify
          icon="ph:bank-bold"
          sx={{
            fontSize: 80,
            color: 'text.disabled',
            mb: 2,
          }}
        />
      </Box>
      <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}>
        No Bank Statements Found
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: 'text.secondary', maxWidth: 400, mx: 'auto' }}
      >
        Upload your first bank statement to start tracking transactions and analyzing your financial
        data automatically.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={handleUploadNew}
        startIcon={<Iconify icon="ph:cloud-arrow-up-bold" />}
        sx={{ mb: 2 }}
      >
        Upload Bank Statement
      </Button>
      <Box sx={{ mt: 3 }}>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
          <Chip
            icon={<Iconify icon="ph:file-pdf-bold" />}
            label="PDF"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<Iconify icon="ph:file-csv-bold" />}
            label="CSV"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<Iconify icon="ph:image-bold" />}
            label="JPG/PNG"
            variant="outlined"
            size="small"
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Supported formats • Maximum 20MB per file
        </Typography>
      </Box>
    </Paper>
  );

  const renderLoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="rectangular" width="60px" height={24} />
                <Stack spacing={1}>
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="90%" />
                  <Skeleton variant="text" width="70%" />
                </Stack>
                <Skeleton variant="rectangular" width="100%" height={60} />
              </Stack>
            </CardContent>
            <Divider />
            <CardActions>
              <Skeleton variant="text" width={60} height={32} />
              <Skeleton variant="text" width={120} height={32} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (!selectedCompany?._id) {
    return (
      <DashboardContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>No Company Selected</AlertTitle>
          Please select a company to view bank statements.
        </Alert>
      </DashboardContent>
    );
  }

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Bank Statements
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View and manage your uploaded bank statements
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleUploadNew}
              startIcon={<Iconify icon="ph:cloud-arrow-up-bold" />}
              disabled={loading}
            >
              Upload New Statement
            </Button>
          </Stack>
        </Box>
        {renderLoadingSkeleton()}
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Bank Statements
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {statements.length > 0
                ? `${statements.length} statement${statements.length !== 1 ? 's' : ''} uploaded • Sorted by statement period (oldest first)`
                : 'View and manage your uploaded bank statements'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleUploadNew}
            startIcon={<Iconify icon="ph:cloud-arrow-up-bold" />}
          >
            Upload New Statement
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {statements.length === 0 && !error && renderEmptyState()}

      {/* Statements Grid */}
      {statements.length > 0 && (
        <Grid container spacing={3}>
          {statements.map((statement, index) => (
            <Grid item xs={12} sm={6} md={4} key={statement._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.customShadows.z8,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Stack spacing={2}>
                    {/* Header with status and sequence */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                              px: 1,
                              py: 0.25,
                              borderRadius: 0.5,
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                            }}
                          >
                            #{index + 1}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {statement.statementPeriod?.startDate
                              ? `Period: ${formatDateString(statement.statementPeriod.startDate)}`
                              : `Uploaded: ${formatDateString(statement.createdAt)}`
                            }
                          </Typography>
                        </Stack>
                        <Typography
                          variant="h6"
                          component="div"
                          sx={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {statement.fileName}
                        </Typography>
                      </Box>
                      {getStatusChip(statement.status)}
                    </Box>

                    {/* Bank Account Info */}
                    {statement.bankAccount && (
                      <Box
                        sx={{
                          bgcolor: 'primary.lighter',
                          p: 1.5,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'primary.light',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <Iconify
                            icon="ph:bank-bold"
                            sx={{ color: 'primary.main', fontSize: 16 }}
                          />
                          <Typography variant="subtitle2" color="primary.main">
                            {statement.bankAccount.bankName}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="primary.dark">
                          {statement.bankAccount.accountName}
                        </Typography>
                        {statement.bankAccount.accountNumber && (
                          <Typography variant="caption" color="primary.dark">
                            •••• {statement.bankAccount.accountNumber}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Statement details */}
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify
                          icon="ph:calendar"
                          sx={{ color: 'text.secondary', fontSize: 16 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Uploaded: {formatDateString(statement.createdAt)}
                        </Typography>
                      </Box>

                      {statement.statementPeriod && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Iconify
                            icon="ph:calendar-check"
                            sx={{ color: 'text.secondary', fontSize: 16 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Period: {formatDateString(statement.statementPeriod.startDate)} -{' '}
                            {formatDateString(statement.statementPeriod.endDate)}
                          </Typography>
                        </Box>
                      )}

                      {statement.transactionCount !== undefined && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Iconify
                            icon="ph:list-bullets"
                            sx={{ color: 'text.secondary', fontSize: 16 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {statement.transactionCount} transaction
                            {statement.transactionCount !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      )}

                      {statement.accountDetails && (
                        <Box
                          sx={{
                            bgcolor: 'background.neutral',
                            p: 1.5,
                            borderRadius: 1,
                            mt: 1,
                          }}
                        >
                          <Stack spacing={0.5}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">
                                Opening Balance:
                              </Typography>
                              <Typography
                                variant="caption"
                                fontWeight="medium"
                                color="text.primary"
                              >
                                ${statement.accountDetails.openingBalance?.toFixed(2) || '0.00'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">
                                Closing Balance:
                              </Typography>
                              <Typography
                                variant="caption"
                                fontWeight="medium"
                                color="text.primary"
                              >
                                ${statement.accountDetails.closingBalance?.toFixed(2) || '0.00'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>

                <Divider />

                <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, statement })}
                      sx={{ border: '1px solid', borderColor: 'error.main' }}
                    >
                      <Iconify icon="ph:trash" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewStatement(statement)}
                      sx={{ border: '1px solid', borderColor: 'primary.main' }}
                    >
                      <Iconify icon="ph:file-text" />
                    </IconButton>
                  </Stack>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="ph:eye" />}
                    onClick={() => handleViewTransactions(statement)}
                    disabled={statement.status !== 'completed'}
                  >
                    View Transactions
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* View Statement Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, statement: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">View Statement</Typography>
              <Typography variant="body2" color="text.secondary">
                {viewDialog.statement?.fileName}
              </Typography>
            </Box>
            <IconButton onClick={() => setViewDialog({ open: false, statement: null })}>
              <Iconify icon="ph:x-bold" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {viewDialog.statement?.filePath ? (
            <Box sx={{ width: '100%', height: '500px' }}>
              <iframe
                src={viewDialog.statement.filePath}
                width="100%"
                height="100%"
                style={{ border: 'none', borderRadius: '8px' }}
                title="Statement Preview"
              />
            </Box>
          ) : (
            <Alert severity="info">
              <AlertTitle>Preview Not Available</AlertTitle>
              File preview is not available for this statement. You can download it to view the
              contents.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, statement: null })}>Close</Button>
          {viewDialog.statement?.filePath && (
            <Button
              variant="contained"
              href={viewDialog.statement.filePath}
              target="_blank"
              startIcon={<Iconify icon="ph:download-bold" />}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, statement: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="ph:warning-circle" sx={{ color: 'error.main' }} />
            Confirm Delete
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this bank statement?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Statement:</strong> {deleteDialog.statement?.fileName}
          </Typography>
          <Alert severity="warning">
            <AlertTitle>Warning</AlertTitle>
            This action will permanently delete the statement and all associated transactions. This
            cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, statement: null })} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteStatement(deleteDialog.statement)}
            color="error"
            variant="contained"
            startIcon={<Iconify icon="ph:trash" />}
          >
            Delete Statement
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}