import { useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    Chip,
    Paper,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { CustomTooltip } from './custom-tooltip';

const CATEGORY_COLORS = [
    '#3b82f6',
    '#22c55e',
    '#ef4444',
    '#f59e0b',
    '#8b5cf6',
    '#06b6d4',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#6366f1',
];

export function CategoryForecastSection({ categories = {} }) {
    const categoryNames = Object.keys(categories);
    const [selectedCategories, setSelectedCategories] = useState(
        categoryNames.slice(0, 3) // Show first 3 by default
    );

    const formatChartCurrency = (value) => `$${(value / 1000).toFixed(0)}K`;

    const formatCurrency = (value) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);

    if (categoryNames.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                    No category-level forecast data available
                </Typography>
            </Box>
        );
    }

    // Build combined chart data — merge all dates across selected categories
    const dateMap = new Map();
    selectedCategories.forEach((catName) => {
        const catData = categories[catName];
        if (!catData?.forecast) return;
        catData.forecast.forEach((point) => {
            const date = typeof point === 'object' ? point.date : null;
            if (!date) return;
            if (!dateMap.has(date)) dateMap.set(date, { period: date });
            dateMap.get(date)[catName] = typeof point === 'object' ? point.forecast : point;
        });
    });

    const chartData = Array.from(dateMap.values()).sort((a, b) =>
        a.period.localeCompare(b.period)
    );

    const toggleCategory = (catName) => {
        setSelectedCategories((prev) =>
            prev.includes(catName)
                ? prev.filter((c) => c !== catName)
                : [...prev, catName]
        );
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6">Forecast by Category</Typography>
                <Typography variant="body2" color="text.secondary">
                    Click categories to toggle them on the chart
                </Typography>
            </Box>

            {/* Category Chips */}
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                {categoryNames.map((catName, idx) => {
                    const isSelected = selectedCategories.includes(catName);
                    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                    return (
                        <Chip
                            key={catName}
                            label={catName}
                            size="small"
                            onClick={() => toggleCategory(catName)}
                            sx={{
                                fontWeight: 600,
                                bgcolor: isSelected ? color : 'transparent',
                                color: isSelected ? 'white' : 'text.secondary',
                                border: `1.5px solid ${color}`,
                                '&:hover': {
                                    bgcolor: isSelected ? color : `${color}20`,
                                },
                            }}
                        />
                    );
                })}
            </Stack>

            {/* Combined Chart */}
            {chartData.length > 0 ? (
                <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="period" style={{ fontSize: 11 }} />
                            <YAxis tickFormatter={formatChartCurrency} style={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                            <Legend />
                            {selectedCategories.map((catName, idx) => (
                                <Line
                                    key={catName}
                                    type="monotone"
                                    dataKey={catName}
                                    stroke={CATEGORY_COLORS[categoryNames.indexOf(catName) % CATEGORY_COLORS.length]}
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    name={catName}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        Select categories above to view their forecasts
                    </Typography>
                </Box>
            )}

            {/* Category Details */}
            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
                    mt: 3,
                }}
            >
                {categoryNames.map((catName, idx) => {
                    const catData = categories[catName];
                    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                    const forecastPoints = catData?.forecast || [];
                    const lastPoint = forecastPoints[forecastPoints.length - 1];
                    const firstPoint = forecastPoints[0];
                    const lastValue = typeof lastPoint === 'object' ? lastPoint.forecast : lastPoint;
                    const firstValue = typeof firstPoint === 'object' ? firstPoint.forecast : firstPoint;
                    const trend = catData?.model_components?.trend;

                    return (
                        <Paper
                            key={catName}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                borderLeft: `4px solid ${color}`,
                                cursor: 'pointer',
                                bgcolor: selectedCategories.includes(catName)
                                    ? `${color}08`
                                    : 'background.paper',
                                '&:hover': { bgcolor: `${color}12` },
                            }}
                            onClick={() => toggleCategory(catName)}
                        >
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                                {catName}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {lastValue != null ? formatCurrency(lastValue) : '—'}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                {trend && (
                                    <Chip
                                        label={trend}
                                        size="small"
                                        color={trend === 'increasing' ? 'success' : trend === 'decreasing' ? 'error' : 'default'}
                                        variant="outlined"
                                        sx={{ fontSize: '0.65rem', height: 20 }}
                                    />
                                )}
                                {catData?.model_components?.seasonality_detected && (
                                    <Chip
                                        label="Seasonal"
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.65rem', height: 20 }}
                                    />
                                )}
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {forecastPoints.length} periods forecasted
                            </Typography>
                        </Paper>
                    );
                })}
            </Box>
        </Box>
    );
}
