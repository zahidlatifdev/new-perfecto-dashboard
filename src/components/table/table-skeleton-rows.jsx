import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------

export function TableSkeletonRows({ rows = 10, columns = [], ...other }) {
    return Array.from({ length: rows }, (_, index) => (
        <TableRow key={index} {...other}>
            {columns.map((column, columnIndex) => (
                <TableCell key={columnIndex} width={column.width}>
                    <Stack spacing={1}>
                        {column.id === 'expand' ? (
                            <Skeleton variant="circular" width={24} height={24} />
                        ) : column.id === 'index' ? (
                            <Skeleton variant="text" width={20} height={16} />
                        ) : column.id === 'date' ? (
                            <Skeleton variant="text" width={80} height={16} />
                        ) : column.id === 'description' ? (
                            <Stack spacing={0.5}>
                                <Skeleton variant="text" width="90%" height={16} />
                                <Skeleton variant="text" width="70%" height={14} />
                            </Stack>
                        ) : column.id === 'category' ? (
                            <Skeleton variant="rectangular" width={120} height={24} sx={{ borderRadius: 1 }} />
                        ) : column.id === 'type' ? (
                            <Skeleton variant="rectangular" width={70} height={20} sx={{ borderRadius: 0.5 }} />
                        ) : column.id === 'debit' || column.id === 'credit' ? (
                            <Skeleton variant="text" width={60} height={16} />
                        ) : column.id === 'matches' ? (
                            <Stack direction="row" spacing={0.5}>
                                <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: 0.5 }} />
                                <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: 0.5 }} />
                            </Stack>
                        ) : column.id === 'actions' ? (
                            <Stack direction="row" spacing={0.5}>
                                <Skeleton variant="circular" width={32} height={32} />
                                <Skeleton variant="circular" width={32} height={32} />
                            </Stack>
                        ) : (
                            <Skeleton variant="text" width="80%" height={16} />
                        )}
                    </Stack>
                </TableCell>
            ))}
        </TableRow>
    ));
}
