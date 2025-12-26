// Fun Facts data for engagement feature

// Generate fun facts based on sample financial data
export const funFacts = [
    {
        id: 'coffee-king',
        category: 'spending',
        icon: '☕',
        title: 'Coffee Royalty',
        description: "You've spent on coffee since joining Perfecto",
        value: '$1,137',
        analogy: "That's enough for 379 lattes!",
        isNew: true,
    },
    {
        id: 'gas-gauge',
        category: 'spending',
        icon: '⛽',
        title: 'Road Warrior',
        description: 'Total gas spend since Day 1',
        value: '$963',
        analogy: 'Enough fuel to drive from NYC to Miami!',
    },
    {
        id: 'amazon-addict',
        category: 'spending',
        icon: '📦',
        title: 'Package Pro',
        description: "You've made Amazon orders",
        value: '84',
        analogy: 'Your packages could fill a small moving truck!',
    },
    {
        id: 'scout-superstar',
        category: 'savings',
        icon: '🍽️',
        title: 'Scout Superstar',
        description: 'Scout has spotted in potential savings',
        value: '$572',
        analogy: "That's a nice dinner out on us!",
        featureLink: '/dashboard/transactions',
        featureName: 'Transactions',
        isNew: true,
    },
    {
        id: 'profit-power',
        category: 'achievement',
        icon: '📈',
        title: 'Profit Powerhouse',
        description: 'Your average monthly profit since joining',
        value: '+$2,841',
        analogy: "You're absolutely crushing it!",
    },
    {
        id: 'streak-master',
        category: 'achievement',
        icon: '🔥',
        title: 'Streak Master',
        description: 'Current positive cash flow streak',
        value: '5 months',
        analogy: 'Keep the momentum going!',
        isNew: true,
    },
    {
        id: 'dining-detective',
        category: 'spending',
        icon: '🍔',
        title: 'Dining Detective',
        description: 'Total meals & restaurants spend',
        value: '$2,405',
        analogy: "You've treated yourself to ~160 meals out!",
    },
    {
        id: 'subscription-sleuth',
        category: 'insight',
        icon: '🔍',
        title: 'Subscription Sleuth',
        description: "You're currently subscribed to services",
        value: '12',
        analogy: "Scout is watching for any you might not need.",
        featureLink: '/dashboard/transactions',
        featureName: 'Scout Analysis',
    },
    {
        id: 'milestone-magic',
        category: 'milestone',
        icon: '🚀',
        title: 'Revenue Rocket',
        description: "You've processed in revenue since joining",
        value: '$48,200',
        analogy: 'Half-way to six figures!',
    },
    {
        id: 'eco-angle',
        category: 'insight',
        icon: '🌍',
        title: 'Eco Champion',
        description: 'Estimated commuting costs saved this year',
        value: '$450',
        analogy: 'By managing remotely – the planet thanks you!',
    },
];

export const getCategoryColor = (category) => {
    switch (category) {
        case 'spending':
            return {
                gradient: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(0, 188, 212, 0.15) 100%)',
                border: 'rgba(33, 150, 243, 0.3)',
            };
        case 'savings':
            return {
                gradient: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(46, 125, 50, 0.15) 100%)',
                border: 'rgba(76, 175, 80, 0.3)',
            };
        case 'achievement':
            return {
                gradient: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 152, 0, 0.15) 100%)',
                border: 'rgba(255, 193, 7, 0.3)',
            };
        case 'insight':
            return {
                gradient: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(233, 30, 99, 0.15) 100%)',
                border: 'rgba(156, 39, 176, 0.3)',
            };
        case 'milestone':
            return {
                gradient: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(211, 47, 47, 0.15) 100%)',
                border: 'rgba(244, 67, 54, 0.3)',
            };
        default:
            return {
                gradient: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.1) 100%)',
                border: 'rgba(33, 150, 243, 0.3)',
            };
    }
};

export const getCategoryLabel = (category) => {
    switch (category) {
        case 'spending':
            return 'Spending Insight';
        case 'savings':
            return 'Savings Win';
        case 'achievement':
            return 'Achievement';
        case 'insight':
            return 'Smart Insight';
        case 'milestone':
            return 'Milestone';
        default:
            return 'Fun Fact';
    }
};
