import { CONFIG } from './constants';

export const AppConfig = {
  ...CONFIG,
  api: {
    hibp: {
      baseUrl: 'https://haveibeenpwned.com/api/v3',
      timeout: 5000,
    },
    keychain: {
      service: 'password-cleanup',
      accessGroup: 'com.passwordcleanup',
    }
  },
  security: {
    passwordMinLength: 12,
    requireSpecialChars: true,
    requireNumbers: true,
    requireMixedCase: true,
  }
}; 