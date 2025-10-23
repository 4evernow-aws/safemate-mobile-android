/**
 * SafeMate Enhanced Hedera Service
 * Real blockchain operations for alias-based accounts
 * No operator account dependency - each account is independent
 */

// Import polyfill for crypto random number generation
import 'react-native-get-random-values';

import {
  Client,
  AccountId,
  PrivateKey,
  Hbar,
  FileCreateTransaction,
  FileAppendTransaction,
  FileContentsQuery,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenAssociateTransaction,
  AccountBalanceQuery,
  TransactionResponse,
  TransactionReceipt,
  TransactionReceiptQuery,
  AccountCreateTransaction,
  TokenType,
  TokenSupplyType,
  TransferTransaction,
  AccountInfoQuery,
} from '@hashgraph/sdk';
import { Wallet } from '../../types';

export interface AccountData {
  accountId: string;
  privateKey: string;
  publicKey: string;
  balance: number;
  network: 'testnet' | 'mainnet';
  transactionId?: string;
}

export interface FileUploadResult {
  fileId: string;
  transactionId: string;
  cost: number;
  size: number;
}

export interface TokenCreationResult {
  tokenId: string;
  transactionId: string;
  cost: number;
}

export interface TransferResult {
  transactionId: string;
  cost: number;
  fromAccount: string;
  toAccount: string;
  amount: number;
}

class EnhancedHederaService {
  private static instance: EnhancedHederaService;
  private testnetClient: Client | null = null; // PRIMARY: Used for DEV/PREPROD
  private mainnetClient: Client | null = null; // FUTURE: Production only

  /**
   * Initialize Hedera client for specified network
   */
  async initializeClient(network: 'testnet' | 'mainnet'): Promise<Client> {
    try {
      if (network === 'testnet') {
        if (!this.testnetClient) {
          this.testnetClient = Client.forTestnet();
          console.log('Enhanced Hedera TESTNET client initialized (DEV/PREPROD)');
        }
        return this.testnetClient;
      } else {
        if (!this.mainnetClient) {
          this.mainnetClient = Client.forMainnet();
          console.log('Enhanced Hedera MAINNET client initialized (PRODUCTION ONLY)');
        }
        return this.mainnetClient;
      }
    } catch (error) {
      console.error('Failed to initialize Hedera client:', error);
      throw error;
    }
  }

