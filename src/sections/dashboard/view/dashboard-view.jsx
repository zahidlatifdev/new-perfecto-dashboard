'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { useDashboardData } from 'src/hooks/use-dashboard-data';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  FinancialSummaryCards,
  FinancialChart,
  IncomeExpensesBreakdown,
  DetailedCategoryBreakdown,
  AccountBalancesChart,
  RecentActivities,
  QuickUpload,
  QuickStats,
} from '../components';

// ----------------------------------------------------------------------

export function DashboardView() {
  const router = useRouter();
  const [chartPeriod, setChartPeriod] = useState('this_year');

  const { data, loading, error, refresh } = useDashboardData(chartPeriod, true);

  // Handle chart period change
  const handleChartPeriodChange = (event) => {
    const newPeriod = event.target.value;
    setChartPeriod(newPeriod);
    refresh(newPeriod);
  };

  // Handle navigation
  const handleNavigate = (path) => {
    router.push(path);
  };

  // Handle view all activities
  const handleViewAllActivities = () => {
    router.push(paths.dashboard.transactions);
  };

  // Handle view pending items
  const handleViewPending = () => {
    router.push(paths.dashboard.pending_items);
  };

  if (error) {
    return (
      <DashboardContent>
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => refresh()}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>

        {/* Show skeleton components even on error to maintain layout */}
        <FinancialSummaryCards loading />

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <FinancialChart loading period={chartPeriod} />
              <IncomeExpensesBreakdown loading />
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <QuickStats loading />
              <RecentActivities loading />
              <QuickUpload />
            </Stack>
          </Grid>
        </Grid>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Dashboard</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Welcome back! Here's what's happening with your books.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => handleNavigate(paths.dashboard.chat_books)}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Chat With Books
        </Button>
      </Stack>

      {/* Financial Summary Cards */}
      <FinancialSummaryCards
        data={data?.financial}
        loading={loading}
      />

      {/* Main Content Grid */}
      <Grid container spacing={3} sx={{ minHeight: 0 }}>
        {/* Left Column */}
        <Grid item xs={12} lg={8} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Stack spacing={3} sx={{ flex: 1 }}>
            {/* Financial Chart */}
            <FinancialChart
              data={data?.chartData}
              loading={loading}
              period={chartPeriod}
              onPeriodChange={handleChartPeriodChange}
            />

            {/* Account Balances Chart */}
            <AccountBalancesChart
              data={data?.accountSummary}
              loading={loading}
            />

            {/* Detailed Category Breakdown */}
            <DetailedCategoryBreakdown
              data={data?.detailedCategoryBreakdown}
              loading={loading}
            />
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Stack spacing={3} sx={{ flex: 1, height: '100%' }}>
            {/* Quick Stats */}
            <QuickStats
              pendingItems={data?.pendingItems}
              loading={loading}
              onViewPending={handleViewPending}
              onNavigate={handleNavigate}
            />

            {/* Category Breakdown (Original) */}
            <IncomeExpensesBreakdown
              data={data?.categoryBreakdown}
              loading={loading}
            />

            {/* Recent Activities */}
            <RecentActivities
              data={data?.recentActivities}
              loading={loading}
              onViewAll={handleViewAllActivities}
            />

            {/* Quick Upload */}
            <QuickUpload />
          </Stack>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}