import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Card,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  useTheme,
  Link,
  Stack,
  useMediaQuery,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Register: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ width: '100%' }}
        >
          <Stack spacing={4} sx={{ width: '100%', p: isMobile ? 2 : 3 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Fresh Expense
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{
                  opacity: 0.8,
                  mt: 1,
                }}
              >
                Create your account
              </Typography>
            </Box>

            <Card
              sx={{
                bgcolor: 'background.paper',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: theme.shadows[8],
                borderRadius: 2,
                p: { xs: 2, sm: 3 },
              }}
            >
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'background.default',
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'background.default',
                        },
                      }}
                    />
                  </Stack>

                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!error && error.includes('email')}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: theme.palette.text.secondary }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.default',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!error && error.includes('password')}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: theme.palette.text.secondary }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={isLoading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.default',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!error && error.includes('password')}
                    helperText={error}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: theme.palette.text.secondary }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.default',
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      py: 1.5,
                      mt: 2,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      },
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Stack>
              </form>
            </Card>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Stack>
        </motion.div>
      </Container>

      {/* Background Gradient */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: `
            radial-gradient(circle at 0% 0%, ${theme.palette.primary.dark}40 0%, transparent 50%),
            radial-gradient(circle at 100% 0%, ${theme.palette.secondary.dark}40 0%, transparent 50%),
            radial-gradient(circle at 50% 100%, ${theme.palette.error.dark}40 0%, transparent 50%)
          `,
          opacity: 0.4,
        }}
      />
    </Box>
  );
};

export default Register;
