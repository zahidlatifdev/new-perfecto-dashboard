'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuthContext } from 'src/auth/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TablePaginationCustom } from 'src/components/table';
import axios, { endpoints } from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

const ACCOUNT_TYPE_TABS = [
  { value: 'bank_account', label: 'Bank Accounts', icon: 'mdi:bank' },
  { value: 'credit_line', label: 'Credit Cards', icon: 'mdi:credit-card' },
  { value: 'loan_account', label: 'Loan Accounts', icon: 'mdi:cash' },
];

const TABLE_HEAD = [
  { id: 'date', label: 'Date', width: 120 },
  { id: 'description', label: 'Description', width: 250 },
  { id: 'vendor', label: 'Vendor', width: 150 },
  { id: 'category', label: 'Category', width: 180 },
  { id: 'account', label: 'Account', width: 150 },
  { id: 'type', label: 'Type', width: 100 },
  { id: 'amount', label: 'Amount', align: 'right', width: 120 },
  { id: 'actions', label: 'Actions', width: 100 },
];

// ----------------------------------------------------------------------

export function TransactionsView() {
  const { company } = useAuthContext();

  const [currentTab, setCurrentTab] = useState('bank_account');
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filters
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Fetch accounts based on current tab
  const fetchAccounts = useCallback(async () => {
    if (!company?._id) return;

    try {
      const response = await axios.get(endpoints.accounts.list, {
        params: { 
          companyId: company._id,
          type: currentTab,
        },
      });
      
      const allAccounts = response.data.data?.allAccounts || [];
      setAccounts(allAccounts);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  }, [company, currentTab]);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!company?._id) return;

    try {
      setLoading(true);
      setErrorMsg('');

      const params = {
        companyId: company._id,
        accountType: currentTab,
        page: page + 1,
        limit: rowsPerPage,
      };

      if (selectedAccount !== 'all') {
        params.accountId = selectedAccount;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await axios.get(endpoints.transactions.list, { params });
      
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setErrorMsg(error.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [company, currentTab, page, rowsPerPage, selectedAccount, searchQuery]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setSelectedAccount('all');
    setPage(0);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await axios.delete(endpoints.transactions.delete(transactionId));
      fetchTransactions();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      setErrorMsg(error.message || 'Failed to delete transaction');
    }
  };

  const filteredTransactions = transactions.filter((txn) => {
    if (searchQuery && !txn.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'debit':
        return 'error';
      case 'credit':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4">Transactions</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              View and manage all your transactions
            </Typography>
          </div>
        </Stack>

        {!!errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        <Card>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{
              px: 3,
              bgcolor: 'background.neutral',
            }}
          >
            {ACCOUNT_TYPE_TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={<Iconify icon={tab.icon} width={20} />}
                iconPosition="start"
              />
            ))}
          </Tabs>

          <Stack spacing={2} sx={{ p: 3 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />,
                }}
              />

              <TextField
                select
                sx={{ minWidth: 200 }}
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                label="Account"
              >
                <MenuItem value="all">All Accounts</MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account._id} value={account._id}>
                    {account.accountName}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>

          <TableContainer sx={{ overflow: 'unset' }}>
            <Scrollbar>
              <Table sx={{ minWidth: 960 }}>
                <TableHead>
                  <TableRow>
                    {TABLE_HEAD.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        align={headCell.align || 'left'}
                        sx={{ width: headCell.width, minWidth: headCell.minWidth }}
                      >
                        {headCell.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                        <Iconify icon="mdi:receipt-text-outline" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          No Transactions Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {currentTab === 'bank_account' && 'No bank account transactions yet'}
                          {currentTab === 'credit_line' && 'No credit card transactions yet'}
                          {currentTab === 'loan_account' && 'No loan account transactions yet'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction, index) => (
                      <TableRow key={transaction._id} hover>
                        <TableCell>{fDate(transaction.date)}</TableCell>
                        <TableCell>{transaction.description || 'N/A'}</TableCell>
                        <TableCell>{transaction.vendor || 'N/A'}</TableCell>
                        <TableCell>
                          <Stack direction="column" spacing={0.5}>
                            <Typography variant="body2">{transaction.category || 'Uncategorized'}</Typography>
                            {transaction.subCategory && (
                              <Typography variant="caption" color="text.secondary">
                                {transaction.subCategory}
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {transaction.accountId?.accountName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type || 'N/A'}
                            size="small"
                            color={getTypeColor(transaction.type)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              color: transaction.type === 'debit' ? 'error.main' : 'success.main',
                              fontWeight: 600,
                            }}
                          >
                            {transaction.type === 'debit' && '-'}
                            {fCurrency(transaction.amount || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTransaction(transaction._id)}
                          >
                            <Iconify icon="eva:trash-2-outline" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={filteredTransactions.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>
      </Container>
    </DashboardContent>
  );
}

