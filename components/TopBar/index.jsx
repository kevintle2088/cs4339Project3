import React from 'react';
import { Box } from '@mui/system';
import {
  Alert,
  AppBar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Toolbar,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router-dom';
import api from '../../lib/api';

import './styles.css';

function TopBar({ currentUser }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const photosMatch = useMatch('/users/:userId/photos');
  const detailMatch = useMatch('/users/:userId');

  const activeUserId = photosMatch?.params?.userId || detailMatch?.params?.userId || null;
  const isPhotosRoute = Boolean(photosMatch);

  const [logoutError, setLogoutError] = React.useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [uploadError, setUploadError] = React.useState('');

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/admin/logout', {});
    },
    onSuccess: async () => {
      setLogoutError('');
      queryClient.setQueryData(['auth', 'me'], null);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['photos'] });
      navigate('/login-register', { replace: true });
    },
    onError: (error) => {
      const responseMessage = error?.response?.data;
      if (typeof responseMessage === 'string' && responseMessage.trim()) {
        setLogoutError(responseMessage);
      } else {
        setLogoutError('Logout failed. Please try again.');
      }
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file) => {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset =
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        || import.meta.env.VITE_CLOUDINARY_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration is missing. Check Vite environment variables.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData },
      );

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok || !cloudinaryData?.secure_url) {
        const cloudinaryMessage = cloudinaryData?.error?.message;
        throw new Error(cloudinaryMessage || 'Cloudinary upload failed.');
      }

      await api.post('/photos', { url: cloudinaryData.secure_url });
    },
    onSuccess: async () => {
      setUploadError('');
      setSelectedFile(null);
      setIsUploadDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
    onError: (error) => {
      const responseMessage = error?.response?.data;
      if (typeof responseMessage === 'string' && responseMessage.trim()) {
        setUploadError(responseMessage);
        return;
      }

      setUploadError(error?.message || 'Unable to upload photo right now.');
    },
  });

  const { data: activeUser, isError: isActiveUserError } = useQuery({
    queryKey: ['users', 'detail', activeUserId],
    queryFn: async () => {
      const response = await api.get(`/user/${activeUserId}`);
      return response.data;
    },
    enabled: Boolean(activeUserId),
  });

  let userName = '';
  if (activeUserId) {
    if (isActiveUserError) {
      userName = 'Unknown User';
    } else if (activeUser) {
      userName = `${activeUser.first_name} ${activeUser.last_name}`;
    }
  } else if (currentUser) {
    userName = `${currentUser.first_name} ${currentUser.last_name}`;
  }

  let contextText = 'PhotoShare';
  if (location.pathname === '/users') {
    contextText = 'Browse Users';
  } else if (activeUserId && isPhotosRoute) {
    contextText = userName ? `Photos of ${userName}` : 'Photos';
  } else if (activeUserId) {
    contextText = userName || 'User Details';
  }

  function openUploadDialog() {
    setUploadError('');
    setSelectedFile(null);
    setIsUploadDialogOpen(true);
  }

  function closeUploadDialog() {
    if (uploadPhotoMutation.isPending) {
      return;
    }

    setUploadError('');
    setSelectedFile(null);
    setIsUploadDialogOpen(false);
  }

  function submitPhotoUpload() {
    if (!selectedFile) {
      setUploadError('Please choose an image file first.');
      return;
    }

    setUploadError('');
    uploadPhotoMutation.mutate(selectedFile);
  }

  return (
    <>
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Box className="topbar-content">
            <Box className="topbar-left">
              <Typography variant="h6" color="inherit">Hi {currentUser.first_name}</Typography>
              <Typography variant="h6" color="inherit">{contextText}</Typography>
            </Box>
            <Box className="topbar-right">
              <Button
                variant="contained"
                color="secondary"
                onClick={openUploadDialog}
                disabled={uploadPhotoMutation.isPending}
                className="topbar-add-photo"
              >
                Add Photo
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="topbar-logout"
              >
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </Button>
            </Box>
          </Box>
        </Toolbar>
        {logoutError ? <Alert severity="error">{logoutError}</Alert> : null}
      </AppBar>

      <Dialog
        open={isUploadDialogOpen}
        onClose={closeUploadDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Photo</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary">
            Choose an image to upload. The file is sent directly to Cloudinary.
          </Typography>
          <input
            type="file"
            accept="image/*"
            className="topbar-file-input"
            disabled={uploadPhotoMutation.isPending}
            onChange={(event) => {
              const nextFile = event.target.files?.[0] || null;
              setSelectedFile(nextFile);
            }}
          />
          {selectedFile ? (
            <Typography variant="body2" className="topbar-selected-file">
              Selected: {selectedFile.name}
            </Typography>
          ) : null}

          {uploadPhotoMutation.isPending ? (
            <Box className="topbar-upload-state">
              <CircularProgress size={22} />
              <Typography variant="body2" color="text.secondary">Uploading image...</Typography>
            </Box>
          ) : null}

          {uploadError ? <Alert severity="error">{uploadError}</Alert> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUploadDialog} disabled={uploadPhotoMutation.isPending}>Cancel</Button>
          <Button
            onClick={submitPhotoUpload}
            variant="contained"
            disabled={uploadPhotoMutation.isPending}
          >
            {uploadPhotoMutation.isPending ? 'Uploading...' : 'Upload Photo'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TopBar;
