export const funFacts = [
    {
        id: 1,
        category: 'spending',
        icon: '☕',
        title: 'Coffee Budget',
        description: 'Your team spent on coffee',
        value: '$842',
        analogy: 'That\'s about 280 cups of artisan coffee!',
        isNew: true,
    },
    {
        id: 2,
        category: 'revenue',
        icon: '🚀',
        title: 'Growth Streak',
        description: 'Consecutive months of revenue growth',
        value: '7 months',
        analogy: 'Your longest streak yet!',
        isNew: false,
    },
    {
        id: 3,
        category: 'savings',
        icon: '💰',
        title: 'Cost Savings',
        description: 'Saved by optimizing expenses',
        value: '$12,450',
        analogy: 'Enough to hire a part-time developer for 2 months!',
        isNew: true,
    },
    {
        id: 4,
        category: 'efficiency',
        icon: '⚡',
        title: 'Processing Speed',
        description: 'Average invoice processing time',
        value: '2.4 hours',
        analogy: '60% faster than industry average',
        isNew: false,
    },
    {
        id: 5,
        category: 'milestone',
        icon: '🎯',
        title: 'Revenue Milestone',
        description: 'You\'re just away from $1M ARR',
        value: '$127K',
        analogy: 'Only 12.7% more to go!',
        isNew: true,
    },
    {
        id: 6,
        category: 'spending',
        icon: '🌐',
        title: 'Software Subscriptions',
        description: 'Monthly SaaS expenses',
        value: '$4,280',
        analogy: 'That\'s 15 different tools powering your business',
        isNew: false,
    },
    {
        id: 7,
        category: 'revenue',
        icon: '📈',
        title: 'Top Revenue Day',
        description: 'Your best performing day this month',
        value: '$28,500',
        analogy: 'That\'s 3x your average daily revenue!',
        isNew: false,
    },
    {
        id: 8,
        category: 'efficiency',
        icon: '🎨',
        title: 'Automation Impact',
        description: 'Hours saved by automation',
        value: '124 hours',
        analogy: 'That\'s over 3 work weeks!',
        isNew: true,
    },
];

export const getCategoryColor = (category) => {
    const colors = {
        spending: 'from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20',
        revenue: 'from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20',
        savings: 'from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20',
        efficiency: 'from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20',
        milestone: 'from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20',
    };
    return colors[category] || 'from-gray-50 to-gray-100 dark:from-gray-950/30 dark:to-gray-900/20';
};

export const getCategoryLabel = (category) => {
    const labels = {
        spending: 'SPENDING',
        revenue: 'REVENUE',
        savings: 'SAVINGS',
        efficiency: 'EFFICIENCY',
        milestone: 'MILESTONE',
    };
    return labels[category] || 'INSIGHT';
};
