import { Box, Button } from '@mui/material';

export function FilterButtons({ filter, onFilterChange }) {
    const filters = [
        { value: 'all', label: 'All Opportunities' },
        { value: 'new', label: 'New' },
        { value: 'reviewing', label: 'Reviewing' },
        { value: 'implemented', label: 'Implemented' },
    ];

    return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {filters.map((filterOption) => (
                <Button
                    key={filterOption.value}
                    variant={filter === filterOption.value ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => onFilterChange(filterOption.value)}
                    sx={{
                        textTransform: 'capitalize',
                        borderRadius: 1,
                        px: 2,
                    }}
                >
                    {filterOption.label}
                </Button>
            ))}
        </Box>
    );
}
