import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { CircularProgress as MuiCircularProgress } from '@mui/material';

interface CircularProgressProps {
  value: number;
  total: number;
  label: string;
  size?: number;
  thickness?: number;
  showPercentage?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  total,
  label,
  size = 120,
  thickness = 4,
  showPercentage = true,
}) => {
  const theme = useTheme();
  const percentage = Math.min(Math.round((value / total) * 100), 100);
  const isOverBudget = value > total;

  const getColor = () => {
    if (isOverBudget) return theme.palette.error.main;
    if (percentage >= 90) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <MuiCircularProgress
          variant="determinate"
          value={100}
          size={size}
          thickness={thickness}
          sx={{ color: theme.palette.grey[200] }}
        />
        <MuiCircularProgress
          variant="determinate"
          value={percentage}
          size={size}
          thickness={thickness}
          sx={{
            color: getColor(),
            position: 'absolute',
            left: 0,
            transition: 'all 0.3s ease-in-out',
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {showPercentage && (
            <Typography
              variant="h6"
              component="div"
              color={getColor()}
              sx={{ lineHeight: 1 }}
            >
              {percentage}%
            </Typography>
          )}
        </Box>
      </Box>
      <Typography
        variant="subtitle2"
        component="div"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        {label}
      </Typography>
    </Box>
  );
}; 