'use client';

import React, { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export function TransactionMatchingCell({
  transaction,
  onManualMatch,
  allTransactions = [],
  statementTotals = {},
  isUpdating = false
}) {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    message: '',
    onConfirm: null,
  });

  const hasMatches = transaction.matchedDocuments && transaction.matchedDocuments.length > 0;
  const hasLinkedCreditCard = transaction.linkedCreditCardStatements && transaction.linkedCreditCardStatements.length > 0;

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

    // Method 3: Calculate from linked transactions if still 0
    if (statementTotal === 0) {
      // Find all credit card transactions for this statement
      const creditCardTransactions = allTransactions.filter(txn =>
        txn.accountType === 'credit_card' &&
        (txn.statementId === statementId || txn.statementId?._id === statementId)
      );

      if (creditCardTransactions.length > 0) {
        statementTotal = creditCardTransactions.reduce((sum, txn) => {
          const debitAmount = txn.debit || 0;
          const creditAmount = txn.credit || 0;
          return sum + debitAmount - creditAmount; // For credit cards: debits are charges, credits are payments
        }, 0);
      }
    }

    // Find all bank transactions linked to this same statement
    const linkedTransactions = allTransactions.filter(txn =>
      txn.accountType === 'bank_account' && // Only bank transactions
      txn.linkedCreditCardStatements &&
      txn.linkedCreditCardStatements.some(ccStmt =>
        (ccStmt.statementId?._id || ccStmt.statementId) === statementId
      )
    );

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

    const result = {
      statementTotal,
      currentTransactionAmount,
      currentAdjustment,
      totalBankPayments,
      totalAdjustments,
      combinedPaidAmount,
      combinedDifference,
      linkedTransactionCount: linkedTransactions.length,
      isMultiTransaction: linkedTransactions.length > 1,
      // Debug info
      statementId,
      linkedTransactions: linkedTransactions.map(t => ({ id: t.id, amount: Math.abs(t.debit || t.credit || 0) }))
    };
    return result;
  }, [hasLinkedCreditCard, transaction, allTransactions, statementTotals]);

  // Check if credit card linking should be available
  const canLinkCreditCard = useMemo(() => {
    // Must be a debit transaction (bank payment)
    if (!transaction.debit || transaction.debit <= 0) {
      return false;
    }
    if (hasMatches || hasLinkedCreditCard || transaction.accountType !== 'bank_account') {
      return false;
    }
    return true;
  }, [transaction, hasMatches, hasLinkedCreditCard]);


  // Calculate matching balance (remaining, excess, or perfect match)
  const transactionAmount = Math.abs(transaction.debit || transaction.credit || 0);
  const matchedAmount = hasMatches
    ? transaction.matchedDocuments.reduce((sum, doc) => sum + (doc.total || 0), 0)
    : 0;
  const balanceDifference = transactionAmount - matchedAmount;
  const hasRemainingBalance = balanceDifference > 0.01;
  const hasExcessAmount = balanceDifference < -0.01;
  const isPerfectMatch = hasMatches && Math.abs(balanceDifference) <= 0.01;

  const handleManualMatchClick = () => {
    if (isPerfectMatch) {
      setConfirmDialog({
        open: true,
        message: 'This transaction is already perfectly matched. Adding more documents will create an excess amount. Do you want to continue?',
        onConfirm: () => {
          onManualMatch?.(transaction);
          setConfirmDialog({ open: false, message: '', onConfirm: null });
        },
      });
    } else {
      onManualMatch?.(transaction);
    }
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({ open: false, message: '', onConfirm: null });
  };

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

  return (
    <>
      <Stack direction="column" spacing={0.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: hasLinkedCreditCard ? 'secondary.main' :
                  isPerfectMatch ? 'success.main' :
                    hasMatches ? 'warning.main' :
                      'grey.400'
              }}
            >
              {isUpdating ? (
                <CircularProgress size={14} sx={{ color: 'white' }} />
              ) : (
                <Iconify
                  icon={
                    hasLinkedCreditCard ? 'mdi:credit-card' :
                      isPerfectMatch ? 'mdi:check-circle' :
                        hasMatches ? 'mdi:alert-circle' :
                          'mdi:link-off'
                  }
                  width={16}
                />
              )}
            </Avatar>

            {(hasMatches || hasLinkedCreditCard) && !isUpdating && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  bgcolor: hasLinkedCreditCard ? 'secondary.main' : 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
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

          <Button
            size="small"
            variant={hasLinkedCreditCard ? "text" : hasMatches ? "text" : "outlined"}
            color={hasLinkedCreditCard ? "secondary" : isPerfectMatch ? "success" : hasMatches ? "warning" : "primary"}
            onClick={handleManualMatchClick}
            disabled={hasLinkedCreditCard || isUpdating}
            startIcon={
              isUpdating ? (
                <CircularProgress size={12} />
              ) : (
                <Iconify icon={hasLinkedCreditCard ? "mdi:credit-card" : hasMatches ? "mdi:plus" : "mdi:link"} />
              )
            }
            sx={{
              minWidth: hasLinkedCreditCard || hasMatches ? 'auto' : undefined,
              fontSize: '0.75rem'
            }}
          >
            {isUpdating ? 'Updating...' : hasLinkedCreditCard ? 'CC Linked' : hasMatches ? 'Add More' : 'Match'}
          </Button>
        </Stack>

        {/* Status Display with validation message */}
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
            sx={{ fontSize: '0.65rem', pl: 0.5 }}
          >
            {getCreditCardStatusText()}
          </Typography>
        )}
        {!hasLinkedCreditCard && hasRemainingBalance && (
          <Typography variant="caption" color="warning.main" sx={{ fontSize: '0.65rem', pl: 0.5 }}>
            Remaining: {fCurrency(Math.abs(balanceDifference))}
          </Typography>
        )}
        {!hasLinkedCreditCard && hasExcessAmount && (
          <Typography variant="caption" color="error.main" sx={{ fontSize: '0.65rem', pl: 0.5 }}>
            Excess: {fCurrency(Math.abs(balanceDifference))}
          </Typography>
        )}
        {!hasLinkedCreditCard && isPerfectMatch && (
          <Typography variant="caption" color="success.main" sx={{ fontSize: '0.65rem', pl: 0.5 }}>
            ✓ Perfect Match
          </Typography>
        )}
      </Stack>

      {/* Pass canLinkCreditCard to parent components */}
      {React.cloneElement(React.Children.only(
        // This will be handled by the parent component
        <div data-can-link-credit-card={canLinkCreditCard} />
      ))}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        maxWidth="sm"
        fullWidth
      >
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
                  color="success.main"
                >
                  Perfect Match
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