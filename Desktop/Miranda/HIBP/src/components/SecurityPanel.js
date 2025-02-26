import React, { useState, useEffect } from 'react';
import { SecurityManager } from '../services/SecurityManager';

/**
 * SecurityPanel component handles security settings and status display
 */
export const SecurityPanel = ({ onSecurityChange }) => {
  // State for security settings
  const [securitySettings, setSecuritySettings] = useState({
    autoLock: true,
    lockTimeout: 5, // minutes
    requireMasterPassword: true,
    biometricEnabled: false
  });

  const [securityStatus, setSecurityStatus] = useState({
    isLocked: false,
    lastUnlock: null,
    securityLevel: 'high'
  });

  const securityManager = new SecurityManager();

  useEffect(() => {
    // Load initial security settings
    const loadSecuritySettings = async () => {
      try {
        const settings = await securityManager.getSecuritySettings();
        setSecuritySettings(settings);
      } catch (error) {
        console.error('Failed to load security settings:', error);
      }
    };

    loadSecuritySettings();
  }, []);

  const handleSettingChange = async (setting, value) => {
    try {
      await securityManager.updateSecuritySetting(setting, value);
      setSecuritySettings(prev => ({
        ...prev,
        [setting]: value
      }));
      
      if (onSecurityChange) {
        onSecurityChange(setting, value);
      }
    } catch (error) {
      console.error('Failed to update security setting:', error);
    }
  };

  return (
    <div className="security-panel">
      <h2>Security Settings</h2>
      
      <div className="security-options">
        <div className="setting-row">
          <label>
            <input
              type="checkbox"
              checked={securitySettings.autoLock}
              onChange={(e) => handleSettingChange('autoLock', e.target.checked)}
            />
            Auto-lock vault
          </label>
        </div>

        {securitySettings.autoLock && (
          <div className="setting-row">
            <label>
              Lock timeout (minutes):
              <input
                type="number"
                min="1"
                max="60"
                value={securitySettings.lockTimeout}
                onChange={(e) => handleSettingChange('lockTimeout', parseInt(e.target.value))}
              />
            </label>
          </div>
        )}

        <div className="setting-row">
          <label>
            <input
              type="checkbox"
              checked={securitySettings.requireMasterPassword}
              onChange={(e) => handleSettingChange('requireMasterPassword', e.target.checked)}
            />
            Require master password on launch
          </label>
        </div>

        <div className="setting-row">
          <label>
            <input
              type="checkbox"
              checked={securitySettings.biometricEnabled}
              onChange={(e) => handleSettingChange('biometricEnabled', e.target.checked)}
            />
            Enable biometric unlock
          </label>
        </div>
      </div>

      <div className="security-status">
        <h3>Security Status</h3>
        <p>Status: {securityStatus.isLocked ? 'Locked' : 'Unlocked'}</p>
        <p>Security Level: {securityStatus.securityLevel}</p>
        {securityStatus.lastUnlock && (
          <p>Last Unlock: {new Date(securityStatus.lastUnlock).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}; 