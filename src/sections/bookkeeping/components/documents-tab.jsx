'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { sampleDocuments, documentFolders } from '../data/bookkeepingData';

export function DocumentsTab() {
    const [viewMode, setViewMode] = useState('list');
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const filteredDocs = selectedFolder
        ? sampleDocuments.filter((d) => d.category === selectedFolder)
        : sampleDocuments;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Upload Area */}
            <Card
                sx={{
                    border: '2px dashed',
                    borderColor: isDragging ? 'primary.main' : 'divider',
                    bgcolor: isDragging ? (theme) => alpha(theme.palette.primary.main, 0.05) : 'transparent',
                    p: 4,
                    textAlign: 'center',
                    transition: 'all 0.3s',
                    '&:hover': {
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
                    },
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                }}
            >
                <Iconify icon="mdi:cloud-upload" width={40} sx={{ color: 'text.secondary', mb: 1.5 }} />
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Drag and drop files here
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    or click to browse
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="mdi:upload" width={16} />}
                >
                    Upload Files
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                    Your bookkeeper can access all files here
                </Typography>
            </Card>

            {/* Folders */}
            <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                    Folders
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                        label="All Files"
                        onClick={() => setSelectedFolder(null)}
                        icon={<Iconify icon="mdi:folder" width={16} />}
                        color={!selectedFolder ? 'primary' : 'default'}
                        sx={{ cursor: 'pointer' }}
                    />
                    {documentFolders.map((folder) => (
                        <Chip
                            key={folder.name}
                            label={`${folder.name} (${folder.count})`}
                            onClick={() => setSelectedFolder(folder.name)}
                            icon={<Iconify icon="mdi:folder" width={16} />}
                            color={selectedFolder === folder.name ? 'primary' : 'default'}
                            sx={{ cursor: 'pointer' }}
                        />
                    ))}
                </Box>
            </Box>

            {/* Files List */}
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        {selectedFolder || 'All Files'} ({filteredDocs.length})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'action.hover', borderRadius: 1, p: 0.5 }}>
                        <IconButton
                            size="small"
                            onClick={() => setViewMode('list')}
                            sx={{
                                bgcolor: viewMode === 'list' ? 'background.paper' : 'transparent',
                                boxShadow: viewMode === 'list' ? 1 : 0,
                            }}
                        >
                            <Iconify icon="mdi:view-list" width={16} />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => setViewMode('grid')}
                            sx={{
                                bgcolor: viewMode === 'grid' ? 'background.paper' : 'transparent',
                                boxShadow: viewMode === 'grid' ? 1 : 0,
                            }}
                        >
                            <Iconify icon="mdi:view-grid" width={16} />
                        </IconButton>
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: viewMode === 'grid' ? 'grid' : 'flex',
                        flexDirection: viewMode === 'list' ? 'column' : undefined,
                        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(200px, 1fr))' : undefined,
                        gap: 2,
                    }}
                >
                    {filteredDocs.map((doc) =>
                        viewMode === 'grid' ? (
                            <Card
                                key={doc.id}
                                sx={{
                                    p: 2,
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
                                        boxShadow: 2,
                                    },
                                }}
                            >
                                <Iconify icon="mdi:file-document" width={40} sx={{ color: 'primary.main', opacity: 0.6, mb: 1.5 }} />
                                <Typography variant="body2" fontWeight={500} noWrap sx={{ mb: 0.5 }}>
                                    {doc.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {doc.size}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5 }}>
                                    <IconButton size="small">
                                        <Iconify icon="mdi:eye" width={16} />
                                    </IconButton>
                                    <IconButton size="small">
                                        <Iconify icon="mdi:download" width={16} />
                                    </IconButton>
                                </Box>
                            </Card>
                        ) : (
                            <Card
                                key={doc.id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 1.5,
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
                                    },
                                }}
                            >
                                <Iconify icon="mdi:file-document" width={32} sx={{ color: 'primary.main', opacity: 0.6, flexShrink: 0 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={500} noWrap>
                                        {doc.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {doc.category}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            •
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {doc.uploadDate.toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            •
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: doc.uploadedBy === 'bookkeeper' ? 'primary.main' : 'text.secondary',
                                            }}
                                        >
                                            {doc.uploadedBy === 'bookkeeper' ? 'Bookkeeper' : 'You'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <IconButton size="small">
                                        <Iconify icon="mdi:eye" width={16} />
                                    </IconButton>
                                    <IconButton size="small">
                                        <Iconify icon="mdi:download" width={16} />
                                    </IconButton>
                                    {doc.uploadedBy === 'client' && (
                                        <IconButton size="small" color="error">
                                            <Iconify icon="mdi:delete" width={16} />
                                        </IconButton>
                                    )}
                                </Box>
                            </Card>
                        )
                    )}
                </Box>
            </Box>
        </Box>
    );
}
