import { StatementTransactionView } from 'src/sections/transactions/view/statement-transaction-view';

// ----------------------------------------------------------------------

export const metadata = {
    title: 'Bank Statement Transactions',
};

// ----------------------------------------------------------------------

export default function BankStatementTransactionsPage() {
    return <StatementTransactionView />;
}
