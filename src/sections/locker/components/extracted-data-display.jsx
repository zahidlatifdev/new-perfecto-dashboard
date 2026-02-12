import {
    Box,
    Typography,
    Stack,
    Chip,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Grid,
    Alert,
    Button,
    CircularProgress,
} from '@mui/material';
import { format } from 'date-fns';
import { Iconify } from 'src/components/iconify';

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
    if (amount == null || amount === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};

// Format date safely
const formatDate = (dateValue) => {
    if (!dateValue) return '—';
    try {
        return format(new Date(dateValue), 'MMM d, yyyy');
    } catch {
        return String(dateValue);
    }
};

// Detail row component
function DetailRow({ label, value, icon }) {
    if (!value && value !== 0) return null;
    return (
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 0.75 }}>
            {icon && <Iconify icon={icon} width={16} sx={{ color: 'text.secondary', mt: 0.3 }} />}
            <Box sx={{ minWidth: 120 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                    {label}
                </Typography>
            </Box>
            <Typography variant="body2" sx={{ flex: 1 }}>
                {value}
            </Typography>
        </Stack>
    );
}

// Invoice data display
function InvoiceExtractedData({ data }) {
    return (
        <Stack spacing={2.5}>
            {/* Vendor Info */}
            <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    <Iconify icon="solar:shop-bold-duotone" width={18} sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                    Vendor Information
                </Typography>
                <Box sx={{ pl: 1 }}>
                    <DetailRow label="Name" value={data.vendorName} />
                    <DetailRow label="Address" value={data.vendorAddress} />
                    <DetailRow label="Phone" value={data.vendorPhone} />
                    <DetailRow label="Email" value={data.vendorEmail} />
                </Box>
            </Box>

            <Divider />

            {/* Invoice Details */}
            <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    <Iconify icon="solar:document-add-bold-duotone" width={18} sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                    Invoice Details
                </Typography>
                <Box sx={{ pl: 1 }}>
                    <DetailRow label="Invoice #" value={data.invoiceNumber} />
                    <DetailRow label="Invoice Date" value={formatDate(data.invoiceDate)} />
                    <DetailRow label="Due Date" value={formatDate(data.dueDate)} />
                    <DetailRow label="Payment Terms" value={data.paymentTerms} />
                    <DetailRow label="Recipient" value={data.recipient} />
                </Box>
            </Box>

            {/* Billing */}
            {(data.billingName || data.billingCompany || data.billingAddress) && (
                <>
                    <Divider />
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                            <Iconify icon="solar:user-bold-duotone" width={18} sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                            Billing Info
                        </Typography>
                        <Box sx={{ pl: 1 }}>
                            <DetailRow label="Name" value={data.billingName} />
                            <DetailRow label="Company" value={data.billingCompany} />
                            <DetailRow label="Address" value={data.billingAddress} />
                        </Box>
                    </Box>
                </>
            )}

            <Divider />

            {/* Items Table */}
            {data.items && data.items.length > 0 && (
                <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                        Line Items ({data.items.length})
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'background.neutral' }}>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="right">Qty</TableCell>
                                    <TableCell align="right">Rate</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Category</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.description || '—'}</TableCell>
                                        <TableCell align="right">{item.quantity ?? '—'}</TableCell>
                                        <TableCell align="right">{formatCurrency(item.rate, data.currency)}</TableCell>
                                        <TableCell align="right">{formatCurrency(item.amount, data.currency)}</TableCell>
                                        <TableCell>
                                            {item.category && (
                                                <Chip label={item.category} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Totals */}
            <Box sx={{ bgcolor: 'background.neutral', p: 2, borderRadius: 1.5 }}>
                <Stack spacing={0.75}>
                    {data.subtotal != null && <TotalRow label="Subtotal" value={formatCurrency(data.subtotal, data.currency)} />}
                    {data.tax != null && <TotalRow label={`Tax${data.taxRate ? ` (${data.taxRate}%)` : ''}`} value={formatCurrency(data.tax, data.currency)} />}
                    {data.discount != null && <TotalRow label="Discount" value={`-${formatCurrency(data.discount, data.currency)}`} />}
                    {data.shipping != null && <TotalRow label="Shipping" value={formatCurrency(data.shipping, data.currency)} />}
                    {data.fees != null && <TotalRow label="Fees" value={formatCurrency(data.fees, data.currency)} />}
                    <Divider />
                    <TotalRow label="Total" value={formatCurrency(data.total, data.currency)} bold />
                    {data.balanceDue != null && <TotalRow label="Balance Due" value={formatCurrency(data.balanceDue, data.currency)} bold color="error.main" />}
                </Stack>
            </Box>

            {data.paymentMethod && (
                <DetailRow label="Payment Method" value={data.paymentMethod} icon="solar:card-bold" />
            )}
        </Stack>
    );
}

