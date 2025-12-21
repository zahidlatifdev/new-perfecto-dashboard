import { Controller, useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export function RHFCode({ name, inputs = 6, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} justifyContent="center">
            {[...Array(inputs)].map((_, index) => (
              <TextField
                key={index}
                {...field}
                type="text"
                inputProps={{
                  maxLength: 1,
                  sx: {
                    p: 0,
                    textAlign: 'center',
                    width: { xs: 36, sm: 56 },
                    height: { xs: 36, sm: 56 },
                  },
                }}
                value={field.value?.[index] || ''}
                onChange={(event) => {
                  const newValue = field.value ? [...field.value] : new Array(inputs).fill('');
                  newValue[index] = event.target.value;
                  field.onChange(newValue.join(''));

                  // Auto-focus next input
                  if (event.target.value && index < inputs - 1) {
                    const nextInput = event.target.parentElement?.nextElementSibling?.querySelector('input');
                    nextInput?.focus();
                  }
                }}
                onKeyDown={(event) => {
                  // Auto-focus previous input on backspace
                  if (event.key === 'Backspace' && !event.target.value && index > 0) {
                    const prevInput = event.target.parentElement?.previousElementSibling?.querySelector('input');
                    prevInput?.focus();
                  }
                }}
                error={!!error}
              />
            ))}
          </Stack>
          {error && (
            <Stack sx={{ typography: 'caption', color: 'error.main', textAlign: 'center' }}>
              {error?.message}
            </Stack>
          )}
        </Stack>
      )}
    />
  );
}

