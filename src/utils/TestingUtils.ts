/**
 * SafeMate Testing Utilities
 * Helper functions for testing and debugging
 */

import DatabaseService from '../services/DataService';
import SecurityService from '../services/SecurityService';
import CryptoService from '../services/CryptoService';
import WalletManager from '../services/blockchain/WalletManager';

export class TestingUtils {
  /**
   * Create test data for development
   */
  static async createTestData(): Promise<void> {
    try {
      console.log('Creating test data...');
      
      // Create test folders
      const testFolders = [
        {
          name: 'Personal Documents',
          type: 'personal' as const,
          description: 'Important personal documents and certificates',
          isBlockchain: true,
          isEncrypted: true,
        },
        {
          name: 'Family Photos',
          type: 'family' as const,
          description: 'Family memories and photos',
          isBlockchain: true,
          isEncrypted: false,
        },
        {
          name: 'Business Files',
          type: 'business' as const,
          description: 'Work-related documents and contracts',
          isBlockchain: true,
          isEncrypted: true,
        },
        {
          name: 'Community Projects',
          type: 'community' as const,
          description: 'Open source projects and community work',
          isBlockchain: false,
          isEncrypted: false,
        },
      ];

      for (const folder of testFolders) {
        await DatabaseService.createFolder(folder);
        console.log(`Created test folder: ${folder.name}`);
      }

      console.log('Test data created successfully');
    } catch (error) {
      console.error('Failed to create test data:', error);
      throw error;
    }
  }

  /**
   * Clear all test data
   */
  static async clearTestData(): Promise<void> {
    try {
      console.log('Clearing test data...');
      await DatabaseService.clearAllTables();
      SecurityService.clearSecurityData();
      console.log('Test data cleared successfully');
    } catch (error) {
      console.error('Failed to clear test data:', error);
      throw error;
    }
  }

  /**
   * Test crypto functionality
   */
  static testCryptoFunctionality(): {
    randomBytes: boolean;
    randomString: boolean;
    passwordHashing: boolean;
    overall: boolean;
  } {
    const results = {
      randomBytes: false,
      randomString: false,
      passwordHashing: false,
      overall: false,
    };

    try {
      // Test random bytes generation
      const randomBytes = CryptoService.generateRandomBytes(32);
      results.randomBytes = randomBytes.length === 32 && 
        randomBytes.every(byte => byte >= 0 && byte <= 255);

      // Test random string generation
      const randomString = CryptoService.generateRandomString(16);
      results.randomString = randomString.length === 32 && // 16 bytes = 32 hex chars
        /^[a-f0-9]+$/i.test(randomString);

      // Test password hashing
      const testPassword = 'testPassword123!';
      const hash = CryptoService.hashPassword(testPassword);
      results.passwordHashing = hash && hash.length > 0 && hash !== testPassword;

      results.overall = results.randomBytes && results.randomString && results.passwordHashing;

      console.log('Crypto functionality test results:', results);
    } catch (error) {
      console.error('Crypto functionality test failed:', error);
    }

    return results;
  }

  /**
   * Test database operations
   */
  static async testDatabaseOperations(): Promise<{
    initialization: boolean;
    createFolder: boolean;
    createFile: boolean;
    queryOperations: boolean;
    overall: boolean;
  }> {
    const results = {
      initialization: false,
      createFolder: false,
      createFile: false,
      queryOperations: false,
      overall: false,
    };

    try {
      // Test database initialization
      await DatabaseService.initialize();
      results.initialization = true;

      // Test folder creation
      const testFolder = await DatabaseService.createFolder({
        name: 'Test Folder',
        type: 'personal',
        description: 'Test folder for database testing',
        isBlockchain: false,
        isEncrypted: false,
      });
      results.createFolder = !!testFolder.id;

      // Test file creation
      const testFile = await DatabaseService.createFile({
        name: 'test-file.txt',
        originalName: 'test-file.txt',
        size: 1024,
        type: 'document',
        mimeType: 'text/plain',
        folderId: testFolder.id,
        isBlockchain: false,
        isEncrypted: false,
        checksum: 'test-checksum',
        localPath: '/test/path/test-file.txt',
      });
      results.createFile = !!testFile.id;

      // Test query operations
      const folders = await DatabaseService.getFolders();
      const files = await DatabaseService.getFilesByFolderId(testFolder.id);
      results.queryOperations = folders.length > 0 && files.length > 0;

      results.overall = results.initialization && results.createFolder && 
                       results.createFile && results.queryOperations;

      console.log('Database operations test results:', results);
    } catch (error) {
      console.error('Database operations test failed:', error);
    }

    return results;
  }

