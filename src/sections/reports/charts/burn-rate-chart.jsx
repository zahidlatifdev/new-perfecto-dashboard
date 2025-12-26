import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';

const data = [
    { month: 'Jul', burn: 8500 },
    { month: 'Aug', burn: 9200 },
    { month: 'Sep', burn: 7800 },
    { month: 'Oct', burn: 10500 },
    { month: 'Nov', burn: 9800 },
    { month: 'Dec', burn: 8900 },
];

const avgBurn = data.reduce((sum, d) => sum + d.burn, 0) / data.length;

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
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</p>
                <p style={{ fontSize: '14px', color: '#EF4444' }}>Burn: ${payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

export function BurnRateChart() {
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
                <ReferenceLine
                    y={avgBurn}
                    stroke="#F59E0B"
                    strokeDasharray="5 5"
                    label={{ value: 'Avg', fill: '#F59E0B', fontSize: 10 }}
                />
                <Line
                    type="monotone"
                    dataKey="burn"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#EF4444' }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
