import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useSnackbar } from 'notistack';

interface GoogleAccount {
  email: string;
  isConnected: boolean;
}

export const GoogleIntegration: React.FC = () => {
  const [accounts, setAccounts] = useState<GoogleAccount[]>([
    { email: 'kaplan.brian@gmail.com', isConnected: false },
    { email: 'brian@downhome.com', isConnected: false },
  ]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      // For each account, check if we have a valid refresh token
      const updatedAccounts = await Promise.all(
        accounts.map(async account => {
          try {
            const response = await fetch(`/api/google/auth-url?email=${account.email}`);
            const { success } = await response.json();
            return { ...account, isConnected: success };
          } catch (error) {
            return { ...account, isConnected: false };
          }
        })
      );
      setAccounts(updatedAccounts);
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  };

  const handleConnect = async (email: string) => {
    try {
      const response = await fetch(`/api/google/auth-url?email=${email}`);
      const { success, url, error } = await response.json();

      if (success) {
        window.location.href = url;
      } else {
        enqueueSnackbar(`Error connecting to Google: ${error}`, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Error connecting to Google', { variant: 'error' });
      console.error('Error connecting to Google:', error);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Sync receipts from both accounts
      const syncPromises = accounts
        .filter(account => account.isConnected)
        .map(account => fetch(`/api/google/receipts?email=${account.email}&query=subject:receipt`));

      const responses = await Promise.all(syncPromises);
      const results = await Promise.all(responses.map(r => r.json()));

      const totalReceipts = results.reduce(
        (sum, result) => sum + (result.success ? result.messages.length : 0),
        0
      );

      enqueueSnackbar(`Synced ${totalReceipts} receipts from ${results.length} accounts`, {
        variant: 'success',
      });
    } catch (error) {
      enqueueSnackbar('Error syncing data', { variant: 'error' });
      console.error('Error syncing data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAutoSyncChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoSync(event.target.checked);
    // TODO: Implement auto-sync logic
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Google Integration
        </Typography>

        {accounts.map(account => (
          <Box key={account.email} sx={{ mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              {account.email}
            </Typography>
            <Button
              variant="contained"
              onClick={() => handleConnect(account.email)}
              disabled={account.isConnected}
              sx={{ mt: 1 }}
            >
              {account.isConnected ? 'Connected' : 'Connect Google Account'}
            </Button>
          </Box>
        ))}

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleSync}
            disabled={!accounts.some(a => a.isConnected) || isSyncing}
            startIcon={isSyncing ? <CircularProgress size={20} /> : null}
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={autoSync}
              onChange={handleAutoSyncChange}
              disabled={!accounts.some(a => a.isConnected)}
            />
          }
          label="Auto-sync daily"
        />
      </CardContent>
    </Card>
  );
};
