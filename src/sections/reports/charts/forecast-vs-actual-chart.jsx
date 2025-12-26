import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
    { month: 'Jul', actual: 6100, forecast: 5800 },
    { month: 'Aug', actual: 7000, forecast: 6500 },
    { month: 'Sep', actual: 8000, forecast: 7200 },
    { month: 'Oct', actual: 9000, forecast: 8000 },
    { month: 'Nov', actual: 9000, forecast: 8500 },
    { month: 'Dec', actual: 11100, forecast: 9500 },
    { month: 'Jan', actual: null, forecast: 10500 },
    { month: 'Feb', actual: null, forecast: 11200 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div
                style={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
            >
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>{label}</p>
                {payload[0]?.value && (
                    <p style={{ fontSize: '14px', color: '#7C3AED', marginBottom: '4px' }}>
                        Actual: ${payload[0].value.toLocaleString()}
                    </p>
                )}
                <p style={{ fontSize: '14px', color: '#64748B' }}>
                    Forecast: ${payload[1]?.value?.toLocaleString() || payload[0]?.value?.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export function ForecastVsActualChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    iconType="line"
                    iconSize={12}
                    formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>}
                />
                <Line
                    type="monotone"
                    dataKey="actual"
                    name="Actual"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    dot={{ fill: '#7C3AED', strokeWidth: 0, r: 3 }}
                    connectNulls={false}
                />
                <Line
                    type="monotone"
                    dataKey="forecast"
                    name="AI Forecast"
                    stroke="#64748B"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
