'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export function AlternativesTable({ originalProduct, alternatives }) {
    // Collect all unique features from all alternatives
    const allFeatures = new Map();
    alternatives.forEach((alt) => {
        alt.features.forEach((f) => {
            if (!allFeatures.has(f.name)) {
                allFeatures.set(f.name, f.originalHas);
            }
        });
    });
    const featureList = Array.from(allFeatures.entries());

    const getFeatureIcon = (available) => {
        if (available === true)
            return <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: 'success.main' }} />;
        if (available === 'partial')
            return <Iconify icon="solar:minus-circle-bold" width={20} sx={{ color: 'warning.main' }} />;
        if (available === false)
            return <Iconify icon="solar:close-circle-bold" width={20} sx={{ color: 'error.main' }} />;
        return <Iconify icon="solar:minus-circle-linear" width={20} sx={{ color: 'text.disabled' }} />;
    };

    const getPricingBadgeColor = (type) => {
        switch (type) {
            case 'free':
                return 'success';
            case 'open-source':
                return 'secondary';
            case 'freemium':
                return 'info';
            default:
                return 'warning';
        }
    };

    const getFeatureStatus = (alt, featureName) => {
        const feature = alt.features.find((f) => f.name === featureName);
        return feature?.available;
    };

    return (
        <Card>
            <Scrollbar>
                <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                        {/* Table Header */}
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ minWidth: 200, bgcolor: 'background.neutral' }}>
                                    <Typography variant="subtitle2">Compare to {originalProduct.name}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {originalProduct.estimatedPrice}
                                    </Typography>
                                </TableCell>
                                {alternatives.map((alt) => (
                                    <TableCell key={alt.id} sx={{ minWidth: 180, bgcolor: 'background.neutral' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 1.5,
                                                    bgcolor: 'primary.lighter',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 18,
                                                    fontWeight: 700,
                                                    border: (theme) => `1px solid ${theme.palette.primary.light}`,
                                                }}
                                            >
                                                {alt.logo}
                                            </Box>
                                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Typography variant="subtitle2" noWrap>
                                                        {alt.name}
                                                    </Typography>
                                                    {alt.isOpenSource && (
                                                        <Iconify icon="solar:code-bold-duotone" width={14} sx={{ color: 'secondary.main' }} />
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            <Chip
                                                label={alt.pricing.type}
                                                size="small"
                                                color={getPricingBadgeColor(alt.pricing.type)}
                                                sx={{ textTransform: 'capitalize', height: 20 }}
                                            />
                                            {alt.comparison.savingsPercent > 0 && (
                                                <Chip
                                                    icon={<Iconify icon="solar:graph-down-bold" width={12} />}
                                                    label={`${alt.comparison.savingsPercent}% off`}
                                                    size="small"
                                                    color="success"
                                                    sx={{ height: 20 }}
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {/* Pricing Row */}
                            <TableRow>
                                <TableCell>
                                    <Typography variant="subtitle2">Starting Price</Typography>
                                </TableCell>
                                {alternatives.map((alt) => (
                                    <TableCell key={alt.id}>
                                        <Typography variant="subtitle2">{alt.pricing.startingPrice}</Typography>
                                        {alt.pricing.freeTrialDays > 0 && (
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                ({alt.pricing.freeTrialDays}-day trial)
                                            </Typography>
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Savings Row */}
                            <TableRow sx={{ bgcolor: 'success.lighter' }}>
                                <TableCell>
                                    <Typography variant="subtitle2" sx={{ color: 'success.dark' }}>
                                        Annual Savings
                                    </Typography>
                                </TableCell>
                                {alternatives.map((alt) => (
                                    <TableCell key={alt.id}>
                                        {alt.comparison.savingsAmount ? (
                                            <Typography variant="subtitle2" sx={{ color: 'success.dark', fontWeight: 700 }}>
                                                {alt.comparison.savingsAmount}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                                —
                                            </Typography>
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Rating Row */}
                            <TableRow>
                                <TableCell>
                                    <Typography variant="subtitle2">Rating</Typography>
                                </TableCell>
                                {alternatives.map((alt) => (
                                    <TableCell key={alt.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Rating value={alt.rating} precision={0.1} size="small" readOnly />
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {alt.rating.toFixed(1)}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Best For Row */}
                            <TableRow sx={{ bgcolor: 'background.neutral' }}>
                                <TableCell>
                                    <Typography variant="subtitle2">Best For</Typography>
                                </TableCell>
                                {alternatives.map((alt) => (
                                    <TableCell key={alt.id}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            {alt.bestFor}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Features Header */}
                            <TableRow>
                                <TableCell colSpan={alternatives.length + 1} sx={{ bgcolor: 'primary.lighter' }}>
                                    <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>
                                        Features Comparison
                                    </Typography>
                                </TableCell>
                            </TableRow>

                            {/* Feature Rows */}
                            {featureList.map(([featureName, originalHas], idx) => (
                                <TableRow key={featureName} sx={{ bgcolor: idx % 2 === 0 ? 'background.paper' : 'background.neutral' }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getFeatureIcon(originalHas)}
                                            <Typography variant="body2">{featureName}</Typography>
                                        </Box>
                                    </TableCell>
                                    {alternatives.map((alt) => (
                                        <TableCell key={alt.id} align="center">
                                            {getFeatureIcon(getFeatureStatus(alt, featureName))}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}

                            {/* Pros Row */}
                            <TableRow sx={{ bgcolor: 'success.lighter' }}>
                                <TableCell>
                                    <Typography variant="subtitle2" sx={{ color: 'success.dark' }}>
                                        Key Pros
                                    </Typography>
                                </TableCell>
                                {alternatives.map((alt) => (
                                    <TableCell key={alt.id}>
                                        <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                            {alt.pros.slice(0, 3).map((pro, j) => (
                                                <Box key={j} component="li" sx={{ mb: 0.5 }}>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {pro}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Cons Row */}
                            <TableRow sx={{ bgcolor: 'error.lighter' }}>
                                <TableCell>
                                    <Typography variant="subtitle2" sx={{ color: 'error.dark' }}>
                                        Key Cons
                                    </Typography>
                                </TableCell>
                                {alternatives.map((alt) => (
                                    <TableCell key={alt.id}>
                                        <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                            {alt.cons.slice(0, 2).map((con, j) => (
                                                <Box key={j} component="li" sx={{ mb: 0.5 }}>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {con}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* CTA Row */}
                            <TableRow sx={{ bgcolor: 'background.neutral' }}>
                                <TableCell>
                                    <Typography variant="subtitle2">Get Started</Typography>
                                </TableCell>
                                {alternatives.map((alt) => (
                                    <TableCell key={alt.id}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="small"
                                            endIcon={<Iconify icon="solar:link-bold-duotone" width={16} />}
                                            onClick={() => window.open(alt.url, '_blank')}
                                        >
                                            Try {alt.name}
                                        </Button>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Scrollbar>
        </Card>
    );
}
