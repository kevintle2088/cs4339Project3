import React from 'react';
import { Box } from '@mui/system';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useMatch } from 'react-router-dom';
import api from '../../lib/api';

import './styles.css';

function TopBar() {
  const location = useLocation();
  const photosMatch = useMatch('/users/:userId/photos');
  const detailMatch = useMatch('/users/:userId');

  const activeUserId = photosMatch?.params?.userId || detailMatch?.params?.userId || null;
  const isPhotosRoute = Boolean(photosMatch);

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
          <Typography variant="h6" color="inherit">Casey Nguyen</Typography>
          <Typography variant="h6" color="inherit">{contextText}</Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
