import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AnimatedWrapper from '../components/AnimatedWrapper';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <AnimatedWrapper>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Profile
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Paper 
                sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.3
                  }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 80, sm: 100 },
                      height: { xs: 80, sm: 100 },
                      fontSize: { xs: '2rem', sm: '2.5rem' },
                      margin: '0 auto 16px',
                      bgcolor: 'primary.main',
                    }}
                  >
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </Avatar>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {user?.email}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    sx={{ 
                      mt: 2,
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    Edit Profile
                  </Button>
                </motion.div>
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={8}>
            <motion.div
              variants={containerAnimation}
              initial="hidden"
              animate="show"
            >
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <motion.div variants={itemAnimation}>
                  <Typography variant="h6" gutterBottom>
                    Account Information
                  </Typography>
                </motion.div>
                <List>
                  <motion.div variants={itemAnimation}>
                    <ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <ListItemText
                        primary="Email"
                        secondary={user?.email}
                        primaryTypographyProps={{
                          variant: isMobile ? 'body2' : 'body1'
                        }}
                      />
                    </ListItem>
                    <Divider />
                  </motion.div>
                  <motion.div variants={itemAnimation}>
                    <ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <ListItemText
                        primary="Role"
                        secondary={user?.role}
                        primaryTypographyProps={{
                          variant: isMobile ? 'body2' : 'body1'
                        }}
                      />
                    </ListItem>
                    <Divider />
                  </motion.div>
                  <motion.div variants={itemAnimation}>
                    <ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <ListItemText
                        primary="Member Since"
                        secondary="March 2024"
                        primaryTypographyProps={{
                          variant: isMobile ? 'body2' : 'body1'
                        }}
                      />
                    </ListItem>
                  </motion.div>
                </List>
                <Box sx={{ mt: 3 }}>
                  <motion.div variants={itemAnimation}>
                    <Typography variant="h6" gutterBottom>
                      Security
                    </Typography>
                  </motion.div>
                  <motion.div 
                    variants={itemAnimation}
                    transition={{ delay: 0.2 }}
                  >
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={2}
                      sx={{ mt: 2 }}
                    >
                      <Button 
                        variant="outlined" 
                        color="primary"
                        fullWidth={isMobile}
                      >
                        Change Password
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth={isMobile}
                      >
                        Delete Account
                      </Button>
                    </Stack>
                  </motion.div>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </AnimatedWrapper>
  );
};

export default Profile; 