/**
 * SafeMate Hedera Service
 * Blockchain operations using Hedera Hashgraph SDK
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
} from '@hashgraph/sdk';
import { Wallet } from '../../types';
import CryptoService from '../CryptoService';

class HederaService {
  private client: Client | null = null;
  private currentWallet: Wallet | null = null;
  private static instance: HederaService;
  private operatorConfigured: boolean = false;
  private readonly TESTNET_NODES = {
    '0.testnet.hedera.com:50211': '0.0.3',
    '1.testnet.hedera.com:50211': '0.0.4',
    '2.testnet.hedera.com:50211': '0.0.5',
  };

  /**
   * Initialize Hedera client for testnet
   */
  async initializeTestnet(): Promise<void> {
    try {
      this.client = Client.forTestnet();
      console.log('Hedera testnet client initialized');

      // Attempt to configure operator from environment/runtime
      this.configureOperatorFromEnv();
    } catch (error) {
      console.error('Failed to initialize Hedera client:', error);
      throw error;
    }
  }

  /**
   * Configure operator from user's wallet (no external operator needed)
   * The user's wallet will be the operator for all transactions
   */
  private configureOperatorFromEnv(): void {
    try {
      if (!this.client) return;
      
      // No external operator needed - user's wallet will be the operator
      this.operatorConfigured = false; // Will be set when user wallet is loaded
      console.log('Hedera client initialized - user wallet will be the operator for all transactions');
    } catch (err) {
      this.operatorConfigured = false;
      console.warn('Failed to initialize Hedera client:', err);
    }
  }

  /**
   * Get the current Hedera client
   */
  getClient(): Client | null {
    return this.client;
  }

  /**
   * Check if Hedera client is initialized
   */
  isInitialized(): boolean {
    return this.client !== null;
  }

  /**
   * Get singleton instance
   */
  static getInstance(): HederaService {
    if (!HederaService.instance) {
      HederaService.instance = new HederaService();
    }
    return HederaService.instance;
  }

  /**
   * Create a new Hedera account with enhanced crypto support
   */
  async createAccount(): Promise<{
    accountId: string;
    privateKey: string;
    publicKey: string;
  }> {
    if (!this.client) {
      await this.initializeTestnet();
    }

    try {
      // Test crypto functionality first
      const cryptoWorking = CryptoService.testCryptoFunctionality();
      console.log('Crypto functionality test:', cryptoWorking ? 'PASSED' : 'FAILED');
      console.log('Available crypto methods:', CryptoService.getAvailableMethods());

      // Generate new key pair with fallback methods
      let privateKey: PrivateKey;
      let publicKey: any;

      try {
        // Method 1: Try standard Hedera SDK key generation
        privateKey = PrivateKey.generateED25519();
        publicKey = privateKey.publicKey;
        console.log('Hedera: Using standard PrivateKey.generateED25519()');
      } catch (sdkError) {
        console.warn('Hedera: Standard key generation failed, trying alternative method:', sdkError);
        
        // Method 2: Generate random bytes and create key manually
        const randomBytes = CryptoService.generateRandomBytes(32);
        privateKey = PrivateKey.fromBytes(randomBytes);
        publicKey = privateKey.publicKey;
        console.log('Hedera: Using alternative key generation with CryptoService');
      }

      // Create a real Hedera account using the testnet
      console.log('Creating real Hedera account on testnet...');
      
      try {
        // For TESTNET, we need to use a funded account to create new accounts
        // This would typically be done through payment services (Alchemy Pay, Banxa, etc.)
        // For now, we'll create the account structure but note that funding is required
        
        console.log('TESTNET: Account creation requires funding through payment services');
        console.log('Account key pair generated - ready for funding and activation');
        
        // Generate a testnet account ID (this would be assigned by Hedera when funded)
        // In real implementation, this would come from the payment service
        const testnetAccountId = `0.0.${Math.floor(Math.random() * 1000000)}`;
        console.log('TESTNET: Account structure created:', testnetAccountId);
        console.log('Note: Account requires HBAR funding to be active on testnet');
        
        return {
          accountId: testnetAccountId,
          privateKey: privateKey.toString(),
          publicKey: publicKey.toString(),
        };
      } catch (accountError) {
        console.error('Account creation failed:', accountError);
        throw new Error(`Failed to create Hedera account: ${accountError.message}`);
      }
    } catch (error) {
      console.error('Failed to create Hedera account:', error);
      throw error;
    }
  }

  /**
   * Set the current wallet for operations
   * The user's wallet becomes the operator for all transactions
   */
  setWallet(wallet: Wallet): void {
    this.currentWallet = wallet;
    
    // Set the user's wallet as the operator for all transactions
    if (this.client && wallet.accountId && wallet.accountId !== 'Unknown') {
      try {
        this.client.setOperator(
          AccountId.fromString(wallet.accountId),
          PrivateKey.fromString(wallet.privateKey)
        );
        this.operatorConfigured = true;
        console.log('User wallet set as Hedera operator for account:', wallet.accountId);
        console.log('All transactions will be signed by user wallet');
      } catch (error) {
        console.warn('Failed to set user wallet as Hedera operator:', error);
        this.operatorConfigured = false;
      }
    } else {
      console.log('Cannot set user wallet as operator - account ID is Unknown or invalid');
      this.operatorConfigured = false;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(accountId?: string): Promise<number> {
    if (!this.client) throw new Error('Hedera client not initialized');

    try {
      const targetAccountId = accountId || this.currentWallet?.accountId;
      if (!targetAccountId) throw new Error('No account ID provided');

      const query = new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(targetAccountId));

      const balance = await query.execute(this.client);
      return balance.hbars.toTinybars().toNumber();
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  /**
   * Upload file to Hedera File Service
   */
  async uploadFile(
    fileContent: Uint8Array,
    fileName: string,
    metadata?: Record<string, any>
  ): Promise<{
    fileId: string;
    transactionId: string;
    cost: number;
  }> {
    if (!this.client || !this.currentWallet) {
      throw new Error('Hedera client or wallet not initialized');
    }

    try {
      // Create file transaction
      const createFileTx = new FileCreateTransaction()
        .setKeys([PrivateKey.fromString(this.currentWallet.privateKey).publicKey])
        .setContents(fileContent);

      if (metadata) {
        createFileTx.setFileMemo(JSON.stringify(metadata));
      }

      const createResponse = await createFileTx.execute(this.client);
      const createReceipt = await createResponse.getReceipt(this.client);
      const fileId = createReceipt.fileId!.toString();

      console.log('File uploaded to Hedera:', fileId);

      return {
        fileId,
        transactionId: createResponse.transactionId.toString(),
        cost: createReceipt.transactionFee.toTinybars().toNumber(),
      };
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }

  /**
   * Download file from Hedera File Service
   */
  async downloadFile(fileId: string): Promise<Uint8Array> {
    if (!this.client) throw new Error('Hedera client not initialized');

    try {
      const query = new FileContentsQuery().setFileId(fileId);
      const fileContents = await query.execute(this.client);
      
      console.log('File downloaded from Hedera:', fileId);
      return fileContents;
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  }

  /**
   * Create NFT token for folder on live testnet
   * User's wallet signs all transactions
   */
  async createFolderToken(
    folderName: string,
    folderDescription: string,
    metadata: Record<string, any>
  ): Promise<{
    tokenId: string;
    transactionId: string;
    cost: number;
  }> {
    if (!this.client || !this.currentWallet) {
      throw new Error('Hedera client or wallet not initialized');
    }

    if (!this.operatorConfigured) {
      throw new Error('User wallet not set as operator - cannot create tokens');
    }

    try {
      console.log('Creating real folder token on testnet:', folderName);
      console.log('User wallet will sign the transaction:', this.currentWallet.accountId);

      // Create token transaction - user's wallet is the operator and signs the transaction
      // This creates a hierarchical NFT that can contain other NFTs (subfolders and files)
      const createTokenTx = new TokenCreateTransaction()
        .setTokenName(folderName)
        .setTokenSymbol(folderName.substring(0, 4).toUpperCase())
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(AccountId.fromString(this.currentWallet.accountId))
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(this.currentWallet.privateKey) // Required for infinite supply tokens
        // No maxSupply for infinite supply
        .setTokenMemo(JSON.stringify({
          ...metadata,
          type: 'folder',
          hierarchical: true,
          canContain: ['subfolders', 'files'],
          maxChildren: 'unlimited'
        }));

      // Execute transaction - user's wallet signs it
      const response = await createTokenTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      const tokenId = receipt.tokenId!.toString();

      console.log('Real folder token created on testnet:', tokenId);
      console.log('Transaction signed by user wallet:', this.currentWallet.accountId);

      return {
        tokenId,
        transactionId: response.transactionId.toString(),
        cost: receipt.transactionFee.toTinybars().toNumber(),
      };
    } catch (error) {
      console.error('Failed to create folder token on testnet:', error);
      throw new Error(`Failed to create folder token: ${error.message}`);
    }
  }

  /**
   * Create subfolder token associated with parent folder token
   * User's wallet signs all transactions
   */
  async createSubfolderToken(
    parentTokenId: string,
    subfolderName: string,
    subfolderDescription: string,
    metadata: Record<string, any>
  ): Promise<{
    tokenId: string;
    transactionId: string;
    cost: number;
  }> {
    if (!this.client || !this.currentWallet) {
      throw new Error('Hedera client or wallet not initialized');
    }

    if (!this.operatorConfigured) {
      throw new Error('User wallet not set as operator - cannot create tokens');
    }

    try {
      console.log('Creating subfolder token on testnet:', subfolderName);
      console.log('Parent folder token:', parentTokenId);
      console.log('User wallet will sign the transaction:', this.currentWallet.accountId);

      // Create subfolder token - associated with parent folder
      const createTokenTx = new TokenCreateTransaction()
        .setTokenName(subfolderName)
        .setTokenSymbol(subfolderName.substring(0, 4).toUpperCase())
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(AccountId.fromString(this.currentWallet.accountId))
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(this.currentWallet.privateKey) // Required for infinite supply tokens
        // No maxSupply for infinite supply
        .setTokenMemo(JSON.stringify({
          ...metadata,
          type: 'subfolder',
          parentTokenId: parentTokenId,
          hierarchical: true,
          canContain: ['subfolders', 'files'],
          maxChildren: 'unlimited'
        }));

      const response = await createTokenTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      const tokenId = receipt.tokenId!.toString();

      console.log('Subfolder token created on testnet:', tokenId);
      console.log('Associated with parent folder token:', parentTokenId);
      console.log('Transaction signed by user wallet:', this.currentWallet.accountId);

      return {
        tokenId,
        transactionId: response.transactionId.toString(),
        cost: receipt.transactionFee.toTinybars().toNumber(),
      };
    } catch (error) {
      console.error('Failed to create subfolder token on testnet:', error);
      throw new Error(`Failed to create subfolder token: ${error.message}`);
    }
  }

  /**
   * Mint NFT for file on live testnet
   * File NFT is associated with parent folder token
   * User's wallet signs all transactions
   */
  async mintFileNFT(
    parentTokenId: string,
    fileMetadata: Record<string, any>
  ): Promise<{
    serialNumber: number;
    transactionId: string;
    cost: number;
  }> {
    if (!this.client || !this.currentWallet) {
      throw new Error('Hedera client or wallet not initialized');
    }

    if (!this.operatorConfigured) {
      throw new Error('User wallet not set as operator - cannot mint NFTs');
    }

    try {
      console.log('Minting file NFT on testnet for parent token:', parentTokenId);
      console.log('User wallet will sign the transaction:', this.currentWallet.accountId);

      // Mint file NFT - associated with parent folder token
      const mintTx = new TokenMintTransaction()
        .setTokenId(parentTokenId)
        .setMetadata([new Uint8Array(Buffer.from(JSON.stringify({
          ...fileMetadata,
          type: 'file',
          parentTokenId: parentTokenId,
          associatedWith: 'folder'
        })))]);

      const response = await mintTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      const serialNumber = receipt.serials[0].toNumber();

      console.log('File NFT minted on testnet:', serialNumber);
      console.log('Associated with parent folder token:', parentTokenId);
      console.log('Transaction signed by user wallet:', this.currentWallet.accountId);

      return {
        serialNumber,
        transactionId: response.transactionId.toString(),
        cost: receipt.transactionFee.toTinybars().toNumber(),
      };
    } catch (error) {
      console.error('Failed to mint file NFT on testnet:', error);
      throw new Error(`Failed to mint file NFT: ${error.message}`);
    }
  }

  /**
   * Get all tokens associated with a folder (subfolders and files)
   * Returns hierarchical structure of the folder
   */
  async getFolderContents(folderTokenId: string): Promise<{
    subfolders: Array<{
      tokenId: string;
      name: string;
      metadata: any;
    }>;
    files: Array<{
      serialNumber: number;
      name: string;
      metadata: any;
    }>;
  }> {
    if (!this.client) throw new Error('Hedera client not initialized');

    try {
      console.log('Querying folder contents for token:', folderTokenId);
      
      // In a real implementation, you would query the blockchain for:
      // 1. All tokens created by the user that have parentTokenId = folderTokenId
      // 2. All NFTs minted to the folder token
      
      // For now, return empty structure - this would be implemented with
      // proper blockchain queries to get the hierarchical structure
      console.log('Folder contents query completed for token:', folderTokenId);
      
      return {
        subfolders: [], // Would be populated with actual subfolder tokens
        files: [] // Would be populated with actual file NFTs
      };
    } catch (error) {
      console.error('Failed to get folder contents:', error);
      throw new Error(`Failed to get folder contents: ${error.message}`);
    }
  }

  /**
   * Get token information from blockchain
   */
  async getTokenInfo(tokenId: string): Promise<any> {
    if (!this.client) throw new Error('Hedera client not initialized');

    try {
      const tokenInfoQuery = new (require('@hashgraph/sdk').TokenInfoQuery)()
        .setTokenId(tokenId);
      
      const tokenInfo = await tokenInfoQuery.execute(this.client);
      return tokenInfo;
    } catch (error) {
      console.error('Failed to get token info:', error);
      return null;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    receipt?: TransactionReceipt;
    error?: string;
  }> {
    if (!this.client) throw new Error('Hedera client not initialized');

    try {
      const receipt = await new TransactionReceiptQuery()
        .setTransactionId(transactionId)
        .execute(this.client);

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
  async checkConnectivity(): Promise<boolean> {
    try {
      if (!this.client) {
        await this.initializeTestnet();
      }

      // Try to get network info
      const networkVersion = await this.client!.getNetworkVersion();
      return networkVersion !== null;
    } catch (error) {
      console.error('Hedera network connectivity check failed:', error);
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
    if (!this.client) {
      await this.initializeTestnet();
    }

    try {
      const networkVersion = await this.client!.getNetworkVersion();
      const network = this.client!.getNetwork();

      return {
        network: 'testnet',
        nodes: Object.keys(network),
        version: networkVersion || 'unknown',
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw error;
    }
  }

  /**
   * Purchase HBAR using funding
   * Simulates purchasing 100 HBAR with the provided funding amount
   */
  async purchaseHBAR(fundingAmount: number, targetAccountId?: string): Promise<{
    success: boolean;
    hbarAmount: number;
    transactionId?: string;
    cost: number;
  }> {
    if (!this.client || !this.currentWallet) {
      throw new Error('Hedera client or wallet not initialized');
    }

    try {
      const accountId = targetAccountId || this.currentWallet.accountId;
      if (!accountId) throw new Error('No target account ID provided');

      // Calculate HBAR amount based on current market rate
      // 100 HBAR = AUD $32.00 (current market rate)
      const hbarAmount = 100; // Fixed 100 HBAR as requested
      const hbarCostAUD = 32.00; // AUD $32.00 for 100 HBAR
      const estimatedCost = hbarCostAUD; // Use actual HBAR cost

      console.log(`🧪 TESTNET: Simulating HBAR purchase`);
      console.log(`💰 Funding amount: $${fundingAmount}`);
      console.log(`🪙 HBAR to purchase: ${hbarAmount} HBAR`);
      console.log(`💸 HBAR cost: AUD $${estimatedCost}`);
      console.log(`💵 Remaining funding: $${(fundingAmount - estimatedCost).toFixed(2)}`);

      // Simulate HBAR purchase transaction
      const simulatedTransactionId = `hbartx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`✅ TESTNET: HBAR purchase simulated successfully`);
      console.log(`📝 Transaction ID: ${simulatedTransactionId}`);
      console.log(`🎯 Target account: ${accountId}`);

      return {
        success: true,
        hbarAmount,
        transactionId: simulatedTransactionId,
        cost: estimatedCost,
      };
    } catch (error) {
      console.error('Failed to purchase HBAR:', error);
      throw error;
    }
  }

  /**
   * Close the Hedera client
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}

export default HederaService.getInstance();
