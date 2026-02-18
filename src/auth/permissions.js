/**
 * Centralized RBAC configuration for the frontend.
 * Mirrors perfecto-api/src/config/permissions.js — keep them in sync.
 *
 * Roles:   owner | admin | member | bookkeeper
 * Actions: view | create | edit | delete | manage
 */

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------
export const ROLES = {
    owner: { level: 3, label: 'Owner' },
    admin: { level: 2, label: 'Admin' },
    bookkeeper: { level: 1, label: 'Bookkeeper' },
    member: { level: 0, label: 'Member' },
};

export const ROLE_OPTIONS = Object.entries(ROLES).map(([key, val]) => ({
    value: key,
    label: val.label,
}));

// Roles that can be assigned via invitation
export const INVITABLE_ROLES = ['admin', 'member'];

// ---------------------------------------------------------------------------
// Permission matrix
// ---------------------------------------------------------------------------
export const PERMISSIONS = {
    // ── Services ──────────────────────────────────────────
    bookkeeping: {
        owner: ['view', 'create', 'edit', 'delete', 'manage'],
        bookkeeper: ['view', 'create', 'edit', 'delete', 'manage'],
        // admin / member → no access
    },

    // ── Insights ──────────────────────────────────────────
    dashboard: {
        owner: ['view'],
        admin: ['view'],
        member: ['view'],
        bookkeeper: ['view'],
    },
    forecasting: {
        owner: ['view'],
        admin: ['view'],
        member: ['view'],
        bookkeeper: ['view'],
    },
    simulator: {
        owner: ['view', 'create', 'edit', 'delete'],
        admin: ['view', 'create', 'edit', 'delete'],
        member: ['view'],
        bookkeeper: ['view'],
    },
    savingScan: {
        owner: ['view'],
        admin: ['view'],
        member: ['view'],
        bookkeeper: ['view'],
    },
    chat: {
        owner: ['view', 'create', 'edit', 'delete'],
        admin: ['view', 'create', 'edit', 'delete'],
        member: ['view', 'create', 'edit', 'delete'],
        bookkeeper: ['view', 'create', 'edit', 'delete'],
    },
    reports: {
        owner: ['view', 'create', 'edit', 'delete'],
        admin: ['view', 'create', 'edit', 'delete'],
        member: ['view'],
        bookkeeper: ['view', 'create', 'edit', 'delete'],
    },

    // ── Discover ──────────────────────────────────────────
    funFacts: {
        owner: ['view'],
        admin: ['view'],
        member: ['view'],
        bookkeeper: ['view'],
    },
    dealScout: {
        owner: ['view', 'create'],
        admin: ['view', 'create'],
        member: ['view'],
        bookkeeper: ['view'],
    },

    // ── Data ──────────────────────────────────────────────
    locker: {
        owner: ['view', 'create', 'edit', 'delete'],
        admin: ['view', 'create', 'edit', 'delete'],
        member: ['view'],             // view only — no upload/edit/delete
        bookkeeper: ['view'],
    },
    accounts: {
        owner: ['view', 'create', 'edit', 'delete'],
        admin: ['view', 'create', 'edit', 'delete'],
        member: ['view'],             // view only — no edits
        bookkeeper: ['view'],
    },
    transactions: {
        owner: ['view', 'create', 'edit', 'delete'],
        admin: ['view', 'create', 'edit', 'delete'],
        member: ['view'],             // view only — no edits
        bookkeeper: ['view', 'edit'],
    },

    // ── Settings ──────────────────────────────────────────
    company: {
        owner: ['view', 'edit', 'manage'],
        // admin / member / bookkeeper → no access
    },
    team: {
        owner: ['view', 'create', 'edit', 'delete', 'manage'],
        admin: ['view', 'create', 'edit'],  // can invite admin/member, manage members
        // member / bookkeeper → no access
    },
    settings: {
        owner: ['view', 'edit'],
        admin: ['view', 'edit'],
        member: ['view', 'edit'],
        bookkeeper: ['view', 'edit'],
    },

    // ── Future: Subscription ──────────────────────────────
    subscription: {
        owner: ['view', 'manage'],
    },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if a role has a specific permission on a module */
export function hasPermission(role, module, action) {
    const modulePerms = PERMISSIONS[module];
    if (!modulePerms) return false;
    const rolePerms = modulePerms[role];
    if (!rolePerms) return false;
    if (rolePerms.includes('manage')) return true;
    return rolePerms.includes(action);
}

/** Check if a role can access a module at all */
export function canAccessModule(role, module) {
    const modulePerms = PERMISSIONS[module];
    if (!modulePerms) return false;
    return !!modulePerms[role] && modulePerms[role].length > 0;
}

/** Map a dashboard path to its permission module key */
const PATH_TO_MODULE = {
    '/dashboard': 'dashboard',
    '/dashboard/bookkeeping': 'bookkeeping',
    '/dashboard/forecasting': 'forecasting',
    '/dashboard/simulator': 'simulator',
    '/dashboard/saving': 'savingScan',
    '/dashboard/chat': 'chat',
    '/dashboard/reports': 'reports',
    '/dashboard/fun-facts': 'funFacts',
    '/dashboard/deal-scout': 'dealScout',
    '/dashboard/locker': 'locker',
    '/dashboard/accounts': 'accounts',
    '/dashboard/accounts-management': 'accounts',
    '/dashboard/transactions': 'transactions',
    '/dashboard/company': 'company',
    '/dashboard/team': 'team',
    '/dashboard/settings': 'settings',
};

/** Resolve a path to its module key */
export function getModuleForPath(path) {
    return PATH_TO_MODULE[path] || null;
}
