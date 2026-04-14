import React from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';

import './styles.css';

function UserDetail() {
  const { userId } = useParams();
  const {
    data: user = null,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['users', 'detail', userId],
    queryFn: async () => {
      const response = await api.get(`/user/${userId}`);
      return response.data || null;
    },
  });

  if (isPending) {
    return (
      <div className="user-detail-state">
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">Loading user details...</Typography>
      </div>
    );
  }

  if (isError) {
    return <Alert severity="error">User not found.</Alert>;
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
