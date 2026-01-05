'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { sampleTasks, categoryConfig } from '../data/bookkeepingData';

export function TasksTab() {
    const [tasks, setTasks] = useState(sampleTasks);
    const [filter, setFilter] = useState('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        description: '',
        assignedTo: 'client',
        category: 'general',
        priority: 'medium',
        notes: '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const filteredTasks = tasks.filter((task) => {
        if (filter === 'mine') return task.assignedTo === 'client';
        if (filter === 'bookkeeper') return task.assignedTo === 'bookkeeper';
        if (filter === 'completed') return task.status === 'completed';
        return true;
    });

    const toggleTaskStatus = (taskId) => {
        setTasks(
            tasks.map((task) => {
                if (task.id === taskId) {
                    const newStatus = task.status === 'completed' ? 'open' : 'completed';
                    return { ...task, status: newStatus };
                }
                return task;
            })
        );
    };

    const handleAddTask = () => {
        if (!newTask.description.trim()) return;

        setTasks([
            ...tasks,
            {
                id: Date.now().toString(),
                description: newTask.description,
                dueDate: newTask.dueDate,
                assignedTo: newTask.assignedTo,
                status: 'open',
                category: newTask.category,
                priority: newTask.priority,
                notes: newTask.notes || undefined,
            },
        ]);
        setNewTask({
            description: '',
            assignedTo: 'client',
            category: 'general',
            priority: 'medium',
            notes: '',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        setIsDialogOpen(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <Iconify icon="mdi:check-circle" width={20} sx={{ color: '#16a34a' }} />;
            case 'in_progress':
                return <Iconify icon="mdi:clock-outline" width={20} sx={{ color: '#f59e0b' }} />;
            default:
                return <Iconify icon="mdi:circle-outline" width={20} sx={{ color: 'text.secondary' }} />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            default:
                return 'default';
        }
    };

    const openTasks = tasks.filter((t) => t.status !== 'completed').length;
    const highPriorityTasks = tasks.filter(
        (t) => t.priority === 'high' && t.status !== 'completed'
    ).length;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Stats */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                <Card
                    sx={{
                        p: 1.5,
                        background: (theme) =>
                            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                >
                    <Typography variant="h5" fontWeight={700}>
                        {openTasks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Open Tasks
                    </Typography>
                </Card>
                <Card
                    sx={{
                        p: 1.5,
                        background: `linear-gradient(135deg, ${alpha('#dc2626', 0.1)} 0%, ${alpha('#dc2626', 0.05)} 100%)`,
                        border: `1px solid ${alpha('#dc2626', 0.2)}`,
                    }}
                >
                    <Typography variant="h5" fontWeight={700}>
                        {highPriorityTasks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        High Priority
                    </Typography>
                </Card>
                <Card
                    sx={{
                        p: 1.5,
                        background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`,
                        border: `1px solid ${alpha('#f59e0b', 0.2)}`,
                    }}
                >
                    <Typography variant="h5" fontWeight={700}>
                        {tasks.filter((t) => t.status === 'in_progress').length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        In Progress
                    </Typography>
                </Card>
                <Card
                    sx={{
                        p: 1.5,
                        background: `linear-gradient(135deg, ${alpha('#16a34a', 0.1)} 0%, ${alpha('#16a34a', 0.05)} 100%)`,
                        border: `1px solid ${alpha('#16a34a', 0.2)}`,
                    }}
                >
                    <Typography variant="h5" fontWeight={700}>
                        {tasks.filter((t) => t.status === 'completed').length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Completed
                    </Typography>
                </Card>
            </Box>

            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 1.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Iconify icon="mdi:filter" width={16} color="text.secondary" />
                    {['all', 'mine', 'bookkeeper', 'completed'].map((f) => (
                        <Chip
                            key={f}
                            label={
                                f === 'all'
                                    ? 'All'
                                    : f === 'mine'
                                        ? 'My Tasks'
                                        : f === 'bookkeeper'
                                            ? 'Bookkeeper'
                                            : 'Completed'
                            }
                            onClick={() => setFilter(f)}
                            color={filter === f ? 'primary' : 'default'}
                            size="small"
                            sx={{ cursor: 'pointer' }}
                        />
                    ))}
                </Box>

                <Button
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="mdi:plus" width={16} />}
                    onClick={() => setIsDialogOpen(true)}
                >
                    Add Task
                </Button>
            </Box>

            {/* Task List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {filteredTasks.length === 0 ? (
                    <Card
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            border: '2px dashed',
                            borderColor: 'divider',
                        }}
                    >
                        <Typography color="text.secondary">No tasks found</Typography>
                    </Card>
                ) : (
                    filteredTasks.map((task) => {
                        const isOverdue = task.dueDate < new Date() && task.status !== 'completed';

                        return (
                            <Card
                                key={task.id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 2,
                                    p: 2,
                                    transition: 'all 0.3s',
                                    opacity: task.status === 'completed' ? 0.6 : 1,
                                    bgcolor:
                                        task.status === 'completed'
                                            ? 'action.hover'
                                            : isOverdue
                                                ? alpha('#dc2626', 0.05)
                                                : 'background.paper',
                                    borderColor: isOverdue ? alpha('#dc2626', 0.3) : 'divider',
                                    '&:hover': {
                                        boxShadow: 2,
                                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
                                    },
                                }}
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => toggleTaskStatus(task.id)}
                                    sx={{ mt: 0.25 }}
                                >
                                    {getStatusIcon(task.status)}
                                </IconButton>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                                        <Typography
                                            variant="body2"
                                            fontWeight={500}
                                            sx={{
                                                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                            }}
                                        >
                                            {task.description}
                                        </Typography>
                                        <Chip
                                            label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                            size="small"
                                            color={getPriorityColor(task.priority)}
                                            sx={{ height: 20, fontSize: 10 }}
                                        />
                                    </Box>

                                    {task.notes && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                            {task.notes}
                                        </Typography>
                                    )}

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                            label={categoryConfig[task.category].label}
                                            size="small"
                                            icon={<Iconify icon="mdi:tag" width={12} />}
                                            sx={{
                                                height: 24,
                                                fontSize: '0.75rem',
                                                bgcolor: alpha(categoryConfig[task.category].color, 0.1),
                                                color: categoryConfig[task.category].color,
                                            }}
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            {isOverdue && <Iconify icon="mdi:alert" width={12} sx={{ color: '#dc2626' }} />}
                                            <Iconify icon="mdi:calendar" width={12} color="text.secondary" />
                                            <Typography
                                                variant="caption"
                                                sx={{ color: isOverdue ? '#dc2626' : 'text.secondary', fontWeight: isOverdue ? 500 : 400 }}
                                            >
                                                {isOverdue ? 'Overdue: ' : 'Due '}{' '}
                                                {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Iconify icon="mdi:account" width={12} color="text.secondary" />
                                            <Typography variant="caption" color="text.secondary">
                                                {task.assignedTo === 'client' ? 'You' : 'Sarah (Bookkeeper)'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Chip
                                    label={
                                        task.status === 'in_progress'
                                            ? 'In Progress'
                                            : task.status.charAt(0).toUpperCase() + task.status.slice(1)
                                    }
                                    size="small"
                                    sx={{
                                        height: 24,
                                        fontSize: '0.75rem',
                                        bgcolor:
                                            task.status === 'completed'
                                                ? alpha('#16a34a', 0.1)
                                                : task.status === 'in_progress'
                                                    ? alpha('#f59e0b', 0.1)
                                                    : 'action.hover',
                                        color:
                                            task.status === 'completed'
                                                ? '#16a34a'
                                                : task.status === 'in_progress'
                                                    ? '#f59e0b'
                                                    : 'text.secondary',
                                    }}
                                />
                            </Card>
                        );
                    })
                )}
            </Box>

            {/* Add Task Dialog */}
            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Bookkeeping Task</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField
                        label="Description"
                        fullWidth
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Enter task description..."
                    />

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextField
                            select
                            label="Category"
                            value={newTask.category}
                            onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                        >
                            <MenuItem value="documents">Documents</MenuItem>
                            <MenuItem value="reconciliation">Reconciliation</MenuItem>
                            <MenuItem value="taxes">Taxes</MenuItem>
                            <MenuItem value="payroll">Payroll</MenuItem>
                            <MenuItem value="general">General</MenuItem>
                        </TextField>

                        <TextField
                            select
                            label="Priority"
                            value={newTask.priority}
                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        >
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                        </TextField>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextField
                            select
                            label="Assign To"
                            value={newTask.assignedTo}
                            onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                        >
                            <MenuItem value="client">Me (Client)</MenuItem>
                            <MenuItem value="bookkeeper">Bookkeeper</MenuItem>
                        </TextField>

                        <TextField
                            type="date"
                            label="Due Date"
                            value={newTask.dueDate.toISOString().split('T')[0]}
                            onChange={(e) => setNewTask({ ...newTask, dueDate: new Date(e.target.value) })}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>

                    <TextField
                        label="Notes (optional)"
                        multiline
                        rows={2}
                        value={newTask.notes}
                        onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                        placeholder="Add any additional notes..."
                    />

                    <Button variant="contained" onClick={handleAddTask} fullWidth>
                        Create Task
                    </Button>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
