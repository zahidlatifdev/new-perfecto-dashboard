'use client';

import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { alpha } from '@mui/material/styles';

import { useAuthContext } from 'src/auth/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function DocumentsView() {
  const { company } = useAuthContext();

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  const handleRemoveFile = (inputFile) => {
    const filtered = files.filter((file) => file !== inputFile);
    setFiles(filtered);
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
  };

  const handleUpload = async () => {
    if (!company?._id) {
      setErrorMsg('No company selected');
      return;
    }

    if (files.length === 0) {
      setErrorMsg('Please select at least one file');
      return;
    }

    try {
      setUploading(true);
      setErrorMsg('');
      setSuccessMsg('');

      // Convert files to base64
      const filePromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              base64,
            });
          };
          reader.onerror = reject;
        });
      });

      const base64Files = await Promise.all(filePromises);

      // Upload to backend
      const response = await axios.post(endpoints.documents.upload.statement, {
        companyId: company._id,
        files: base64Files,
      });

      setSuccessMsg(`Successfully uploaded ${files.length} file(s). Processing started.`);
      setFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMsg(error.response?.data?.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <div>
            <Typography variant="h4">Document Vault</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Upload bank statements for automatic processing and categorization
            </Typography>
          </div>
        </Stack>

        {!!errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        {!!successMsg && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg('')}>
            {successMsg}
          </Alert>
        )}

        <Card>
          <Box sx={{ p: 3 }}>
            <Upload
              multiple
              files={files}
              onDrop={handleDrop}
              onRemove={handleRemoveFile}
              onRemoveAll={handleRemoveAllFiles}
              onUpload={handleUpload}
              disabled={uploading}
            />

            {uploading && (
              <Box sx={{ mt: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                  <Iconify icon="svg-spinners:3-dots-bounce" width={24} />
                  <Typography variant="body2">Uploading and processing...</Typography>
                </Stack>
                <LinearProgress />
              </Box>
            )}

            {files.length > 0 && !uploading && (
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleUpload}
                  startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                >
                  Upload {files.length} file{files.length > 1 ? 's' : ''}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={handleRemoveAllFiles}
                >
                  Clear All
                </Button>
              </Stack>
            )}
          </Box>

          <Box
            sx={{
              p: 3,
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
              borderTop: (theme) => `dashed 1px ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Supported Formats
            </Typography>
            <Typography variant="body2" color="text.secondary">
              PDF, PNG, JPG, JPEG - Bank statements and credit card statements
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Your statements will be automatically processed and transactions will be categorized.
            </Typography>
          </Box>
        </Card>
      </Container>
    </DashboardContent>
  );
}

