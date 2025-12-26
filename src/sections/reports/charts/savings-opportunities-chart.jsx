import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const data = [
    { category: 'Software', savings: 480, color: '#16A34A' },
    { category: 'Utilities', savings: 320, color: '#22C55E' },
    { category: 'Insurance', savings: 250, color: '#4ADE80' },
    { category: 'Telecom', savings: 180, color: '#86EFAC' },
    { category: 'Office', savings: 120, color: '#BBF7D0' },
];

const CustomTooltip = ({ active, payload }) => {
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
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>{payload[0].payload.category}</p>
                <p style={{ fontSize: '14px', color: '#16A34A', marginBottom: '4px' }}>
                    Potential Savings: ${payload[0].value}/mo
                </p>
                <p style={{ fontSize: '12px', color: '#64748B' }}>Found by Scout</p>
            </div>
        );
    }
    return null;
};

export function SavingsOpportunitiesChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis
                    dataKey="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                <Bar dataKey="savings" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
