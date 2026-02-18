'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Container,
  Grid,
  Menu,
  MenuItem,
  Paper,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { ReportCard } from '../components/report-card';
import { ExportModal } from '../components/export-modal';
import { FullScreenReportModal } from '../components/fullscreen-report-modal';
import { ExpenseByCategoryChart } from '../charts/expense-by-category-chart';
import { BurnRateChart } from '../charts/burn-rate-chart';
import { ProfitLossChart } from '../charts/profit-loss-chart';
import { CashFlowChart } from '../charts/cash-flow-chart';
import { RevenueTrendsChart } from '../charts/revenue-trends-chart';
import { SubscriptionExpensesChart } from '../charts/subscription-expenses-chart';
import { TaxDeductibleChart } from '../charts/tax-deductible-chart';
import { SavingsOpportunitiesChart } from '../charts/savings-opportunities-chart';
import { CategoryTrendsChart } from '../charts/category-trends-chart';
import { ForecastVsActualChart } from '../charts/forecast-vs-actual-chart';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { usePermissions } from 'src/hooks/use-permissions';

const timeRangeLabels = {
  last_month: 'Last Month',
  quarter: 'This Quarter',
  year: 'This Year',
  custom: 'Custom Range',
};

export function ReportsView() {
  const router = useRouter();
  const { can } = usePermissions();
  const [timeRange, setTimeRange] = useState('quarter');
  const [timeRangeAnchor, setTimeRangeAnchor] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportAllModal, setExportAllModal] = useState(false);
  const [fullScreenReport, setFullScreenReport] = useState(null);
  const [selectedReportTitle, setSelectedReportTitle] = useState('');

  // Simulate free user for demo (set to true to unlock all)
  const [isPremiumUser] = useState(false);

  const handleExport = (reportTitle) => {
    setSelectedReportTitle(reportTitle);
    setExportModalOpen(true);
  };

  const handleFullScreen = (reportId) => {
    setFullScreenReport(reportId);
  };

  const handleDrillDown = (destination, message) => {
    toast.success(message);
    router.push(destination);
  };

  const reports = [
    {
      id: 'expense-category',
      title: 'Expense by Category',
      summary: '$12,450',
      summaryLabel: 'Total Expenses',
      isPremium: false,
      chart: <ExpenseByCategoryChart />,
      drillDown: () => handleDrillDown('/dashboard/transactions', 'Viewing transaction details...'),
      drillDownLabel: 'View Transactions',
    },
    {
      id: 'burn-rate',
      title: 'Burn Rate',
      summary: '$9,117/mo',
      summaryLabel: 'Avg. Monthly Burn',
      isPremium: false,
      chart: <BurnRateChart />,
      drillDown: () => handleDrillDown('/dashboard/reports', 'Opening forecasting...'),
      drillDownLabel: 'View Forecast',
    },
    {
      id: 'profit-loss',
      title: 'Profit & Loss',
      summary: '$50,200',
      summaryLabel: 'Net Profit (YTD)',
      isPremium: false,
      chart: <ProfitLossChart />,
    },
    {
      id: 'cash-flow',
      title: 'Cash Flow Summary',
      summary: '$89,100',
      summaryLabel: 'Current Balance',
      isPremium: false,
      chart: <CashFlowChart />,
    },
    {
      id: 'revenue-trends',
      title: 'Revenue Trends',
      summary: '$132,800',
      summaryLabel: 'Total Revenue (6 mo)',
      isPremium: false,
      chart: <RevenueTrendsChart />,
    },
    {
      id: 'subscriptions',
      title: 'Subscription Expenses',
      summary: '$1,600/mo',
      summaryLabel: 'Recurring Costs',
      isPremium: false,
      chart: <SubscriptionExpensesChart />,
      drillDown: () => handleDrillDown('/dashboard/deal-scout', 'See savings in Scout...'),
      drillDownLabel: 'Find Savings',
    },
    {
      id: 'tax-deductible',
      title: 'Tax Deductible Expenses',
      summary: '$2,535',
      summaryLabel: 'Est. Tax Savings',
      isPremium: false,
      chart: <TaxDeductibleChart />,
    },
    {
      id: 'savings-opportunities',
      title: 'Savings Opportunities',
      summary: '$1,350/mo',
      summaryLabel: 'Potential Monthly Savings',
      isPremium: true,
      chart: <SavingsOpportunitiesChart />,
      drillDown: () => handleDrillDown('/dashboard/deal-scout', 'Opening Deal Scout...'),
      drillDownLabel: 'View in Scout',
    },
    {
      id: 'category-trends',
      title: 'Category Trends Over Time',
      summary: '5 Categories',
      summaryLabel: 'Top Expense Categories',
      isPremium: false,
      chart: <CategoryTrendsChart />,
    },
    {
      id: 'forecast-actual',
      title: 'Forecast vs Actual',
      summary: '+17%',
      summaryLabel: 'Outperforming Forecast',
      isPremium: true,
      chart: <ForecastVsActualChart />,
      drillDown: () => handleDrillDown('/dashboard/reports', 'Opening AI Forecasting...'),
      drillDownLabel: 'Adjust Forecast',
    },
  ];

  const getChartComponent = (reportId) => {
    const report = reports.find((r) => r.id === reportId);
    return report?.chart || null;
  };

  return (
    <Container maxWidth="xl">
      <Stack spacing={4}>
        {/* Hero Header */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%)',
            border: 1,
            borderColor: 'primary.lighter',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                alignItems={{ xs: 'flex-start', lg: 'center' }}
                justifyContent="space-between"
                spacing={3}
              >
                <Box>
                  <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: 'primary.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon="solar:chart-2-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        Perfecto Reports
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Visualize Your Business Finances
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600 }}>
                    Interactive graphs for key metrics — export, zoom, and drill down for insights. All
                    reports update automatically based on your connected accounts.
                  </Typography>
                </Box>

                {/* Global Filters */}
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:calendar-linear" />}
                    endIcon={<Iconify icon="solar:alt-arrow-down-linear" />}
                    onClick={(e) => setTimeRangeAnchor(e.currentTarget)}
                  >
                    {timeRangeLabels[timeRange]}
                  </Button>
                  <Menu
                    anchorEl={timeRangeAnchor}
                    open={Boolean(timeRangeAnchor)}
                    onClose={() => setTimeRangeAnchor(null)}
                  >
                    {Object.entries(timeRangeLabels).map(([key, label]) => (
                      <MenuItem
                        key={key}
                        onClick={() => {
                          setTimeRange(key);
                          setTimeRangeAnchor(null);
                        }}
                      >
                        {label}
                      </MenuItem>
                    ))}
                  </Menu>

                  {can('reports', 'create') && (
                    <Button
                      variant="contained"
                      startIcon={<Iconify icon="solar:download-linear" />}
                      onClick={() => setExportAllModal(true)}
                    >
                      Export All
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Quick Stats Row */}
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: 'success.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:chart-linear" width={20} sx={{ color: 'success.main' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    $132.8k
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: 'error.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:chart-2-linear" width={20} sx={{ color: 'error.main' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    $82.6k
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Expenses
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: 'primary.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:dollar-linear" width={20} sx={{ color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    $50.2k
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Net Profit
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: 'warning.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:star-bold" width={20} sx={{ color: 'warning.main' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    $1.35k
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Scout Savings
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Reports Grid */}
        <Grid container spacing={3}>
          {reports.map((report) => (
            <Grid item xs={12} sm={6} lg={4} key={report.id}>
              <ReportCard
                title={report.title}
                summary={report.summary}
                summaryLabel={report.summaryLabel}
                isPremium={report.isPremium}
                isLocked={report.isPremium && !isPremiumUser}
                onExport={() => handleExport(report.title)}
                onFullScreen={() => handleFullScreen(report.id)}
                onDrillDown={report.drillDown}
                drillDownLabel={report.drillDownLabel}
              >
                {report.chart}
              </ReportCard>
            </Grid>
          ))}
        </Grid>

        {/* Empty State Hint */}
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            textAlign: 'center',
            borderStyle: 'dashed',
            bgcolor: 'action.hover',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Iconify icon="solar:link-circle-bold" width={24} sx={{ color: 'primary.main' }} />
          </Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Connect More Accounts for Deeper Insights
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
            Link additional bank accounts or credit cards to unlock detailed reports and more accurate AI
            forecasting.
          </Typography>
          <Link href="/dashboard/accounts" passHref legacyBehavior>
            <Button variant="outlined">Connect Accounts</Button>
          </Link>
        </Paper>
      </Stack>

      {/* Modals */}
      <ExportModal open={exportModalOpen} onOpenChange={setExportModalOpen} reportTitle={selectedReportTitle} />
      <ExportModal open={exportAllModal} onOpenChange={setExportAllModal} isAllReports />
      <FullScreenReportModal
        open={!!fullScreenReport}
        onOpenChange={(open) => !open && setFullScreenReport(null)}
        title={reports.find((r) => r.id === fullScreenReport)?.title || ''}
        onExport={() => {
          setFullScreenReport(null);
          handleExport(reports.find((r) => r.id === fullScreenReport)?.title || '');
        }}
      >
        {fullScreenReport && getChartComponent(fullScreenReport)}
      </FullScreenReportModal>
    </Container>
  );
}
