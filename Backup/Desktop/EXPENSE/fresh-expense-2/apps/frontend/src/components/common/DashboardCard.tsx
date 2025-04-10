import React from 'react';
import { Card, CardContent, CardHeader, Typography, Box, useTheme } from '@mui/material';
import { Icons } from '../icons';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Icons;
  children: React.ReactNode;
  action?: React.ReactNode;
  minHeight?: number | string;
  fullHeight?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  action,
  minHeight = 'auto',
  fullHeight = false,
}) => {
  const theme = useTheme();
  const IconComponent = icon ? Icons[icon].Filled : null;

  return (
    <Card
      sx={{
        height: fullHeight ? '100%' : 'auto',
        minHeight,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {IconComponent && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                }}
              >
                <IconComponent />
              </Box>
            )}
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          </Box>
        }
        subheader={subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
        action={action}
        sx={{
          padding: theme.spacing(2),
          '& .MuiCardHeader-action': {
            margin: 0,
            alignSelf: 'center',
          },
        }}
      />
      <CardContent
        sx={{
          padding: theme.spacing(2),
          '&:last-child': {
            paddingBottom: theme.spacing(2),
          },
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}; 