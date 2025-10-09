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
  private currentWallet: Wallet | null = null;

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
      console.log(`🔍 Loading wallet with ID: ${walletId}`);
      const wallet = await DatabaseService.getWalletById(walletId);
      if (!wallet) {
        console.log(`❌ Wallet not found in database: ${walletId}`);
        return null;
      }

      console.log(`✅ Wallet found in database: ${wallet.accountId}`);
      // Decrypt private key from keychain
      const decryptedPrivateKey = await this.getPrivateKeyFromKeychain(walletId);
      if (!decryptedPrivateKey) {
        console.log(`❌ Failed to retrieve private key from keychain for wallet: ${walletId}`);
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

      // Load wallet if not already loaded
      if (!this.currentWallet) {
        await this.loadWallet(walletId);
      }

      // Initialize Hedera client if not already initialized
      if (!HederaService.isInitialized()) {
        await HederaService.initializeTestnet();
      }

      // Set the wallet as operator before getting balance
      if (this.currentWallet) {
        HederaService.setWallet(this.currentWallet);
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
      throw error;
    }
  }

  /**
   * Check if wallet exists
   */
  async hasWallet(): Promise<boolean> {
    try {
      console.log('Checking for existing wallet...');
      const wallets = await DatabaseService.getWallets();
      const hasWallet = wallets.length > 0;
      console.log(`Wallet check result: ${hasWallet ? 'Found' : 'No wallet found'}`);
      return hasWallet;
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
   * Get current loaded wallet
   */
  getCurrentWallet(): Wallet | null {
    return this.currentWallet;
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
      } catch (networkError: any) {
        console.log('Hedera testnet connectivity: FAILED -', networkError.message);
        return false;
      }
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
  private encryptPrivateKey(privateKey: string): string {
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
  private async storePrivateKeyInKeychain(walletId: string, encryptedPrivateKey: string): Promise<void> {
    try {
      const keychainService = `${this.KEYCHAIN_SERVICE}_${walletId}`;
      console.log(`🔐 Storing private key in keychain for service: ${keychainService}`);
      
      await Keychain.setInternetCredentials(
        keychainService,
        walletId,
        encryptedPrivateKey,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        }
      );
      
      console.log(`✅ Private key stored successfully in keychain for wallet: ${walletId}`);
    } catch (error) {
      console.error('Failed to store private key in keychain:', error);
      console.error('Wallet ID:', walletId);
      console.error('Keychain service:', `${this.KEYCHAIN_SERVICE}_${walletId}`);
      throw error;
    }
  }

  /**
   * Get private key from keychain
   */
  private async getPrivateKeyFromKeychain(walletId: string): Promise<string | null> {
    try {
      const keychainService = `${this.KEYCHAIN_SERVICE}_${walletId}`;
      console.log(`🔑 Attempting to retrieve keychain for service: ${keychainService}`);
      
      const credentials = await Keychain.getInternetCredentials(keychainService);
      
      if (credentials) {
        console.log(`✅ Keychain credentials found for wallet: ${walletId}`);
        return credentials.password;
      }
      
      console.log(`❌ No keychain credentials found for wallet: ${walletId}`);
      return null;
    } catch (error) {
      console.error('Failed to get private key from keychain:', error);
      console.error('Wallet ID:', walletId);
      console.error('Keychain service:', `${this.KEYCHAIN_SERVICE}_${walletId}`);
      return null;
    }
  }

  /**
   * Delete wallet from keychain
   */
  async deleteWalletFromKeychain(walletId: string): Promise<void> {
    try {
      await Keychain.resetInternetCredentials({
        service: `${this.KEYCHAIN_SERVICE}_${walletId}`,
        username: walletId
      });
    } catch (error) {
      console.error('Failed to delete wallet from keychain:', error);
      throw error;
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
      return {
        cryptoWorking,
        availableMethods,
        testResults
      };
    } catch (error: any) {
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
