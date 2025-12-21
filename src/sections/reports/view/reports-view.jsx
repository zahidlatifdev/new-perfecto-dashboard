'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { alpha } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ReportsView() {
  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4">Reports</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Financial reports and analytics
          </Typography>
        </Box>

        <Card
          sx={{
            textAlign: 'center',
            py: 10,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          }}
        >
          <CardContent>
            <Iconify icon="mdi:file-chart" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Reports Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your financial reports will be generated here
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </DashboardContent>
  );
}
