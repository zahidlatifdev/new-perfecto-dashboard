'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Paper,
    Stack,
    Grid,
    Skeleton,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { Iconify } from 'src/components/iconify';
import axiosInstance, { endpoints } from 'src/utils/axios';
import websocketService from 'src/utils/websocket';
import { useAuthContext } from 'src/auth/hooks';
import { usePermissions } from 'src/hooks/use-permissions';
import { DocumentCard } from '../components/document-card';
import { CategoryFilter } from '../components/category-filter';
import { UpcomingExpiries } from '../components/upcoming-expiries';
import { EmptyState } from '../components/empty-state';
import { UploadDocumentModal } from '../components/upload-document-modal';
import { DocumentEditModal } from '../components/document-edit-modal';
import { DocumentViewerModal } from '../components/document-viewer-modal';
import { ShareDocumentModal } from '../components/share-document-modal';
import { UploadNewVersionModal } from '../components/upload-new-version-modal';

export function LockerView() {
    const { selectedCompany } = useAuthContext();
    const { can } = usePermissions();
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
    const [viewingDocument, setViewingDocument] = useState(null);
    const [sharingDocument, setSharingDocument] = useState(null);
    const [uploadingNewVersionFor, setUploadingNewVersionFor] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState(null);

    // Fetch documents from API
    const fetchDocuments = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(endpoints.documents.list, {
                params: {
                    category: selectedCategory,
                    search: searchQuery,
                    sortBy: 'uploadDate',
                    sortOrder: 'desc',
                },
            });

            if (response.data.success) {
                // Convert date strings to Date objects
                const docs = response.data.data.map((doc) => ({
                    ...doc,
                    id: doc._id,
                    uploadDate: new Date(doc.uploadDate),
                    expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
                    versions: doc.versions?.map((v) => ({
                        ...v,
                        timestamp: new Date(v.timestamp),
                    })),
                }));
                setDocuments(docs);
                if (response.data.stats) {
                    setStats(response.data.stats);
                }
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error(error.message || 'Failed to load documents');
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory, searchQuery, selectedCompany?._id]);

    // Fetch documents on mount and when filters change
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Listen for real-time document processing updates via WebSocket
    useEffect(() => {
        const handleDocumentProcessed = (data) => {
            if (data.type !== 'locker_document') return;
            // Refresh the document from API to get full extracted data
            refreshDocument(data.id);
            if (data.hasData) {
                toast.success('Data extraction completed!');
            }
        };

        const handleDocumentProcessing = (data) => {
            if (data.type !== 'locker_document') return;
            setDocuments((prev) =>
                prev.map((doc) =>
                    doc.id === data.id ? { ...doc, processingStatus: 'processing' } : doc
                )
            );
        };

        const handleDocumentFailed = (data) => {
            if (data.type !== 'locker_document') return;
            setDocuments((prev) =>
                prev.map((doc) =>
                    doc.id === data.id
                        ? { ...doc, processingStatus: 'failed', processingError: data.error }
                        : doc
                )
            );
            toast.error('Data extraction failed. You can retry from the document details.');
        };

        websocketService.on('documentProcessed', handleDocumentProcessed);
        websocketService.on('documentProcessing', handleDocumentProcessing);
        websocketService.on('documentProcessingFailed', handleDocumentFailed);

        return () => {
            websocketService.off('documentProcessed', handleDocumentProcessed);
            websocketService.off('documentProcessing', handleDocumentProcessing);
            websocketService.off('documentProcessingFailed', handleDocumentFailed);
        };
    }, []);

    // Refresh a single document from API
    const refreshDocument = async (docId) => {
        try {
            const response = await axiosInstance.get(endpoints.documents.get(docId));
            if (response.data.success) {
                const updated = {
                    ...response.data.data,
                    id: response.data.data._id,
                    uploadDate: new Date(response.data.data.uploadDate),
                    expiryDate: response.data.data.expiryDate
                        ? new Date(response.data.data.expiryDate)
                        : null,
                    versions: response.data.data.versions?.map((v) => ({
                        ...v,
                        timestamp: new Date(v.timestamp),
                    })),
                };
                setDocuments((prev) =>
                    prev.map((doc) => (doc.id === docId ? updated : doc))
                );
                // Also update viewing document if it's the same one
                setViewingDocument((prev) => (prev?.id === docId ? updated : prev));
            }
        } catch (error) {
            console.error('Error refreshing document:', error);
        }
    };

    // Calculate notification count (documents expiring within 30 days)
    const notificationCount = useMemo(() => {
        const today = new Date();
        return documents.filter((doc) => {
            if (!doc.expiryDate) return false;
            const days = differenceInDays(doc.expiryDate, today);
            return days >= 0 && days <= 30;
        }).length;
    }, [documents]);

    // Filter documents
    const filteredDocuments = useMemo(() => {
        return documents.filter((doc) => {
            const matchesSearch =
                doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.notes?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [documents, searchQuery, selectedCategory]);

    const handleUpload = async (formData) => {
        try {
            const response = await axiosInstance.post(endpoints.documents.create, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                const newDoc = {
                    ...response.data.data,
                    id: response.data.data._id,
                    uploadDate: new Date(response.data.data.uploadDate),
                    expiryDate: response.data.data.expiryDate
                        ? new Date(response.data.data.expiryDate)
                        : null,
                    versions: response.data.data.versions?.map((v) => ({
                        ...v,
                        timestamp: new Date(v.timestamp),
                    })),
                };
                setDocuments((prev) => [newDoc, ...prev]);
                setViewingDocument(newDoc); // Auto-open details modal for new doc
                toast.success(`"${newDoc.name}" has been saved to your Locker.`);
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            toast.error(error.message || 'Failed to upload document');
        }
    };

    const handleView = (doc) => {
        // Get the latest version of the document from state
        const currentDoc = documents.find((d) => d.id === doc.id);
        setViewingDocument(currentDoc || doc);
    };

    const handleEdit = (doc) => {
        setEditingDocument(doc);
    };

    const handleSaveEdit = async (updatedDoc) => {
        try {
            const response = await axiosInstance.put(endpoints.documents.update(updatedDoc.id), {
                name: updatedDoc.name,
                category: updatedDoc.category,
                expiryDate: updatedDoc.expiryDate,
                notes: updatedDoc.notes,
                tags: updatedDoc.tags,
            });

            if (response.data.success) {
                const updated = {
                    ...response.data.data,
                    id: response.data.data._id,
                    uploadDate: new Date(response.data.data.uploadDate),
                    expiryDate: response.data.data.expiryDate
                        ? new Date(response.data.data.expiryDate)
                        : null,
                    versions: response.data.data.versions?.map((v) => ({
                        ...v,
                        timestamp: new Date(v.timestamp),
                    })),
                };

                setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));

                // Update viewing document if it's the same one
                if (viewingDocument?.id === updated.id) {
                    setViewingDocument(updated);
                }

                toast.success(`"${updated.name}" has been updated.`);
            }
        } catch (error) {
            console.error('Error updating document:', error);
            toast.error(error.message || 'Failed to update document');
        }
    };

    const handleDelete = async (id) => {
        try {
            const doc = documents.find((d) => d.id === id);
            const response = await axiosInstance.delete(endpoints.documents.delete(id));

            if (response.data.success) {
                setDocuments((prev) => prev.filter((d) => d.id !== id));
                toast.success(doc ? `"${doc.name}" has been removed.` : 'Document removed.');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error(error.message || 'Failed to delete document');
        }
    };

    const handleDownload = async (doc) => {
        try {
            toast.loading(`Preparing "${doc.name}" for download...`, { id: 'download' });

            const response = await axiosInstance.get(endpoints.documents.download(doc.id));

            if (response.data.success) {
                const { url, fileName } = response.data.data;

                // Open download URL in new tab
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success(`Downloading "${doc.name}"...`, { id: 'download' });
            }
        } catch (error) {
            console.error('Error downloading document:', error);
            toast.error(error.message || 'Failed to download document', { id: 'download' });
        }
    };

    const handleShare = (doc) => {
        setSharingDocument(doc);
    };

    const handleUploadNewVersion = (doc) => {
        setUploadingNewVersionFor(doc);
    };

    const handleSaveNewVersion = async (docId, file, notes, expiryDate) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (notes) formData.append('notes', notes);
            if (expiryDate) formData.append('expiryDate', expiryDate.toISOString());

            const response = await axiosInstance.post(
                endpoints.documents.uploadVersion(docId),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.success) {
                const updated = {
                    ...response.data.data,
                    id: response.data.data._id,
                    uploadDate: new Date(response.data.data.uploadDate),
                    expiryDate: response.data.data.expiryDate
                        ? new Date(response.data.data.expiryDate)
                        : null,
                    versions: response.data.data.versions?.map((v) => ({
                        ...v,
                        timestamp: new Date(v.timestamp),
                    })),
                };

                setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));

                // Update viewing document if same
                if (viewingDocument?.id === docId) {
                    setViewingDocument(updated);
                }

                const doc = documents.find((d) => d.id === docId);
                toast.success(
                    doc ? `"${doc.name}" has been updated to a new version.` : 'Document updated.'
                );
            }
        } catch (error) {
            console.error('Error uploading new version:', error);
            toast.error(error.message || 'Failed to upload new version');
        }
    };

    const handleDownloadVersion = async (version) => {
        if (!version.fileVersion) return;

        try {
            toast.loading(`Preparing version ${version.fileVersion.versionNumber} for download...`, {
                id: 'version-download',
            });

            const response = await axiosInstance.get(
                endpoints.documents.download(viewingDocument.id),
                {
                    params: { versionId: version.id },
                }
            );

            if (response.data.success) {
                const { url, fileName } = response.data.data;

                // Open download URL in new tab
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success(`Downloading version ${version.fileVersion.versionNumber}...`, {
                    id: 'version-download',
                });
            }
        } catch (error) {
            console.error('Error downloading version:', error);
            toast.error(error.message || 'Failed to download version', { id: 'version-download' });
        }
    };

    const handleReprocess = async (doc) => {
        try {
            toast.loading('Starting data extraction...', { id: 'reprocess' });

            const response = await axiosInstance.post(endpoints.documents.reprocess(doc.id));

            if (response.data.success) {
                const updated = {
                    ...response.data.data,
                    id: response.data.data._id,
                    uploadDate: new Date(response.data.data.uploadDate),
                    expiryDate: response.data.data.expiryDate
                        ? new Date(response.data.data.expiryDate)
                        : null,
                    versions: response.data.data.versions?.map((v) => ({
                        ...v,
                        timestamp: new Date(v.timestamp),
                    })),
                };

                setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));

                if (viewingDocument?.id === doc.id) {
                    setViewingDocument(updated);
                }

                toast.success('Data extraction restarted. We\'ll notify you when it\'s done.', {
                    id: 'reprocess',
                });
            }
        } catch (error) {
            console.error('Error reprocessing document:', error);
            toast.error(error.message || 'Failed to reprocess document', { id: 'reprocess' });
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="lg">
                {/* Hero Section */}
                <Paper
                    sx={{
                        p: { xs: 3, md: 4 },
                        mb: 3,
                        borderRadius: 2,
                        background: (theme) =>
                            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white',
                        animation: 'fadeIn 0.5s ease-in',
                        '@keyframes fadeIn': {
                            from: { opacity: 0, transform: 'translateY(10px)' },
                            to: { opacity: 1, transform: 'translateY(0)' },
                        },
                    }}
                >
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        justifyContent="space-between"
                        spacing={2}
                    >
                        <Box>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                                <Iconify icon="solar:lock-keyhole-bold-duotone" width={28} />
                                <Typography variant="h4" fontWeight={700}>
                                    Document Locker
                                </Typography>
                            </Stack>
                            <Typography
                                variant="body2"
                                sx={{
                                    opacity: 0.9,
                                    maxWidth: 500,
                                }}
                            >
                                Secure home for your contracts, policies, licenses, and more. Never miss a renewal
                                with automatic expiry reminders.
                            </Typography>
                        </Box>
                        {can('locker', 'create') && (
                            <Button
                                onClick={() => setUploadModalOpen(true)}
                                variant="contained"
                                size="large"
                                startIcon={<Iconify icon="solar:upload-bold" />}
                                sx={{
                                    bgcolor: 'white',
                                    color: 'primary.main',
                                    boxShadow: (theme) => theme.customShadows.z8,
                                    '&:hover': {
                                        bgcolor: 'grey.100',
                                    },
                                }}
                            >
                                Upload Document
                            </Button>
                        )}
                    </Stack>
                </Paper>

                {!isLoading && stats && stats.total === 0 ? (
                    <EmptyState onUpload={() => setUploadModalOpen(true)} can={can} />
                ) : (
                    <>
                        {/* Upcoming Expiries */}
                        <UpcomingExpiries documents={documents} onDocumentClick={handleView} />

                        {/* Search and Filters */}
                        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    placeholder="Search documents..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Iconify icon="solar:magnifer-bold" width={20} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Box sx={{ overflowX: 'auto', pb: 1 }}>
                                    <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
                                </Box>
                            </Stack>
                        </Paper>

                        {/* Document Grid */}
                        {isLoading ? (
                            <Grid container spacing={2}>
                                {[...Array(4)].map((_, index) => (
                                    <Grid item xs={12} md={6} key={index}>
                                        <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                                            <Stack direction="row" spacing={2}>
                                                <Skeleton variant="rounded" width={48} height={48} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Skeleton variant="text" width="80%" height={24} />
                                                    <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
                                                    <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Grid container spacing={2}>
                                {filteredDocuments.map((doc) => (
                                    <Grid item xs={12} md={6} key={doc.id}>
                                        <DocumentCard
                                            document={doc}
                                            onView={handleView}
                                            onEdit={can('locker', 'edit') ? handleEdit : undefined}
                                            onDelete={can('locker', 'delete') ? handleDelete : undefined}
                                            onDownload={handleDownload}
                                            onShare={handleShare}
                                            onUploadNewVersion={can('locker', 'create') ? handleUploadNewVersion : undefined}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        {filteredDocuments.length === 0 && !isLoading && (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <Iconify
                                    icon="solar:documents-bold-duotone"
                                    width={64}
                                    sx={{ color: 'text.secondary', mb: 2 }}
                                />
                                <Typography variant="h6" color="text.secondary">
                                    No documents found matching your search.
                                </Typography>
                            </Box>
                        )}
                    </>
                )}

                {/* Modals */}
                <UploadDocumentModal
                    open={uploadModalOpen}
                    onOpenChange={setUploadModalOpen}
                    onSave={handleUpload}
                />

                <DocumentEditModal
                    document={editingDocument}
                    open={!!editingDocument}
                    onOpenChange={(open) => !open && setEditingDocument(null)}
                    onSave={handleSaveEdit}
                    onDelete={handleDelete}
                />

                <DocumentViewerModal
                    document={viewingDocument}
                    open={!!viewingDocument}
                    onOpenChange={(open) => !open && setViewingDocument(null)}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    onUploadNewVersion={handleUploadNewVersion}
                    onDownloadVersion={handleDownloadVersion}
                    onReprocess={handleReprocess}
                />

                <ShareDocumentModal
                    document={sharingDocument}
                    open={!!sharingDocument}
                    onOpenChange={(open) => !open && setSharingDocument(null)}
                />

                <UploadNewVersionModal
                    document={uploadingNewVersionFor}
                    open={!!uploadingNewVersionFor}
                    onOpenChange={(open) => !open && setUploadingNewVersionFor(null)}
                    onSave={handleSaveNewVersion}
                />
            </Container>
        </LocalizationProvider>
    );
}
