// Price Alerts utilities

const STORAGE_KEY = 'priceAlerts';

export const getAlerts = () => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading alerts:', error);
        return [];
    }
};

export const saveAlert = (alert) => {
    if (typeof window === 'undefined') return null;
    try {
        const alerts = getAlerts();
        const newAlert = {
            ...alert,
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };
        alerts.push(newAlert);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));

        // Dispatch custom event for updates
        window.dispatchEvent(new Event('alertsUpdated'));

        return newAlert;
    } catch (error) {
        console.error('Error saving alert:', error);
        return null;
    }
};

export const deleteAlert = (id) => {
    if (typeof window === 'undefined') return;
    try {
        const alerts = getAlerts().filter((a) => a.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
        window.dispatchEvent(new Event('alertsUpdated'));
    } catch (error) {
        console.error('Error deleting alert:', error);
    }
};

export const toggleAlert = (id) => {
    if (typeof window === 'undefined') return;
    try {
        const alerts = getAlerts().map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
        window.dispatchEvent(new Event('alertsUpdated'));
    } catch (error) {
        console.error('Error toggling alert:', error);
    }
};

export const checkAlertsMatch = (deals, alerts) => {
    const matches = [];

    for (const alert of alerts.filter((a) => a.isActive)) {
        for (const deal of deals) {
            const dealPrice = deal.dealPrice
                ? parseFloat(deal.dealPrice.replace(/[^0-9.]/g, ''))
                : null;

            const keywordMatch =
                deal.title.toLowerCase().includes(alert.keyword.toLowerCase()) ||
                deal.description.toLowerCase().includes(alert.keyword.toLowerCase());

            const categoryMatch =
                alert.category === 'all' || deal.category.toLowerCase() === alert.category.toLowerCase();

            const priceMatch = dealPrice !== null && dealPrice <= alert.targetPrice;

            if (keywordMatch && categoryMatch && priceMatch) {
                matches.push({ alert, deal });
            }
        }
    }

    return matches;
};

// Parse price helper
export const parsePrice = (price) => {
    if (!price) return Infinity;
    const match = price.match(/[\d,.]+/);
    return match ? parseFloat(match[0].replace(',', '')) : Infinity;
};

// Parse discount helper
export const parseDiscount = (discount) => {
    if (!discount) return 0;
    const match = discount.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
};
