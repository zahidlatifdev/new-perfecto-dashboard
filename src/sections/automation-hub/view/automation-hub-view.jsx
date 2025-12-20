'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { CategorySelector } from 'src/components/category-selector';

// ----------------------------------------------------------------------

// Sample categorization rules
const INITIAL_RULES = [
    { 
        id: '1', 
        condition: 'vendor', 
        operator: 'CONTAINS', 
        value: 'Starbucks', 
        category: 'Meals & Entertainment' 
    },
    { 
        id: '2', 
        condition: 'description', 
        operator: 'CONTAINS', 
        value: 'AWS Services', 
        category: 'Software & Subscriptions' 
    },
];

// ----------------------------------------------------------------------

export function AutomationHubView() {
    const [categorizationRules, setCategorizationRules] = useState(INITIAL_RULES);
    const [openNewRuleDialog, setOpenNewRuleDialog] = useState(false);
    const [reminderEnabled, setReminderEnabled] = useState(true);
    const [newRule, setNewRule] = useState({
        condition: 'vendor',
        operator: 'CONTAINS',
        value: '',
        category: '',
    });

    const handleOpenNewRuleDialog = () => {
        setOpenNewRuleDialog(true);
    };

    const handleCloseNewRuleDialog = () => {
        setOpenNewRuleDialog(false);
        setNewRule({
            condition: 'vendor',
            operator: 'CONTAINS',
            value: '',
            category: '',
        });
    };

    const handleNewRuleChange = (e) => {
        setNewRule({
            ...newRule,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddRule = () => {
        const rule = {
            ...newRule,
            id: `rule-${Date.now()}`,
        };
        setCategorizationRules([...categorizationRules, rule]);
        handleCloseNewRuleDialog();
    };

    const handleRemoveRule = (ruleId) => {
        setCategorizationRules(categorizationRules.filter(rule => rule.id !== ruleId));
    };

    const handleToggleReminder = () => {
        setReminderEnabled(!reminderEnabled);
    };

    return (
        <DashboardContent maxWidth="xl">
            <Typography variant="h4" sx={{ mb: 3 }}>
                Automation Hub
            </Typography>

            <Grid container spacing={3}>
                {/* Categorization Rules Card */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Categorization Rules
                        </Typography>
                        
                        <Stack spacing={1.5} sx={{ mb: 2 }}>
                            {categorizationRules.map((rule) => (
                                <Box 
                                    key={rule.id}
                                    sx={{ 
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        bgcolor: 'background.neutral',
                                        p: 1,
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            fontFamily: 'monospace',
                                            flexGrow: 1,
                                            pr: 1,
                                        }}
                                    >
                                        IF {rule.condition} {rule.operator} "{rule.value}" THEN category = "{rule.category}"
                                    </Typography>
                                    
                                    <Tooltip title="Remove Rule">
                                        <IconButton 
                                            size="small" 
                                            color="error"
                                            onClick={() => handleRemoveRule(rule.id)}
                                            sx={{ 
                                                p: 0.5,
                                                '&:hover': { 
                                                    bgcolor: 'error.lighter',
                                                },
                                            }}
                                        >
                                            <Iconify icon="ph:trash-bold" width={16} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            ))}
                        </Stack>
                        
                        <Box sx={{ flexGrow: 1 }} />
                        
                        <Button
                            variant="outlined"
                            color="inherit"
                            size="small"
                            startIcon={<Iconify icon="ph:plus-circle-bold" />}
                            onClick={handleOpenNewRuleDialog}
                            sx={{ 
                                alignSelf: 'flex-start',
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                mt: 2,
                            }}
                        >
                            Add New Rule
                        </Button>
                    </Card>
                </Grid>

                {/* Upload Reminders Card */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Upload Reminders
                        </Typography>
                        
                        <Stack 
                            direction="row" 
                            justifyContent="space-between" 
                            alignItems="center"
                        >
                            <Typography variant="body2">
                                Monthly Statement Reminder (Email)
                            </Typography>
                            
                            <Switch
                                checked={reminderEnabled}
                                onChange={handleToggleReminder}
                                color="success"
                            />
                        </Stack>
                        
                        <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                        >
                            Sent on the 3rd of each month.
                        </Typography>
                    </Card>
                </Grid>
            </Grid>

            {/* Add New Rule Dialog */}
            <Dialog
                open={openNewRuleDialog}
                onClose={handleCloseNewRuleDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Add New Categorization Rule</DialogTitle>
                
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Rules are applied automatically when new transactions are imported
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>IF</Typography>
                            
                            <FormControl size="small" sx={{ width: 120, mr: 1 }}>
                                <Select
                                    name="condition"
                                    value={newRule.condition}
                                    onChange={handleNewRuleChange}
                                >
                                    <MenuItem value="vendor">vendor</MenuItem>
                                    <MenuItem value="description">description</MenuItem>
                                    <MenuItem value="amount">amount</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <FormControl size="small" sx={{ width: 130, mr: 1 }}>
                                <Select
                                    name="operator"
                                    value={newRule.operator}
                                    onChange={handleNewRuleChange}
                                >
                                    <MenuItem value="CONTAINS">CONTAINS</MenuItem>
                                    <MenuItem value="EQUALS">EQUALS</MenuItem>
                                    <MenuItem value="STARTS_WITH">STARTS WITH</MenuItem>
                                    <MenuItem value="ENDS_WITH">ENDS WITH</MenuItem>
                                    <MenuItem value="GREATER_THAN">GREATER THAN</MenuItem>
                                    <MenuItem value="LESS_THAN">LESS THAN</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <TextField
                                size="small"
                                name="value"
                                value={newRule.value}
                                onChange={handleNewRuleChange}
                                sx={{ flexGrow: 1 }}
                                placeholder="Value"
                            />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>THEN category =</Typography>
                            
                            <CategorySelector
                                value={newRule.category}
                                onChange={(value) => setNewRule(prev => ({ ...prev, category: value }))}
                                label="Category"
                                size="small"
                            />
                        </Box>
                    </Stack>
                </DialogContent>
                
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseNewRuleDialog} color="inherit">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAddRule}
                        variant="contained" 
                        color="primary"
                        disabled={!newRule.value || !newRule.category}
                    >
                        Add Rule
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardContent>
    );
}