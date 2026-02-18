'use client';

import { useMemo, useCallback } from 'react';

import { useAuthContext } from 'src/auth/hooks';
import { hasPermission, canAccessModule } from 'src/auth/permissions';

// ----------------------------------------------------------------------

/**
 * Hook that exposes role-aware permission helpers.
 *
 * Usage:
 *   const { role, can, canAccess } = usePermissions();
 *
 *   can('transactions', 'edit')   // true / false
 *   canAccess('bookkeeping')      // true / false
 */
export function usePermissions() {
    const { user } = useAuthContext();

    // The role is injected into user object by the AuthProvider from company context
    const role = user?.role ?? null;

    const can = useCallback(
        (module, action) => {
            if (!role) return false;
            return hasPermission(role, module, action);
        },
        [role]
    );

    const canAccess = useCallback(
        (module) => {
            if (!role) return false;
            return canAccessModule(role, module);
        },
        [role]
    );

    return useMemo(
        () => ({
            role,
            can,
            canAccess,
        }),
        [role, can, canAccess]
    );
}
