import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export function SimulatorChart({
    baselineIncome,
    baselineExpenses,
    simulatedIncome,
    simulatedExpenses,
    timeHorizon,
}) {
    const theme = useTheme();

    const chartData = useMemo(() => {
        const labels = Array.from({ length: timeHorizon }, (_, i) => `Month ${i + 1}`);

        const baselineIncomeData = Array(timeHorizon).fill(baselineIncome);
        const baselineExpensesData = Array(timeHorizon).fill(baselineExpenses);
        const simulatedIncomeData = Array(timeHorizon).fill(simulatedIncome);
        const simulatedExpensesData = Array(timeHorizon).fill(simulatedExpenses);

        return {
            labels,
            datasets: [
                {
                    label: 'Baseline Income',
                    data: baselineIncomeData,
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.main + '20',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 3,
                    tension: 0.4,
                },
                {
                    label: 'Simulated Income',
                    data: simulatedIncomeData,
                    borderColor: theme.palette.success.main,
                    backgroundColor: theme.palette.success.main + '20',
                    borderWidth: 2,
                    pointRadius: 3,
                    tension: 0.4,
                },
                {
                    label: 'Baseline Expenses',
                    data: baselineExpensesData,
                    borderColor: theme.palette.warning.main,
                    backgroundColor: theme.palette.warning.main + '20',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 3,
                    tension: 0.4,
                },
                {
                    label: 'Simulated Expenses',
                    data: simulatedExpensesData,
                    borderColor: theme.palette.error.main,
                    backgroundColor: theme.palette.error.main + '20',
                    borderWidth: 2,
                    pointRadius: 3,
                    tension: 0.4,
                },
            ],
        };
    }, [
        timeHorizon,
        baselineIncome,
        baselineExpenses,
        simulatedIncome,
        simulatedExpenses,
        theme.palette,
    ]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    color: theme.palette.text.primary,
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: theme.palette.background.paper,
                titleColor: theme.palette.text.primary,
                bodyColor: theme.palette.text.secondary,
                borderColor: theme.palette.divider,
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += '$' + context.parsed.y.toLocaleString();
                        }
                        return label;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: theme.palette.text.secondary,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: theme.palette.divider,
                },
                ticks: {
                    color: theme.palette.text.secondary,
                    callback: function (value) {
                        return '$' + value.toLocaleString();
                    },
                },
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
    };

    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <Line data={chartData} options={options} />
        </Box>
    );
}
