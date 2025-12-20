import { StatementTransactionView } from 'src/sections/transactions/view/statement-transaction-view';

// ----------------------------------------------------------------------

export const metadata = {
    title: 'Cash Account Transactions',
};

// ----------------------------------------------------------------------

export default function CashAccountTransactionsPage() {
    return <StatementTransactionView />;
}
