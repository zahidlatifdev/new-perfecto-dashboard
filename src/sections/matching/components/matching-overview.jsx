'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';
import { fCurrency, fPercent } from 'src/utils/format-number';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function MatchingOverview({ onAutoMatchingToggle }) {
  const { selectedCompany } = useAuthContext();
  const [statistics, setStatistics] = useState(null);
  const [autoMatchingEnabled, setAutoMatchingEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCompany?._id) {
      fetchStatistics();
    }
  }, [selectedCompany?._id]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(endpoints.matching.statistics, {
        params: { companyId: selectedCompany._id }
      });

      if (response.data.success) {
        setStatistics(response.data.data);
        setAutoMatchingEnabled(selectedCompany?.settings?.autoMatching !== false);
      }
    } catch (error) {
      console.error('Failed to fetch matching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoMatchingToggle = async (event) => {
    const enabled = event.target.checked;

    try {
      await axiosInstance.post(endpoints.matching.toggleAutoMatching, {
        enabled
      });

      setAutoMatchingEnabled(enabled);
      onAutoMatchingToggle?.(enabled);
    } catch (error) {
      console.error('Failed to toggle auto-matching:', error);
    }
  };

  if (loading || !statistics) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  const { overview } = statistics;
  const transactionMatchRate = parseFloat(overview.transactionMatchingRate) || 0;
  const documentMatchRate = parseFloat(overview.documentMatchingRate) || 0;

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h6">Matching Overview</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={autoMatchingEnabled}
                onChange={handleAutoMatchingToggle}
                color="primary"
              />
            }
            label="Auto-matching"
          />
        </Stack>

        <Grid container spacing={3}>
          {/* Transaction Matching */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Iconify icon="mdi:swap-horizontal" width={20} />
                <Typography variant="subtitle2">Transaction Matching</Typography>
              </Stack>

              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Match Rate
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {fPercent(transactionMatchRate)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={transactionMatchRate}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Stack direction="row" justifyContent="space-between">
                  <Stack>
                    <Typography variant="h4" color="success.main">
                      {overview.matchedTransactions}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Matched
                    </Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="h4" color="error.main">
                      {overview.unmatchedTransactions}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Unmatched
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          {/* Document Matching */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Iconify icon="mdi:file-document" width={20} />
                <Typography variant="subtitle2">Document Matching</Typography>
              </Stack>

              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Match Rate
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {fPercent(documentMatchRate)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={documentMatchRate}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Stack direction="row" justifyContent="space-between">
                  <Stack>
                    <Typography variant="h4" color="success.main">
                      {overview.matchedDocuments}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Matched
                    </Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="h4" color="error.main">
                      {overview.unmatchedDocuments}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Unmatched
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          {/* Document Types */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Document Types
            </Typography>
            <Grid container spacing={2}>
              {statistics.documentTypes.map((docType) => (
                <Grid item xs={6} md={3} key={docType._id}>
                  <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="h5">{docType.count}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {docType._id || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {fCurrency(docType.totalAmount || 0)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}