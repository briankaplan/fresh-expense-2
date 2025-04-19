import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  Fade,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome Back
            </Typography>

            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #764ba2, #667eea)',
                  },
                }}
              >
                Sign In
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  to="/forgot-password"
                  style={{
                    textDecoration: 'none',
                    color: '#667eea',
                    fontSize: '0.875rem',
                  }}
                >
                  Forgot password?
                </Link>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    style={{
                      textDecoration: 'none',
                      color: '#667eea',
                      fontWeight: 'bold',
                    }}
                  >
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