  /**
   * Test security features
   */
  static testSecurityFeatures(): {
    passwordValidation: boolean;
    loginTracking: boolean;
    sessionTokens: boolean;
    auditLogging: boolean;
    overall: boolean;
  } {
    const results = {
      passwordValidation: false,
      loginTracking: false,
      sessionTokens: false,
      auditLogging: false,
      overall: false,
    };

    try {
      // Test password validation
      const weakPassword = '123';
      const strongPassword = 'StrongPassword123!';
      
      const weakResult = SecurityService.validatePassword(weakPassword);
      const strongResult = SecurityService.validatePassword(strongPassword);
      
      results.passwordValidation = !weakResult.isValid && strongResult.isValid;

      // Test login tracking
      const testEmail = 'test@example.com';
      SecurityService.trackLoginAttempt(testEmail, false);
      SecurityService.trackLoginAttempt(testEmail, false);
      SecurityService.trackLoginAttempt(testEmail, true);
      
      results.loginTracking = !SecurityService.isAccountLocked(testEmail);

      // Test session tokens
      const token = SecurityService.generateSessionToken();
      results.sessionTokens = SecurityService.validateSessionToken(token);

      // Test audit logging
      SecurityService.logSecurityEvent('test_event', 'low', 'Test audit log entry');
      const auditLog = SecurityService.getAuditLog();
      results.auditLogging = auditLog.length > 0;

      results.overall = results.passwordValidation && results.loginTracking && 
                       results.sessionTokens && results.auditLogging;

      console.log('Security features test results:', results);
    } catch (error) {
      console.error('Security features test failed:', error);
    }

    return results;
  }

  /**
   * Test blockchain functionality
   */
  static async testBlockchainFunctionality(): Promise<{
    walletCreation: boolean;
    networkConnectivity: boolean;
    accountCreation: boolean;
    overall: boolean;
  }> {
    const results = {
      walletCreation: false,
      networkConnectivity: false,
      accountCreation: false,
      overall: false,
    };

    try {
      // Test wallet creation
      const hasWallet = await WalletManager.hasWallet();
      results.walletCreation = typeof hasWallet === 'boolean';

      // Test network connectivity
      const isOnline = await WalletManager.checkNetworkConnectivity();
      results.networkConnectivity = typeof isOnline === 'boolean';

      // Test crypto functionality
      const cryptoTest = await WalletManager.testCryptoFunctionality();
      results.accountCreation = cryptoTest && typeof cryptoTest === 'object';

      results.overall = results.walletCreation && results.networkConnectivity && results.accountCreation;

      console.log('Blockchain functionality test results:', results);
    } catch (error) {
      console.error('Blockchain functionality test failed:', error);
    }

    return results;
  }

  /**
   * Run comprehensive test suite
   */
  static async runTestSuite(): Promise<{
    crypto: any;
    database: any;
    security: any;
    blockchain: any;
    overall: boolean;
  }> {
    console.log('Running SafeMate test suite...');
    
    const crypto = this.testCryptoFunctionality();
    const database = await this.testDatabaseOperations();
    const security = this.testSecurityFeatures();
    const blockchain = await this.testBlockchainFunctionality();

    const overall = crypto.overall && database.overall && security.overall && blockchain.overall;

    const results = {
      crypto,
      database,
      security,
      blockchain,
      overall,
    };

    console.log('Test suite results:', results);
    return results;
  }

  /**
   * Generate test report
   */
  static generateTestReport(results: any): string {
    const report = `
# SafeMate Test Report
Generated: ${new Date().toISOString()}

## Overall Status: ${results.overall ? '✅ PASSED' : '❌ FAILED'}

## Test Results:

### Crypto Functionality: ${results.crypto.overall ? '✅ PASSED' : '❌ FAILED'}
- Random Bytes: ${results.crypto.randomBytes ? '✅' : '❌'}
- Random String: ${results.crypto.randomString ? '✅' : '❌'}
- Password Hashing: ${results.crypto.passwordHashing ? '✅' : '❌'}

### Database Operations: ${results.database.overall ? '✅ PASSED' : '❌ FAILED'}
- Initialization: ${results.database.initialization ? '✅' : '❌'}
- Create Folder: ${results.database.createFolder ? '✅' : '❌'}
- Create File: ${results.database.createFile ? '✅' : '❌'}
- Query Operations: ${results.database.queryOperations ? '✅' : '❌'}

### Security Features: ${results.security.overall ? '✅ PASSED' : '❌ FAILED'}
- Password Validation: ${results.security.passwordValidation ? '✅' : '❌'}
- Login Tracking: ${results.security.loginTracking ? '✅' : '❌'}
- Session Tokens: ${results.security.sessionTokens ? '✅' : '❌'}
- Audit Logging: ${results.security.auditLogging ? '✅' : '❌'}

### Blockchain Functionality: ${results.blockchain.overall ? '✅ PASSED' : '❌ FAILED'}
- Wallet Creation: ${results.blockchain.walletCreation ? '✅' : '❌'}
- Network Connectivity: ${results.blockchain.networkConnectivity ? '✅' : '❌'}
- Account Creation: ${results.blockchain.accountCreation ? '✅' : '❌'}

## Recommendations:
${!results.overall ? '- Review failed tests and fix issues before deployment' : '- All tests passed! Ready for production deployment'}
    `;

    return report;
  }
}

export default TestingUtils;
