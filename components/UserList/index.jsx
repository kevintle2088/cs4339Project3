import React from 'react';
import {
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import api from '../../lib/api';

import './styles.css';

function UserList() {
  const {
    data: users = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: async () => {
      const response = await api.get('/user/list');
      return response.data || [];
    },
  });
  const location = useLocation();

  if (isPending) {
    return (
      <div className="user-list-state">
        <CircularProgress size={26} />
        <Typography variant="body2" color="text.secondary">Loading users...</Typography>
      </div>
    );
  }

  if (isError) {
    return <Alert severity="error">Unable to load users. Please try again.</Alert>;
  }

  if (users.length === 0) {
    return <Alert severity="info">No users found.</Alert>;
  }

  return (
    <div>
      <Typography variant="h6" className="user-list-title">Users</Typography>
      <List component="nav">
        {users.map((user) => {
          const fullName = `${user.first_name} ${user.last_name}`;
          const to = `/users/${user._id}`;
          const isActive = location.pathname === to || location.pathname === `${to}/photos`;

          return (
            <React.Fragment key={user._id}>
              <ListItem disablePadding>
                <ListItemButton component={Link} to={to} selected={isActive}>
                  <ListItemText primary={fullName} />
                </ListItemButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          );
        })}
      </List>
    </div>
  );
}

export default UserList;