// Bill data display
function BillExtractedData({ data }) {
    return (
        <Stack spacing={2.5}>
            {/* Vendor Info */}
            <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    <Iconify icon="solar:shop-bold-duotone" width={18} sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                    Provider Information
                </Typography>
                <Box sx={{ pl: 1 }}>
                    <DetailRow label="Name" value={data.vendorName} />
                    <DetailRow label="Address" value={data.vendorAddress} />
                    <DetailRow label="Phone" value={data.vendorPhone} />
                    <DetailRow label="Email" value={data.vendorEmail} />
                </Box>
            </Box>

            <Divider />

            {/* Bill Details */}
            <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    <Iconify icon="solar:wallet-money-bold-duotone" width={18} sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                    Bill Details
                </Typography>
                <Box sx={{ pl: 1 }}>
                    <DetailRow label="Bill #" value={data.billNumber} />
                    <DetailRow label="Bill Date" value={formatDate(data.billDate)} />
                    <DetailRow label="Due Date" value={formatDate(data.dueDate)} />
                    <DetailRow label="Service Period" value={data.servicePeriod} />
                    <DetailRow label="Account #" value={data.accountNumber} />
                    <DetailRow label="Recipient" value={data.recipient} />
                </Box>
            </Box>

            <Divider />

            {/* Items Table */}
            {data.items && data.items.length > 0 && (
                <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                        Line Items ({data.items.length})
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'background.neutral' }}>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="right">Units</TableCell>
                                    <TableCell align="right">Rate</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Category</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.description || '—'}</TableCell>
                                        <TableCell align="right">{item.units ?? '—'}</TableCell>
                                        <TableCell align="right">{formatCurrency(item.rate, data.currency)}</TableCell>
                                        <TableCell align="right">{formatCurrency(item.amount, data.currency)}</TableCell>
                                        <TableCell>
                                            {item.category && (
                                                <Chip label={item.category} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Totals */}
            <Box sx={{ bgcolor: 'background.neutral', p: 2, borderRadius: 1.5 }}>
                <Stack spacing={0.75}>
                    {data.subtotal != null && <TotalRow label="Subtotal" value={formatCurrency(data.subtotal, data.currency)} />}
                    {data.tax != null && <TotalRow label="Tax" value={formatCurrency(data.tax, data.currency)} />}
                    {data.fees != null && <TotalRow label="Fees" value={formatCurrency(data.fees, data.currency)} />}
                    <Divider />
                    <TotalRow label="Total Due" value={formatCurrency(data.totalDue || data.total, data.currency)} bold />
                </Stack>
            </Box>

            {data.notesExceptions && (
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                        Notes / Exceptions
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}>
                        {data.notesExceptions}
                    </Typography>
                </Box>
            )}

            {data.paymentMethod && (
                <DetailRow label="Payment Method" value={data.paymentMethod} icon="solar:card-bold" />
            )}
        </Stack>
    );
}

