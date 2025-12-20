'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';

import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { fCurrency, fPercent } from 'src/utils/format-number';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { Avatar } from '@mui/material';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// ----------------------------------------------------------------------

// Helper function to determine if an expense is non-operating
const isNonOperatingExpense = (category) => {
  const nonOperatingKeywords = [
    'interest',
    'loan',
    'depreciation',
    'amortization',
    'investment',
    'gain',
    'loss',
    'extraordinary',
  ];
  return nonOperatingKeywords.some((keyword) => category.toLowerCase().includes(keyword));
};

// ----------------------------------------------------------------------

export function PLStatementView() {
  const { selectedCompany } = useAuthContext();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plData, setPlData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    revenue: false,
    cogs: false,
    operating: false,
    nonOperating: false,
  });

  // Filter state
  const [filters, setFilters] = useState({
    period: 'year_to_date',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quarter: Math.floor(new Date().getMonth() / 3) + 1,
    startDate: '',
    endDate: '',
  });

  // Fetch P&L data
  const fetchPLData = async () => {
    if (!selectedCompany?._id) return;

    try {
      setLoading(true);
      setError(null);

      const params = {
        period: filters.period,
        ...(filters.period === 'year' && { year: filters.year }),
        ...(filters.period === 'month' && { year: filters.year, month: filters.month }),
        ...(filters.period === 'quarter' && { year: filters.year, quarter: filters.quarter }),
        ...(filters.period === 'custom' && {
          startDate: filters.startDate,
          endDate: filters.endDate,
        }),
      };

      const response = await axiosInstance.get(endpoints.plStatement.get, { params });
      setPlData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch P&L data:', err);
      setError('Failed to load P&L statement data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and filter changes
  useEffect(() => {
    // Only fetch data if we have all required filters
    const shouldFetch =
      filters.period === 'year_to_date' ||
      (filters.period === 'month' && filters.year && filters.month) ||
      (filters.period === 'quarter' && filters.year && filters.quarter) ||
      (filters.period === 'year' && filters.year);

    if (shouldFetch) {
      fetchPLData();
    } else {
      // Clear data if filters are incomplete
      setPlData(null);
      setLoading(false);
    }
  }, [selectedCompany?._id, filters]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Calculate chart data from actual P&L data
  const chartData = useMemo(() => {
    if (!plData) return null;

    const { currentPeriod, summary } = plData;

    // For now, show current period data as single point
    // TODO: Implement historical data fetching for trend analysis
    const currentPeriodLabel =
      filters.period === 'month'
        ? `${new Date(0, filters.month - 1).toLocaleString('default', { month: 'short' })} ${filters.year}`
        : filters.period === 'quarter'
          ? `Q${filters.quarter} ${filters.year}`
          : filters.period === 'year'
            ? `${filters.year}`
            : 'Current Period';

    // Profit trend data - using actual data
    const profitTrendData = {
      labels: [currentPeriodLabel],
      datasets: [
        {
          label: 'Gross Profit',
          data: [summary.grossProfit],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Net Income',
          data: [summary.netIncome],
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Revenue',
          data: [summary.totalRevenue],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
      ],
    };

    // Expense breakdown pie chart - showing business vs personal + top categories
    const businessTotal = currentPeriod.expenses.business?.total || 0;
    const personalTotal = currentPeriod.expenses.personal?.total || 0;

    const expenseBreakdownData = {
      labels: [
        'Business Expenses',
        'Personal Expenses',
        ...currentPeriod.expenses.categories
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 8)
          .map((cat) => cat.name),
      ],
      datasets: [
        {
          data: [
            businessTotal,
            personalTotal,
            ...currentPeriod.expenses.categories
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 8)
              .map((cat) => cat.amount),
          ],
          backgroundColor: [
            '#3b82f6', // Business - Blue
            '#f59e0b', // Personal - Orange
            '#ef4444',
            '#10b981',
            '#8b5cf6',
            '#ec4899',
            '#06b6d4',
            '#84cc16',
            '#f97316',
            '#6366f1',
          ],
        },
      ],
    };

    // Revenue vs Expenses comparison - using actual data
    const revenueExpensesData = {
      labels: [currentPeriodLabel],
      datasets: [
        {
          label: 'Revenue',
          data: [currentPeriod.revenue.total],
          backgroundColor: '#3b82f6',
        },
        {
          label: 'COGS',
          data: [currentPeriod.expenses.cogs],
          backgroundColor: '#f59e0b',
        },
        {
          label: 'Operating Expenses',
          data: [currentPeriod.expenses.operating],
          backgroundColor: '#8b5cf6',
        },
        {
          label: 'Non-Operating Expenses',
          data: [currentPeriod.expenses.nonOperating],
          backgroundColor: '#ef4444',
        },
        {
          label: 'Net Income',
          data: [summary.netIncome],
          backgroundColor: '#10b981',
        },
      ],
    };

    return {
      profitTrend: profitTrendData,
      expenseBreakdown: expenseBreakdownData,
      revenueExpenses: revenueExpensesData,
    };
  }, [plData, filters]);

  if (loading) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Skeleton variant="text" width={300} height={40} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {[...Array(4)].map((_, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={32} sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rectangular" height={400} sx={{ mt: 3 }} />
        </Box>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent maxWidth="xl">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </DashboardContent>
    );
  }

  if (!plData) {
    return (
      <DashboardContent maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h4">Profit & Loss Statement</Typography>
          </Stack>

          {/* Filters */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Iconify icon="eva:calendar-outline" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Period:
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Period Type</InputLabel>
                <Select
                  value={filters.period}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                  label="Period Type"
                >
                  <MenuItem value="year_to_date">Year to Date</MenuItem>
                  <MenuItem value="month">Monthly</MenuItem>
                  <MenuItem value="quarter">Quarterly</MenuItem>
                  <MenuItem value="year">Yearly</MenuItem>
                </Select>
              </FormControl>

              {/* Show secondary filter placeholders */}
              {filters.period === 'month' && (
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Month</InputLabel>
                  <Select value="" label="Month" disabled>
                    <MenuItem value="">Select Month</MenuItem>
                  </Select>
                </FormControl>
              )}

              {filters.period === 'quarter' && (
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Quarter</InputLabel>
                  <Select value="" label="Quarter" disabled>
                    <MenuItem value="">Select Quarter</MenuItem>
                  </Select>
                </FormControl>
              )}

              {filters.period === 'year' && (
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Year</InputLabel>
                  <Select value="" label="Year" disabled>
                    <MenuItem value="">Select Year</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Stack>
          </Stack>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          {filters.period === 'year_to_date'
            ? 'No P&L data available for the current year to date.'
            : 'Please select both filters to load P&L data.'}
        </Alert>
      </DashboardContent>
    );
  }

  const { summary, currentPeriod, trends } = plData;

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">Profit & Loss Statement</Typography>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:download-outline" />}
            onClick={() => window.print()}
          >
            Export PDF
          </Button>
        </Stack>

        {/* Filters */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Iconify icon="eva:calendar-outline" sx={{ color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Period:
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Period Type</InputLabel>
              <Select
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                label="Period Type"
              >
                <MenuItem value="year_to_date">Year to Date</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
                <MenuItem value="quarter">Quarterly</MenuItem>
                <MenuItem value="year">Yearly</MenuItem>
              </Select>
            </FormControl>

            {/* Second Filter - Dynamic based on period type */}
            {filters.period === 'month' && plData?.availablePeriods?.months && (
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={`${filters.year}-${filters.month}`}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-');
                    handleFilterChange('year', parseInt(year));
                    handleFilterChange('month', parseInt(month));
                  }}
                  label="Month"
                >
                  {plData.availablePeriods.months.map((monthData) => (
                    <MenuItem
                      key={`${monthData.year}-${monthData.month}`}
                      value={`${monthData.year}-${monthData.month}`}
                    >
                      {monthData.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {filters.period === 'quarter' && plData?.availablePeriods?.quarters && (
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Quarter</InputLabel>
                <Select
                  value={`${filters.year}-${filters.quarter}`}
                  onChange={(e) => {
                    const [year, quarter] = e.target.value.split('-');
                    handleFilterChange('year', parseInt(year));
                    handleFilterChange('quarter', parseInt(quarter));
                  }}
                  label="Quarter"
                >
                  {plData.availablePeriods.quarters.map((quarterData) => (
                    <MenuItem
                      key={`${quarterData.year}-${quarterData.quarter}`}
                      value={`${quarterData.year}-${quarterData.quarter}`}
                    >
                      {quarterData.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {filters.period === 'year' && plData?.availablePeriods?.years && (
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  label="Year"
                >
                  {plData.availablePeriods.years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                >
                  Total Revenue
                </Typography>
                <Avatar
                  sx={{
                    backgroundColor: 'primary.lighter',
                    width: 32,
                    height: 32,
                  }}
                >
                  <Iconify icon="eva:trending-up-fill" color="primary.main" width={16} />
                </Avatar>
              </Stack>
              <Typography variant="h5" sx={{ fontSize: '1.25rem' }}>
                {fCurrency(summary.totalRevenue)}
              </Typography>
              {trends && (
                <Typography
                  variant="caption"
                  sx={{
                    color: trends.revenue >= 0 ? 'success.main' : 'error.main',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block',
                  }}
                >
                  {trends.revenue >= 0 ? '+' : ''}
                  {fPercent(Math.abs(trends.revenue))} vs last period
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                >
                  Gross Profit
                </Typography>
                <Avatar
                  sx={{
                    backgroundColor: summary.grossProfit >= 0 ? 'success.lighter' : 'error.lighter',
                    width: 32,
                    height: 32,
                  }}
                >
                  <Iconify
                    icon="eva:pie-chart-2-fill"
                    color={summary.grossProfit >= 0 ? 'success.main' : 'error.main'}
                    width={16}
                  />
                </Avatar>
              </Stack>
              <Typography
                variant="h5"
                sx={{
                  fontSize: '1.25rem',
                  color: summary.grossProfit >= 0 ? 'success.main' : 'error.main',
                }}
              >
                {fCurrency(summary.grossProfit)}
              </Typography>
              {trends && (
                <Typography
                  variant="caption"
                  sx={{
                    color: trends.revenue >= 0 ? 'success.main' : 'error.main',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block',
                  }}
                >
                  {fPercent(summary.grossMargin)}% margin
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                >
                  Operating Income
                </Typography>
                <Avatar
                  sx={{
                    backgroundColor:
                      summary.operatingIncome >= 0 ? 'info.lighter' : 'warning.lighter',
                    width: 32,
                    height: 32,
                  }}
                >
                  <Iconify
                    icon="eva:bar-chart-2-fill"
                    color={summary.operatingIncome >= 0 ? 'info.main' : 'warning.main'}
                    width={16}
                  />
                </Avatar>
              </Stack>
              <Typography
                variant="h5"
                sx={{
                  fontSize: '1.25rem',
                  color: summary.operatingIncome >= 0 ? 'info.main' : 'warning.main',
                }}
              >
                {fCurrency(summary.operatingIncome)}
              </Typography>
              {trends && (
                <Typography
                  variant="caption"
                  sx={{
                    color: trends.expenses <= 0 ? 'success.main' : 'error.main',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block',
                  }}
                >
                  {fPercent(summary.operatingMargin)}% margin
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                >
                  Net Income
                </Typography>
                <Avatar
                  sx={{
                    backgroundColor: summary.netIncome >= 0 ? 'success.lighter' : 'error.lighter',
                    width: 32,
                    height: 32,
                  }}
                >
                  <Iconify
                    icon={
                      summary.netIncome >= 0 ? 'eva:trending-up-fill' : 'eva:trending-down-fill'
                    }
                    color={summary.netIncome >= 0 ? 'success.main' : 'error.main'}
                    width={16}
                  />
                </Avatar>
              </Stack>
              <Typography
                variant="h5"
                sx={{
                  fontSize: '1.25rem',
                  color: summary.netIncome >= 0 ? 'success.main' : 'error.main',
                }}
              >
                {fCurrency(summary.netIncome)}
              </Typography>
              {trends && (
                <Typography
                  variant="caption"
                  sx={{
                    color: trends.netIncome >= 0 ? 'success.main' : 'error.main',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block',
                  }}
                >
                  {trends.netIncome >= 0 ? '+' : ''}
                  {fPercent(Math.abs(trends.netIncome))} vs last period
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                >
                  Net Liabilities
                </Typography>
                <Avatar
                  sx={{
                    backgroundColor: 'error.lighter',
                    width: 32,
                    height: 32,
                  }}
                >
                  <Iconify icon="eva:alert-triangle-fill" color="error.main" width={16} />
                </Avatar>
              </Stack>
              <Typography variant="h5" sx={{ fontSize: '1.25rem', color: 'error.main' }}>
                {fCurrency(currentPeriod.liabilities.net)}
              </Typography>
              {trends && trends.liabilities !== undefined && (
                <Typography
                  variant="caption"
                  sx={{
                    color: trends.liabilities <= 0 ? 'success.main' : 'error.main',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block',
                  }}
                >
                  {trends.liabilities >= 0 ? '+' : ''}
                  {fPercent(Math.abs(trends.liabilities))} vs last period
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* P&L Statement Table */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Typography variant="h6">Profit & Loss Statement</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Detailed breakdown of income and expenses
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.neutral' }}>
              <TableRow>
                <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Account</TableCell>
                <TableCell align="right" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                  Amount
                </TableCell>
                <TableCell align="right" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                  % of Revenue
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Revenue Section */}
              <TableRow
                sx={{
                  bgcolor: 'primary.lighter',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.light' },
                }}
                onClick={() => toggleSection('revenue')}
              >
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify
                      icon={
                        expandedSections.revenue
                          ? 'eva:chevron-down-fill'
                          : 'eva:chevron-right-fill'
                      }
                      sx={{ color: 'text.primary' }}
                    />
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                      Revenue
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    {fCurrency(currentPeriod.revenue.total)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    100.0%
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Revenue Categories - Always show when expanded */}
              {expandedSections.revenue &&
                currentPeriod.revenue.categories.map((category) => (
                  <TableRow key={category.name} sx={{ bgcolor: 'background.paper' }}>
                    <TableCell sx={{ pl: 6 }}>
                      <Typography variant="body2" color="text.primary">
                        {category.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.primary">
                        {fCurrency(category.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {fPercent((category.amount / currentPeriod.revenue.total) * 100)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}

              {/* COGS Section */}
              <TableRow
                sx={{
                  bgcolor: 'error.lighter',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'error.light' },
                }}
                onClick={() => toggleSection('cogs')}
              >
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify
                      icon={
                        expandedSections.cogs ? 'eva:chevron-down-fill' : 'eva:chevron-right-fill'
                      }
                      sx={{ color: 'text.primary' }}
                    />
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                      Cost of Goods Sold
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'error.main' }}>
                    -{fCurrency(currentPeriod.expenses.cogs)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {fPercent((currentPeriod.expenses.cogs / currentPeriod.revenue.total) * 100)}
                  </Typography>
                </TableCell>
              </TableRow>

              {/* COGS Categories */}
              {expandedSections.cogs &&
                currentPeriod.expenses.categories
                  .filter(
                    (cat) =>
                      cat.name.toLowerCase().includes('cogs') ||
                      cat.name.toLowerCase().includes('cost of goods')
                  )
                  .map((category) => (
                    <TableRow key={category.name} sx={{ bgcolor: 'background.paper' }}>
                      <TableCell sx={{ pl: 6 }}>
                        <Typography variant="body2" color="text.primary">
                          {category.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="error.main">
                          -{fCurrency(category.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {fPercent((category.amount / currentPeriod.revenue.total) * 100)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}

              {/* Gross Profit */}
              <TableRow
                sx={{ bgcolor: 'success.lighter', borderTop: 2, borderColor: 'success.main' }}
              >
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    Gross Profit
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                    {fCurrency(summary.grossProfit)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {fPercent(summary.grossMargin)}
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Operating Expenses */}
              <TableRow
                sx={{
                  bgcolor: 'warning.lighter',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'warning.light' },
                }}
                onClick={() => toggleSection('operating')}
              >
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify
                      icon={
                        expandedSections.operating
                          ? 'eva:chevron-down-fill'
                          : 'eva:chevron-right-fill'
                      }
                      sx={{ color: 'text.primary' }}
                    />
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                      Operating Expenses
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'error.main' }}>
                    -{fCurrency(currentPeriod.expenses.operating)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {fPercent(
                      (currentPeriod.expenses.operating / currentPeriod.revenue.total) * 100
                    )}
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Operating Expense Categories */}
              {expandedSections.operating && (
                <>
                  {/* Business Expenses */}
                  {currentPeriod.expenses.business &&
                    currentPeriod.expenses.business.categories.length > 0 && (
                      <>
                        <TableRow sx={{ bgcolor: 'background.neutral' }}>
                          <TableCell sx={{ pl: 4 }}>
                            <Typography variant="body2" fontWeight="bold" color="primary.main">
                              Business Expenses
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold" color="error.main">
                              -{fCurrency(currentPeriod.expenses.business.operating)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {fPercent(
                                (currentPeriod.expenses.business.operating /
                                  currentPeriod.revenue.total) *
                                  100
                              )}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        {currentPeriod.expenses.business.categories
                          .filter(
                            (cat) =>
                              !cat.name.toLowerCase().includes('cogs') &&
                              !isNonOperatingExpense(cat.name)
                          )
                          .map((category) => (
                            <TableRow
                              key={`business-${category.name}`}
                              sx={{ bgcolor: 'background.paper' }}
                            >
                              <TableCell sx={{ pl: 8 }}>
                                <Typography variant="body2" color="text.primary">
                                  {category.name}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" color="error.main">
                                  -{fCurrency(category.amount)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  {fPercent((category.amount / currentPeriod.revenue.total) * 100)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                      </>
                    )}

                  {/* Personal Expenses */}
                  {currentPeriod.expenses.personal &&
                    currentPeriod.expenses.personal.categories.length > 0 && (
                      <>
                        <TableRow sx={{ bgcolor: 'background.neutral' }}>
                          <TableCell sx={{ pl: 4 }}>
                            <Typography variant="body2" fontWeight="bold" color="warning.main">
                              Personal Expenses
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold" color="error.main">
                              -{fCurrency(currentPeriod.expenses.personal.operating)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {fPercent(
                                (currentPeriod.expenses.personal.operating /
                                  currentPeriod.revenue.total) *
                                  100
                              )}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        {currentPeriod.expenses.personal.categories
                          .filter(
                            (cat) =>
                              !cat.name.toLowerCase().includes('cogs') &&
                              !isNonOperatingExpense(cat.name)
                          )
                          .map((category) => (
                            <TableRow
                              key={`personal-${category.name}`}
                              sx={{ bgcolor: 'background.paper' }}
                            >
                              <TableCell sx={{ pl: 8 }}>
                                <Typography variant="body2" color="text.primary">
                                  {category.name}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" color="error.main">
                                  -{fCurrency(category.amount)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  {fPercent((category.amount / currentPeriod.revenue.total) * 100)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                      </>
                    )}
                </>
              )}

              {/* Operating Income */}
              <TableRow sx={{ bgcolor: 'info.lighter', borderTop: 2, borderColor: 'info.main' }}>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    Operating Income
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold" color="info.main">
                    {fCurrency(summary.operatingIncome)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {fPercent(summary.operatingMargin)}
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Non-Operating Expenses */}
              <TableRow
                sx={{
                  bgcolor: 'error.lighter',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'error.light' },
                }}
                onClick={() => toggleSection('nonOperating')}
              >
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify
                      icon={
                        expandedSections.nonOperating
                          ? 'eva:chevron-down-fill'
                          : 'eva:chevron-right-fill'
                      }
                      sx={{ color: 'text.primary' }}
                    />
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                      Non-Operating Expenses
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'error.main' }}>
                    -{fCurrency(currentPeriod.expenses.nonOperating)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {fPercent(
                      (currentPeriod.expenses.nonOperating / currentPeriod.revenue.total) * 100
                    )}
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Non-Operating Expense Categories */}
              {expandedSections.nonOperating &&
                currentPeriod.expenses.categories
                  .filter((cat) => isNonOperatingExpense(cat.name))
                  .map((category) => (
                    <TableRow key={category.name} sx={{ bgcolor: 'background.paper' }}>
                      <TableCell sx={{ pl: 6 }}>
                        <Typography variant="body2" color="text.primary">
                          {category.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="error.main">
                          -{fCurrency(category.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {fPercent((category.amount / currentPeriod.revenue.total) * 100)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}

              {/* Net Income */}
              <TableRow
                sx={{ bgcolor: 'success.lighter', borderTop: 4, borderColor: 'success.dark' }}
              >
                <TableCell>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                    Net Income
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color={summary.netIncome >= 0 ? 'success.main' : 'error.main'}
                  >
                    {fCurrency(summary.netIncome)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {fPercent(summary.netMargin)}
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Liabilities Section */}
              <TableRow sx={{ bgcolor: 'error.lighter', borderTop: 2, borderColor: 'error.main' }}>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    Total Liabilities
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'error.main' }}>
                    {fCurrency(currentPeriod.liabilities.total)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {currentPeriod.revenue.total > 0
                      ? fPercent(
                          (currentPeriod.liabilities.total / currentPeriod.revenue.total) * 100
                        )
                      : '0.0%'}
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Credit Card Liabilities */}
              <TableRow sx={{ bgcolor: 'background.paper' }}>
                <TableCell sx={{ pl: 6 }}>
                  <Typography variant="body2" color="text.primary">
                    Credit Card Liabilities
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="error.main">
                    {fCurrency(currentPeriod.liabilities.creditCard)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {currentPeriod.revenue.total > 0
                      ? fPercent(
                          (currentPeriod.liabilities.creditCard / currentPeriod.revenue.total) * 100
                        )
                      : '0.0%'}
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Loan Liabilities */}
              <TableRow sx={{ bgcolor: 'background.paper' }}>
                <TableCell sx={{ pl: 6 }}>
                  <Typography variant="body2" color="text.primary">
                    Loan Liabilities
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="error.main">
                    {fCurrency(currentPeriod.liabilities.loans)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {currentPeriod.revenue.total > 0
                      ? fPercent(
                          (currentPeriod.liabilities.loans / currentPeriod.revenue.total) * 100
                        )
                      : '0.0%'}
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Liability Payments */}
              <TableRow sx={{ bgcolor: 'background.paper' }}>
                <TableCell sx={{ pl: 6 }}>
                  <Typography variant="body2" color="text.primary">
                    Less: Payments Made
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="success.main">
                    -{fCurrency(currentPeriod.liabilities.payments)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {currentPeriod.revenue.total > 0
                      ? fPercent(
                          (currentPeriod.liabilities.payments / currentPeriod.revenue.total) * 100
                        )
                      : '0.0%'}
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Net Liabilities */}
              <TableRow sx={{ bgcolor: 'error.lighter', borderTop: 2, borderColor: 'error.dark' }}>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    Net Outstanding Liabilities
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold" color="error.main">
                    {fCurrency(currentPeriod.liabilities.net)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {currentPeriod.revenue.total > 0
                      ? fPercent(
                          (currentPeriod.liabilities.net / currentPeriod.revenue.total) * 100
                        )
                      : '0.0%'}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Profit Trend Analysis
            </Typography>
            <Box sx={{ height: 320 }}>
              {chartData && (
                <Line
                  data={chartData.profitTrend}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => fCurrency(value),
                        },
                      },
                    },
                  }}
                />
              )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Expense Breakdown
            </Typography>
            <Box sx={{ height: 320 }}>
              {chartData && (
                <Pie
                  data={chartData.expenseBreakdown}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = fCurrency(context.parsed);
                            const percentage = fPercent(
                              (context.parsed / currentPeriod.expenses.total) * 100
                            );
                            return `${label}: ${value} (${percentage})`;
                          },
                        },
                      },
                    },
                  }}
                />
              )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Revenue vs Expenses Comparison
            </Typography>
            <Box sx={{ height: 320 }}>
              {chartData && (
                <Bar
                  data={chartData.revenueExpenses}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => fCurrency(value),
                        },
                      },
                    },
                  }}
                />
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Key Ratios */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Profit Margins
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Gross Margin
                </Typography>
                <Typography variant="subtitle2">{fPercent(summary.grossMargin)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Operating Margin
                </Typography>
                <Typography variant="subtitle2">{fPercent(summary.operatingMargin)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Net Margin
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'success.main' }}>
                  {fPercent(summary.netMargin)}
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Expense Ratios
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  COGS Ratio
                </Typography>
                <Typography variant="subtitle2">
                  {fPercent((currentPeriod.expenses.cogs / currentPeriod.revenue.total) * 100)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  OpEx Ratio
                </Typography>
                <Typography variant="subtitle2">
                  {fPercent((currentPeriod.expenses.operating / currentPeriod.revenue.total) * 100)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Total Expense Ratio
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'error.main' }}>
                  {fPercent((currentPeriod.expenses.total / currentPeriod.revenue.total) * 100)}
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Key Ratios
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Revenue Growth
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ color: trends.revenue >= 0 ? 'success.main' : 'error.main' }}
                >
                  {trends.revenue >= 0 ? '+' : ''}
                  {fPercent(trends.revenue)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Profit Growth
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ color: trends.netIncome >= 0 ? 'success.main' : 'error.main' }}
                >
                  {trends.netIncome >= 0 ? '+' : ''}
                  {fPercent(trends.netIncome)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Efficiency Score
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'info.main' }}>
                  {summary.netMargin > 0 ? (summary.netMargin * 3).toFixed(1) : '0.0'}
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
