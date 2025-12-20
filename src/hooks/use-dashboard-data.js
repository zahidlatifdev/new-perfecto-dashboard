import { useState, useEffect, useCallback } from 'react';

import axios, { endpoints } from 'src/utils/axios';

export function useDashboardData(period = 'this_year', autoRefresh = false) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async (currentPeriod = period) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(endpoints.dashboard.stats, {
                params: { period: currentPeriod }
            });

            if (response.data.success) {
                setData(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch dashboard data');
            }
        } catch (err) {
            console.error('Dashboard data fetch error:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Auto refresh every 5 minutes if enabled
    useEffect(() => {
        if (!autoRefresh) return undefined;

        const interval = setInterval(() => {
            fetchDashboardData();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [autoRefresh, fetchDashboardData]);

    const refresh = useCallback((newPeriod = period) => {
        fetchDashboardData(newPeriod);
    }, [fetchDashboardData, period]);

    return {
        data,
        loading,
        error,
        refresh,
        refetch: fetchDashboardData
    };
}
