import React, { useState, useEffect } from 'react';
import { Password } from '../../types';
import { PasswordList } from '../PasswordList';
import { SecurityPanel } from '../SecurityPanel';
import { UploadArea } from '../UploadArea';
import { PasswordManager } from '../../services';
import { AppError } from '../../utils/error';
import './Dashboard.css';

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
      const loadedPasswords = await passwordManager.getAllPasswords();
      setPasswords(loadedPasswords);
    } catch (error) {
      setError(error instanceof AppError ? error.message : 'Failed to load passwords');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Password Health Dashboard</h1>
      
      <UploadArea onUpload={loadPasswords} />

      {error && (
        <div className="error-banner">{error}</div>
      )}

      <div className="dashboard-content">
        <PasswordList 
          passwords={passwords}
          onPasswordUpdate={loadPasswords}
        />
        
        <SecurityPanel passwords={passwords} />
      </div>
    </div>
  );
}; 