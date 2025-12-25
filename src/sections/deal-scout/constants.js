// Deal Scout constants

export const DEAL_CATEGORIES = [
    { id: 'all', label: 'All Categories', icon: '🌟' },
    { id: 'electronics', label: 'Electronics', icon: '💻' },
    { id: 'software', label: 'Software', icon: '💿' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'home', label: 'Home & Office', icon: '🏠' },
    { id: 'business tools', label: 'Business Tools', icon: '💼' },
];

export const POPULAR_PRODUCTS = [
    // Payment Processing
    { name: "Stripe", icon: "💳", category: "Payment Processing", categoryId: "payment-processing" },
    { name: "Square", icon: "⬜", category: "Payment Processing", categoryId: "payment-processing" },
    { name: "PayPal", icon: "🅿️", category: "Payment Processing", categoryId: "payment-processing" },

    // VoIP / Business Phone
    { name: "Nextiva", icon: "📞", category: "Business Phone / VoIP", categoryId: "voip-phone" },
    { name: "RingCentral", icon: "🔔", category: "Business Phone / VoIP", categoryId: "voip-phone" },
    { name: "Zoom Phone", icon: "📹", category: "Business Phone / VoIP", categoryId: "voip-phone" },

    // Email Marketing
    { name: "Mailchimp", icon: "📧", category: "Email Marketing", categoryId: "email-marketing" },
    { name: "Klaviyo", icon: "🎹", category: "Email Marketing", categoryId: "email-marketing" },
    { name: "ConvertKit", icon: "🔄", category: "Email Marketing", categoryId: "email-marketing" },

    // Cloud Storage
    { name: "Google Drive", icon: "☁️", category: "Cloud Storage", categoryId: "cloud-storage" },
    { name: "Dropbox", icon: "📦", category: "Cloud Storage", categoryId: "cloud-storage" },
    { name: "OneDrive", icon: "🔷", category: "Cloud Storage", categoryId: "cloud-storage" },

    // Project Management
    { name: "Asana", icon: "✅", category: "Project Management", categoryId: "project-management" },
    { name: "Trello", icon: "📋", category: "Project Management", categoryId: "project-management" },
    { name: "Monday.com", icon: "📅", category: "Project Management", categoryId: "project-management" },

    // Video Conferencing
    { name: "Zoom", icon: "📹", category: "Video Conferencing", categoryId: "video-conferencing" },
    { name: "Microsoft Teams", icon: "👥", category: "Video Conferencing", categoryId: "video-conferencing" },
    { name: "Google Meet", icon: "🎥", category: "Video Conferencing", categoryId: "video-conferencing" },

    // Team Communication
    { name: "Slack", icon: "💬", category: "Team Communication", categoryId: "team-communication" },
    { name: "Discord", icon: "🎮", category: "Team Communication", categoryId: "team-communication" },

    // Office Suite
    { name: "Microsoft Office", icon: "📊", category: "Office Suite", categoryId: "office-suite" },
    { name: "Google Workspace", icon: "🔷", category: "Office Suite", categoryId: "office-suite" },
    { name: "LibreOffice", icon: "📗", category: "Office Suite", categoryId: "office-suite" },

    // CRM
    { name: "Salesforce", icon: "📈", category: "CRM Software", categoryId: "crm" },
    { name: "HubSpot", icon: "🎯", category: "CRM Software", categoryId: "crm" },
    { name: "Pipedrive", icon: "🔵", category: "CRM Software", categoryId: "crm" },

    // Design & Creative
    { name: "Adobe Creative Cloud", icon: "🎨", category: "Design & Creative", categoryId: "design-creative" },
    { name: "Figma", icon: "🖼️", category: "Design & Creative", categoryId: "design-creative" },
    { name: "Canva", icon: "🎭", category: "Design & Creative", categoryId: "design-creative" },

    // Accounting
    { name: "QuickBooks", icon: "💰", category: "Accounting Software", categoryId: "accounting" },
    { name: "Xero", icon: "🔷", category: "Accounting Software", categoryId: "accounting" },
    { name: "Wave", icon: "🌊", category: "Accounting Software", categoryId: "accounting" },
];

export const BUSINESS_CATEGORIES = [
    {
        id: "payment-processing",
        name: "Payment Processing",
        icon: "💳",
        description: "Cut transaction fees from 2-4% down significantly",
        potentialSavings: "$500-5000/year"
    },
    {
        id: "voip-phone",
        name: "Business Phone / VoIP",
        icon: "📞",
        description: "Compare calling rates, features, and integrations",
        potentialSavings: "$100-500/year"
    },
    {
        id: "email-marketing",
        name: "Email Marketing",
        icon: "📧",
        description: "Compare pricing tiers based on send volume",
        potentialSavings: "$200-2000/year"
    },
    {
        id: "cloud-storage",
        name: "Cloud Storage",
        icon: "☁️",
        description: "Compare storage limits and per-user pricing",
        potentialSavings: "$50-500/year"
    },
    {
        id: "project-management",
        name: "Project Management",
        icon: "📋",
        description: "Compare features, user limits, and pricing models",
        potentialSavings: "$100-1000/year"
    },
    {
        id: "video-conferencing",
        name: "Video Conferencing",
        icon: "📹",
        description: "Compare participant limits and recording options",
        potentialSavings: "$100-800/year"
    },
    {
        id: "team-communication",
        name: "Team Communication",
        icon: "💬",
        description: "Compare messaging, channels, and integrations",
        potentialSavings: "$50-400/year"
    },
    {
        id: "office-suite",
        name: "Office Suite",
        icon: "📊",
        description: "Compare document, spreadsheet, and presentation tools",
        potentialSavings: "$100-500/year"
    },
    {
        id: "crm",
        name: "CRM Software",
        icon: "📈",
        description: "Compare contact management and automation features",
        potentialSavings: "$200-2000/year"
    },
    {
        id: "design-creative",
        name: "Design & Creative",
        icon: "🎨",
        description: "Compare design tools, asset libraries, and pricing",
        potentialSavings: "$200-1500/year"
    },
    {
        id: "accounting",
        name: "Accounting Software",
        icon: "💰",
        description: "Compare bookkeeping, invoicing, and tax features",
        potentialSavings: "$100-800/year"
    },
];
