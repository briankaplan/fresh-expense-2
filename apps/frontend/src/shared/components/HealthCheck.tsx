import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import healthService from '../services/health.service';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: boolean;
    api: boolean;
    cache: boolean;
  };
  version: string;
  uptime: number;
}

const HealthCheck: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const status = await healthService.checkHealth();
      setHealth(status);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    healthService.startHealthCheck();

    return () => {
      healthService.stopHealthCheck();
    };
  }, []);

  const getStatusColor = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'unhealthy':
        return 'error';
      default:
        return 'default';
    }
  };

  if (!health) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
      <Tooltip title="System Status">
        <Chip
          label={health.status.toUpperCase()}
          color={getStatusColor(health.status)}
          size="small"
        />
      </Tooltip>

      <Typography variant="caption" color="textSecondary">
        v{health.version}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1 }}>
        {Object.entries(health.services).map(([service, status]) => (
          <Tooltip key={service} title={`${service}: ${status ? 'Online' : 'Offline'}`}>
            <Chip
              label={service}
              size="small"
              color={status ? 'success' : 'error'}
              variant="outlined"
            />
          </Tooltip>
        ))}
      </Box>

      <Tooltip title="Refresh Status">
        <IconButton size="small" onClick={checkHealth} disabled={loading} sx={{ ml: 'auto' }}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default HealthCheck;
