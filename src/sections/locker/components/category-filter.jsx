import { Box, Chip, Stack } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { DOCUMENT_CATEGORIES } from '../constants';

export function CategoryFilter({ selected, onSelect }) {
    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                flexWrap: 'wrap',
                gap: 1,
                '& > *': { mb: 0 },
            }}
        >
            <Chip
                label="All Documents"
                onClick={() => onSelect('all')}
                color={selected === 'all' ? 'primary' : 'default'}
                sx={{
                    fontWeight: selected === 'all' ? 600 : 400,
                    cursor: 'pointer',
                }}
            />
            {DOCUMENT_CATEGORIES.map((category) => (
                <Chip
                    key={category.id}
                    label={category.label}
                    icon={
                        <Box
                            component="span"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                ml: 0.5,
                            }}
                        >
                            <Iconify icon={category.icon} width={16} />
                        </Box>
                    }
                    onClick={() => onSelect(category.id)}
                    color={selected === category.id ? 'primary' : 'default'}
                    sx={{
                        fontWeight: selected === category.id ? 600 : 400,
                        cursor: 'pointer',
                    }}
                />
            ))}
        </Stack>
    );
}
