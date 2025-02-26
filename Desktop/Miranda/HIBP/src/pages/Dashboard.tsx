import React, { useState, useEffect } from 'react';
import { Password } from '../types';
import { PasswordList, SecurityPanel, UploadArea } from '../components';
import { PasswordManager } from '../services';
import { AppError } from '../utils/error';

export const Dashboard: React.FC = () => {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const passwordManager = PasswordManager.getInstance();

  useEffect(() => {
    loadPasswords();
  }, []);

  const loadPasswords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load passwords from database
      const loadedPasswords = await passwordManager.getAllPasswords();
      setPasswords(loadedPasswords);
    } catch (error) {
      setError(error instanceof AppError ? error.message : 'Failed to load passwords');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (updatedPassword: Password) => {
    try {
      await passwordManager.updatePassword(updatedPassword);
      
      // Refresh password list
      setPasswords(passwords.map(p => 
        p.id === updatedPassword.id ? updatedPassword : p
      ));
    } catch (error) {
      setError(error instanceof AppError ? error.message : 'Failed to update password');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Password Health Dashboard</h1>
      
      <UploadArea 
        onUpload={loadPasswords}
      />

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="dashboard-content">
        <PasswordList 
          passwords={passwords}
          onPasswordUpdate={handlePasswordUpdate}
        />
        
        <div className="dashboard-stats">
          <h2>Statistics</h2>
          <p>Total Passwords: {passwords.length}</p>
          <p>Weak Passwords: {passwords.filter(p => p.strength === 'weak').length}</p>
          <p>Breached Passwords: {passwords.filter(p => p.metadata.breachCount > 0).length}</p>
        </div>
      </div>
    </div>
  );
}; 