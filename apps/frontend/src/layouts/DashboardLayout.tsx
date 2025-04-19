import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import { MainLayout } from './MainLayout';
import { DashboardCard } from '@/shared/components/common/DashboardCard';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
}) => {
  const theme = useTheme();

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box>
            {title && (
              <Typography variant="h4" component="h1" gutterBottom>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="subtitle1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && <Box>{actions}</Box>}
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: theme.spacing(3),
          }}
        >
          {children}
        </Box>
      </Container>
    </MainLayout>
  );
};
