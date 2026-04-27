import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  List,
  ListItem,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import api from '../../lib/api';

import './styles.css';

function UserPhotos() {
  const { userId } = useParams();
  const queryClient = useQueryClient();
  const [comments, setComment] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [likeErrors, setLikeErrors] = useState({});

  const { data: currentUser = null } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.get('/admin/me');
      return response.data || null;
    },
  });

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
        const response = await api.get(`/photosOfUser/${userId}?includeLikes=true`);
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
  const handleCommentSubmission = (photoId) => {
    const text = (comments[photoId] || '').trim();

    if (!text) {
      setCommentErrors((prev) => ({
        ...prev,
        [photoId]: 'Comment must not be empty!',
      }));
      return;
    }

    commentMutation.mutate({
      photoId,
      comment: text,
    });
  };

  const commentMutation = useMutation({
    mutationFn: async ({ photoId, comment }) => {
      await api.post(`/commentsOfPhoto/${photoId}`, { comment });
    },
    onSuccess: (_data, variables) => {
      setCommentErrors((prev) => ({
        ...prev,
        [variables.photoId]: '',
      }));
      setComment((prev) => ({
        ...prev,
        [variables.photoId]: '',
      }));
      queryClient.invalidateQueries({
        queryKey: ['photos', 'by-user', userId],
      });
    },
    onError: (err, variables) => {
      setCommentErrors((prev) => ({
        ...prev,
        [variables.photoId]: err?.response?.data || 'Could not post Comment',
      }));
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (photoId) => {
      const response = await api.post(`/photos/${photoId}/like`, {});
      return response.data;
    },
    onSuccess: (_data, photoId) => {
      setLikeErrors((prev) => ({
        ...prev,
        [photoId]: '',
      }));
      queryClient.invalidateQueries({ queryKey: ['photos', 'by-user', userId] });
    },
    onError: (err, photoId) => {
      setLikeErrors((prev) => ({
        ...prev,
        [photoId]: err?.response?.data || 'Unable to update like right now.',
      }));
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

      {photos.map((photo) => {
        const likeUserIds = Array.isArray(photo.likes) ? photo.likes.map((likeUserId) => String(likeUserId)) : [];
        const currentUserId = currentUser?._id ? String(currentUser._id) : null;
        const isLikedByCurrentUser = currentUserId ? likeUserIds.includes(currentUserId) : false;
        const likeCount = likeUserIds.length;

        return (
          <Card key={photo._id} className="user-photo-card" variant="outlined">
            <CardMedia
              component="img"
              image={photo.file_name}
              alt={`Uploaded by ${owner.first_name} ${owner.last_name}`}
              className="user-photo-image"
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" className="user-photo-date">
                Uploaded:
                {' '}
                {formatDateTime(photo.date_time)}
              </Typography>

              <Box className="photo-like-row">
                <Button
                  size="small"
                  variant={isLikedByCurrentUser ? 'contained' : 'outlined'}
                  color={isLikedByCurrentUser ? 'error' : 'primary'}
                  onClick={() => likeMutation.mutate(photo._id)}
                  disabled={likeMutation.isPending && likeMutation.variables === photo._id}
                >
                  {isLikedByCurrentUser ? 'Unlike' : 'Like'}
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {likeCount}
                  {' '}
                  {likeCount === 1 ? 'like' : 'likes'}
                </Typography>
              </Box>

              {likeErrors[photo._id] ? (
                <Typography color="error" variant="body2" className="photo-like-error">
                  {likeErrors[photo._id]}
                </Typography>
              ) : null}

              <Divider className="user-photo-divider" />
              <TextField
                fullWidth
                placeholder="Leave a comment..."
                value={comments[photo._id] || ''}
                onChange={(e) =>
                  setComment((prev) => ({
                    ...prev, [photo._id]: e.target.value,
                  }))
                }
              />

              <Button
                size="small"
                onClick={() => handleCommentSubmission(photo._id)}
                disabled={commentMutation.isPending && commentMutation.variables?.photoId === photo._id}
              >
                Upload Comment
              </Button>

              {commentErrors[photo._id] && (
                <Typography color="error" variant="body2">{commentErrors[photo._id]}</Typography>
              )}

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
        );
      })}
    </Box>
  );
}

export default UserPhotos;
