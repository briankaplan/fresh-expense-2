class AppleKeychainSync {
  constructor() {
    this.keychain = new AppleKeychainConnector();
    this.localDb = new LocalPasswordStore();
    this.merger = new PasswordMerger();
    this.conflictResolver = new ConflictResolver();
  }

  async initialize() {
    try {
      await this.keychain.authenticate();
      await this.localDb.initialize();
      this.startSyncMonitor();
    } catch (error) {
      throw new Error(`Keychain sync initialization failed: ${error.message}`);
    }
  }

  async startSync() {
    console.log('🔄 Starting Apple Keychain synchronization...');
    
    try {
      // Get passwords from both sources
      const [keychainPasswords, localPasswords] = await Promise.all([
        this.keychain.getAllPasswords(),
        this.localDb.getAllPasswords()
      ]);

      // Compare and merge
      const syncResult = await this.merger.mergePasswords(
        keychainPasswords,
        localPasswords
      );

      // Handle conflicts
      if (syncResult.conflicts.length > 0) {
        await this.handleConflicts(syncResult.conflicts);
      }

      // Update both stores
      await this.updateStores(syncResult.merged);

      return {
        success: true,
        synchronized: syncResult.merged.length,
        conflicts: syncResult.conflicts.length,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Sync failed:', error);
      throw new Error(`Sync failed: ${error.message}`);
    }
  }

  async handleConflicts(conflicts) {
    for (const conflict of conflicts) {
      const resolution = await this.conflictResolver.resolve(conflict);
      await this.applyResolution(resolution);
    }
  }
}

class AppleKeychainConnector {
  constructor() {
    this.api = new AppleKeychainAPI();
    this.session = null;
  }

  async authenticate() {
    try {
      // Request keychain access
      const authResult = await this.api.requestAccess({
        accessLevel: 'read-write',
        service: 'password-manager'
      });

      if (authResult.granted) {
        this.session = authResult.session;
        return true;
      }
      throw new Error('Keychain access denied');
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async getAllPasswords() {
    if (!this.session) {
      throw new Error('Not authenticated');
    }

    return this.api.getPasswords({
      session: this.session,
      includeMetadata: true
    });
  }

  async updatePassword(password) {
    return this.api.updatePassword({
      session: this.session,
      ...password
    });
  }
}

class PasswordMerger {
  async mergePasswords(keychainPasswords, localPasswords) {
    const merged = new Map();
    const conflicts = [];

    // Create lookup maps
    const keychainMap = new Map(
      keychainPasswords.map(p => [this.getPasswordKey(p), p])
    );
    const localMap = new Map(
      localPasswords.map(p => [this.getPasswordKey(p), p])
    );

    // Process all passwords
    const allKeys = new Set([
      ...keychainMap.keys(),
      ...localMap.keys()
    ]);

    for (const key of allKeys) {
      const keychain = keychainMap.get(key);
      const local = localMap.get(key);

      if (keychain && local) {
        // Both exist - check for conflicts
        if (this.hasConflict(keychain, local)) {
          conflicts.push({ keychain, local });
        } else {
          merged.set(key, this.selectNewest(keychain, local));
        }
      } else {
        // Only exists in one source
        merged.set(key, keychain || local);
      }
    }

    return {
      merged: Array.from(merged.values()),
      conflicts
    };
  }

  getPasswordKey(password) {
    return `${password.service}:${password.username}`;
  }

  hasConflict(keychain, local) {
    return (
      keychain.password !== local.password &&
      Math.abs(keychain.modifiedAt - local.modifiedAt) < 300000 // 5 minutes
    );
  }

  selectNewest(keychain, local) {
    return keychain.modifiedAt > local.modifiedAt ? keychain : local;
  }
}

class ConflictResolver {
  async resolve(conflict) {
    // Analyze differences
    const differences = this.analyzeDifferences(
      conflict.keychain,
      conflict.local
    );

    // Apply resolution rules
    const resolution = await this.applyResolutionRules(
      differences,
      conflict
    );

    return {
      resolved: resolution,
      source: resolution.source,
      action: resolution.action
    };
  }

  analyzeDifferences(keychain, local) {
    return {
      password: keychain.password !== local.password,
      metadata: this.compareMetadata(keychain, local),
      timeGap: Math.abs(keychain.modifiedAt - local.modifiedAt),
      strengthDiff: this.comparePasswordStrength(keychain, local)
    };
  }

  async applyResolutionRules(differences, conflict) {
    // Implement smart conflict resolution logic
    if (differences.strengthDiff > 0) {
      // Choose stronger password
      return {
        ...conflict[differences.strengthDiff > 0 ? 'keychain' : 'local'],
        source: differences.strengthDiff > 0 ? 'keychain' : 'local',
        action: 'choose_stronger'
      };
    }

    if (differences.timeGap > 86400000) { // 24 hours
      // Choose newer version
      return {
        ...(conflict.keychain.modifiedAt > conflict.local.modifiedAt
          ? conflict.keychain
          : conflict.local),
        source: conflict.keychain.modifiedAt > conflict.local.modifiedAt
          ? 'keychain'
          : 'local',
        action: 'choose_newer'
      };
    }

    // Default to keychain version if can't decide
    return {
      ...conflict.keychain,
      source: 'keychain',
      action: 'default_to_keychain'
    };
  }
} 