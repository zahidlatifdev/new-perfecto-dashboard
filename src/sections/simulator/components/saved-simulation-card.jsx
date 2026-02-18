import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';

import { Iconify } from 'src/components/iconify';

export function SavedSimulationCard({ simulation, onLoad, onDelete }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const isProfit = simulation.totalProfit >= 0;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLoad = () => {
        handleClose();
        onLoad(simulation);
    };

    const handleDelete = () => {
        handleClose();
        onDelete(simulation._id);
    };

    return (
        <Card
            sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                transition: 'all 0.3s',
                '&:hover': {
                    borderColor: 'primary.main',
                    '& .action-button': {
                        opacity: 1,
                    },
                },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {simulation.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Iconify icon="solar:calendar-linear" width={12} />
                        <Typography variant="caption" color="text.secondary">
                            {new Date(simulation.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }}>
                            •
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {simulation.timeHorizon} month projection
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    size="small"
                    onClick={handleClick}
                    className="action-button"
                    sx={{
                        opacity: 0,
                        transition: 'opacity 0.3s',
                    }}
                >
                    <Iconify icon="eva:more-vertical-fill" width={20} />
                </IconButton>
                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    <MenuItem onClick={handleLoad}>
                        <Iconify icon="solar:play-bold" width={20} sx={{ mr: 1 }} />
                        Load Simulation
                    </MenuItem>
                    {onDelete && (
                        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                            <Iconify icon="solar:trash-bin-trash-bold" width={20} sx={{ mr: 1 }} />
                            Delete
                        </MenuItem>
                    )}
                </Menu>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: (theme) =>
                        alpha(isProfit ? theme.palette.success.main : theme.palette.error.main, 0.1),
                }}
            >
                <Iconify
                    icon={isProfit ? 'solar:graph-up-bold' : 'solar:graph-down-bold'}
                    width={24}
                    sx={{ color: isProfit ? 'success.main' : 'error.main' }}
                />
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 'bold',
                            color: isProfit ? 'success.main' : 'error.main',
                        }}
                    >
                        {isProfit ? '+' : ''}
                        {simulation.totalProfit >= 0 ? '$' : '-$'}
                        {Math.abs(simulation.totalProfit).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Total {isProfit ? 'profit' : 'loss'} over {simulation.timeHorizon} months
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                        Income:
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 500,
                            color:
                                (simulation.incomeChangePercent || simulation.incomeChange) > 0
                                    ? 'success.main'
                                    : (simulation.incomeChangePercent || simulation.incomeChange) < 0
                                        ? 'error.main'
                                        : 'text.primary',
                        }}
                    >
                        {(simulation.incomeChangePercent || simulation.incomeChange) > 0 ? '+' : ''}
                        {simulation.incomeChangePercent || simulation.incomeChange}%
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                        Expenses:
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 500,
                            color:
                                (simulation.expenseChangePercent || simulation.expenseChange) < 0
                                    ? 'success.main'
                                    : (simulation.expenseChangePercent || simulation.expenseChange) > 0
                                        ? 'error.main'
                                        : 'text.primary',
                        }}
                    >
                        {(simulation.expenseChangePercent || simulation.expenseChange) > 0 ? '+' : ''}
                        {simulation.expenseChangePercent || simulation.expenseChange}%
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
}
