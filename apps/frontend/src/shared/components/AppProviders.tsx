import React from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from '../context/AuthContext';
import CssBaseline from '@mui/material/CssBaseline';
import { Outlet } from 'react-router-dom';

export function AppProviders() {
  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default AppProviders;