  /**
   * Create real Hedera account with alias (no operator required)
   */
  async createAccountWithAlias(
    alias: string,
    network: 'testnet' | 'mainnet' = 'testnet' // DEFAULT: testnet for DEV/PREPROD
  ): Promise<AccountData> {
    try {
      console.log('Creating real Hedera account with alias:', alias);
      
      const client = await this.initializeClient(network);
      
      // Generate new key pair
      const privateKey = PrivateKey.generateED25519();
      const publicKey = privateKey.publicKey;
      
      console.log('Generated key pair for account');

      // Create account transaction with alias
      const accountCreateTx = new AccountCreateTransaction()
        .setKey(publicKey)
        .setAlias(alias) // Set the alias for the account
        .setInitialBalance(Hbar.fromTinybars(0)); // Start with 0 balance

      // Execute the transaction
      console.log('Executing account creation transaction...');
      const response: TransactionResponse = await accountCreateTx.execute(client);
      
      // Get the receipt
      const receipt: TransactionReceipt = await response.getReceipt(client);
      const accountId = receipt.accountId!.toString();
      const transactionId = response.transactionId.toString();

      console.log('Real Hedera account created successfully:', accountId);
      console.log('Transaction ID:', transactionId);

      // Get initial balance
      const balanceQuery = new AccountBalanceQuery().setAccountId(AccountId.fromString(accountId));
      const balance = await balanceQuery.execute(client);
      const balanceInTinybars = balance.hbars.toTinybars().toNumber();

      return {
        accountId,
        privateKey: privateKey.toString(),
        publicKey: publicKey.toString(),
        balance: balanceInTinybars,
        network,
        transactionId,
      };
    } catch (error) {
      console.error('Failed to create Hedera account with alias:', error);
      throw new Error(`Hedera account creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get account balance for any account
   */
  async getAccountBalance(
    accountId: string,
    network: 'testnet' | 'mainnet' = 'testnet'
  ): Promise<number> {
    try {
      const client = await this.initializeClient(network);
      
      const balanceQuery = new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId));
      
      const balance = await balanceQuery.execute(client);
      return balance.hbars.toTinybars().toNumber();
    } catch (error) {
      console.error('Failed to get account balance:', error);
      throw error;
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(
    accountId: string,
    network: 'testnet' | 'mainnet' = 'testnet'
  ): Promise<{
    accountId: string;
    alias?: string;
    balance: number;
    key: string;
    isDeleted: boolean;
  }> {
    try {
      const client = await this.initializeClient(network);
      
      const accountInfoQuery = new AccountInfoQuery()
        .setAccountId(AccountId.fromString(accountId));
      
      const accountInfo = await accountInfoQuery.execute(client);
      
      return {
        accountId: accountInfo.accountId.toString(),
        alias: accountInfo.alias?.toString(),
        balance: accountInfo.balance.toTinybars().toNumber(),
        key: accountInfo.key.toString(),
        isDeleted: accountInfo.isDeleted,
      };
    } catch (error) {
      console.error('Failed to get account info:', error);
      throw error;
    }
  }

  /**
   * Transfer HBAR between accounts
   */
  async transferHBAR(
    fromAccountId: string,
    fromPrivateKey: string,
    toAccountId: string,
    amount: number, // Amount in tinybars
    network: 'testnet' | 'mainnet' = 'testnet'
  ): Promise<TransferResult> {
    try {
      console.log(`Transferring ${amount} tinybars from ${fromAccountId} to ${toAccountId}`);
      
      const client = await this.initializeClient(network);
      
      // Set the sender as operator for this transaction
      const fromAccount = AccountId.fromString(fromAccountId);
      const fromKey = PrivateKey.fromString(fromPrivateKey);
      client.setOperator(fromAccount, fromKey);
      
      // Create transfer transaction
      const transferTx = new TransferTransaction()
        .addHbarTransfer(fromAccount, Hbar.fromTinybars(-amount)) // Negative for sender
        .addHbarTransfer(AccountId.fromString(toAccountId), Hbar.fromTinybars(amount)) // Positive for receiver
        .setTransactionMemo(`Transfer from ${fromAccountId} to ${toAccountId}`);
      
      // Execute the transaction
      const response = await transferTx.execute(client);
      const receipt = await response.getReceipt(client);
      
      console.log('HBAR transfer completed successfully');
      
      return {
        transactionId: response.transactionId.toString(),
        cost: receipt.transactionFee.toTinybars().toNumber(),
        fromAccount: fromAccountId,
        toAccount: toAccountId,
        amount,
      };
    } catch (error) {
      console.error('Failed to transfer HBAR:', error);
      throw error;
    }
  }

  /**
   * Upload file to Hedera File Service
   */
  async uploadFile(
    fileContent: Uint8Array,
    fileName: string,
    accountId: string,
    privateKey: string,
    metadata?: Record<string, any>,
    network: 'testnet' | 'mainnet' = 'testnet'
  ): Promise<FileUploadResult> {
    try {
      console.log(`Uploading file ${fileName} to Hedera for account ${accountId}`);
      
      const client = await this.initializeClient(network);
      
      // Set the account as operator for this transaction
      const account = AccountId.fromString(accountId);
      const key = PrivateKey.fromString(privateKey);
      client.setOperator(account, key);
      
      // Create file transaction
      const createFileTx = new FileCreateTransaction()
        .setKeys([key.publicKey])
        .setContents(fileContent);

      if (metadata) {
        createFileTx.setFileMemo(JSON.stringify(metadata));
      }

      const createResponse = await createFileTx.execute(client);
      const createReceipt = await createResponse.getReceipt(client);
      const fileId = createReceipt.fileId!.toString();

      console.log('File uploaded to Hedera:', fileId);

      return {
        fileId,
        transactionId: createResponse.transactionId.toString(),
        cost: createReceipt.transactionFee.toTinybars().toNumber(),
        size: fileContent.length,
      };
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }

  /**
   * Download file from Hedera File Service
   */
  async downloadFile(
    fileId: string,
    network: 'testnet' | 'mainnet' = 'testnet'
  ): Promise<Uint8Array> {
    try {
      const client = await this.initializeClient(network);
      
      const query = new FileContentsQuery().setFileId(fileId);
      const fileContents = await query.execute(client);
      
      console.log('File downloaded from Hedera:', fileId);
      return fileContents;
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  }

  /**
   * Create NFT token for folder
   */
  async createFolderToken(
    folderName: string,
    folderDescription: string,
    metadata: Record<string, any>,
    accountId: string,
    privateKey: string,
    network: 'testnet' | 'mainnet' = 'testnet'
  ): Promise<TokenCreationResult> {
    try {
      console.log(`Creating folder token ${folderName} for account ${accountId}`);
      
      const client = await this.initializeClient(network);
      
      // Set the account as operator for this transaction
      const account = AccountId.fromString(accountId);
      const key = PrivateKey.fromString(privateKey);
      client.setOperator(account, key);
      
      // Create token transaction
      const createTokenTx = new TokenCreateTransaction()
        .setTokenName(folderName)
        .setTokenSymbol(folderName.substring(0, 4).toUpperCase())
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(account)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(1000)
        .setTokenMemo(JSON.stringify(metadata));

      const response = await createTokenTx.execute(client);
      const receipt = await response.getReceipt(client);
      const tokenId = receipt.tokenId!.toString();

      console.log('Folder token created:', tokenId);

      return {
        tokenId,
        transactionId: response.transactionId.toString(),
        cost: receipt.transactionFee.toTinybars().toNumber(),
      };
    } catch (error) {
      console.error('Failed to create folder token:', error);
      throw error;
    }
  }

  /**
   * Mint NFT for file
   */
  async mintFileNFT(
    tokenId: string,
    fileMetadata: Record<string, any>,
    accountId: string,
    privateKey: string,
    network: 'testnet' | 'mainnet' = 'testnet'
  ): Promise<{
    serialNumber: number;
    transactionId: string;
    cost: number;
  }> {
    try {
      console.log(`Minting file NFT for token ${tokenId} and account ${accountId}`);
      
      const client = await this.initializeClient(network);
      
      // Set the account as operator for this transaction
      const account = AccountId.fromString(accountId);
      const key = PrivateKey.fromString(privateKey);
      client.setOperator(account, key);
      
      // Mint NFT transaction
      const mintTx = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([new Uint8Array(Buffer.from(JSON.stringify(fileMetadata)))]);

      const response = await mintTx.execute(client);
      const receipt = await response.getReceipt(client);
      const serialNumber = receipt.serials[0].toNumber();

      console.log('File NFT minted:', serialNumber);

      return {
        serialNumber,
        transactionId: response.transactionId.toString(),
        cost: receipt.transactionFee.toTinybars().toNumber(),
      };
    } catch (error) {
      console.error('Failed to mint file NFT:', error);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(
    transactionId: string,
    network: 'testnet' | 'mainnet' = 'testnet'
  ): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    receipt?: TransactionReceipt;
    error?: string;
  }> {
    try {
      const client = await this.initializeClient(network);
      
      const receipt = await new TransactionReceiptQuery()
        .setTransactionId(transactionId)
        .execute(client);

      return {
        status: 'confirmed',
        receipt,
      };
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check network connectivity
   */
  async checkConnectivity(network: 'testnet' | 'mainnet' = 'testnet'): Promise<boolean> {
    try {
      const client = await this.initializeClient(network);
      
      // Try to get network info
      const networkVersion = await client.getNetworkVersion();
      return networkVersion !== null;
    } catch (error) {
      console.error('Hedera network connectivity check failed:', error);
      return false;
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo(network: 'testnet' | 'mainnet' = 'testnet'): Promise<{
    network: string;
    nodes: string[];
    version: string;
  }> {
    try {
      const client = await this.initializeClient(network);
      
      const networkVersion = await client.getNetworkVersion();
      const networkNodes = client.getNetwork();

      return {
        network,
        nodes: Object.keys(networkNodes),
        version: networkVersion || 'unknown',
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw error;
    }
  }

  /**
   * Validate account ID format
   */
  validateAccountId(accountId: string): boolean {
    // Basic Hedera account ID format validation (e.g., "0.0.123456")
    return /^\d+\.\d+\.\d+$/.test(accountId);
  }

  /**
   * Convert tinybars to HBAR
   */
  tinybarsToHBAR(tinybars: number): number {
    return tinybars / 100000000; // 1 HBAR = 100,000,000 tinybars
  }

  /**
   * Convert HBAR to tinybars
   */
  hbarToTinybars(hbar: number): number {
    return Math.floor(hbar * 100000000); // 1 HBAR = 100,000,000 tinybars
  }

  /**
   * Close all clients
   */
  async close(): Promise<void> {
    try {
      if (this.testnetClient) {
        await this.testnetClient.close();
        this.testnetClient = null;
      }
      if (this.mainnetClient) {
        await this.mainnetClient.close();
        this.mainnetClient = null;
      }
      console.log('All Hedera clients closed');
    } catch (error) {
      console.error('Failed to close Hedera clients:', error);
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): EnhancedHederaService {
    if (!EnhancedHederaService.instance) {
      EnhancedHederaService.instance = new EnhancedHederaService();
    }
    return EnhancedHederaService.instance;
  }
}

export default EnhancedHederaService.getInstance();
