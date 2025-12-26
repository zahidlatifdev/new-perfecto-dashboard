import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
    { name: 'Payroll', value: 4980, color: '#7C3AED' },
    { name: 'Marketing', value: 3112, color: '#C026D3' },
    { name: 'Software', value: 1868, color: '#16A34A' },
    { name: 'Office', value: 1245, color: '#F59E0B' },
    { name: 'Utilities', value: 745, color: '#EF4444' },
    { name: 'Other', value: 500, color: '#64748B' },
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
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>{payload[0].name}</p>
                <p style={{ fontSize: '14px', color: '#64748B' }}>
                    ${payload[0].value.toLocaleString()} ({((payload[0].value / 12450) * 100).toFixed(1)}%)
                </p>
            </div>
        );
    }
    return null;
};

export function ExpenseByCategoryChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
