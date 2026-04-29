import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import {
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import {
  createHashRouter, RouterProvider, Outlet, Navigate,
} from 'react-router-dom';

import './styles/main.css';
import api from './lib/api';
import LoginRegister from './components/LoginRegister';
import TopBar from './components/TopBar';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';

async function fetchCurrentUser() {
  try {
    const response = await api.get('/admin/me');
    return response.data || null;
  } catch (error) {
    if (error?.response?.status === 401) {
      return null;
    }

    throw error;
  }
}

const currentUserQueryOptions = {
  queryKey: ['auth', 'me'],
  queryFn: fetchCurrentUser,
  retry: false,
};

function SessionState({ message }) {
  return (
    <div className="main-session-state">
      <CircularProgress size={28} />
      <Typography variant="body2" color="text.secondary">{message}</Typography>
    </div>
  );
}

function SessionError() {
  return (
    <div className="main-session-shell">
      <Alert severity="error">Unable to verify session right now. Please refresh and try again.</Alert>
    </div>
  );
}

function LoginRegisterRoute() {
  const {
    data: currentUser,
    isPending,
    isError,
  } = useQuery(currentUserQueryOptions);

  if (isPending) {
    return <SessionState message="Checking session..." />;
  }

  if (isError) {
    return <SessionError />;
  }

  if (currentUser) {
    return <Navigate to={`/users/${currentUser._id}`} replace />;
  }

  return <LoginRegister />;
}

function UsersLanding() {
  return (
    <Typography variant="h6" color="text.secondary">
      Select a user from the left panel to view profile details and photos.
    </Typography>
  );
}

function Root() {
  const {
    data: currentUser,
    isPending,
    isError,
  } = useQuery(currentUserQueryOptions);

  if (isPending) {
    return <SessionState message="Loading your account..." />;
  }

  if (isError) {
    return <SessionError />;
  }

  if (!currentUser) {
    return <Navigate to="/login-register" replace />;
  }

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TopBar currentUser={currentUser} />
        </Grid>
        <div className="main-topbar-buffer" />
        <Grid item sm={3}>
          <Paper className="main-grid-item">
            <UserList />
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="main-grid-item">
            <Outlet />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

function UserLayout() {
  return <Outlet />;
}

const router = createHashRouter([
  {
    path: '/login-register',
    element: <LoginRegisterRoute />,
  },
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Navigate to="/users" replace /> },

      { path: 'users', element: <UsersLanding /> },

      {
        path: 'users/:userId',
        element: <UserLayout />,
        children: [
          { index: true, element: <UserDetail /> },
          { path: 'photos', element: <UserPhotos /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('photoshareapp'));
root.render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
);
