import keytar from 'keytar';

export class AppleKeychainService {
  constructor() {
    this.keytar = keytar;
  }

  async scanKeychain() {
    try {
      console.log('🔐 Starting Keychain scan...');
      
      // Get all credentials stored in the keychain
      const credentials = await this.keytar.findCredentials('');
      
      // Format the results
      const passwords = credentials.map(cred => ({
        id: `${cred.account}-${cred.service}`,
        service: cred.service,
        account: cred.account,
        password: cred.password,
        created: new Date(), // Keytar doesn't provide creation date
        modified: new Date(),
        source: 'keychain'
      }));

      console.log(`Found ${passwords.length} passwords`);
      return passwords;

    } catch (error) {
      console.error('Keychain scan failed:', error);
      if (error.message.includes('access denied')) {
        throw new Error('Please allow Keychain access when prompted');
      }
      throw new Error(`Unable to access Keychain: ${error.message}`);
    }
  }

  async getPassword(service, account) {
    try {
      return await this.keytar.getPassword(service, account);
    } catch (error) {
      console.error('Error getting password:', error);
      return null;
    }
  }

  async savePassword(service, account, password) {
    try {
      await this.keytar.setPassword(service, account, password);
      return true;
    } catch (error) {
      console.error('Error saving password:', error);
      return false;
    }
  }

  async deletePassword(service, account) {
    try {
      await this.keytar.deletePassword(service, account);
      return true;
    } catch (error) {
      console.error('Error deleting password:', error);
      return false;
    }
  }
} 