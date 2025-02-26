import React, { useState, useEffect } from 'react';
import { Password } from '../types';
import { SecurityService } from '../services';
import { AppError } from '../utils/error';

interface Props {
  password: Password;
  onUpdate: (password: Password) => void;
}

export const SecurityPanel: React.FC<Props> = ({ password, onUpdate }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSecurity = async () => {
    try {
      setIsChecking(true);
      setError(null);
      
      const breachCount = await SecurityService.checkForBreaches(password);
      
      onUpdate({
        ...password,
        metadata: {
          ...password.metadata,
          breachCount,
          lastChecked: new Date()
        }
      });
    } catch (error) {
      setError(error instanceof AppError ? error.message : 'Security check failed');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="security-panel">
      <h3>Security Status</h3>
      <div className="security-info">
        <p>Strength: {password.strength}</p>
        <p>Last Checked: {password.metadata.lastChecked?.toLocaleDateString()}</p>
        {password.metadata.breachCount !== undefined && (
          <p>Found in {password.metadata.breachCount} breaches</p>
        )}
      </div>
      <button 
        onClick={checkSecurity}
        disabled={isChecking}
      >
        {isChecking ? 'Checking...' : 'Check Security'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}; 