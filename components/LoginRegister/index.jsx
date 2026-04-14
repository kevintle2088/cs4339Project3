import React from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

import './styles.css';

const INITIAL_LOGIN_FORM = {
  login_name: '',
  password: '',
};

const INITIAL_REGISTER_FORM = {
  login_name: '',
  password: '',
  first_name: '',
  last_name: '',
  location: '',
  description: '',
  occupation: '',
};

function extractApiError(error, fallbackMessage) {
  const responseData = error?.response?.data;
  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  return fallbackMessage;
}

function LoginRegister() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [loginForm, setLoginForm] = React.useState(INITIAL_LOGIN_FORM);
  const [registerForm, setRegisterForm] = React.useState(INITIAL_REGISTER_FORM);

  const [loginError, setLoginError] = React.useState('');
  const [registerError, setRegisterError] = React.useState('');
  const [registerSuccess, setRegisterSuccess] = React.useState('');

  const loginMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post('/admin/login', payload);
      return response.data;
    },
    onSuccess: async (loggedInUser) => {
      setLoginError('');
      queryClient.setQueryData(['auth', 'me'], loggedInUser);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      navigate(`/users/${loggedInUser._id}`, { replace: true });
    },
    onError: (error) => {
      setLoginError(extractApiError(error, 'Login failed. Please check your credentials.'));
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post('/user', payload);
      return response.data;
    },
    onSuccess: async (createdUser) => {
      setRegisterError('');
      setRegisterSuccess('Registration successful. You can now log in.');
      setRegisterForm(INITIAL_REGISTER_FORM);
      setLoginForm((previous) => ({
        ...previous,
        login_name: createdUser.login_name,
      }));
      await queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
    onError: (error) => {
      setRegisterError(extractApiError(error, 'Registration failed. Please try again.'));
    },
  });

  function updateLoginField(field, value) {
    setLoginForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateRegisterField(field, value) {
    setRegisterForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleLoginSubmit(event) {
    event.preventDefault();
    setLoginError('');

    const loginName = loginForm.login_name.trim();
    const password = loginForm.password;

    if (!loginName || !password) {
      setLoginError('login_name and password are required.');
      return;
    }

    loginMutation.mutate({
      login_name: loginName,
      password,
    });
  }

  function handleRegisterSubmit(event) {
    event.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    const payload = {
      login_name: registerForm.login_name.trim(),
      password: registerForm.password,
      first_name: registerForm.first_name.trim(),
      last_name: registerForm.last_name.trim(),
      location: registerForm.location.trim(),
      description: registerForm.description.trim(),
      occupation: registerForm.occupation.trim(),
    };

    if (!payload.login_name || !payload.password || !payload.first_name || !payload.last_name) {
      setRegisterError('login_name, password, first_name, and last_name are required.');
      return;
    }

    registerMutation.mutate(payload);
  }

  return (
    <Box className="login-register-page">
      <Typography variant="h4" className="login-register-title">PhotoShare</Typography>
      <Typography variant="body1" color="text.secondary" className="login-register-subtitle">
        Sign in to continue, or create a new account.
      </Typography>

      <Box className="login-register-grid">
        <Paper elevation={2} className="login-register-card">
          <Typography variant="h6">Login</Typography>
          <Box component="form" onSubmit={handleLoginSubmit} className="login-register-form">
            <TextField
              label="Login Name"
              value={loginForm.login_name}
              onChange={(event) => updateLoginField('login_name', event.target.value)}
              autoComplete="username"
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={(event) => updateLoginField('password', event.target.value)}
              autoComplete="current-password"
              required
              fullWidth
            />
            {loginError ? <Alert severity="error">{loginError}</Alert> : null}
            <Stack direction="row" justifyContent="flex-end">
              <Button type="submit" variant="contained" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Signing in...' : 'Login'}
              </Button>
            </Stack>
          </Box>
        </Paper>

        <Paper elevation={2} className="login-register-card">
          <Typography variant="h6">Register</Typography>
          <Box component="form" onSubmit={handleRegisterSubmit} className="login-register-form">
            <TextField
              label="Login Name"
              value={registerForm.login_name}
              onChange={(event) => updateRegisterField('login_name', event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={registerForm.password}
              onChange={(event) => updateRegisterField('password', event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="First Name"
              value={registerForm.first_name}
              onChange={(event) => updateRegisterField('first_name', event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Last Name"
              value={registerForm.last_name}
              onChange={(event) => updateRegisterField('last_name', event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Location"
              value={registerForm.location}
              onChange={(event) => updateRegisterField('location', event.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              value={registerForm.description}
              onChange={(event) => updateRegisterField('description', event.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              label="Occupation"
              value={registerForm.occupation}
              onChange={(event) => updateRegisterField('occupation', event.target.value)}
              fullWidth
            />

            {registerError ? <Alert severity="error">{registerError}</Alert> : null}
            {registerSuccess ? <Alert severity="success">{registerSuccess}</Alert> : null}

            <Stack direction="row" justifyContent="flex-end">
              <Button type="submit" variant="contained" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Creating account...' : 'Register'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default LoginRegister;
