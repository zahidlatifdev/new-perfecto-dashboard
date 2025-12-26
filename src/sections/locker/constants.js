// Document categories configuration

export const DOCUMENT_CATEGORIES = [
    {
        id: 'insurance',
        label: 'Insurance Policies',
        icon: 'solar:shield-check-bold-duotone',
        expiryDefault: true,
    },
    {
        id: 'contracts',
        label: 'Contracts & Agreements',
        icon: 'solar:document-text-bold-duotone',
        expiryDefault: false,
    },
    {
        id: 'leases',
        label: 'Leases',
        icon: 'solar:home-2-bold-duotone',
        expiryDefault: true,
    },
    {
        id: 'licenses',
        label: 'Licenses & Permits',
        icon: 'solar:verified-check-bold-duotone',
        expiryDefault: true,
    },
    {
        id: 'tax',
        label: 'Tax Documents',
        icon: 'solar:calculator-bold-duotone',
        expiryDefault: false,
    },
    {
        id: 'legal',
        label: 'Formation & Legal',
        icon: 'solar:scale-bold-duotone',
        expiryDefault: false,
    },
    {
        id: 'hr',
        label: 'HR & Employee',
        icon: 'solar:users-group-rounded-bold-duotone',
        expiryDefault: false,
    },
    {
        id: 'bank',
        label: 'Bank & Financial',
        icon: 'solar:card-bold-duotone',
        expiryDefault: false,
    },
    {
        id: 'vendor',
        label: 'Vendor Agreements',
        icon: 'solar:handshake-bold-duotone',
        expiryDefault: false,
    },
];

export function getCategoryInfo(categoryId) {
    return DOCUMENT_CATEGORIES.find((c) => c.id === categoryId) || DOCUMENT_CATEGORIES[0];
}
