import React from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';

import './styles.css';

function UserPhotos() {
  const { userId } = useParams();
  const {
    data: owner = null,
    isPending: isOwnerPending,
    isError: isOwnerError,
  } = useQuery({
    queryKey: ['users', 'detail', userId],
    queryFn: async () => {
      const response = await api.get(`/user/${userId}`);
      return response.data || null;
    },
  });

  const {
    data: photos = [],
    isPending: isPhotosPending,
    isError: isPhotosError,
  } = useQuery({
    queryKey: ['photos', 'by-user', userId],
    queryFn: async () => {
      try {
        const response = await api.get(`/photosOfUser/${userId}`);
        return response.data || [];
      } catch (photosErr) {
        const statusCode = photosErr?.response?.status;
        if (statusCode === 400 || statusCode === 404) {
          return [];
        }

        throw photosErr;
      }
    },
  });

  const formatDateTime = (dateTimeString) => {
    const normalized = dateTimeString?.replace(' ', 'T');
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      return dateTimeString;
    }

    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isOwnerPending || isPhotosPending) {
    return (
      <div className="user-photos-state">
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">Loading photos...</Typography>
      </div>
    );
  }

  if (isOwnerError || isPhotosError) {
    return <Alert severity="error">Unable to load photos for this user.</Alert>;
  }

  if (!owner) {
    return <Alert severity="info">User not found.</Alert>;
  }

  if (photos.length === 0) {
    return (
      <Alert severity="info">
        {owner.first_name}
        {' '}
        {owner.last_name}
        {' '}has no photos yet.
      </Alert>
    );
  }

  return (
    <Box className="user-photos-container">
      <Typography variant="h5" className="user-photos-heading">
        Photos of
        {' '}
        {owner.first_name}
        {' '}
        {owner.last_name}
      </Typography>

      {photos.map((photo) => (
        <Card key={photo._id} className="user-photo-card" variant="outlined">
          <CardMedia
            component="img"
            image={`/images/${photo.file_name}`}
            alt={`Uploaded by ${owner.first_name} ${owner.last_name}`}
            className="user-photo-image"
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary" className="user-photo-date">
              Uploaded:
              {' '}
              {formatDateTime(photo.date_time)}
            </Typography>
            <Divider className="user-photo-divider" />
            <Typography variant="subtitle1">Comments</Typography>

            {photo.comments?.length ? (
              <List disablePadding>
                {photo.comments.map((comment) => (
                  <ListItem key={comment._id} disableGutters className="photo-comment-item">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(comment.date_time)}
                      </Typography>
                      <Typography variant="body1">
                        <Link to={`/users/${comment.user._id}`} className="photo-comment-user-link">
                          {comment.user.first_name}
                          {' '}
                          {comment.user.last_name}
                        </Link>
                        :
                        {' '}
                        {comment.comment}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default UserPhotos;
