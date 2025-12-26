// Sample documents for demo

const today = new Date();

const addDays = (days) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date;
};

const subDays = (days) => {
    const date = new Date(today);
    date.setDate(date.getDate() - days);
    return date;
};

export const SAMPLE_DOCUMENTS = [
    {
        id: '1',
        name: 'General Liability Insurance 2024',
        category: 'insurance',
        uploadDate: new Date('2024-01-15'),
        expiryDate: addDays(5),
        notes: 'Annual policy with State Farm',
        fileType: 'pdf',
        fileSize: 2500000,
        versions: [
            {
                id: 'v-1-1',
                timestamp: new Date('2024-01-15'),
                action: 'uploaded',
                description: 'Document uploaded to Locker',
            },
            {
                id: 'v-1-2',
                timestamp: new Date('2024-03-20'),
                action: 'edited',
                description: 'Updated notes with policy provider details',
                previousValues: { notes: 'Annual policy' },
            },
            {
                id: 'v-1-3',
                timestamp: subDays(10),
                action: 'expiry_updated',
                description: 'Expiry date updated for renewal',
                previousValues: { expiryDate: new Date('2024-12-31') },
            },
        ],
    },
    {
        id: '2',
        name: 'Office Lease Agreement',
        category: 'leases',
        uploadDate: new Date('2023-06-01'),
        expiryDate: addDays(18),
        notes: '123 Main St, Suite 400',
        fileType: 'pdf',
        fileSize: 1800000,
        versions: [
            {
                id: 'v-2-1',
                timestamp: new Date('2023-06-01'),
                action: 'uploaded',
                description: 'Document uploaded to Locker',
            },
            {
                id: 'v-2-2',
                timestamp: new Date('2024-05-15'),
                action: 'renamed',
                description: 'Renamed from "Lease Agreement" to "Office Lease Agreement"',
                previousValues: { name: 'Lease Agreement' },
            },
        ],
    },
    {
        id: '3',
        name: 'Business License - City of Austin',
        category: 'licenses',
        uploadDate: new Date('2024-03-20'),
        expiryDate: addDays(45),
        fileType: 'pdf',
        fileSize: 500000,
        versions: [
            {
                id: 'v-3-1',
                timestamp: new Date('2024-03-20'),
                action: 'uploaded',
                description: 'Document uploaded to Locker',
            },
        ],
    },
    {
        id: '4',
        name: 'Articles of Incorporation',
        category: 'legal',
        uploadDate: new Date('2020-01-10'),
        fileType: 'pdf',
        fileSize: 950000,
        versions: [
            {
                id: 'v-4-1',
                timestamp: new Date('2020-01-10'),
                action: 'uploaded',
                description: 'Document uploaded to Locker',
            },
            {
                id: 'v-4-2',
                timestamp: new Date('2022-08-15'),
                action: 'category_changed',
                description: 'Category changed from "Contracts & Agreements" to "Formation & Legal"',
                previousValues: { category: 'contracts' },
            },
        ],
    },
    {
        id: '5',
        name: 'Employee Handbook v3.2',
        category: 'hr',
        uploadDate: new Date('2024-09-01'),
        fileType: 'pdf',
        fileSize: 3200000,
        versions: [
            {
                id: 'v-5-1',
                timestamp: new Date('2024-09-01'),
                action: 'uploaded',
                description: 'Document uploaded to Locker',
            },
        ],
    },
    {
        id: '6',
        name: 'AWS Services Agreement',
        category: 'vendor',
        uploadDate: new Date('2024-06-15'),
        expiryDate: addDays(25),
        notes: 'Enterprise tier',
        fileType: 'pdf',
        fileSize: 1100000,
        versions: [
            {
                id: 'v-6-1',
                timestamp: new Date('2024-06-15'),
                action: 'uploaded',
                description: 'Document uploaded to Locker',
            },
            {
                id: 'v-6-2',
                timestamp: new Date('2024-10-01'),
                action: 'edited',
                description: 'Added notes about enterprise tier',
                previousValues: { notes: undefined },
            },
        ],
    },
    {
        id: '7',
        name: '2023 Tax Return',
        category: 'tax',
        uploadDate: new Date('2024-04-15'),
        fileType: 'pdf',
        fileSize: 4500000,
        versions: [
            {
                id: 'v-7-1',
                timestamp: new Date('2024-04-15'),
                action: 'uploaded',
                description: 'Document uploaded to Locker',
            },
        ],
    },
    {
        id: '8',
        name: 'Workers Comp Insurance',
        category: 'insurance',
        uploadDate: new Date('2024-02-01'),
        expiryDate: addDays(52),
        fileType: 'pdf',
        fileSize: 1900000,
        versions: [
            {
                id: 'v-8-1',
                timestamp: new Date('2024-02-01'),
                action: 'uploaded',
                description: 'Document uploaded to Locker',
            },
        ],
    },
];

// Helper to create initial version
export const createInitialVersion = (uploadDate) => ({
    id: `v-${Date.now()}`,
    timestamp: uploadDate,
    action: 'uploaded',
    description: 'Document uploaded to Locker',
});

// Helper to create edit version
export const createEditVersion = (action, description, previousValues) => ({
    id: `v-${Date.now()}`,
    timestamp: new Date(),
    action,
    description,
    previousValues,
});
