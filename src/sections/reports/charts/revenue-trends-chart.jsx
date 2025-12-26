import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
    { month: 'Jul', revenue: 18500 },
    { month: 'Aug', revenue: 21200 },
    { month: 'Sep', revenue: 19800 },
    { month: 'Oct', revenue: 24500 },
    { month: 'Nov', revenue: 22800 },
    { month: 'Dec', revenue: 26000 },
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
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</p>
                <p style={{ fontSize: '14px', color: '#16A34A' }}>
                    Revenue: ${payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export function RevenueTrendsChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                    </linearGradient>
                </defs>
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
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#16A34A"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
