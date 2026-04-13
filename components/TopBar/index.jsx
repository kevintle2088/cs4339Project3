import React from 'react';
import { Box } from '@mui/system';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { useLocation, useMatch } from 'react-router-dom';
import api from '../../lib/api';

import './styles.css';

function TopBar() {
  const location = useLocation();
  const photosMatch = useMatch('/users/:userId/photos');
  const detailMatch = useMatch('/users/:userId');

  const activeUserId = photosMatch?.params?.userId || detailMatch?.params?.userId || null;
  const isPhotosRoute = Boolean(photosMatch);

  const [userName, setUserName] = React.useState('');

  React.useEffect(() => {
    let isMounted = true;

    async function loadUserName() {
      if (!activeUserId) {
        setUserName('');
        return;
      }

      try {
        const response = await api.get(`/user/${activeUserId}`);
        const user = response.data;
        if (isMounted && user) {
          setUserName(`${user.first_name} ${user.last_name}`);
        }
      } catch (err) {
        if (isMounted) {
          setUserName('Unknown User');
        }
      }
    }

    loadUserName();

    return () => {
      isMounted = false;
    };
  }, [activeUserId]);

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
