import React from 'react';
import { Box } from '@mui/system';
import {
  Alert,
  AppBar,
  Button,
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

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Box className="topbar-content">
          <Box className="topbar-left">
            <Typography variant="h6" color="inherit">Hi {currentUser.first_name}</Typography>
            <Typography variant="h6" color="inherit">{contextText}</Typography>
          </Box>
          <Box className="topbar-right">
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
  );
}

export default TopBar;
