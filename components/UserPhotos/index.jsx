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
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';

import './styles.css';

function UserPhotos() {
  const { userId } = useParams();
  const [photos, setPhotos] = React.useState([]);
  const [owner, setOwner] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

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

  React.useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError('');

        const userResponse = await api.get(`/user/${userId}`);

        let fetchedPhotos = [];
        try {
          const photosResponse = await api.get(`/photosOfUser/${userId}`);
          fetchedPhotos = photosResponse.data || [];
        } catch (photosErr) {
          const statusCode = photosErr?.response?.status;
          if (statusCode !== 400 && statusCode !== 404) {
            throw photosErr;
          }
        }

        if (isMounted) {
          setPhotos(fetchedPhotos);
          setOwner(userResponse.data || null);
        }
      } catch (err) {
        if (isMounted) {
          setPhotos([]);
          setOwner(null);
          setError('Unable to load photos for this user.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="user-photos-state">
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">Loading photos...</Typography>
      </div>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
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
