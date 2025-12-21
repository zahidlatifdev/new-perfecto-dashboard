import { Controller, useFormContext } from 'react-hook-form';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export function RHFSelect({ name, native, maxHeight = 220, children, helperText, ...other }) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <TextField
                    {...field}
                    select
                    fullWidth
                    SelectProps={{
                        native,
                        MenuProps: {
                            PaperProps: {
                                sx: {
                                    ...(!native && {
                                        maxHeight: typeof maxHeight === 'number' ? maxHeight : 'unset',
                                    }),
                                },
                            },
                        },
                        sx: { textTransform: 'capitalize' },
                    }}
                    error={!!error}
                    helperText={error ? error?.message : helperText}
                    {...other}
                >
                    {children}
                </TextField>
            )}
        />
    );
}

