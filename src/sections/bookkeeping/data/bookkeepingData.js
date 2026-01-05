export const sampleMessages = [
    {
        id: '1',
        content: "Hi! I've completed the November reconciliation. Everything looks great!",
        sender: 'bookkeeper',
        timestamp: new Date(2024, 11, 18, 10, 30),
        read: true,
    },
    {
        id: '2',
        content:
            "That's awesome, thanks Sarah! Quick question - did you see the new vendor payment from last week?",
        sender: 'user',
        timestamp: new Date(2024, 11, 18, 11, 15),
        read: true,
    },
    {
        id: '3',
        content:
            'Yes, I categorized it under Office Supplies. I also noticed you might be able to get a bulk discount - I left a note in the activity log.',
        sender: 'bookkeeper',
        timestamp: new Date(2024, 11, 18, 11, 45),
        read: true,
    },
    {
        id: '4',
        content: 'Perfect! Can you also prepare the Q4 estimates when you have time?',
        sender: 'user',
        timestamp: new Date(2024, 11, 19, 9, 0),
        read: true,
    },
    {
        id: '5',
        content:
            "Absolutely! I'll have those ready by end of week. I'll also upload the updated P&L to the documents folder.",
        sender: 'bookkeeper',
        timestamp: new Date(2024, 11, 19, 9, 30),
        read: false,
    },
];

export const sampleDocuments = [
    {
        id: '1',
        name: 'November_Bank_Statement.pdf',
        category: 'Bank Statements',
        uploadDate: new Date(2024, 11, 15),
        uploadedBy: 'client',
        size: '245 KB',
    },
    {
        id: '2',
        name: 'Q3_Reconciliation.xlsx',
        category: 'Other',
        uploadDate: new Date(2024, 11, 18),
        uploadedBy: 'bookkeeper',
        size: '89 KB',
    },
    {
        id: '3',
        name: 'Office_Supplies_Receipt.pdf',
        category: 'Receipts',
        uploadDate: new Date(2024, 11, 10),
        uploadedBy: 'client',
        size: '156 KB',
    },
    {
        id: '4',
        name: 'Payroll_Nov_2024.pdf',
        category: 'Payroll Docs',
        uploadDate: new Date(2024, 11, 1),
        uploadedBy: 'bookkeeper',
        size: '312 KB',
    },
    {
        id: '5',
        name: 'Invoice_#1234.pdf',
        category: 'Invoices',
        uploadDate: new Date(2024, 11, 5),
        uploadedBy: 'client',
        size: '78 KB',
    },
];

export const documentFolders = [
    { name: 'Receipts', count: 24 },
    { name: 'Bank Statements', count: 12 },
    { name: 'Invoices', count: 45 },
    { name: 'Payroll Docs', count: 8 },
    { name: 'Tax Forms', count: 6 },
    { name: 'Prior Returns', count: 3 },
    { name: 'Other', count: 15 },
];

export const sampleTasks = [
    {
        id: '1',
        description: 'Upload November bank statements',
        dueDate: new Date(2024, 11, 20),
        assignedTo: 'client',
        status: 'completed',
        category: 'documents',
        priority: 'high',
    },
    {
        id: '2',
        description: 'Review Q3 expense categorization',
        dueDate: new Date(2024, 11, 22),
        assignedTo: 'bookkeeper',
        status: 'in_progress',
        category: 'reconciliation',
        priority: 'medium',
    },
    {
        id: '3',
        description: 'Provide mileage log for 2024',
        dueDate: new Date(2024, 11, 28),
        assignedTo: 'client',
        status: 'open',
        category: 'taxes',
        priority: 'high',
        notes: 'Need odometer readings for business trips',
    },
    {
        id: '4',
        description: 'Prepare quarterly tax estimates',
        dueDate: new Date(2024, 11, 30),
        assignedTo: 'bookkeeper',
        status: 'open',
        category: 'taxes',
        priority: 'high',
    },
    {
        id: '5',
        description: 'Upload vendor contracts',
        dueDate: new Date(2025, 0, 5),
        assignedTo: 'client',
        status: 'open',
        category: 'documents',
        priority: 'low',
    },
    {
        id: '6',
        description: 'Finalize year-end reconciliation',
        dueDate: new Date(2025, 0, 10),
        assignedTo: 'bookkeeper',
        status: 'open',
        category: 'reconciliation',
        priority: 'high',
    },
    {
        id: '7',
        description: 'Process December payroll',
        dueDate: new Date(2024, 11, 25),
        assignedTo: 'bookkeeper',
        status: 'in_progress',
        category: 'payroll',
        priority: 'high',
    },
    {
        id: '8',
        description: 'Submit W-9 forms for contractors',
        dueDate: new Date(2025, 0, 15),
        assignedTo: 'client',
        status: 'open',
        category: 'taxes',
        priority: 'medium',
        notes: 'Required for 1099 filing',
    },
];

export const sampleActivities = [
    {
        id: '1',
        type: 'message',
        description: 'Sarah sent you a message about Q4 estimates',
        actor: 'bookkeeper',
        timestamp: new Date(2024, 11, 19, 9, 30),
    },
    {
        id: '2',
        type: 'upload',
        description: 'You uploaded November_Bank_Statement.pdf',
        actor: 'client',
        timestamp: new Date(2024, 11, 18, 14, 0),
    },
    {
        id: '3',
        type: 'document',
        description: 'Sarah uploaded Q3_Reconciliation.xlsx',
        actor: 'bookkeeper',
        timestamp: new Date(2024, 11, 18, 11, 45),
    },
    {
        id: '4',
        type: 'task_complete',
        description: "Task 'Upload November bank statements' marked complete",
        actor: 'client',
        timestamp: new Date(2024, 11, 17, 16, 20),
    },
    {
        id: '5',
        type: 'status_update',
        description: "Bookkeeping status updated to 'Up to date through Nov 2024'",
        actor: 'bookkeeper',
        timestamp: new Date(2024, 11, 15, 10, 0),
    },
    {
        id: '6',
        type: 'message',
        description: 'You started a conversation about vendor payments',
        actor: 'client',
        timestamp: new Date(2024, 11, 14, 11, 15),
    },
    {
        id: '7',
        type: 'upload',
        description: 'Sarah uploaded updated P&L statement',
        actor: 'bookkeeper',
        timestamp: new Date(2024, 11, 12, 15, 30),
    },
    {
        id: '8',
        type: 'task_complete',
        description: "Task 'Review Q3 expenses' marked complete by Sarah",
        actor: 'bookkeeper',
        timestamp: new Date(2024, 11, 10, 9, 45),
    },
];

export const categoryConfig = {
    documents: {
        label: 'Documents',
        color: '#2563eb',
    },
    reconciliation: {
        label: 'Reconciliation',
        color: '#9333ea',
    },
    taxes: {
        label: 'Taxes',
        color: '#dc2626',
    },
    payroll: {
        label: 'Payroll',
        color: '#16a34a',
    },
    general: {
        label: 'General',
        color: '#6b7280',
    },
};
