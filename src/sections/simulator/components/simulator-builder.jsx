import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { SimulatorSlider } from './simulator-slider';
import { SimulatorChart } from './simulator-chart';
import { SimulatorMetricCard } from './simulator-metric-card';

export function SimulatorBuilder({ isOpen, onClose, onSave, baselineIncome, baselineExpenses }) {
    const router = useRouter();
    const [timeHorizon, setTimeHorizon] = useState('6');
    const [income, setIncome] = useState(baselineIncome);
    const [expenses, setExpenses] = useState(
        baselineExpenses.map((e) => ({ ...e, current: e.current ?? e.baseline }))
    );
    const [customEvents, setCustomEvents] = useState([]);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [simulationName, setSimulationName] = useState('');

    const totalBaselineExpenses = baselineExpenses.reduce((sum, e) => sum + e.baseline, 0);
    const totalCurrentExpenses = expenses.reduce((sum, e) => sum + e.current, 0);
    const totalCustomEvents = customEvents.reduce((sum, e) => sum + e.amount, 0);

    const monthlyProfit = income - totalCurrentExpenses;
    const totalProfit = monthlyProfit * parseInt(timeHorizon) - totalCustomEvents;
    const breakEvenMonth =
        monthlyProfit <= 0 ? null : Math.ceil(totalCustomEvents / monthlyProfit);

    const incomeChange =
        baselineIncome > 0 ? Math.round(((income - baselineIncome) / baselineIncome) * 100) : 0;
    const expenseChange =
        totalBaselineExpenses > 0
            ? Math.round(((totalCurrentExpenses - totalBaselineExpenses) / totalBaselineExpenses) * 100)
            : 0;

    const handleUpdateExpense = (id, value) => {
        setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, current: value } : e)));
    };

    const handleAddCustomEvent = () => {
        setCustomEvents((prev) => [
            ...prev,
            { id: crypto.randomUUID(), name: 'New Event', amount: 0, month: 1 },
        ]);
    };

    const handleUpdateCustomEvent = (id, field, value) => {
        setCustomEvents((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
    };

    const handleRemoveCustomEvent = (id) => {
        setCustomEvents((prev) => prev.filter((e) => e.id !== id));
    };

    const handleReset = () => {
        setIncome(baselineIncome);
        setExpenses(baselineExpenses.map((e) => ({ ...e, current: e.baseline })));
        setCustomEvents([]);
        setTimeHorizon('6');
    };

    const handleSave = () => {
        const simulation = {
            name: simulationName || `Simulation ${new Date().toLocaleDateString()}`,
            timeHorizon: parseInt(timeHorizon),
            baselineIncome,
            baselineTotalExpenses: totalBaselineExpenses,
            baselineProfit: baselineIncome - totalBaselineExpenses,
            baselineExpenseCategories: expenses.map(e => ({
                categoryId: e.id,
                categoryName: e.name,
                amount: e.baseline
            })),
            adjustedIncome: income,
            incomeChangePercent: incomeChange,
            adjustedExpenses: expenses.map(e => ({
                categoryId: e.id,
                categoryName: e.name,
                baselineValue: e.baseline,
                adjustedValue: e.current,
                percentChange: e.baseline > 0 ? Math.round(((e.current - e.baseline) / e.baseline) * 100) : 0
            })),
            adjustedTotalExpenses: totalCurrentExpenses,
            expenseChangePercent: expenseChange,
            customEvents: customEvents.map(e => ({
                name: e.name,
                amount: e.amount,
                month: e.month
            })),
            totalCustomEvents,
            monthlyProfit,
            totalProfit,
            breakEvenMonth: breakEvenMonth || null
        };
        onSave(simulation);
        setShowSaveDialog(false);
        setSimulationName('');
        onClose();
    };

    const insights = useMemo(() => {
        const items = [];

        if (incomeChange >= 20) {
            items.push({
                type: 'tip',
                text: 'Increasing revenue by 20%+ could significantly boost income. Check the Power Blog for growth strategies.',
                action: () => router.push('/dashboard/blog'),
            });
        }

        if (expenseChange > 10) {
            items.push({
                type: 'warning',
                text: `Expenses increased by ${expenseChange}%. Visit Scout to find cost-saving opportunities.`,
                action: () => router.push('/dashboard/deal-scout'),
            });
        }

        if (monthlyProfit < 0) {
            items.push({
                type: 'warning',
                text: `Projected monthly loss of $${Math.abs(monthlyProfit).toLocaleString()}. Consider reducing expenses or increasing revenue.`,
            });
        }

        if (expenseChange < -10) {
            items.push({
                type: 'tip',
                text: `Great! Reducing expenses by ${Math.abs(expenseChange)}% adds ${Math.abs((expenseChange * totalBaselineExpenses) / 100).toLocaleString()} to your bottom line.`,
            });
        }

        return items;
    }, [incomeChange, expenseChange, monthlyProfit, router, totalBaselineExpenses]);

    if (!isOpen) return null;

    return (
        <>
            <Dialog
                fullScreen
                open={isOpen}
                onClose={onClose}
                PaperProps={{
                    sx: { bgcolor: 'background.default' },
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: 1,
                            borderColor: 'divider',
                            px: 3,
                            py: 2,
                        }}
                    >
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                Business Simulator Builder
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Adjust sliders to see how changes affect your bottom line
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Iconify icon="solar:restart-bold" />}
                                onClick={handleReset}
                            >
                                Reset
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Iconify icon="solar:download-bold" />}
                            >
                                Export
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<Iconify icon="solar:diskette-bold" />}
                                onClick={() => setShowSaveDialog(true)}
                            >
                                Save Simulation
                            </Button>
                            <IconButton onClick={onClose}>
                                <Iconify icon="solar:close-circle-bold" width={24} />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        {/* Left Panel - Sliders */}
                        <Box
                            sx={{
                                width: 400,
                                borderRight: 1,
                                borderColor: 'divider',
                                overflowY: 'auto',
                                p: 3,
                            }}
                        >
                            <Stack spacing={3}>
                                {/* Time Horizon */}
                                <FormControl fullWidth>
                                    <InputLabel>Projection Period</InputLabel>
                                    <Select
                                        value={timeHorizon}
                                        label="Projection Period"
                                        onChange={(e) => setTimeHorizon(e.target.value)}
                                    >
                                        <MenuItem value="1">1 Month</MenuItem>
                                        <MenuItem value="3">3 Months</MenuItem>
                                        <MenuItem value="6">6 Months</MenuItem>
                                        <MenuItem value="12">12 Months</MenuItem>
                                    </Select>
                                </FormControl>

                                {/* Income Slider */}
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Iconify
                                            icon="solar:graph-up-bold"
                                            width={20}
                                            sx={{ color: 'success.main' }}
                                        />
                                        <Typography variant="subtitle2">Income</Typography>
                                    </Box>
                                    <SimulatorSlider
                                        label="Total Monthly Income"
                                        baselineValue={baselineIncome}
                                        currentValue={income}
                                        onChange={setIncome}
                                        min={-50}
                                        max={200}
                                    />
                                </Box>

                                {/* Expense Sliders */}
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Iconify
                                            icon="solar:graph-down-bold"
                                            width={20}
                                            sx={{ color: 'error.main' }}
                                        />
                                        <Typography variant="subtitle2">Expenses by Category</Typography>
                                    </Box>
                                    <Stack spacing={2}>
                                        {expenses.map((expense) => (
                                            <SimulatorSlider
                                                key={expense.id}
                                                label={expense.name}
                                                baselineValue={expense.baseline}
                                                currentValue={expense.current}
                                                onChange={(value) => handleUpdateExpense(expense.id, value)}
                                                min={-100}
                                                max={100}
                                            />
                                        ))}
                                    </Stack>
                                </Box>

                                {/* Custom Events */}
                                <Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Iconify
                                                icon="solar:target-bold"
                                                width={20}
                                                sx={{ color: 'warning.main' }}
                                            />
                                            <Typography variant="subtitle2">One-Time Events</Typography>
                                        </Box>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<Iconify icon="solar:add-circle-bold" />}
                                            onClick={handleAddCustomEvent}
                                        >
                                            Add
                                        </Button>
                                    </Box>

                                    {customEvents.length === 0 ? (
                                        <Box
                                            sx={{
                                                py: 3,
                                                textAlign: 'center',
                                                border: 1,
                                                borderStyle: 'dashed',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                            }}
                                        >
                                            <Typography variant="body2" color="text.secondary">
                                                No custom events added
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Stack spacing={2}>
                                            {customEvents.map((event) => (
                                                <Card key={event.id} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            mb: 1,
                                                        }}
                                                    >
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={event.name}
                                                            onChange={(e) =>
                                                                handleUpdateCustomEvent(event.id, 'name', e.target.value)
                                                            }
                                                            placeholder="Event name"
                                                        />
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleRemoveCustomEvent(event.id)}
                                                        >
                                                            <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                                                        </IconButton>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            type="number"
                                                            label="Amount"
                                                            value={event.amount}
                                                            onChange={(e) =>
                                                                handleUpdateCustomEvent(
                                                                    event.id,
                                                                    'amount',
                                                                    parseFloat(e.target.value) || 0
                                                                )
                                                            }
                                                        />
                                                        <FormControl size="small" sx={{ minWidth: 100 }}>
                                                            <InputLabel>Month</InputLabel>
                                                            <Select
                                                                value={event.month}
                                                                label="Month"
                                                                onChange={(e) =>
                                                                    handleUpdateCustomEvent(event.id, 'month', parseInt(e.target.value))
                                                                }
                                                            >
                                                                {Array.from({ length: parseInt(timeHorizon) }, (_, i) => (
                                                                    <MenuItem key={i + 1} value={i + 1}>
                                                                        Month {i + 1}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Box>
                                                </Card>
                                            ))}
                                        </Stack>
                                    )}
                                </Box>
                            </Stack>
                        </Box>

                        {/* Right Panel - Results */}
                        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
                            <Stack spacing={3}>
                                {/* Metrics */}
                                <Grid container spacing={2} alignItems="stretch">
                                    {[
                                        {
                                            title: "Monthly Income",
                                            value: `$${income.toLocaleString()}`,
                                            change: incomeChange,
                                            changeLabel: "vs baseline",
                                            icon: (props) => <Iconify icon="solar:dollar-bold" {...props} />,
                                            variant: incomeChange > 0 ? "success" : incomeChange < 0 ? "danger" : "default",
                                        },
                                        {
                                            title: "Monthly Expenses",
                                            value: `$${totalCurrentExpenses.toLocaleString()}`,
                                            change: expenseChange,
                                            changeLabel: "vs baseline",
                                            icon: (props) => <Iconify icon="solar:graph-down-bold" {...props} />,
                                            variant: expenseChange < 0 ? "success" : expenseChange > 0 ? "warning" : "default",
                                        },
                                        {
                                            title: "Monthly Profit/Loss",
                                            value: `${monthlyProfit >= 0 ? "$" : "-$"}${Math.abs(monthlyProfit).toLocaleString()}`,
                                            icon: (props) => (
                                                <Iconify
                                                    icon={monthlyProfit >= 0 ? "solar:graph-up-bold" : "solar:graph-down-bold"}
                                                    {...props}
                                                />
                                            ),
                                            variant: monthlyProfit > 0 ? "success" : monthlyProfit < 0 ? "danger" : "default",
                                        },
                                        {
                                            title: `Total (${timeHorizon}mo)`,
                                            value: `${totalProfit >= 0 ? "$" : "-$"}${Math.abs(totalProfit).toLocaleString()}`,
                                            icon: (props) => <Iconify icon="solar:target-bold" {...props} />,
                                            variant: totalProfit > 0 ? "success" : totalProfit < 0 ? "danger" : "default",
                                        },
                                    ].map((card) => (
                                        <Grid
                                            item
                                            xs={12}
                                            sm={6}
                                            md={3}
                                            key={card.title}
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                            }}
                                        >
                                            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                                <SimulatorMetricCard {...card} />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Chart */}
                                <Card sx={{ p: 3, border: 1, borderColor: 'divider' }}>
                                    <Typography variant="h6" sx={{ mb: 3 }}>
                                        Income vs Expenses Comparison
                                    </Typography>
                                    <SimulatorChart
                                        baselineIncome={baselineIncome}
                                        baselineExpenses={totalBaselineExpenses}
                                        simulatedIncome={income}
                                        simulatedExpenses={totalCurrentExpenses}
                                        timeHorizon={parseInt(timeHorizon)}
                                    />
                                </Card>

                                {/* Breakdown Table */}
                                <Card sx={{ p: 3, border: 1, borderColor: 'divider' }}>
                                    <Typography variant="h6" sx={{ mb: 3 }}>
                                        Detailed Breakdown
                                    </Typography>
                                    <Box sx={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(145, 158, 171, 0.24)' }}>
                                                    <th style={{ textAlign: 'left', padding: '12px 0' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Category
                                                        </Typography>
                                                    </th>
                                                    <th style={{ textAlign: 'right', padding: '12px 0' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Baseline
                                                        </Typography>
                                                    </th>
                                                    <th style={{ textAlign: 'right', padding: '12px 0' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Adjusted
                                                        </Typography>
                                                    </th>
                                                    <th style={{ textAlign: 'right', padding: '12px 0' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Difference
                                                        </Typography>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ borderBottom: '1px solid rgba(145, 158, 171, 0.24)' }}>
                                                    <td style={{ padding: '12px 0' }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            Income
                                                        </Typography>
                                                    </td>
                                                    <td style={{ textAlign: 'right', padding: '12px 0' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            ${baselineIncome.toLocaleString()}
                                                        </Typography>
                                                    </td>
                                                    <td style={{ textAlign: 'right', padding: '12px 0' }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            ${income.toLocaleString()}
                                                        </Typography>
                                                    </td>
                                                    <td style={{ textAlign: 'right', padding: '12px 0' }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: 500,
                                                                color:
                                                                    income - baselineIncome > 0
                                                                        ? 'success.main'
                                                                        : income - baselineIncome < 0
                                                                            ? 'error.main'
                                                                            : 'text.secondary',
                                                            }}
                                                        >
                                                            {income - baselineIncome > 0 ? '+' : ''}
                                                            {income - baselineIncome !== 0
                                                                ? `$${(income - baselineIncome).toLocaleString()}`
                                                                : '-'}
                                                        </Typography>
                                                    </td>
                                                </tr>
                                                {expenses.map((expense) => {
                                                    const diff = expense.current - expense.baseline;
                                                    return (
                                                        <tr
                                                            key={expense.id}
                                                            style={{ borderBottom: '1px solid rgba(145, 158, 171, 0.24)' }}
                                                        >
                                                            <td style={{ padding: '12px 0' }}>
                                                                <Typography variant="body2">{expense.name}</Typography>
                                                            </td>
                                                            <td style={{ textAlign: 'right', padding: '12px 0' }}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    ${expense.baseline.toLocaleString()}
                                                                </Typography>
                                                            </td>
                                                            <td style={{ textAlign: 'right', padding: '12px 0' }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                    ${expense.current.toLocaleString()}
                                                                </Typography>
                                                            </td>
                                                            <td style={{ textAlign: 'right', padding: '12px 0' }}>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        fontWeight: 500,
                                                                        color:
                                                                            diff < 0
                                                                                ? 'success.main'
                                                                                : diff > 0
                                                                                    ? 'error.main'
                                                                                    : 'text.secondary',
                                                                    }}
                                                                >
                                                                    {diff > 0 ? '+' : ''}
                                                                    {diff !== 0 ? `$${diff.toLocaleString()}` : '-'}
                                                                </Typography>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                <tr>
                                                    <td style={{ paddingTop: '16px' }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            Net Profit/Loss
                                                        </Typography>
                                                    </td>
                                                    <td style={{ textAlign: 'right', paddingTop: '16px' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            ${(baselineIncome - totalBaselineExpenses).toLocaleString()}
                                                        </Typography>
                                                    </td>
                                                    <td style={{ textAlign: 'right', paddingTop: '16px' }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            ${monthlyProfit.toLocaleString()}
                                                        </Typography>
                                                    </td>
                                                    <td style={{ textAlign: 'right', paddingTop: '16px' }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color:
                                                                    monthlyProfit - (baselineIncome - totalBaselineExpenses) > 0
                                                                        ? 'success.main'
                                                                        : 'error.main',
                                                            }}
                                                        >
                                                            {monthlyProfit - (baselineIncome - totalBaselineExpenses) > 0
                                                                ? '+'
                                                                : ''}
                                                            $
                                                            {(
                                                                monthlyProfit -
                                                                (baselineIncome - totalBaselineExpenses)
                                                            ).toLocaleString()}
                                                        </Typography>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </Box>
                                </Card>

                                {/* AI Insights */}
                                {/* {insights.length > 0 && (
                                    <Card sx={{ p: 3, border: 1, borderColor: 'divider' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <Iconify icon="solar:lightbulb-bolt-bold" width={24} sx={{ color: 'warning.main' }} />
                                            <Typography variant="h6">AI Insights</Typography>
                                        </Box>
                                        <Stack spacing={2}>
                                            {insights.map((insight, index) => (
                                                <Alert
                                                    key={index}
                                                    severity={insight.type === 'warning' ? 'error' : 'info'}
                                                    icon={
                                                        insight.type === 'warning' ? (
                                                            <Iconify icon="solar:danger-triangle-bold" width={20} />
                                                        ) : (
                                                            <Iconify icon="solar:lightbulb-bolt-bold" width={20} />
                                                        )
                                                    }
                                                    action={
                                                        insight.action && (
                                                            <Button
                                                                size="small"
                                                                color="inherit"
                                                                onClick={insight.action}
                                                                startIcon={
                                                                    <Iconify
                                                                        icon={
                                                                            insight.text.includes('Scout')
                                                                                ? 'solar:compass-bold'
                                                                                : 'solar:lightbulb-bolt-bold'
                                                                        }
                                                                        width={16}
                                                                    />
                                                                }
                                                            >
                                                                {insight.text.includes('Scout') ? 'Open Scout' : 'Read Blog'}
                                                            </Button>
                                                        )
                                                    }
                                                >
                                                    {insight.text}
                                                </Alert>
                                            ))}
                                        </Stack>
                                    </Card>
                                )} */}
                            </Stack>
                        </Box>
                    </Box>
                </Box>
            </Dialog>

            {/* Save Dialog */}
            <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} maxWidth="sm" fullWidth>
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                        Save Simulation
                    </Typography>

                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Simulation Name"
                            value={simulationName}
                            onChange={(e) => setSimulationName(e.target.value)}
                            placeholder="e.g., Q1 Growth Scenario"
                        />

                        <Card sx={{ p: 2, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08) }}>
                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Time Horizon
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {timeHorizon} months
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Projected Outcome
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 500,
                                            color: totalProfit >= 0 ? 'success.main' : 'error.main',
                                        }}
                                    >
                                        {totalProfit >= 0 ? '+' : ''}
                                        {totalProfit >= 0 ? '$' : '-$'}
                                        {Math.abs(totalProfit).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    </Stack>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                        <Button variant="outlined" onClick={() => setShowSaveDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleSave}>
                            Save Simulation
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </>
    );
}
