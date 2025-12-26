import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
    { month: 'Jul', payroll: 4200, marketing: 2800, software: 1600, office: 1200, utilities: 700 },
    { month: 'Aug', payroll: 4400, marketing: 3100, software: 1750, office: 1100, utilities: 720 },
    { month: 'Sep', payroll: 4100, marketing: 2600, software: 1550, office: 1300, utilities: 680 },
    { month: 'Oct', payroll: 4800, marketing: 3400, software: 1900, office: 1150, utilities: 750 },
    { month: 'Nov', payroll: 4600, marketing: 3200, software: 1800, office: 1250, utilities: 730 },
    { month: 'Dec', payroll: 4980, marketing: 3112, software: 1868, office: 1245, utilities: 745 },
];

const categories = [
    { key: 'payroll', color: '#7C3AED', name: 'Payroll' },
    { key: 'marketing', color: '#C026D3', name: 'Marketing' },
    { key: 'software', color: '#16A34A', name: 'Software' },
    { key: 'office', color: '#F59E0B', name: 'Office' },
    { key: 'utilities', color: '#EF4444', name: 'Utilities' },
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
                {payload.map((entry, index) => (
                    <p key={index} style={{ fontSize: '14px', color: entry.color, marginBottom: '4px' }}>
                        {entry.name}: ${entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function CategoryTrendsChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
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
                {categories.map((cat) => (
                    <Line
                        key={cat.key}
                        type="monotone"
                        dataKey={cat.key}
                        name={cat.name}
                        stroke={cat.color}
                        strokeWidth={2}
                        dot={false}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}
