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

export function DashboardView() {
  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4">Dashboard</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Welcome to Perfecto! Your dashboard will display analytics and insights here.
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
            <Iconify icon="mdi:chart-line" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Dashboard Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your financial analytics and insights will appear here
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </DashboardContent>
  );
}
