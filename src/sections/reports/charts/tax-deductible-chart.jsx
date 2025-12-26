import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
    { name: 'Deductible', value: 8450, color: '#16A34A' },
    { name: 'Non-Deductible', value: 4000, color: '#64748B' },
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
                <p style={{ fontSize: '14px', color: '#64748B' }}>${payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

export function TaxDeductibleChart() {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const deductiblePercent = ((data[0].value / total) * 100).toFixed(0);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fill: '#1E293B', fontWeight: 700, fontSize: '20px' }}
                >
                    {deductiblePercent}%
                </text>
                <text
                    x="50%"
                    y="60%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fill: '#64748B', fontSize: '12px' }}
                >
                    Deductible
                </text>
            </PieChart>
        </ResponsiveContainer>
    );
}
