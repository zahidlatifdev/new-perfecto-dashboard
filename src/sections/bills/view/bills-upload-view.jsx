'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { useDocumentProcessing } from 'src/hooks/use-websocket';

// ----------------------------------------------------------------------

export function BillsUploadView() {
  const router = useRouter();
  const { selectedCompany } = useAuthContext();

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [currentUploadId, setCurrentUploadId] = useState(null);

  // WebSocket listeners for real-time updates (background processing)
  useDocumentProcessing({
    onDocumentProcessing: (data) => {
      // Background processing - no UI updates needed since user is redirected
    },
    onDocumentProcessed: (data) => {
      // Background processing - no UI updates needed since user is redirected
    },
    onDocumentProcessingFailed: (data) => {
      // Background processing - no UI updates needed since user is redirected
    }
  });

  const handleDropFiles = (acceptedFiles) => {
    setFiles([...files, ...acceptedFiles]);
  };

  const handleRemoveFile = (inputFile) => {
    const filesFiltered = files.filter((file) => file !== inputFile);
    setFiles(filesFiltered);
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      if (!selectedCompany?._id) {
        throw new Error('No company selected');
      }

      // Simulate progress over 150 seconds (2.5 minutes)
      let progress = 0;
      const totalDuration = 150000;
      const interval = 1000;
      const increment = 100 / (totalDuration / interval);

      const progressInterval = setInterval(() => {
        progress += increment;
        if (progress >= 95) {
          clearInterval(progressInterval);
          setUploadProgress(95);
        } else {
          setUploadProgress(Math.floor(progress));
        }
      }, interval);

      // Convert the first file to base64
      const base64String = await convertFileToBase64(files[0]);
      const fileDataWithPrefix = `data:${files[0].type};base64,${base64String}`;

      // Prepare upload data
      const uploadData = {
        fileName: files[0].name,
        fileData: fileDataWithPrefix,
        documentType: 'Bill'
      };

      // Call backend API
      const response = await axiosInstance.post(endpoints.documents.upload.document, uploadData);
      const result = response.data;

      if (result.success) {
        clearInterval(progressInterval);
        setProcessingStatus('completed');
        setUploadProgress(100);
        setUploadSuccess(true);
        
        // Reset states and redirect
        setTimeout(() => {
          setUploading(false);
          setFiles([]);
          setUploadProgress(0);
          setProcessingStatus(null);
          setCurrentUploadId(null);
          router.push('/dashboard/bills');
        }, 1500);
      } else {
        clearInterval(progressInterval);
        throw new Error(result.message || 'Failed to process bill');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setUploadError(error.message || 'An error occurred while uploading the file');
      setUploadProgress(0);
      setUploading(false);
    }
  };

  const handleViewBills = () => {
    router.push('/dashboard/bills');
  };

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Upload Bills
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        Upload your bills for automatic processing. Supported formats: PDF, PNG, JPG. Maximum size: 20MB per file.
      </Typography>

      {uploadSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setUploadSuccess(false)}
        >
          <AlertTitle>Success</AlertTitle>
          Your bills have been processed successfully. Redirecting to view bills...
        </Alert>
      )}

      {uploadError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setUploadError(null)}
        >
          <AlertTitle>Error</AlertTitle>
          {uploadError}
        </Alert>
      )}

      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Upload Details
        </Typography>

        <Stack spacing={3}>
          <Upload
            multiple
            files={files}
            onDrop={handleDropFiles}
            onRemove={handleRemoveFile}
            accept={{
              'application/pdf': ['.pdf'],
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
            }}
            sx={{ my: 3 }}
          />

          {/* Custom file display */}
          {files.length > 0 && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Selected Files:
              </Typography>
              <Stack spacing={1}>
                {files.map((file, index) => (
                  <Card key={index} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Iconify
                          icon={
                            file.type === 'application/pdf' ? 'ph:file-pdf-bold' :
                              file.type.includes('image') ? 'ph:image-bold' :
                                'ph:file-bold'
                          }
                          sx={{ fontSize: 24, color: 'primary.main' }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        </Box>
                      </Stack>
                      <IconButton
                        onClick={() => handleRemoveFile(file)}
                        size="small"
                        color="error"
                        disabled={uploading}
                      >
                        <Iconify icon="ph:x-bold" />
                      </IconButton>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}

          {uploading && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                color={processingStatus === 'failed' ? 'error' : processingStatus === 'completed' ? 'success' : 'primary'}
              />
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                {processingStatus === 'uploaded' && 'File uploaded, processing will begin shortly...'}
                {processingStatus === 'processing' && 'Extracting data...'}
                {processingStatus === 'completed' && 'Processing completed successfully!'}
                {processingStatus === 'failed' && 'Processing failed'}
                {!processingStatus && `Processing... ${uploadProgress}%`}
              </Typography>
            </Box>
          )}

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              color="error"
              onClick={handleRemoveAllFiles}
              disabled={!files.length || uploading}
            >
              Remove All
            </Button>

            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!files.length || uploading || !selectedCompany?._id}
              startIcon={<Iconify icon="ph:cloud-arrow-up-bold" />}
            >
              {uploading ? 'Processing...' : 'Process Bill'}
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Bill Processing Features
        </Typography>

        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="ph:check-circle-bold" sx={{ color: 'success.main', mr: 2 }} />
            <Typography variant="body2">
              Automatic extraction of vendor/customer information
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="ph:check-circle-bold" sx={{ color: 'success.main', mr: 2 }} />
            <Typography variant="body2">
              Bill number, date, and amount detection
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="ph:check-circle-bold" sx={{ color: 'success.main', mr: 2 }} />
            <Typography variant="body2">
              Line item extraction for detailed analysis
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="ph:check-circle-bold" sx={{ color: 'success.main', mr: 2 }} />
            <Typography variant="body2">
              Tax and discount calculation verification
            </Typography>
          </Box>
        </Stack>
      </Card>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
        icon={<Iconify icon="ph:info-bold" />}
      >
        <AlertTitle>Processing Tips</AlertTitle>
        For best results, ensure bills are clear and high-resolution. Our AI can process both digital and scanned bills.
      </Alert>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          onClick={handleViewBills}
          startIcon={<Iconify icon="ph:list-bullets-bold" />}
        >
          View Existing Bills
        </Button>
      </Box>
    </DashboardContent>
  );
}