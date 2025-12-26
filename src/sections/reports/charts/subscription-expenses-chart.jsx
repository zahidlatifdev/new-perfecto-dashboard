import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const data = [
    { name: 'Slack', amount: 450, waste: false },
    { name: 'Salesforce', amount: 380, waste: false },
    { name: 'AWS', amount: 320, waste: false },
    { name: 'Zoom', amount: 180, waste: true },
    { name: 'Adobe', amount: 150, waste: false },
    { name: 'HubSpot', amount: 120, waste: true },
];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const item = payload[0].payload;
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
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>{item.name}</p>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '4px' }}>
                    ${item.amount}/mo
                </p>
                {item.waste && (
                    <p style={{ fontSize: '12px', color: '#F59E0B' }}>⚠️ Flagged by Scout</p>
                )}
            </div>
        );
    }
    return null;
};

export function SubscriptionExpensesChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 40, bottom: 5 }}>
                <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickFormatter={(value) => `$${value}`}
                />
                <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    width={60}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.waste ? '#F59E0B' : '#7C3AED'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
