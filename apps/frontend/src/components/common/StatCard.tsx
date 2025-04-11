import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Icons } from '../icons';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: keyof typeof Icons;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color,
}) => {
  const theme = useTheme();
  const IconComponent = icon ? Icons[icon].Filled : null;
  const defaultColor = theme.palette.primary.main;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      <Box
        sx={{
          p: 2,
          borderRadius: theme.shape.borderRadius,
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {IconComponent && (
            <Box
              component={motion.div}
              whileHover={{ scale: 1.1 }}
              sx={{
                mr: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: color || defaultColor,
                color: theme.palette.common.white,
              }}
            >
              <IconComponent />
            </Box>
          )}
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
          <Typography
            variant="h4"
            component={motion.h4}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            sx={{ fontWeight: 600 }}
          >
            {value}
          </Typography>

          {trend && (
            <Box
              component={motion.div}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                ml: 1,
                color: trend.isPositive
                  ? theme.palette.success.main
                  : theme.palette.error.main,
              }}
            >
              {trend.isPositive ? (
                <Icons.Success.Filled fontSize="small" />
              ) : (
                <Icons.Error.Filled fontSize="small" />
              )}
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {trend.value}%
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </motion.div>
  );
}; 