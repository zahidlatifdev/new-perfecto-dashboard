'use client';

import { createContext, useContext, useState } from 'react';

const BookkeepingModeContext = createContext(undefined);

export function BookkeepingModeProvider({ children }) {
    const [isBookkeepingMode, setIsBookkeepingMode] = useState(false);
    // Demo mode: Always start without subscription - user must upgrade each session
    const [hasBookkeepingSubscription, setHasBookkeepingSubscription] = useState(false);

    // Activate subscription when user upgrades
    const activateBookkeepingSubscription = () => {
        setHasBookkeepingSubscription(true);
        setIsBookkeepingMode(true);
    };

    // Reset subscription (for demo purposes)
    const resetSubscription = () => {
        setHasBookkeepingSubscription(false);
        setIsBookkeepingMode(false);
    };

    return (
        <BookkeepingModeContext.Provider
            value={{
                isBookkeepingMode,
                setIsBookkeepingMode,
                hasBookkeepingSubscription,
                activateBookkeepingSubscription,
                resetSubscription,
            }}
        >
            {children}
        </BookkeepingModeContext.Provider>
    );
}

export function useBookkeepingMode() {
    const context = useContext(BookkeepingModeContext);
    if (!context) {
        throw new Error('useBookkeepingMode must be used within BookkeepingModeProvider');
    }
    return context;
}
