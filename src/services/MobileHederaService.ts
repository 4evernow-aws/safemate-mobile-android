/**
 * SafeMate Android Mobile Hedera Service
 * Blockchain integration service for Android platform
 */

import {Client, AccountId, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar} from '@hashgraph/sdk';
import CryptoJS from 'crypto-js';

export interface HederaAccount {
  accountId: string;
  privateKey: string;
  publicKey: string;
  balance: string;
}

export interface HederaTransaction {
  id: string;
  type: string;
  amount: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

class MobileHederaService {
  private client: Client | null = null;
  private account: HederaAccount | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      // Initialize Hedera client for testnet
      this.client = Client.forTestnet();
      console.log('Hedera client initialized for testnet');
    } catch (error) {
      console.error('Failed to initialize Hedera client:', error);
    }
  }

  /**
   * Create a new Hedera account
   */
  async createAccount(): Promise<HederaAccount> {
    if (!this.client) {
      throw new Error('Hedera client not initialized');
    }

    try {
      // Generate new private key
      const privateKey = PrivateKey.generate();
      const publicKey = privateKey.getPublicKey();

      // Create account transaction
      const transaction = new AccountCreateTransaction()
        .setKey(publicKey)
        .setInitialBalance(Hbar.fromTinybars(1000)); // Initial balance

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      const accountId = receipt.accountId?.toString() || '';

      const account: HederaAccount = {
        accountId,
        privateKey: privateKey.toString(),
        publicKey: publicKey.toString(),
        balance: '0.00000000',
      };

      this.account = account;
      return account;
    } catch (error) {
      console.error('Failed to create Hedera account:', error);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(accountId: string): Promise<string> {
    if (!this.client) {
      throw new Error('Hedera client not initialized');
    }

    try {
      const query = new AccountBalanceQuery().setAccountId(AccountId.fromString(accountId));
      const balance = await query.execute(this.client);
      return balance.hbars.toString();
    } catch (error) {
      console.error('Failed to get account balance:', error);
      throw error;
    }
  }

  /**
   * Send HBAR to another account
   */
  async sendHBAR(toAccountId: string, amount: string): Promise<string> {
    if (!this.client || !this.account) {
      throw new Error('Hedera client or account not initialized');
    }

    try {
      const privateKey = PrivateKey.fromString(this.account.privateKey);
      const fromAccountId = AccountId.fromString(this.account.accountId);
      const toAccount = AccountId.fromString(toAccountId);

      const transaction = new AccountCreateTransaction()
        .setKey(privateKey.getPublicKey())
        .setInitialBalance(Hbar.fromTinybars(parseFloat(amount) * 100000000));

      const response = await transaction.execute(this.client);
      return response.transactionId.toString();
    } catch (error) {
      console.error('Failed to send HBAR:', error);
      throw error;
    }
  }

  /**
   * Get account information
   */
  getAccount(): HederaAccount | null {
    return this.account;
  }

  /**
   * Set account from stored data
   */
  setAccount(account: HederaAccount): void {
    this.account = account;
  }

  /**
   * Encrypt private key for storage
   */
  encryptPrivateKey(privateKey: string, password: string): string {
    return CryptoJS.AES.encrypt(privateKey, password).toString();
  }

  /**
   * Decrypt private key from storage
   */
  decryptPrivateKey(encryptedKey: string, password: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.client !== null;
  }

  /**
   * Get network information
   */
  getNetworkInfo(): { network: string; nodeId: string } {
    return {
      network: 'testnet',
      nodeId: '0.0.3',
    };
  }
}

export default new MobileHederaService();
