import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import { motion } from 'framer-motion';
import AnimatedWrapper from '@/shared/components/AnimatedWrapper';

const Settings: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <AnimatedWrapper>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ my: { xs: 2, sm: 4 } }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
              Settings
            </Typography>
          </motion.div>

          <motion.div variants={containerAnimation} initial="hidden" animate="show">
            <Stack spacing={3}>
              {/* Appearance Settings */}
              <motion.div variants={itemAnimation}>
                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom>
                    Appearance
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List disablePadding>
                    <ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <ListItemText
                        primary="Dark Mode"
                        secondary="Use dark theme across the application"
                        primaryTypographyProps={{
                          variant: isMobile ? 'body2' : 'body1',
                        }}
                      />
                      <Switch />
                    </ListItem>
                    <ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <ListItemText
                        primary="Compact Mode"
                        secondary="Reduce padding and margins for denser layout"
                        primaryTypographyProps={{
                          variant: isMobile ? 'body2' : 'body1',
                        }}
                      />
                      <Switch />
                    </ListItem>
                  </List>
                </Paper>
              </motion.div>

              {/* Notification Settings */}
              <motion.div variants={itemAnimation}>
                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom>
                    Notifications
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List disablePadding>
                    <ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <ListItemText
                        primary="Email Notifications"
                        secondary="Receive updates and alerts via email"
                        primaryTypographyProps={{
                          variant: isMobile ? 'body2' : 'body1',
                        }}
                      />
                      <Switch defaultChecked />
                    </ListItem>
                    <ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <ListItemText
                        primary="Push Notifications"
                        secondary="Receive instant notifications in your browser"
                        primaryTypographyProps={{
                          variant: isMobile ? 'body2' : 'body1',
                        }}
                      />
                      <Switch defaultChecked />
                    </ListItem>
                  </List>
                </Paper>
              </motion.div>

              {/* Preferences */}
              <motion.div variants={itemAnimation}>
                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom>
                    Preferences
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel id="currency-label">Default Currency</InputLabel>
                      <Select
                        labelId="currency-label"
                        defaultValue="USD"
                        label="Default Currency"
                        size={isMobile ? 'small' : 'medium'}
                      >
                        <MenuItem value="USD">USD ($)</MenuItem>
                        <MenuItem value="EUR">EUR (€)</MenuItem>
                        <MenuItem value="GBP">GBP (£)</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel id="date-format-label">Date Format</InputLabel>
                      <Select
                        labelId="date-format-label"
                        defaultValue="MM/DD/YYYY"
                        label="Date Format"
                        size={isMobile ? 'small' : 'medium'}
                      >
                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Paper>
              </motion.div>
            </Stack>
          </motion.div>
        </Box>
      </Container>
    </AnimatedWrapper>
  );
};

export default Settings;
