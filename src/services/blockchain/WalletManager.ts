/**
 * SafeMate Wallet Manager
 * Manages Hedera wallet operations and security
 */

// Import polyfill for crypto random number generation
import 'react-native-get-random-values';

import * as Keychain from 'react-native-keychain';
import CryptoJS from 'crypto-js';
import HederaService from './HederaService';
import DatabaseService from '../../database/DatabaseService';
import CryptoService from '../CryptoService';
import { Wallet } from '../../types';

class WalletManager {
  private readonly KEYCHAIN_SERVICE = 'SafeMateWallet';
  private readonly ENCRYPTION_KEY = 'SafeMateEncryption2024';

  /**
   * Create a new wallet
   */
  async createWallet(): Promise<Wallet> {
    try {
      console.log('Creating new Hedera wallet...');
      
      // Create new Hedera account
      const accountData = await HederaService.createAccount();
      
      // Encrypt private key
      const encryptedPrivateKey = this.encryptPrivateKey(accountData.privateKey);
      
      // Create wallet object
      const wallet: Omit<Wallet, 'id' | 'createdAt' | 'lastSynced'> = {
        accountId: accountData.accountId,
        publicKey: accountData.publicKey,
        privateKey: encryptedPrivateKey,
        balance: 0,
        isActive: true,
        network: 'testnet',
      };

      // Save to database
      const savedWallet = await DatabaseService.createWallet(wallet);
      
      // Store encrypted private key in keychain
      await this.storePrivateKeyInKeychain(savedWallet.id, encryptedPrivateKey);
      
      // Set wallet in Hedera service
      HederaService.setWallet(savedWallet);
      
      console.log('Wallet created successfully:', savedWallet.accountId);
      return savedWallet;
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    }
  }

  /**
   * Load existing wallet
   */
  async loadWallet(walletId: string): Promise<Wallet | null> {
    try {
      const wallet = await DatabaseService.getWalletById(walletId);
      if (!wallet) return null;

      // Decrypt private key from keychain
      const decryptedPrivateKey = await this.getPrivateKeyFromKeychain(walletId);
      if (!decryptedPrivateKey) {
        throw new Error('Failed to retrieve private key from keychain');
      }

      // Update wallet with decrypted private key
      const walletWithDecryptedKey = {
        ...wallet,
        privateKey: decryptedPrivateKey,
      };

      // Set wallet in Hedera service
      HederaService.setWallet(walletWithDecryptedKey);
      
      return walletWithDecryptedKey;
    } catch (error) {
      console.error('Failed to load wallet:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(walletId: string): Promise<number> {
    try {
      const wallet = await DatabaseService.getWalletById(walletId);
      if (!wallet) throw new Error('Wallet not found');

      // For simulated accounts (TESTNET development), return the balance from database
      // instead of querying the blockchain since the account doesn't actually exist
      if (wallet.network === 'testnet' && wallet.accountId.startsWith('0.0.')) {
        return wallet.balance;
      }

      // For real accounts, query the blockchain
      // Load wallet if not already loaded
      if (!HederaService.currentWallet) {
        await this.loadWallet(walletId);
      }

      const balance = await HederaService.getBalance();
      
      // Update balance in database
      await DatabaseService.updateWallet(walletId, {
        balance,
        lastSynced: new Date(),
      });

      return balance;
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      // Fallback to database balance if blockchain query fails
      const wallet = await DatabaseService.getWalletById(walletId);
      if (wallet) {
        console.log('⚠️ Using fallback balance from database:', wallet.balance, 'tinybars');
        return wallet.balance;
      }
      throw error;
    }
  }

  /**
   * Check if wallet exists
   */
  async hasWallet(): Promise<boolean> {
    try {
      const wallets = await DatabaseService.getWallets();
      return wallets.length > 0;
    } catch (error) {
      console.error('Failed to check wallet existence:', error);
      return false;
    }
  }

  /**
   * Get active wallet
   */
  async getActiveWallet(): Promise<Wallet | null> {
    try {
      const wallets = await DatabaseService.getWallets();
      const activeWallet = wallets.find(w => w.isActive);
      
      if (activeWallet) {
        return await this.loadWallet(activeWallet.id);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get active wallet:', error);
      return null;
    }
  }

  /**
   * Update wallet balance
   */
  async updateWalletBalance(walletId: string): Promise<void> {
    try {
      const balance = await this.getWalletBalance(walletId);
      console.log('Wallet balance updated:', balance, 'tinybars');
    } catch (error) {
      console.error('Failed to update wallet balance:', error);
      throw error;
    }
  }

  /**
   * Check network connectivity
   */
  async checkNetworkConnectivity(): Promise<boolean> {
    try {
      return await HederaService.checkConnectivity();
    } catch (error) {
      console.error('Network connectivity check failed:', error);
      return false;
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<{
    network: string;
    nodes: string[];
    version: string;
  }> {
    try {
      return await HederaService.getNetworkInfo();
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw error;
    }
  }

  // Private Methods

  /**
   * Encrypt private key
   */
  encryptPrivateKey(privateKey: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(privateKey, this.ENCRYPTION_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Failed to encrypt private key:', error);
      throw error;
    }
  }

  /**
   * Decrypt private key
   */
  private decryptPrivateKey(encryptedPrivateKey: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedPrivateKey, this.ENCRYPTION_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Failed to decrypt private key:', error);
      throw error;
    }
  }

  /**
   * Store private key in keychain
   */
  async storePrivateKeyInKeychain(walletId: string, encryptedPrivateKey: string): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        `${this.KEYCHAIN_SERVICE}_${walletId}`,
        walletId,
        encryptedPrivateKey,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
          authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
        }
      );
    } catch (error) {
      console.error('Failed to store private key in keychain:', error);
      throw error;
    }
  }

