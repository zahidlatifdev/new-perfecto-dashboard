import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
    { month: 'Jul', revenue: 18500, expenses: 12400, profit: 6100 },
    { month: 'Aug', revenue: 21200, expenses: 14200, profit: 7000 },
    { month: 'Sep', revenue: 19800, expenses: 11800, profit: 8000 },
    { month: 'Oct', revenue: 24500, expenses: 15500, profit: 9000 },
    { month: 'Nov', revenue: 22800, expenses: 13800, profit: 9000 },
    { month: 'Dec', revenue: 26000, expenses: 14900, profit: 11100 },
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
                <p style={{ fontSize: '14px', color: '#16A34A', marginBottom: '4px' }}>
                    Revenue: ${payload[0]?.value?.toLocaleString()}
                </p>
                <p style={{ fontSize: '14px', color: '#EF4444', marginBottom: '4px' }}>
                    Expenses: ${payload[1]?.value?.toLocaleString()}
                </p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#7C3AED' }}>
                    Profit: ${payload[2]?.value?.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export function ProfitLossChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                <Bar dataKey="revenue" fill="#16A34A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="profit" stroke="#7C3AED" strokeWidth={2} dot={false} />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
