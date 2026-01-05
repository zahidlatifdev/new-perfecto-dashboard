'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import { alpha } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { TodaysInspiration } from '../components/todays-inspiration';
import { FunFactsCarousel } from '../components/fun-facts-carousel';

// ----------------------------------------------------------------------

export function DashboardView() {
  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {/* Today's Inspiration - Hero Widget */}
        <Box
          sx={{
            mb: 3,
            animation: 'fadeIn 0.6s ease-in',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(-10px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <TodaysInspiration />
        </Box>

        {/* Welcome Card */}
        <Card
          sx={{
            p: 4,
            mb: 3,
            animation: 'fadeIn 0.6s ease-in 0.05s backwards',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(-10px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                Welcome, Alex!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your books are fully balanced for Oct 2023.
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: (theme) => alpha('#f59e0b', 0.1),
              }}
            >
              <Iconify icon="mdi:white-balance-sunny" width={28} sx={{ color: '#f59e0b' }} />
            </Box>
          </Box>
        </Card>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              animation: 'fadeIn 0.6s ease-in 0.1s backwards',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Card sx={{ p: 3 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 10,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: 1.2,
                      color: 'text.secondary',
                      mb: 0.5,
                      display: 'block',
                    }}
                  >
                    TODAY'S CREDITS
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#16a34a', mb: 1 }}>
                    $12,500.00
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      LIVE VIA PLAID
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: (theme) => alpha('#16a34a', 0.1),
                  }}
                >
                  <Iconify icon="mdi:arrow-top-right" width={16} sx={{ color: '#16a34a' }} />
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
            sx={{
              animation: 'fadeIn 0.6s ease-in 0.15s backwards',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Card sx={{ p: 3 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 10,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: 1.2,
                      color: 'text.secondary',
                      mb: 0.5,
                      display: 'block',
                    }}
                  >
                    TODAY'S EXPENSE
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#dc2626', mb: 1 }}>
                    -$1,282.50
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      LIVE VIA PLAID
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: (theme) => alpha('#dc2626', 0.1),
                  }}
                >
                  <Iconify icon="mdi:arrow-bottom-right" width={16} sx={{ color: '#dc2626' }} />
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
            sx={{
              animation: 'fadeIn 0.6s ease-in 0.2s backwards',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Card sx={{ p: 3 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 10,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: 1.2,
                      color: 'text.secondary',
                      mb: 0.5,
                      display: 'block',
                    }}
                  >
                    TODAY'S LOANS
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    $0.00
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 1, display: 'block' }}>
                    NO DAILY ACTIVITY
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.1),
                  }}
                >
                  <Iconify icon="mdi:minus" width={16} sx={{ color: 'text.secondary' }} />
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* AI Health Check */}
        {/* <Card
          sx={{
            p: 3,
            mb: 3,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'primary.contrastText',
            animation: 'fadeIn 0.6s ease-in 0.25s backwards',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(-10px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.primary.contrastText, 0.2),
              }}
            >
              <Iconify icon="mdi:sparkles" width={24} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                AI Health Check
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Monthly recurring revenue is trending 14% higher than projection.
              </Typography>
            </Box>
          </Box>
        </Card> */}

        {/* Fun Facts Carousel */}
        <Box
          sx={{
            mb: 3,
            animation: 'fadeIn 0.6s ease-in 0.3s backwards',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(-10px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <FunFactsCarousel />
        </Box>

        {/* Bottom Stats */}
        <Grid container spacing={2}>
          <Grid
            item
            xs={6}
            md={3}
            sx={{
              animation: 'fadeIn 0.6s ease-in 0.3s backwards',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Card sx={{ p: 2.5 }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  color: 'text.secondary',
                  mb: 0.5,
                  display: 'block',
                }}
              >
                NET CASH FLOW
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  $42,500
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#16a34a' }}
                >
                  +12%
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid
            item
            xs={6}
            md={3}
            sx={{
              animation: 'fadeIn 0.6s ease-in 0.35s backwards',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Card sx={{ p: 2.5 }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  color: 'text.secondary',
                  mb: 0.5,
                  display: 'block',
                }}
              >
                OPERATING BURN
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                $85,899
              </Typography>
            </Card>
          </Grid>

          <Grid
            item
            xs={6}
            md={3}
            sx={{
              animation: 'fadeIn 0.6s ease-in 0.4s backwards',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Card sx={{ p: 2.5 }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  color: 'text.secondary',
                  mb: 0.5,
                  display: 'block',
                }}
              >
                TOTAL REVENUE
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  $128,400
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#16a34a' }}
                >
                  +8%
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid
            item
            xs={6}
            md={3}
            sx={{
              animation: 'fadeIn 0.6s ease-in 0.45s backwards',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Card sx={{ p: 2.5 }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  color: 'text.secondary',
                  mb: 0.5,
                  display: 'block',
                }}
              >
                RUNWAY
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                18.4 Mo
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </DashboardContent>
  );
}
