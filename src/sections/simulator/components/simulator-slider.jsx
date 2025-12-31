import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

export function SimulatorSlider({ label, baselineValue, currentValue, onChange, min, max }) {
    const percentChange = baselineValue > 0 ? ((currentValue - baselineValue) / baselineValue) * 100 : 0;
    const [localValue, setLocalValue] = useState(percentChange);

    useEffect(() => {
        setLocalValue(percentChange);
    }, [percentChange]);

    const handleSliderChange = (event, newValue) => {
        setLocalValue(newValue);
    };

    const handleSliderCommitted = (event, newValue) => {
        const adjustedValue = baselineValue * (1 + newValue / 100);
        onChange(Math.round(adjustedValue));
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    ${currentValue.toLocaleString()}
                </Typography>
            </Box>

            <Slider
                value={localValue}
                onChange={handleSliderChange}
                onChangeCommitted={handleSliderCommitted}
                min={min}
                max={max}
                step={1}
                marks={[
                    { value: min, label: `${min}%` },
                    { value: 0, label: 'Baseline' },
                    { value: max, label: `+${max}%` },
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value > 0 ? '+' : ''}${Math.round(value)}%`}
                sx={{
                    '& .MuiSlider-markLabel': {
                        fontSize: '0.65rem',
                    },
                }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                    Baseline: ${baselineValue.toLocaleString()}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 500,
                        color:
                            localValue > 0
                                ? 'success.main'
                                : localValue < 0
                                    ? 'error.main'
                                    : 'text.secondary',
                    }}
                >
                    {localValue > 0 ? '+' : ''}
                    {localValue.toFixed(1)}%
                </Typography>
            </Box>
        </Box>
    );
}
