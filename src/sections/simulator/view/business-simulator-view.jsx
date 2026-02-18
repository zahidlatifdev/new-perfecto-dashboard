'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import toast from 'react-hot-toast';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { SimulatorMetricCard } from '../components/simulator-metric-card';
import { SavedSimulationCard } from '../components/saved-simulation-card';
import { SimulatorBuilder } from '../components/simulator-builder';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { usePermissions } from 'src/hooks/use-permissions';
import { fCurrency } from 'src/utils/format-number';
import { Tooltip } from '@mui/material';

// Skeleton loading component for metric cards
function MetricCardSkeleton() {
    return (
        <Card sx={{ p: 2, border: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width={150} height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width={100} height={40} />
                </Box>
                <Skeleton variant="circular" width={48} height={48} />
            </Box>
        </Card>
    );
}

// Skeleton loading component for category cards
function CategoryCardSkeleton() {
    return (
        <Card sx={{ p: 2, border: 1, borderColor: 'divider' }}>
            <Skeleton variant="text" width={100} height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={80} height={28} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={60} height={14} />
        </Card>
    );
}

// Skeleton loading component for simulation cards
function SimulationCardSkeleton() {
    return (
        <Card sx={{ p: 2, border: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width={180} height={24} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width={140} height={16} />
                </Box>
            </Box>
            <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 1.5, mb: 1.5 }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="text" width={80} height={16} />
                <Skeleton variant="text" width={80} height={16} />
            </Box>
        </Card>
    );
}

export function BusinessSimulatorView() {
    const { selectedCompany } = useAuthContext();
    const { can } = usePermissions();
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [savedSimulations, setSavedSimulations] = useState([]);
    const [baselineData, setBaselineData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [simulationsLoading, setSimulationsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasConnectedAccounts] = useState(true);

    useEffect(() => {
        if (selectedCompany?._id) {
            fetchBaselineData();
            fetchSimulations();
        }
    }, [selectedCompany?._id]);

    const fetchBaselineData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get(endpoints.simulator.baseline, {
                params: { months: 6 }
            });

            if (response.data?.success && response.data?.data) {
                const data = response.data.data;
                // Map new API fields to frontend expected fields
                setBaselineData({
                    income: data.baselineIncome ?? 0,
                    totalExpenses: data.baselineTotalExpenses ?? 0,
                    profit: data.baselineProfit ?? 0,
                    expensesByCategory: Array.isArray(data.baselineExpenseCategories)
                        ? data.baselineExpenseCategories.map(cat => ({
                            group: cat.categoryName,
                            total: cat.amount,
                            id: cat.categoryId
                        }))
                        : [],
                    transactionCount: data.transactionCount ?? 0,
                    periodMonths: data.periodMonths,
                    startDate: data.startDate,
                    endDate: data.endDate
                });
            } else {
                // Handle empty/no data gracefully
                setBaselineData({
                    income: 0,
                    totalExpenses: 0,
                    profit: 0,
                    expensesByCategory: [],
                    transactionCount: 0
                });
                setError('No transaction data available. Please connect your accounts or add transactions.');
            }
        } catch (err) {
            console.error('Error fetching baseline data:', err);
            const errorMessage = err?.message || err?.error || 'Failed to load baseline metrics';
            setError(errorMessage);
            // Set empty baseline data to prevent undefined errors
            setBaselineData({
                income: 0,
                totalExpenses: 0,
                profit: 0,
                expensesByCategory: [],
                transactionCount: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSimulations = async () => {
        try {
            setSimulationsLoading(true);
            const response = await axiosInstance.get(endpoints.simulator.list, {
                params: { sortBy: 'createdAt', sortOrder: 'desc', limit: 50 }
            });

            if (response.data?.success && response.data?.data?.simulations) {
                setSavedSimulations(Array.isArray(response.data.data.simulations) ? response.data.data.simulations : []);
            } else {
                setSavedSimulations([]);
            }
        } catch (err) {
            console.error('Error fetching simulations:', err);
            setSavedSimulations([]);
        } finally {
            setSimulationsLoading(false);
        }
    };

    const handleSaveSimulation = async (simulationData) => {
        try {
            const response = await axiosInstance.post(endpoints.simulator.create, simulationData);

            if (response.data?.success && response.data?.data) {
                setSavedSimulations((prev) => [response.data.data, ...prev]);
                toast.success('Simulation saved successfully!');
                setIsBuilderOpen(false);
            } else {
                toast.error('Failed to save simulation');
            }
        } catch (err) {
            console.error('Error saving simulation:', err);
            toast.error(err?.message || 'Failed to save simulation');
        }
    };

    const handleLoadSimulation = (simulation) => {
        toast.success(`Loading "${simulation.name}"...`);
        // TODO: Pass simulation data to builder to pre-populate
        setIsBuilderOpen(true);
    };

    const handleDeleteSimulation = async (id) => {
        try {
            await axiosInstance.delete(endpoints.simulator.delete(id));
            setSavedSimulations((prev) => prev.filter((s) => s._id !== id));
            toast.success('Simulation deleted');
        } catch (err) {
            console.error('Error deleting simulation:', err);
            toast.error(err?.message || 'Failed to delete simulation');
        }
    };

    // Show main loading state
    if (loading) {
        return (
            <DashboardContent maxWidth="xl">
                <Stack spacing={4}>
                    {/* Header Skeleton */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', lg: 'row' },
                            alignItems: { xs: 'flex-start', lg: 'flex-start' },
                            justifyContent: 'space-between',
                            gap: 2,
                        }}
                    >
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="80%" height={20} />
                        </Box>
                        <Skeleton variant="rectangular" width={180} height={48} sx={{ borderRadius: 1 }} />
                    </Box>

                    {/* Baseline Metrics Skeleton */}
                    <Box>
                        <Skeleton variant="text" width={280} height={32} sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            {[1, 2, 3].map((i) => (
                                <Grid item xs={12} md={4} key={i}>
                                    <MetricCardSkeleton />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    {/* Categories Skeleton */}
                    <Box>
                        <Skeleton variant="text" width={250} height={32} sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Grid item xs={6} sm={4} md={2} key={i}>
                                    <CategoryCardSkeleton />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    {/* Simulations Skeleton */}
                    <Box>
                        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            {[1, 2, 3].map((i) => (
                                <Grid item xs={12} md={6} lg={4} key={i}>
                                    <SimulationCardSkeleton />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Stack>
            </DashboardContent>
        );
    }

    // Show error state with retry option
    if (error && !baselineData) {
        return (
            <DashboardContent>
                <Stack spacing={3} alignItems="center" justifyContent="center" sx={{ minHeight: '60vh' }}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Iconify icon="solar:danger-triangle-bold" width={32} sx={{ color: 'error.main' }} />
                    </Box>
                    <Typography variant="h5" textAlign="center">
                        Unable to Load Simulator
                    </Typography>
                    <Alert severity="error" sx={{ maxWidth: 500 }}>
                        {error}
                    </Alert>
                    <Button variant="contained" onClick={fetchBaselineData} startIcon={<Iconify icon="solar:refresh-bold" />}>
                        Retry
                    </Button>
                </Stack>
            </DashboardContent>
        );
    }

    // Show empty state for no connected accounts
    if (!hasConnectedAccounts) {
        return (
            <DashboardContent>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '60vh',
                        textAlign: 'center',
                        px: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3,
                        }}
                    >
                        <Iconify icon="solar:danger-triangle-bold" width={32} sx={{ color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                        Connect Your Accounts
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mb: 3 }}>
                        Connect your bank accounts to unlock personalized business simulations based on your
                        actual financial data.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Iconify icon="solar:bolt-bold" />}
                    >
                        Connect Accounts
                    </Button>
                </Box>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent maxWidth="xl">
            <Stack spacing={4}>
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', lg: 'row' },
                        alignItems: { xs: 'flex-start', lg: 'flex-start' },
                        justifyContent: 'space-between',
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h4" sx={{ mb: 1 }}>
                            Tallify Business Simulator
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            See how changes affect your bottom line. Start with your average historic data,
                            adjust income and expenses, and watch profit/loss update in real-time.
                        </Typography>
                    </Box>
                    <Tooltip
                        title={
                            !baselineData?.expensesByCategory || baselineData.expensesByCategory.length === 0
                                ? 'You need at least one expense category to start a simulation. Add transactions to enable.'
                                : ''
                        }
                        disableHoverListener={!!(baselineData?.expensesByCategory && baselineData.expensesByCategory.length > 0)}
                    >
                        <span>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<Iconify icon="solar:play-bold" />}
                                onClick={() => setIsBuilderOpen(true)}
                                sx={{
                                    flexShrink: 0,
                                    minWidth: 200,
                                    whiteSpace: 'nowrap',
                                }}
                                disabled={!baselineData?.expensesByCategory || baselineData.expensesByCategory.length === 0 || !can('simulator', 'create')}
                            >
                                Start Simulation
                            </Button>
                        </span>
                    </Tooltip>
                </Box>

                {/* Warning message if data is insufficient */}
                {error && (
                    <Alert severity="warning" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Baseline Metrics */}
                <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Your Baseline Metrics (6-Month Average)
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <SimulatorMetricCard
                                title="Average Monthly Income"
                                value={fCurrency(baselineData?.income || 0)}
                                icon={(props) => <Iconify icon="solar:dollar-bold" {...props} />}
                                variant="default"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <SimulatorMetricCard
                                title="Average Monthly Expenses"
                                value={fCurrency(baselineData?.totalExpenses || 0)}
                                icon={(props) => <Iconify icon="solar:graph-down-bold" {...props} />}
                                variant="default"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <SimulatorMetricCard
                                title="Average Monthly Profit"
                                value={fCurrency(baselineData?.profit || 0)}
                                icon={(props) => <Iconify icon="solar:graph-up-bold" {...props} />}
                                variant={(baselineData?.profit || 0) > 0 ? 'success' : 'danger'}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* Expense Breakdown */}
                <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Expense Categories
                    </Typography>
                    {baselineData?.expensesByCategory && baselineData.expensesByCategory.length > 0 ? (
                        <Grid container spacing={2}>
                            {baselineData.expensesByCategory.map((category) => (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    lg={3}
                                    xl={2.4}
                                    key={category.group}
                                    sx={{
                                        display: 'flex',
                                    }}
                                >
                                    <Card
                                        sx={{
                                            p: 2,
                                            border: 1,
                                            borderColor: 'divider',
                                            minHeight: 120,
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            {category.group}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                            {fCurrency(category.total || 0)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {baselineData.totalExpenses > 0
                                                ? Math.round(((category.total || 0) / baselineData.totalExpenses) * 100)
                                                : 0}% of total
                                        </Typography>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Card
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                border: 1,
                                borderStyle: 'dashed',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                No expense categories available. Start adding transactions to see expense breakdown.
                            </Typography>
                        </Card>
                    )}
                </Box>

                {/* Saved Simulations */}
                <Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2,
                        }}
                    >
                        <Typography variant="h6">Saved Simulations</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {savedSimulations.length} simulation{savedSimulations.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>

                    {simulationsLoading ? (
                        <Grid container spacing={2}>
                            {[1, 2, 3].map((i) => (
                                <Grid item xs={12} md={6} lg={4} key={i}>
                                    <SimulationCardSkeleton />
                                </Grid>
                            ))}
                        </Grid>
                    ) : savedSimulations.length === 0 ? (
                        <Card
                            sx={{
                                p: 6,
                                textAlign: 'center',
                                border: 1,
                                borderStyle: 'dashed',
                                borderColor: 'divider',
                                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.5),
                            }}
                        >
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    bgcolor: 'action.hover',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2,
                                }}
                            >
                                <Iconify icon="solar:play-bold" width={24} sx={{ color: 'text.secondary' }} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                No saved simulations yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Start a simulation to explore different scenarios for your business.
                            </Typography>
                            <Tooltip
                                title={
                                    !baselineData?.expensesByCategory || baselineData.expensesByCategory.length === 0
                                        ? 'You need at least one expense category to start a simulation. Add transactions to enable.'
                                        : ''
                                }
                                disableHoverListener={!!(baselineData?.expensesByCategory && baselineData.expensesByCategory.length > 0)}
                            >
                                <span>
                                    <Button
                                        variant="contained"
                                        onClick={() => setIsBuilderOpen(true)}
                                        startIcon={<Iconify icon="solar:play-bold" />}
                                        disabled={!baselineData?.expensesByCategory || baselineData.expensesByCategory.length === 0 || !can('simulator', 'create')}
                                    >
                                        Create Your First Simulation
                                    </Button>
                                </span>
                            </Tooltip>
                        </Card>
                    ) : (
                        <Grid container spacing={2}>
                            {savedSimulations.map((simulation) => (
                                <Grid item xs={12} md={6} lg={4} key={simulation._id}>
                                    <SavedSimulationCard
                                        simulation={simulation}
                                        onLoad={handleLoadSimulation}
                                        onDelete={can('simulator', 'delete') ? handleDeleteSimulation : undefined}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Stack>

            {/* Simulator Builder Modal */}
            {baselineData && baselineData.expensesByCategory && baselineData.expensesByCategory.length > 0 && (
                <SimulatorBuilder
                    isOpen={isBuilderOpen}
                    onClose={() => setIsBuilderOpen(false)}
                    onSave={handleSaveSimulation}
                    baselineIncome={baselineData.income || 0}
                    baselineExpenses={baselineData.expensesByCategory.map(cat => ({
                        id: cat.group,
                        name: cat.group,
                        baseline: cat.total || 0
                    }))}
                />
            )}
        </DashboardContent>
    );
}
