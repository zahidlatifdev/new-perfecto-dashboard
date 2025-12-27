// Sample financial data for AI Forecasting

// Generate dates for the past 12 months
const generateMonthlyDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }
    return dates;
};

export const monthlyDates = generateMonthlyDates();

// Revenue and expense data
export const revenueData = [
    { month: monthlyDates[0], revenue: 42500, expenses: 38200, profit: 4300 },
    { month: monthlyDates[1], revenue: 48200, expenses: 41500, profit: 6700 },
    { month: monthlyDates[2], revenue: 51800, expenses: 43200, profit: 8600 },
    { month: monthlyDates[3], revenue: 49500, expenses: 45800, profit: 3700 },
    { month: monthlyDates[4], revenue: 55200, expenses: 44100, profit: 11100 },
    { month: monthlyDates[5], revenue: 62400, expenses: 48500, profit: 13900 },
    { month: monthlyDates[6], revenue: 58900, expenses: 51200, profit: 7700 },
    { month: monthlyDates[7], revenue: 67500, expenses: 52800, profit: 14700 },
    { month: monthlyDates[8], revenue: 71200, expenses: 55400, profit: 15800 },
    { month: monthlyDates[9], revenue: 75800, expenses: 58200, profit: 17600 },
    { month: monthlyDates[10], revenue: 82100, expenses: 61500, profit: 20600 },
    { month: monthlyDates[11], revenue: 89500, expenses: 64800, profit: 24700 },
];

// Forecast data (next 6 months)
export const forecastData = [
    { month: 'Jan 2026', projected: 96200, optimistic: 102500, conservative: 89800 },
    { month: 'Feb 2026', projected: 103800, optimistic: 112000, conservative: 95500 },
    { month: 'Mar 2026', projected: 112500, optimistic: 125000, conservative: 101200 },
    { month: 'Apr 2026', projected: 118900, optimistic: 135000, conservative: 105800 },
    { month: 'May 2026', projected: 128500, optimistic: 148000, conservative: 112500 },
    { month: 'Jun 2026', projected: 138200, optimistic: 162000, conservative: 118900 },
];

// Cash flow data
export const cashFlowData = [
    { month: monthlyDates[0], inflow: 45200, outflow: 39800, balance: 125400 },
    { month: monthlyDates[1], inflow: 51800, outflow: 43200, balance: 134000 },
    { month: monthlyDates[2], inflow: 54500, outflow: 48100, balance: 140400 },
    { month: monthlyDates[3], inflow: 52200, outflow: 51500, balance: 141100 },
    { month: monthlyDates[4], inflow: 58900, outflow: 47200, balance: 152800 },
    { month: monthlyDates[5], inflow: 65800, outflow: 52400, balance: 166200 },
    { month: monthlyDates[6], inflow: 62100, outflow: 55800, balance: 172500 },
    { month: monthlyDates[7], inflow: 71200, outflow: 58900, balance: 184800 },
    { month: monthlyDates[8], inflow: 75500, outflow: 61200, balance: 199100 },
    { month: monthlyDates[9], inflow: 79800, outflow: 64500, balance: 214400 },
    { month: monthlyDates[10], inflow: 86200, outflow: 68100, balance: 232500 },
    { month: monthlyDates[11], inflow: 94500, outflow: 71800, balance: 255200 },
];

// Burn rate analysis
export const burnRateData = {
    currentMonthlyBurn: 64800,
    averageBurn: 58450,
    burnTrend: 'increasing',
    runwayMonths: 39.4,
    cashBalance: 255200,
};

// Sales metrics
export const salesMetrics = {
    totalRevenue: 754600,
    monthlyGrowthRate: 8.9,
    avgDealSize: 4250,
    conversionRate: 23.5,
    customerAcquisitionCost: 185,
    lifetimeValue: 12800,
    ltcCacRatio: 69.2,
};