// Receipt data display
function ReceiptExtractedData({ data }) {
    return (
        <Stack spacing={2.5}>
            {/* Vendor Info */}
            <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    <Iconify icon="solar:shop-bold-duotone" width={18} sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                    Vendor / Store
                </Typography>
                <Box sx={{ pl: 1 }}>
                    <DetailRow label="Vendor" value={data.vendor} />
                    <DetailRow label="Receipt Type" value={data.receiptType} />
                </Box>
            </Box>

            <Divider />

            {/* Receipt Details */}
            <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    <Iconify icon="solar:bill-list-bold-duotone" width={18} sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                    Receipt Details
                </Typography>
                <Box sx={{ pl: 1 }}>
                    <DetailRow label="Receipt #" value={data.receiptNumber} />
                    <DetailRow label="Order ID" value={data.orderId} />
                    <DetailRow label="Receipt Date" value={formatDate(data.receiptDate)} />
                    <DetailRow label="Order Date" value={formatDate(data.orderDate)} />
                    <DetailRow label="Shipment Date" value={formatDate(data.shipmentDate)} />
                </Box>
            </Box>

            {/* Shipping Info */}
            {(data.shippingName || data.shippingAddress) && (
                <>
                    <Divider />
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                            <Iconify icon="solar:box-bold-duotone" width={18} sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                            Shipping Info
                        </Typography>
                        <Box sx={{ pl: 1 }}>
                            <DetailRow label="Name" value={data.shippingName} />
                            <DetailRow label="Address" value={data.shippingAddress} />
                        </Box>
                    </Box>
                </>
            )}

            <Divider />

            {/* Items Table */}
            {data.items && data.items.length > 0 && (
                <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                        Items ({data.items.length})
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'background.neutral' }}>
                                    <TableCell>Item</TableCell>
                                    <TableCell align="right">Qty</TableCell>
                                    <TableCell align="right">Unit Price</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    <TableCell>Category</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.name || item.description || '—'}</TableCell>
                                        <TableCell align="right">{item.quantity ?? '—'}</TableCell>
                                        <TableCell align="right">{formatCurrency(item.unitPrice, data.currency)}</TableCell>
                                        <TableCell align="right">{formatCurrency(item.totalPrice, data.currency)}</TableCell>
                                        <TableCell>
                                            {item.category && (
                                                <Chip label={item.category} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Totals */}
            <Box sx={{ bgcolor: 'background.neutral', p: 2, borderRadius: 1.5 }}>
                <Stack spacing={0.75}>
                    {data.subtotal != null && <TotalRow label="Subtotal" value={formatCurrency(data.subtotal, data.currency)} />}
                    {data.tax != null && <TotalRow label="Tax" value={formatCurrency(data.tax, data.currency)} />}
                    {data.shipping != null && <TotalRow label="Shipping" value={formatCurrency(data.shipping, data.currency)} />}
                    {data.shippingDiscount != null && <TotalRow label="Shipping Discount" value={`-${formatCurrency(data.shippingDiscount, data.currency)}`} />}
                    {data.fees != null && <TotalRow label="Fees" value={formatCurrency(data.fees, data.currency)} />}
                    <Divider />
                    <TotalRow label="Total" value={formatCurrency(data.total, data.currency)} bold />
                </Stack>
            </Box>

            {data.paymentMethod && (
                <DetailRow label="Payment Method" value={data.paymentMethod} icon="solar:card-bold" />
            )}
        </Stack>
    );
}

// Total row helper
function TotalRow({ label, value, bold, color }) {
    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant={bold ? 'subtitle2' : 'body2'} fontWeight={bold ? 700 : 400}>
                {label}
            </Typography>
            <Typography variant={bold ? 'subtitle1' : 'body2'} fontWeight={bold ? 700 : 500} color={color}>
                {value}
            </Typography>
        </Stack>
    );
}

/**
 * Main Extracted Data Display component
 * Shows processing status or extracted information for receipt/invoice/bill documents
 */
export function ExtractedDataDisplay({ document, onReprocess }) {
    const { processingStatus, extractedData, processingError, category } = document;

    // Pending / Processing
    if (processingStatus === 'pending' || processingStatus === 'processing') {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                    Extracting Data...
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    We&apos;re analyzing your {category} to extract key details. This usually takes a few moments.
                </Typography>
            </Box>
        );
    }

    // Failed
    if (processingStatus === 'failed') {
        return (
            <Alert
                severity="error"
                sx={{ borderRadius: 1.5 }}
                action={
                    onReprocess && (
                        <Button color="error" size="small" onClick={onReprocess}>
                            Retry
                        </Button>
                    )
                }
            >
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Data Extraction Failed
                </Typography>
                <Typography variant="body2">
                    {processingError || 'Something went wrong while extracting data from this document.'}
                </Typography>
            </Alert>
        );
    }

    // Completed but no data
    if (processingStatus === 'completed' && (!extractedData || !extractedData.documentType)) {
        return (
            <Alert
                severity="warning"
                sx={{ borderRadius: 1.5 }}
                action={
                    onReprocess && (
                        <Button color="warning" size="small" onClick={onReprocess}>
                            Retry
                        </Button>
                    )
                }
            >
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    No Data Extracted
                </Typography>
                <Typography variant="body2">
                    We processed this document but couldn&apos;t extract meaningful data. This might happen with
                    low-quality images or unsupported formats.
                </Typography>
            </Alert>
        );
    }

    // Completed with data
    if (processingStatus === 'completed' && extractedData) {
        const docType = extractedData.documentType;

        return (
            <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Iconify icon="solar:magic-stick-3-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight={700}>
                        Extracted Information
                    </Typography>
                    <Chip
                        label={docType}
                        size="small"
                        color="primary"
                        variant="soft"
                        sx={{ fontSize: '0.7rem' }}
                    />
                </Stack>

                {docType === 'Invoice' && <InvoiceExtractedData data={extractedData} />}
                {docType === 'Bill' && <BillExtractedData data={extractedData} />}
                {docType === 'Receipt' && <ReceiptExtractedData data={extractedData} />}
            </Box>
        );
    }

    return null;
}
