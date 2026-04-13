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
import { Link, useLocation } from 'react-router-dom';
import api from '../../lib/api';

import './styles.css';

function UserList() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const location = useLocation();

  React.useEffect(() => {
    let isMounted = true;

    async function fetchUsers() {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/user/list');
        if (isMounted) {
          setUsers(response.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError('Unable to load users. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="user-list-state">
        <CircularProgress size={26} />
        <Typography variant="body2" color="text.secondary">Loading users...</Typography>
      </div>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
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
