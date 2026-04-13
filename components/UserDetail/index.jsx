import React from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';

import './styles.css';

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/user/${userId}`);
        if (isMounted) {
          setUser(response.data || null);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setError('User not found.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="user-detail-state">
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">Loading user details...</Typography>
      </div>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!user) {
    return <Alert severity="info">No user data available.</Alert>;
  }

  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <Stack spacing={2}>
      <Typography variant="h4">{fullName}</Typography>
      <Divider />
      <Typography variant="body1"><strong>Location:</strong> {user.location}</Typography>
      <Typography variant="body1"><strong>Occupation:</strong> {user.occupation}</Typography>
      <Typography variant="body1"><strong>About:</strong> {user.description}</Typography>
      <Button
        component={Link}
        to={`/users/${user._id}/photos`}
        variant="contained"
        className="user-detail-photo-link"
      >
        View Photos
      </Button>
    </Stack>
  );
}

export default UserDetail;
