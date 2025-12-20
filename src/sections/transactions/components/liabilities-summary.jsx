import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export function LiabilitiesSummary({ 
  creditCardLiabilities = 0, 
  loanLiabilities = 0, 
  totalPayments = 0,
  netLiabilities = 0,
  loading = false 
}) {
  const totalLiabilities = creditCardLiabilities + loanLiabilities;

  const liabilityItems = [
    {
      label: 'Credit Card Liabilities',
      value: creditCardLiabilities,
      icon: 'eva:credit-card-outline',
      color: 'error.main',
      description: 'Total credit card transactions (unpaid)'
    },
    {
      label: 'Loan Liabilities', 
      value: loanLiabilities,
      icon: 'eva:trending-up-outline',
      color: 'warning.main',
      description: 'Credit transactions categorized as loans'
    },
    {
      label: 'Total Payments',
      value: totalPayments,
      icon: 'eva:checkmark-circle-2-outline',
      color: 'success.main',
      description: 'Payments made towards credit card statements'
    },
    {
      label: 'Net Liabilities',
      value: netLiabilities,
      icon: 'eva:alert-triangle-outline',
      color: netLiabilities > 0 ? 'error.main' : 'success.main',
      description: 'Outstanding liabilities after payments'
    }
  ];

  if (loading) {
    return (
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Liabilities Summary
        </Typography>
        <Grid container spacing={2}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Box sx={{ height: 20, bgcolor: 'grey.300', borderRadius: 0.5, mb: 1 }} />
                <Box sx={{ height: 32, bgcolor: 'grey.300', borderRadius: 0.5 }} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">
          Liabilities Summary
        </Typography>
        <Tooltip title="Liabilities include credit card transactions and loans, reduced by payments made">
          <Iconify icon="eva:info-outline" sx={{ color: 'text.secondary' }} />
        </Tooltip>
      </Stack>

      <Grid container spacing={2}>
        {liabilityItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Tooltip title={item.description}>
              <Card 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  cursor: 'help',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Iconify 
                    icon={item.icon} 
                    sx={{ 
                      color: item.color,
                      width: 20,
                      height: 20
                    }} 
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    {item.label}
                  </Typography>
                </Stack>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: item.color,
                    fontWeight: 'bold'
                  }}
                >
                  {fCurrency(item.value)}
                </Typography>

                {/* Show percentage of total for individual liability types */}
                {(item.label.includes('Credit Card') || item.label.includes('Loan')) && totalLiabilities > 0 && (
                  <Chip
                    label={`${((item.value / totalLiabilities) * 100).toFixed(1)}%`}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      mt: 0.5,
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                )}
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      {/* Additional Info */}
      {totalLiabilities > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify 
              icon="eva:info-outline" 
              sx={{ color: 'info.main', width: 16, height: 16 }} 
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Liabilities are calculated from credit card transactions and loan credits, 
              then reduced by payments made towards credit card statements.
              {netLiabilities === 0 && ' All liabilities have been paid!'}
            </Typography>
          </Stack>
        </Box>
      )}
    </Card>
  );
}

LiabilitiesSummary.propTypes = {
  creditCardLiabilities: PropTypes.number,
  loanLiabilities: PropTypes.number,
  totalPayments: PropTypes.number,
  netLiabilities: PropTypes.number,
  loading: PropTypes.bool,
};