/**
 * SafeMate Hedera Service
 * Blockchain operations using Hedera Hashgraph SDK
 */

import 'react-native-get-random-values';
import {
  Client,
  AccountId,
  PrivateKey,
  Hbar,
  FileCreateTransaction,
  FileAppendTransaction,
  FileContentsQuery,
  TransactionResponse,
  TransactionReceipt,
} from '@hashgraph/sdk';

export interface HederaConfig {
  network: 'testnet' | 'mainnet';
  operatorId: string;
  operatorKey: string;
}

export interface HederaFile {
  fileId: string;
  contents: Uint8Array;
  size: number;
  created: Date;
}

class HederaService {
  private client: Client | null = null;
  private config: HederaConfig | null = null;

  /**
   * Initialize Hedera client
   */
  async initialize(config: HederaConfig): Promise<void> {
    try {
      console.log('⛓️ Initializing Hedera service...');

      this.config = config;
      
      // Create Hedera client
      this.client = Client.forName(config.network);
      this.client.setOperator(
        AccountId.fromString(config.operatorId),
        PrivateKey.fromString(config.operatorKey)
      );

      console.log('✅ Hedera service initialized successfully');
    } catch (error) {
      console.error('❌ Hedera initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create a new file on Hedera
   */
  async createFile(contents: Uint8Array): Promise<string> {
    if (!this.client) {
      throw new Error('Hedera client not initialized');
    }

    try {
      console.log('📁 Creating file on Hedera...');

      const fileCreateTx = new FileCreateTransaction()
        .setContents(contents)
        .setMaxTransactionFee(new Hbar(2));

      const fileCreateResponse: TransactionResponse = await fileCreateTx.execute(this.client);
      const fileCreateReceipt: TransactionReceipt = await fileCreateResponse.getReceipt(this.client);
      
      const fileId = fileCreateReceipt.fileId?.toString();
      if (!fileId) {
        throw new Error('File creation failed');
      }

      console.log('✅ File created on Hedera:', fileId);
      return fileId;

    } catch (error) {
      console.error('❌ File creation failed:', error);
      throw error;
    }
  }

  /**
   * Append content to existing file
   */
  async appendToFile(fileId: string, contents: Uint8Array): Promise<void> {
    if (!this.client) {
      throw new Error('Hedera client not initialized');
    }

    try {
      console.log('📝 Appending to file:', fileId);

      const fileAppendTx = new FileAppendTransaction()
        .setFileId(fileId)
        .setContents(contents)
        .setMaxTransactionFee(new Hbar(2));

      const fileAppendResponse: TransactionResponse = await fileAppendTx.execute(this.client);
      await fileAppendResponse.getReceipt(this.client);

      console.log('✅ Content appended to file successfully');

    } catch (error) {
      console.error('❌ File append failed:', error);
      throw error;
    }
  }

  /**
   * Get file contents from Hedera
   */
  async getFileContents(fileId: string): Promise<Uint8Array> {
    if (!this.client) {
      throw new Error('Hedera client not initialized');
    }

    try {
      console.log('📖 Getting file contents:', fileId);

      const fileContentsQuery = new FileContentsQuery().setFileId(fileId);
      const contents = await fileContentsQuery.execute(this.client);

      console.log('✅ File contents retrieved successfully');
      return contents;

    } catch (error) {
      console.error('❌ File contents retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Check network connectivity
   */
  async checkConnectivity(): Promise<boolean> {
    try {
      if (!this.client) {
        return false;
      }

      // Try to get account info to test connectivity
      const accountId = AccountId.fromString(this.config!.operatorId);
      await this.client.getAccountBalance(accountId);
      
      return true;
    } catch (error) {
      console.error('❌ Hedera connectivity check failed:', error);
      return false;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string): Promise<Hbar> {
    if (!this.client) {
      throw new Error('Hedera client not initialized');
    }

    try {
      const balance = await this.client.getAccountBalance(AccountId.fromString(accountId));
      return balance;
    } catch (error) {
      console.error('❌ Balance retrieval failed:', error);
      throw error;
    }
  }
}

export default new HederaService();