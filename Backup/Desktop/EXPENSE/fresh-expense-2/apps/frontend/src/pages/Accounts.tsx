import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import AccountsList from '../components/AccountsList';
import AddAccountButton from '../components/AddAccountButton';
import AnimatedWrapper from '../components/AnimatedWrapper';

const Accounts: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AnimatedWrapper>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Grid 
            container 
            spacing={2} 
            alignItems="center" 
            sx={{ 
              mb: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              '& > .MuiGrid-item': {
                width: { xs: '100%', sm: 'auto' }
              }
            }}
          >
            <Grid item xs>
              <Typography 
                variant="h4"
                sx={{
                  textAlign: { xs: 'center', sm: 'left' },
                  mb: { xs: 2, sm: 0 }
                }}
              >
                Accounts
              </Typography>
            </Grid>
            <Grid 
              item 
              sx={{
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              <AddAccountButton fullWidth={isMobile} />
            </Grid>
          </Grid>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 2 },
              overflowX: 'auto'
            }}
          >
            <AccountsList />
          </Paper>
        </motion.div>
      </Box>
    </AnimatedWrapper>
  );
};

export default Accounts; 