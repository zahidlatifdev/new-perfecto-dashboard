import { ComposedChart, Area, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
    { month: 'Jul', inflows: 18500, outflows: 12400, balance: 45000 },
    { month: 'Aug', inflows: 21200, outflows: 14200, balance: 52000 },
    { month: 'Sep', inflows: 19800, outflows: 11800, balance: 60000 },
    { month: 'Oct', inflows: 24500, outflows: 15500, balance: 69000 },
    { month: 'Nov', inflows: 22800, outflows: 13800, balance: 78000 },
    { month: 'Dec', inflows: 26000, outflows: 14900, balance: 89100 },
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
                <p style={{ fontSize: '14px', color: '#7C3AED', marginBottom: '4px' }}>
                    Inflows: ${payload[0]?.value?.toLocaleString()}
                </p>
                <p style={{ fontSize: '14px', color: '#F59E0B', marginBottom: '4px' }}>
                    Outflows: ${payload[1]?.value?.toLocaleString()}
                </p>
                <p style={{ fontSize: '14px', color: '#64748B' }}>
                    Balance: ${payload[2]?.value?.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export function CashFlowChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
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
                <Line type="monotone" dataKey="inflows" stroke="#7C3AED" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="outflows" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#64748B"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    fill="url(#balanceGradient)"
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
