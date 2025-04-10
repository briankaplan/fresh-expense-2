import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Link as MuiLink } from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Google,
} from '@mui/icons-material';
import { loginSchema } from '../utils/validationSchemas';
import { useUIStore } from '../store';
import { apiClient } from '../services/api';
import { AuthResponse } from '../types/api.types';
import { toast } from 'react-hot-toast';

interface LoginFormInputs {
  email: string;
  password: string;
}

const Login = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();
  const setIsLoading = useUIStore((state) => state.setIsLoading);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      
      // Store tokens
      localStorage.setItem(
        import.meta.env.VITE_JWT_STORAGE_KEY,
        response.data.token
      );
      localStorage.setItem(
        import.meta.env.VITE_REFRESH_TOKEN_KEY,
        response.data.refreshToken
      );

      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      // Error handling is managed by the API client
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!import.meta.env.VITE_ENABLE_GOOGLE_AUTH) {
      toast.error('Google authentication is not enabled');
      return;
    }

    try {
      setIsLoading(true);
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    } catch (error) {
      toast.error('Failed to initialize Google login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: (theme) => theme.palette.background.default,
        backgroundImage: (theme) => `
          radial-gradient(at 50% 0%, ${theme.palette.primary.dark}29 0%, transparent 50%),
          radial-gradient(at 100% 0%, ${theme.palette.secondary.dark}29 0%, transparent 50%)
        `,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        <Card
          sx={{
            width: '100%',
            background: 'rgba(26, 27, 30, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{
                fontWeight: 700,
                mb: 3,
                background: (theme) =>
                  `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome Back
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  mb: 2,
                  background: (theme) =>
                    `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  '&:hover': {
                    background: (theme) =>
                      `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  },
                }}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>

              {import.meta.env.VITE_ENABLE_GOOGLE_AUTH && (
                <>
                  <Divider sx={{ my: 2 }}>OR</Divider>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleGoogleLogin}
                    startIcon={<Google />}
                    sx={{ mb: 2 }}
                  >
                    Continue with Google
                  </Button>
                </>
              )}

              <Box sx={{ textAlign: 'center' }}>
                <MuiLink
                  component={RouterLink}
                  to="/forgot-password"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Forgot Password?
                </MuiLink>
              </Box>

              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Don't have an account?{' '}
                <MuiLink
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Sign Up
                </MuiLink>
              </Typography>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Login;