// Category breakdown
export const expensesByCategory = [
    { category: 'Payroll', amount: 285000, percentage: 43.9, trend: 'stable' },
    { category: 'Software & Tools', amount: 68500, percentage: 10.6, trend: 'increasing' },
    { category: 'Marketing', amount: 95200, percentage: 14.7, trend: 'increasing' },
    { category: 'Office & Rent', amount: 72000, percentage: 11.1, trend: 'stable' },
    { category: 'Professional Services', amount: 45800, percentage: 7.1, trend: 'decreasing' },
    { category: 'Travel & Entertainment', amount: 32500, percentage: 5.0, trend: 'increasing' },
    { category: 'Utilities', amount: 18200, percentage: 2.8, trend: 'stable' },
    { category: 'Other', amount: 31300, percentage: 4.8, trend: 'stable' },
];

// AI Insights
export const aiInsights = [
    {
        id: '1',
        type: 'positive',
        title: 'Revenue Growth Accelerating',
        description: "Your revenue has grown 8.9% month-over-month, outpacing your 6-month average of 7.2%. At this rate, you'll hit $100K monthly revenue by Q2 2026.",
        metric: '+8.9% MoM',
        impact: '$138K projected Q2',
        date: new Date().toISOString(),
        detailedAnalysis: 'Your revenue trajectory shows strong momentum with consistent month-over-month growth. The acceleration from 7.2% to 8.9% indicates improving market conditions and effective sales strategies. Key contributing factors include increased customer acquisition (+15% new customers) and higher average deal sizes (+12% compared to last quarter).',
        recommendations: [
            'Consider reinvesting 10-15% of revenue growth into marketing to maintain momentum',
            'Focus on upselling to existing customers who show high engagement',
            'Document and replicate successful sales strategies across the team'
        ]
    },
    {
        id: '2',
        type: 'warning',
        title: 'Burn Rate Increasing',
        description: 'Monthly burn has increased 11% over the past quarter. Software subscriptions (+22%) and marketing spend (+18%) are the main drivers.',
        metric: '$64.8K/month',
        impact: 'Runway: 39 months',
        date: new Date().toISOString(),
        detailedAnalysis: 'While your runway remains healthy at 39 months, the increasing burn rate trend requires attention. Software costs have grown faster than revenue (22% vs 8.9%), primarily due to adding new tools for the growing team. Marketing spend increase is justified by improved customer acquisition, but ROI should be monitored closely.',
        recommendations: [
            'Audit software subscriptions to identify redundant or underutilized tools',
            'Negotiate annual contracts for core software to reduce per-seat costs',
            'Set up monthly budget alerts at 80% and 100% thresholds',
            'Review marketing channel performance to optimize spend allocation'
        ]
    },
    {
        id: '3',
        type: 'opportunity',
        title: 'Unused Software Licenses',
        description: 'We detected 12 unused software licenses across 3 vendors totaling $2,400/month. Consider consolidating or canceling.',
        metric: '$2,400/month',
        impact: '$28.8K annual savings',
        date: new Date().toISOString(),
        detailedAnalysis: 'Analysis of your software usage data reveals 12 licenses with zero or minimal activity over the past 60 days. Breakdown: 5 Slack seats ($600/mo), 4 HubSpot seats ($1,200/mo), and 3 Figma licenses ($600/mo). These appear to be assigned to former employees or team members who have transitioned to different roles.',
        recommendations: [
            'Immediately deactivate the 5 unused Slack seats - savings: $600/month',
            'Downgrade HubSpot to starter tier for inactive users - savings: $800/month',
            'Consolidate Figma licenses to the design team only - savings: $600/month',
            'Implement quarterly software audit process to prevent future waste'
        ]
    },
    {
        id: '4',
        type: 'action',
        title: 'Quarterly Tax Estimate Due',
        description: 'Based on your current revenue, your Q4 estimated tax payment should be approximately $18,500. Due date: January 15, 2026.',
        metric: '$18,500',
        impact: 'Due in 23 days',
        date: new Date().toISOString(),
        detailedAnalysis: 'Your estimated quarterly tax payment is calculated based on your YTD income of $754,600 and estimated annual income of ~$980,000. This estimate accounts for standard business deductions including payroll, rent, and operational expenses. Failure to pay by January 15th may result in underpayment penalties of approximately 8% annually.',
        recommendations: [
            'Set aside $18,500 in your tax savings account immediately',
            'Review any additional deductions that can be applied before year-end',
            'Consider making the payment early to avoid last-minute issues',
            'Schedule a call with your accountant to verify the estimate'
        ]
    },
    {
        id: '5',
        type: 'positive',
        title: 'Customer LTV Improving',
        description: 'Average customer lifetime value increased to $12,800, up 15% from last quarter. Your LTV:CAC ratio of 69:1 is excellent.',
        metric: 'LTV: $12,800',
        impact: 'LTV:CAC 69:1',
        date: new Date().toISOString(),
        detailedAnalysis: 'Your customer lifetime value has seen significant improvement driven by reduced churn (down 2.3%) and increased average contract value. The LTV:CAC ratio of 69:1 is exceptional - industry benchmarks suggest 3:1 is healthy, meaning you have significant room to invest more aggressively in customer acquisition while maintaining profitability.',
        recommendations: [
            'Increase customer acquisition budget by 30-50% while maintaining quality',
            'Implement customer success programs to further reduce churn',
            'Explore upselling opportunities with your highest-value customers',
            'Document your customer success playbook for team scaling'
        ]
    },
    {
        id: '6',
        type: 'opportunity',
        title: 'Peak Sales Period Approaching',
        description: 'Historical data shows January-March is your strongest quarter. Consider increasing marketing spend by 20% to capitalize.',
        metric: '+34% Q1 avg',
        impact: 'Est. $42K opportunity',
        date: new Date().toISOString(),
        detailedAnalysis: 'Analysis of your 2-year transaction history shows Q1 consistently outperforms other quarters by 34% on average. This aligns with industry trends where businesses allocate new budgets at the start of the fiscal year. Your current marketing budget may not be optimized to capture this increased demand.',
        recommendations: [
            'Prepare promotional offers or incentives for early Q1 sign-ups',
            'Increase Google Ads budget by 25% starting January 1st',
            'Ensure sales team capacity can handle increased lead volume',
            'Create Q1-specific landing pages and marketing campaigns'
        ]
    },
    {
        id: '7',
        type: 'warning',
        title: 'Holiday Slowdown Expected',
        description: 'Historical patterns show 15-20% revenue dip during holiday periods. Plan accordingly for cash flow.',
        metric: '-18% avg',
        impact: 'Dec-Jan period',
        date: new Date().toISOString(),
        detailedAnalysis: 'Analysis of past 3 years shows consistent seasonal pattern with reduced business activity during late December through early January. While your annual contracts provide stability, new customer acquisition and project-based revenue typically drops during this period.',
        recommendations: [
            'Ensure sufficient cash reserves to cover 2 months of operating expenses',
            'Schedule important renewals and upsells before mid-December',
            'Plan major marketing campaigns for late January when activity rebounds',
            'Use the slow period for strategic planning and process improvements'
        ]
    },
    {
        id: '8',
        type: 'action',
        title: 'Annual Planning Recommended',
        description: 'Q1 is approaching - time to set 2026 financial goals, budgets, and hiring plans.',
        metric: 'Q1 2026',
        impact: 'Strategic planning',
        date: new Date().toISOString(),
        detailedAnalysis: 'Your strong Q4 performance and growth trajectory make this an ideal time for comprehensive 2026 planning. Key areas to address: revenue targets, expense budgets, team expansion, and major capital investments.',
        recommendations: [
            'Set quarterly revenue targets with 10-15% buffer for market volatility',
            'Create departmental budgets with monthly review checkpoints',
            'Identify 3-5 key hires needed to support projected growth',
            'Plan major software or equipment purchases to optimize tax deductions'
        ]
    }
];