  /**
   * Get private key from keychain
   */
  private async getPrivateKeyFromKeychain(walletId: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(
        `${this.KEYCHAIN_SERVICE}_${walletId}`
      );
      
      if (credentials) {
        return credentials.password;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get private key from keychain:', error);
      return null;
    }
  }

  /**
   * Delete wallet from keychain
   */
  async deleteWalletFromKeychain(walletId: string): Promise<void> {
    try {
      console.log(`🗑️ Attempting to delete keychain entry for wallet: ${walletId}`);
      
      // Temporarily disable keychain deletion to isolate the bridge error
      // TODO: Re-enable once bridge error is resolved
      console.log('⚠️ Keychain deletion temporarily disabled to avoid bridge errors');
      
      // Original code (commented out for debugging):
      // const credentials = await Keychain.getInternetCredentials(`${this.KEYCHAIN_SERVICE}_${walletId}`);
      // if (credentials) {
      //   await Keychain.resetInternetCredentials(`${this.KEYCHAIN_SERVICE}_${walletId}`);
      // }
      
    } catch (error) {
      console.error('Failed to delete wallet from keychain:', error);
      // Don't throw the error - just log it and continue
    }
  }

  /**
   * Check if user has an existing wallet
   */
  async hasWallet(): Promise<boolean> {
    try {
      console.log('Checking for existing wallet...');
      const wallets = await DatabaseService.getWallets();
      const hasWallet = wallets.length > 0;
      console.log(`Wallet check result: ${hasWallet ? 'Found' : 'No wallet found'}`);
      return hasWallet;
    } catch (error) {
      console.error('Failed to check for existing wallet:', error);
      return false;
    }
  }

  /**
   * Check network connectivity to Hedera testnet
   */
  async checkNetworkConnectivity(): Promise<boolean> {
    try {
      console.log('Checking Hedera testnet connectivity...');
      
      // Initialize Hedera client
      await HederaService.initializeTestnet();
      
      // Try to get network info (simple connectivity test)
      const client = HederaService.getClient();
      if (!client) {
        console.log('Hedera client not available');
        return false;
      }

      // Test connectivity by trying to get account info for a known testnet account
      try {
        const testAccountId = '0.0.2'; // Known testnet account
        const balanceQuery = new (require('@hashgraph/sdk').AccountBalanceQuery)()
          .setAccountId(testAccountId);
        
        await balanceQuery.execute(client);
        console.log('Hedera testnet connectivity: SUCCESS');
        return true;
      } catch (networkError) {
        console.log('Hedera testnet connectivity: FAILED -', networkError.message);
        return false;
      }
    } catch (error) {
      console.error('Network connectivity check failed:', error);
      return false;
    }
  }

  /**
   * Test crypto functionality before wallet creation
   */
  async testCryptoFunctionality(): Promise<{
    cryptoWorking: boolean;
    availableMethods: string[];
    testResults: any;
  }> {
    try {
      console.log('Testing crypto functionality...');
      
      const cryptoWorking = CryptoService.testCryptoFunctionality();
      const availableMethods = CryptoService.getAvailableMethods();
      
      // Test random string generation
      const testString = CryptoService.generateRandomString(16);
      
      const testResults = {
        cryptoWorking,
        availableMethods,
        testStringLength: testString.length,
        testString: testString.substring(0, 8) + '...', // Show partial string
      };
      
      console.log('Crypto test results:', testResults);
      return testResults;
    } catch (error) {
      console.error('Crypto functionality test failed:', error);
      return {
        cryptoWorking: false,
        availableMethods: [],
        testResults: { error: error.message }
      };
    }
  }
}

export default new WalletManager();
