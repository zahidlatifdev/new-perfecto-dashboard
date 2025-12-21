import { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export function RHFCode({ name, inputs = 6, ...other }) {
  const { control } = useFormContext();
  const inputRefs = useRef([]);

  const handlePaste = (event, field, currentIndex) => {
    event.preventDefault();
    
    const pastedData = event.clipboardData.getData('text');
    
    // Extract only digits from pasted text
    const digits = pastedData.replace(/\D/g, '').slice(0, inputs);
    
    if (digits.length === 0) return;
    
    // Create new value array starting from current index
    const currentValue = field.value || '';
    const valueArray = currentValue.split('').slice(0, inputs);
    
    // Fill digits starting from current index
    digits.split('').forEach((digit, idx) => {
      const targetIndex = currentIndex + idx;
      if (targetIndex < inputs) {
        valueArray[targetIndex] = digit;
      }
    });
    
    // Update field value
    const newValue = valueArray.join('');
    field.onChange(newValue);
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = Math.min(
      currentIndex + digits.length,
      inputs - 1
    );
    
    setTimeout(() => {
      if (inputRefs.current[nextEmptyIndex]) {
        inputRefs.current[nextEmptyIndex].focus();
      }
    }, 0);
  };

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
                inputRef={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
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
                  
                  // Only allow numeric input
                  const inputValue = event.target.value.replace(/\D/g, '');
                  
                  if (inputValue.length > 0) {
                    newValue[index] = inputValue[0];
                  } else {
                    newValue[index] = '';
                  }
                  
                  field.onChange(newValue.join(''));

                  // Auto-focus next input if value entered
                  if (inputValue.length > 0 && index < inputs - 1) {
                    setTimeout(() => {
                      if (inputRefs.current[index + 1]) {
                        inputRefs.current[index + 1].focus();
                      }
                    }, 0);
                  }
                }}
                onPaste={(event) => handlePaste(event, field, index)}
                onKeyDown={(event) => {
                  // Auto-focus previous input on backspace
                  if (event.key === 'Backspace' && !event.target.value && index > 0) {
                    setTimeout(() => {
                      if (inputRefs.current[index - 1]) {
                        inputRefs.current[index - 1].focus();
                      }
                    }, 0);
                  }
                }}
                onFocus={(event) => {
                  // Select all text when focused for easy replacement
                  event.target.select();
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