// Sample transactions
export const sampleTransactions = [
    { id: '1', date: '2025-12-22', description: 'Client Payment - Acme Corp', category: 'Revenue', amount: 15000, type: 'income', account: 'Business Checking' },
    { id: '2', date: '2025-12-21', description: 'AWS Monthly Bill', category: 'Software & Tools', amount: 2450, type: 'expense', account: 'Business Credit Card', vendor: 'Amazon Web Services' },
    { id: '3', date: '2025-12-20', description: 'Payroll - December', category: 'Payroll', amount: 45200, type: 'expense', account: 'Business Checking' },
    { id: '4', date: '2025-12-19', description: 'Client Payment - TechStart Inc', category: 'Revenue', amount: 8500, type: 'income', account: 'Business Checking' },
    { id: '5', date: '2025-12-18', description: 'Google Ads', category: 'Marketing', amount: 3200, type: 'expense', account: 'Business Credit Card', vendor: 'Google' },
    { id: '6', date: '2025-12-17', description: 'Office Rent - December', category: 'Office & Rent', amount: 6000, type: 'expense', account: 'Business Checking', vendor: 'WeWork' },
    { id: '7', date: '2025-12-16', description: 'Client Payment - GlobalTech', category: 'Revenue', amount: 22000, type: 'income', account: 'Business Checking' },
    { id: '8', date: '2025-12-15', description: 'Slack Subscription', category: 'Software & Tools', amount: 850, type: 'expense', account: 'Business Credit Card', vendor: 'Slack' },
    { id: '9', date: '2025-12-14', description: 'Client Retainer - StartupXYZ', category: 'Revenue', amount: 5000, type: 'income', account: 'Business Checking' },
    { id: '10', date: '2025-12-13', description: 'HubSpot CRM', category: 'Software & Tools', amount: 1200, type: 'expense', account: 'Business Credit Card', vendor: 'HubSpot' },
    { id: '11', date: '2025-12-12', description: 'Facebook Ads', category: 'Marketing', amount: 2800, type: 'expense', account: 'Business Credit Card', vendor: 'Meta' },
    { id: '12', date: '2025-12-11', description: 'Client Payment - RetailCo', category: 'Revenue', amount: 12500, type: 'income', account: 'Business Checking' },
    { id: '13', date: '2025-12-10', description: 'Legal Consultation', category: 'Professional Services', amount: 2500, type: 'expense', account: 'Business Checking', vendor: 'Smith & Associates' },
    { id: '14', date: '2025-12-09', description: 'Team Lunch', category: 'Travel & Entertainment', amount: 485, type: 'expense', account: 'Business Credit Card' },
    { id: '15', date: '2025-12-08', description: 'Utility Bill', category: 'Utilities', amount: 320, type: 'expense', account: 'Business Checking' },
];

// Helper function to get insight icon
export const getInsightIcon = (type) => {
    const icons = {
        positive: 'mdi:check-circle',
        warning: 'mdi:alert',
        opportunity: 'mdi:lightbulb-on',
        action: 'mdi:lightning-bolt',
    };
    return icons[type] || 'mdi:information';
};

// Helper function to get insight color
export const getInsightColor = (type) => {
    const colors = {
        positive: { bg: 'success.lighter', text: 'success.dark', border: 'success.light' },
        warning: { bg: 'warning.lighter', text: 'warning.dark', border: 'warning.light' },
        opportunity: { bg: 'primary.lighter', text: 'primary.dark', border: 'primary.light' },
        action: { bg: 'error.lighter', text: 'error.dark', border: 'error.light' },
    };
    return colors[type] || { bg: 'grey.100', text: 'grey.800', border: 'grey.300' };
};
