'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';

const timeSlots = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
];

export function ScheduleCallModal({ open, onOpenChange }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        notes: '',
    });

    const handleSchedule = () => {
        // In a real app, this would send to an API
        console.log('Scheduling call:', formData);
        onOpenChange(false);
        // Show success message
    };

    return (
        <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: (theme) => theme.palette.primary.main + '20',
                        }}
                    >
                        <Iconify icon="mdi:phone" width={20} color="primary.main" />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={600}>
                            Schedule a Call
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Let's discuss how we can help with your bookkeeping
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
                <TextField
                    label="Full Name"
                    fullWidth
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                    />
                    <TextField
                        label="Phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                    />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                        label="Preferred Date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                            min: new Date().toISOString().split('T')[0],
                        }}
                    />
                    <TextField
                        select
                        label="Preferred Time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    >
                        {timeSlots.map((slot) => (
                            <MenuItem key={slot} value={slot}>
                                {slot}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                <TextField
                    label="Additional Notes (optional)"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Tell us about your business and bookkeeping needs..."
                />

                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleSchedule}
                    startIcon={<Iconify icon="mdi:calendar-check" width={20} />}
                    disabled={!formData.name || !formData.email || !formData.date || !formData.time}
                >
                    Schedule Call
                </Button>
            </DialogContent>
        </Dialog>
    );
}
