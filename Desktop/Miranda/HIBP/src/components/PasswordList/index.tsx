import React from 'react';
import { Password } from '../../types';
import { PasswordItem } from './PasswordItem';
import { BatchControls } from './BatchControls';

interface Props {
  passwords: Password[];
  onPasswordUpdate: (password: Password) => void;
}

export const PasswordList: React.FC<Props> = ({ passwords, onPasswordUpdate }) => {
  return (
    <div className="password-list">
      <BatchControls />
      {passwords.map(password => (
        <PasswordItem 
          key={password.id}
          password={password}
          onUpdate={onPasswordUpdate}
        />
      ))}
    </div>
  );
}; 