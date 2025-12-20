'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import axiosInstance, { endpoints } from 'src/utils/axios';
import { paths } from 'src/routes/paths';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import { InvoiceItemsRows } from 'src/sections/transactions/components/invoice-items-rows';

// Helper functions for document structure
const getVendorName = (document) => {
  if (document.documentType === 'Invoice' || document.documentType === 'Bill') {
    return document.vendorName || document.billingName || 'Unknown Vendor';
  } else {
    return document.vendor || document.billingName || 'Unknown Vendor';
  }
};

const getDocumentDate = (document) => {
  let dateValue;
  if (document.documentType === 'Invoice') {
    dateValue = document.invoiceDate;
  } else if (document.documentType === 'Bill') {
    dateValue = document.billDate;
  } else {
    dateValue = document.receiptDate || document.orderDate || document.invoiceDate;
  }

  if (dateValue) {
    return new Date(dateValue).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return 'No date';
};

// ----------------------------------------------------------------------

export function TransactionMatchingRow({
  transaction,
  index,
  onManualMatch,
  onRemoveMatch,
  isExpanded,
  onToggleExpand,
  onViewDocument,
  allTransactions = [],
  statementTotals = {},
  onEditAdjustment,
  onUnlinkCreditCard,
}) {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    message: '',
    onConfirm: null,
  });

  const hasMatches = transaction.matchedDocuments && transaction.matchedDocuments.length > 0;
  const hasLinkedCreditCard = transaction.linkedCreditCardStatements && transaction.linkedCreditCardStatements.length > 0;
  const hasAnyMatches = hasMatches || hasLinkedCreditCard;

  const router = useRouter();
  // Calculate credit card statement difference with proper multi-transaction handling
  const creditCardCalculation = useMemo(() => {
    if (!hasLinkedCreditCard || !transaction.linkedCreditCardStatements.length) {
      return null;
    }

    const ccStatement = transaction.linkedCreditCardStatements[0];
    const statementId = ccStatement.statementId?._id || ccStatement.statementId;

    if (!statementId) return null;

    // Get the statement total with multiple fallback methods
    let statementTotal = 0;

    // Method 1: From populated statement object
    if (ccStatement.statementId && typeof ccStatement.statementId === 'object') {
      statementTotal = ccStatement.statementId.total || 0;
    }

    // Method 2: From statementTotals prop (most reliable)
    if (statementTotal === 0) {
      statementTotal = statementTotals[statementId] || 0;
    }

    // Find all bank transactions linked to this same statement (needed for Method 3)
    const linkedTransactions = allTransactions.filter(txn =>
      txn.linkedCreditCardStatements &&
      txn.linkedCreditCardStatements.some(ccStmt =>
        (ccStmt.statementId?._id || ccStmt.statementId) === statementId
      )
    );

    // Method 3: Calculate from linked transactions if still 0
    if (statementTotal === 0) {
      console.log('Statement total is 0, trying to calculate from transactions for statement:', statementId);
      console.log('Available statement IDs in totals map:', Object.keys(statementTotals));

      // Find all credit card transactions for this statement
      const creditCardTransactions = allTransactions.filter(txn =>
        txn.accountType === 'credit_card' &&
        (txn.statementId === statementId || txn.statementId?._id === statementId)
      );

      console.log('Found credit card transactions for statement:', creditCardTransactions);

      if (creditCardTransactions.length > 0) {
        statementTotal = creditCardTransactions.reduce((sum, txn) => {
          const debitAmount = txn.debit || 0;
          const creditAmount = txn.credit || 0;
          return sum + debitAmount - creditAmount; // For credit cards: debits are charges, credits are payments
        }, 0);
        console.log('Calculated statement total from credit card transactions:', statementTotal);
      } else {
        // If no credit card transactions found, use the combined paid amount as the statement total
        // This happens when the statement isn't in our statements list but is linked to bank transactions
        console.log('No credit card transactions found, using combined paid amount as statement total');
        statementTotal = linkedTransactions.reduce((sum, txn) => {
          return sum + Math.abs(txn.debit || txn.credit || 0);
        }, 0) + linkedTransactions.reduce((sum, txn) => {
          const txnCcStatement = txn.linkedCreditCardStatements.find(ccStmt =>
            (ccStmt.statementId?._id || ccStmt.statementId) === statementId
          );
          return sum + (txnCcStatement?.adjustmentAmount || 0);
        }, 0);
        console.log('Using combined amount as statement total:', statementTotal);
      }
    }

    // Calculate total bank payments (sum of all transaction amounts)
    const totalBankPayments = linkedTransactions.reduce((sum, txn) => {
      return sum + Math.abs(txn.debit || txn.credit || 0);
    }, 0);

    // Calculate total adjustments across all linked transactions
    const totalAdjustments = linkedTransactions.reduce((sum, txn) => {
      const txnCcStatement = txn.linkedCreditCardStatements.find(ccStmt =>
        (ccStmt.statementId?._id || ccStmt.statementId) === statementId
      );
      return sum + (txnCcStatement?.adjustmentAmount || 0);
    }, 0);

    // Calculate combined difference
    const combinedPaidAmount = totalBankPayments + totalAdjustments;
    const combinedDifference = statementTotal - combinedPaidAmount;

    // Current transaction info
    const currentTransactionAmount = Math.abs(transaction.debit || transaction.credit || 0);
    const currentAdjustment = ccStatement.adjustmentAmount || 0;

    return {
      statementTotal,
      currentTransactionAmount,
      currentAdjustment,
      totalBankPayments,
      totalAdjustments,
      combinedPaidAmount,
      combinedDifference,
      linkedTransactionCount: linkedTransactions.length,
      isMultiTransaction: linkedTransactions.length > 1,
      statementId,
    };
  }, [hasLinkedCreditCard, transaction, allTransactions, statementTotals]);

  const handleRemoveMatch = (documentId) => {
    onRemoveMatch?.(transaction.id, documentId);
  };

  const handleManualMatchClick = () => {
    if (isPerfectMatch) {
      // Show confirmation dialog for perfect matches
      setConfirmDialog({
        open: true,
        action: 'add_match',
        message:
          'This transaction is already perfectly matched. Adding more documents will create an excess amount. Do you want to continue?',
        onConfirm: () => {
          onManualMatch?.(transaction);
          setConfirmDialog({ open: false, action: null, message: '', onConfirm: null });
        },
      });
    } else {
      // Proceed directly for partial matches
      onManualMatch?.(transaction);
    }
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({ open: false, action: null, message: '', onConfirm: null });
  };

  // Calculate matching balance for document matches
  const transactionAmount = Math.abs(transaction.debit || transaction.credit || 0);
  const matchedAmount = hasMatches
    ? transaction.matchedDocuments.reduce((sum, doc) => sum + (doc.total || 0), 0)
    : 0;
  const balanceDifference = transactionAmount - matchedAmount;
  const isPartiallyMatched = hasMatches && Math.abs(balanceDifference) > 0.01; // Allow for small rounding differences
  const hasRemainingBalance = balanceDifference > 0.01; // Transaction amount > matched amount
  const hasExcessAmount = balanceDifference < -0.01; // Matched amount > transaction amount
  const isPerfectMatch = hasMatches && Math.abs(balanceDifference) <= 0.01;

  // Credit card status helper function
  const getCreditCardStatusText = () => {
    if (!creditCardCalculation) return "💳 Credit Card Linked";

    const { combinedDifference } = creditCardCalculation;
    if (Math.abs(combinedDifference) <= 0.01) {
      return "✓ CC Perfect Match";
    } else if (combinedDifference > 0.01) {
      return `CC Remaining: ${fCurrency(combinedDifference)}`;
    } else if (combinedDifference < -0.01) {
      return `CC Overpaid: ${fCurrency(Math.abs(combinedDifference))}`;
    } else {
      return "✓ CC Perfect Match";
    }
  };

  // Determine overall status priority (credit card takes precedence)
  const getOverallStatus = () => {
    if (hasLinkedCreditCard) {
      if (creditCardCalculation && Math.abs(creditCardCalculation.combinedDifference) <= 0.01) {
        return { type: 'cc-perfect', color: 'success.main', icon: 'mdi:credit-card-check' };
      } else if (creditCardCalculation && creditCardCalculation.combinedDifference > 0.01) {
        return { type: 'cc-remaining', color: 'warning.main', icon: 'mdi:credit-card-minus' };
      } else {
        return { type: 'cc-overpaid', color: 'error.main', icon: 'mdi:credit-card-plus' };
      }
    } else if (isPerfectMatch) {
      return { type: 'perfect', color: 'success.main', icon: 'mdi:check-circle' };
    } else if (hasMatches) {
      return { type: 'partial', color: 'warning.main', icon: 'mdi:alert-circle' };
    } else {
      return { type: 'unmatched', color: 'grey.400', icon: 'mdi:link-off' };
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {index}.
          </Typography>
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              size="small"
              onClick={() => onToggleExpand(transaction.id)}
              sx={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            >
              <Iconify icon="mdi:chevron-right" width={16} />
            </IconButton>

            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: overallStatus.color,
                }}
              >
                <Iconify icon={overallStatus.icon} width={16} />
              </Avatar>

              {(hasAnyMatches) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    bgcolor: hasLinkedCreditCard ? 'secondary.main' : 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    border: '2px solid white'
                  }}
                >
                  {hasLinkedCreditCard ? (
                    creditCardCalculation?.isMultiTransaction ? 'CC+' : 'CC'
                  ) : (
                    transaction.matchedDocuments.length
                  )}
                </Box>
              )}
            </Box>
          </Stack>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{transaction.date}</Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" fontWeight="medium">
            {transaction.description}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {transaction.source}
          </Typography>
        </TableCell>

        <TableCell>
          <Chip label={transaction.category} size="small" variant="outlined" />
        </TableCell>

        <TableCell align="right">
          {transaction.debit && (
            <Typography variant="body2" color="error.main">
              -{fCurrency(transaction.debit)}
            </Typography>
          )}
        </TableCell>

        <TableCell align="right">
          {transaction.credit && (
            <Typography variant="body2" color="success.main">
              +{fCurrency(transaction.credit)}
            </Typography>
          )}
        </TableCell>

        <TableCell>
          <Stack direction="column" spacing={0.5}>
            <Stack direction="row" spacing={1}>
              {hasLinkedCreditCard ? (
                <Chip
                  label="CC Linked"
                  size="small"
                  color="secondary"
                  variant="outlined"
                  icon={<Iconify icon="mdi:credit-card" width={14} />}
                />
              ) : hasMatches ? (
                <Chip
                  label={`${transaction.matchedDocuments.length} matched`}
                  size="small"
                  color={isPartiallyMatched ? 'warning' : 'success'}
                  variant="outlined"
                />
              ) : (
                <Chip label="Unmatched" size="small" color="error" variant="outlined" />
              )}
            </Stack>

            {/* Status Display */}
            {hasLinkedCreditCard && (
              <Typography
                variant="caption"
                color={
                  creditCardCalculation && Math.abs(creditCardCalculation.combinedDifference) <= 0.01
                    ? "success.main"
                    : creditCardCalculation && creditCardCalculation.combinedDifference > 0.01
                      ? "warning.main"
                      : "error.main"
                }
                sx={{ fontSize: '0.65rem' }}
              >
                {getCreditCardStatusText()}
              </Typography>
            )}
            {!hasLinkedCreditCard && hasRemainingBalance && (
              <Typography variant="caption" color="warning.main" sx={{ fontSize: '0.65rem' }}>
                Remaining: {fCurrency(Math.abs(balanceDifference))}
              </Typography>
            )}
            {!hasLinkedCreditCard && hasExcessAmount && (
              <Typography variant="caption" color="error.main" sx={{ fontSize: '0.65rem' }}>
                Excess: {fCurrency(Math.abs(balanceDifference))}
              </Typography>
            )}
            {!hasLinkedCreditCard && isPerfectMatch && (
              <Typography variant="caption" color="success.main" sx={{ fontSize: '0.65rem' }}>
                ✓ Perfect Match
              </Typography>
            )}
          </Stack>
        </TableCell>

        <TableCell>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant={hasLinkedCreditCard ? "text" : hasMatches ? "text" : "outlined"}
              color={hasLinkedCreditCard ? "secondary" : isPerfectMatch ? "success" : hasMatches ? "warning" : "primary"}
              onClick={handleManualMatchClick}
              disabled={hasLinkedCreditCard}
              startIcon={
                <Iconify icon={hasLinkedCreditCard ? "mdi:credit-card" : hasMatches ? "mdi:plus" : "mdi:link"} />
              }
              sx={{
                minWidth: hasLinkedCreditCard || hasMatches ? 'auto' : undefined,
                fontSize: '0.75rem'
              }}
            >
              {hasLinkedCreditCard ? 'CC Linked' : hasMatches ? 'Add More' : 'Match'}
            </Button>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Matched Documents - Separated by Credits and Debits */}
      {isExpanded &&
        hasMatches &&
        (() => {
          // Separate documents by type
          const creditDocuments = transaction.matchedDocuments.filter(
            (doc) => doc.documentType === 'Invoice'
          );
          const debitDocuments = transaction.matchedDocuments.filter(
            (doc) => doc.documentType === 'Receipt' || doc.documentType === 'Bill'
          );

          return (
            <>
              {/* Credit Documents Section */}
              {creditDocuments.length > 0 && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      sx={{ py: 1, border: 0, bgcolor: 'success.lighter', width: '100%' }}
                    >
                      <Box sx={{ pl: 4 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Iconify icon="mdi:arrow-up" width={16} sx={{ color: 'success.main' }} />
                          <Typography variant="subtitle2" color="success.dark" fontWeight="bold">
                            Credit Documents ({creditDocuments.length})
                          </Typography>
                          <Typography variant="caption" color="success.dark">
                            Total:{' '}
                            {fCurrency(
                              creditDocuments.reduce((sum, doc) => sum + (doc.total || 0), 0)
                            )}
                          </Typography>
                        </Stack>
                      </Box>
                    </TableCell>
                  </TableRow>
                  {creditDocuments.map((document) => (
                    <React.Fragment key={`${transaction.id}-credit-${document._id}`}>
                      {/* Document Header Row */}
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          sx={{ py: 1, border: 0, bgcolor: 'background.neutral', width: '100%' }}
                        >
                          <Box sx={{ pl: 6, overflow: 'hidden' }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    bgcolor: 'primary.main',
                                  }}
                                >
                                  <Iconify icon="mdi:file-invoice" width={12} />
                                </Avatar>

                                <Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                    sx={{
                                      fontSize: '0.875rem',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      maxWidth: '400px',
                                    }}
                                  >
                                    {getVendorName(document)} • {document.documentType} •{' '}
                                    {getDocumentDate(document)}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="success.main"
                                    fontWeight="bold"
                                  >
                                    Total: {fCurrency(document.total || 0)}
                                  </Typography>
                                </Box>
                              </Stack>

                              <Stack direction="row" spacing={1}>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => onViewDocument?.(document)}
                                  title="View Document Details"
                                >
                                  <Iconify icon="mdi:eye" width={14} />
                                </IconButton>

                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveMatch(document._id)}
                                  title="Remove Match"
                                >
                                  <Iconify icon="mdi:close" width={14} />
                                </IconButton>
                              </Stack>
                            </Stack>
                          </Box>
                        </TableCell>
                      </TableRow>

                      {/* Document Items Rows */}
                      <InvoiceItemsRows
                        document={document}
                        isInvoice={document.documentType === 'Invoice'}
                      />
                    </React.Fragment>
                  ))}
                </>
              )}

              {/* Debit Documents Section */}
              {debitDocuments.length > 0 && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      sx={{ py: 1, border: 0, bgcolor: 'error.lighter', width: '100%' }}
                    >
                      <Box sx={{ pl: 4 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Iconify icon="mdi:arrow-down" width={16} sx={{ color: 'error.main' }} />
                          <Typography variant="subtitle2" color="error.dark" fontWeight="bold">
                            Debit Documents ({debitDocuments.length})
                          </Typography>
                          <Typography variant="caption" color="error.dark">
                            Total:{' '}
                            {fCurrency(
                              debitDocuments.reduce((sum, doc) => sum + (doc.total || 0), 0)
                            )}
                          </Typography>
                        </Stack>
                      </Box>
                    </TableCell>
                  </TableRow>
                  {debitDocuments.map((document) => (
                    <React.Fragment key={`${transaction.id}-debit-${document._id}`}>
                      {/* Document Header Row */}
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          sx={{ py: 1, border: 0, bgcolor: 'background.neutral', width: '100%' }}
                        >
                          <Box sx={{ pl: 6, overflow: 'hidden' }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    bgcolor:
                                      document.documentType === 'Bill'
                                        ? 'info.main'
                                        : 'secondary.main',
                                  }}
                                >
                                  <Iconify
                                    icon={
                                      document.documentType === 'Bill'
                                        ? 'mdi:file-document'
                                        : 'mdi:receipt'
                                    }
                                    width={12}
                                  />
                                </Avatar>

                                <Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                    sx={{
                                      fontSize: '0.875rem',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      maxWidth: '400px',
                                    }}
                                  >
                                    {getVendorName(document)} • {document.documentType} •{' '}
                                    {getDocumentDate(document)}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="error.main"
                                    fontWeight="bold"
                                  >
                                    Total: {fCurrency(document.total || 0)}
                                  </Typography>
                                </Box>
                              </Stack>

                              <Stack direction="row" spacing={1}>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => onViewDocument?.(document)}
                                  title="View Document Details"
                                >
                                  <Iconify icon="mdi:eye" width={14} />
                                </IconButton>

                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveMatch(document._id)}
                                  title="Remove Match"
                                >
                                  <Iconify icon="mdi:close" width={14} />
                                </IconButton>
                              </Stack>
                            </Stack>
                          </Box>
                        </TableCell>
                      </TableRow>

                      {/* Document Items Rows */}
                      <InvoiceItemsRows
                        document={document}
                        isInvoice={document.documentType === 'Invoice'}
                      />
                    </React.Fragment>
                  ))}
                </>
              )}
            </>
          );
        })()}

      {/* Linked Credit Card Statements */}
      {isExpanded &&
        transaction.linkedCreditCardStatements &&
        transaction.linkedCreditCardStatements.length > 0 &&
        transaction.linkedCreditCardStatements.map((ccStatement, index) => {
          // Calculate combined info for this statement
          const statementId = ccStatement.statementId?._id || ccStatement.statementId;
          const statementTotal = statementTotals[statementId] || 0;

          // Find all transactions linked to this same statement
          const linkedTransactions = allTransactions.filter(txn =>
            txn.linkedCreditCardStatements &&
            txn.linkedCreditCardStatements.some(ccStmt =>
              (ccStmt.statementId?._id || ccStmt.statementId) === statementId
            )
          );

          // Calculate totals
          const totalBankPayments = linkedTransactions.reduce((sum, txn) => {
            return sum + Math.abs(txn.debit || txn.credit || 0);
          }, 0);

          const totalAdjustments = linkedTransactions.reduce((sum, txn) => {
            const txnCcStatement = txn.linkedCreditCardStatements.find(ccStmt =>
              (ccStmt.statementId?._id || ccStmt.statementId) === statementId
            );
            return sum + (txnCcStatement?.adjustmentAmount || 0);
          }, 0);

          const combinedPaidAmount = totalBankPayments + totalAdjustments;
          const combinedDifference = statementTotal - combinedPaidAmount;

          const currentTransactionAmount = Math.abs(transaction.debit || transaction.credit || 0);
          const currentAdjustment = ccStatement.adjustmentAmount || 0;

          return (
            <React.Fragment key={`${transaction.id}-cc-${statementId || index}`}>
              {/* Credit Card Statement Header Row */}
              <TableRow>
                <TableCell
                  colSpan={9}
                  sx={{
                    py: 2.5,
                    border: 0,
                    bgcolor: 'rgba(103, 58, 183, 0.04)',
                    borderLeft: '4px solid',
                    borderLeftColor: 'secondary.main',
                    width: '100%',
                  }}
                >
                  <Box sx={{ pl: 4, pr: 2 }}>
                    <Stack direction="row" alignItems="flex-start" spacing={3}>
                      {/* Left Section - Icon and Basic Info */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minWidth: 0, flex: '0 0 auto' }}>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: 'secondary.main',
                            boxShadow: 2,
                          }}
                        >
                          <Iconify icon="mdi:credit-card" width={24} />
                        </Avatar>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Typography variant="h6" fontWeight="bold" color="secondary.main" sx={{ fontSize: '1.1rem' }}>
                              Credit Card Statement
                            </Typography>
                            <Chip
                              label="CC"
                              size="small"
                              color="secondary"
                              variant="filled"
                              sx={{
                                fontSize: '0.7rem',
                                height: 22,
                                fontWeight: 'bold'
                              }}
                            />
                            {linkedTransactions.length > 1 && (
                              <Chip
                                label={`${linkedTransactions.length} Txns`}
                                size="small"
                                color="info"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 22,
                                  fontWeight: 'medium'
                                }}
                              />
                            )}
                          </Stack>

                          <Typography variant="body2" color="text.primary" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.875rem' }} noWrap>
                            {ccStatement.statementId?.fileName || `Statement ${index + 1}`}
                          </Typography>

                          {ccStatement.statementId?.statementPeriod && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                              Period: {getDocumentDate(ccStatement.statementId.statementPeriod.startDate)} - {getDocumentDate(ccStatement.statementId.statementPeriod.endDate)}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Middle Section - Financial Details */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={2} justifyContent="space-around">
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                              Statement Total
                            </Typography>
                            <Typography variant="h6" color="secondary.main" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                              {fCurrency(statementTotal)}
                            </Typography>
                          </Box>

                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                              This Transaction
                            </Typography>
                            <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                              {fCurrency(currentTransactionAmount)}
                            </Typography>
                            {currentAdjustment > 0 && (
                              <Typography variant="caption" color="info.main" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                + Adj: {fCurrency(currentAdjustment)}
                              </Typography>
                            )}
                          </Box>

                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                              Total Paid
                            </Typography>
                            <Typography variant="h6" color="success.main" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                              {fCurrency(combinedPaidAmount)}
                            </Typography>
                          </Box>

                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                              Difference
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              sx={{
                                fontSize: '1.1rem',
                                color: Math.abs(combinedDifference) <= 0.01
                                  ? 'success.main'
                                  : combinedDifference > 0
                                    ? 'warning.main'
                                    : 'error.main'
                              }}
                            >
                              {fCurrency(combinedDifference)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Right Section - Actions */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: '0 0 auto' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => router.push(`${paths.dashboard.statements}/${statementId}`)}
                          startIcon={<Iconify icon="mdi:eye" />}
                          sx={{
                            fontSize: '0.75rem',
                            minWidth: 'auto',
                            px: 1.5,
                            py: 0.5,
                            fontWeight: 600
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="info"
                          onClick={() => onEditAdjustment?.(transaction, ccStatement, currentAdjustment)}
                          startIcon={<Iconify icon="mdi:pencil" />}
                          sx={{
                            fontSize: '0.75rem',
                            minWidth: 'auto',
                            px: 1.5,
                            py: 0.5,
                            fontWeight: 600
                          }}
                        >
                          Edit Adj
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => { onUnlinkCreditCard(statementId, transaction.id) }}
                          startIcon={<Iconify icon="mdi:link-off" />}
                          sx={{
                            fontSize: '0.75rem',
                            minWidth: 'auto',
                            px: 1.5,
                            py: 0.5,
                            fontWeight: 600
                          }}
                        >
                          Unlink
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                </TableCell>
              </TableRow>
            </React.Fragment>
          );
        })}

      {/* No matches message */}
      {isExpanded && !hasAnyMatches && (
        <TableRow>
          <TableCell colSpan={9} sx={{ py: 2, border: 0, width: '100%' }}>
            <Box sx={{ textAlign: 'center', pl: 6 }}>
              <Iconify icon="mdi:link-off" width={32} sx={{ color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No matched documents
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Click "Match" to manually link documents to this transaction
              </Typography>
            </Box>
          </TableCell>
        </TableRow>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleConfirmDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:alert-circle" width={24} sx={{ color: 'warning.main' }} />
            <Typography variant="h6">Confirm Action</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {confirmDialog.message}
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Transaction Amount:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {fCurrency(transactionAmount)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Currently Matched:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {fCurrency(matchedAmount)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  color={
                    isPerfectMatch
                      ? 'success.main'
                      : hasRemainingBalance
                        ? 'warning.main'
                        : 'error.main'
                  }
                >
                  {isPerfectMatch
                    ? 'Perfect Match'
                    : hasRemainingBalance
                      ? `${fCurrency(Math.abs(balanceDifference))} Remaining`
                      : `${fCurrency(Math.abs(balanceDifference))} Excess`}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color="warning"
            startIcon={<Iconify icon="mdi:check" />}
          >
            Continue Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
