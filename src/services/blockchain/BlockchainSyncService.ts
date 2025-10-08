/**
 * SafeMate Blockchain Sync Service
 * Handles synchronization between local database and Hedera blockchain
 */

import HederaService from './HederaService';
import WalletManager from './WalletManager';
import DatabaseService from '../../database/DatabaseService';
import { Folder, File, SyncStatus, BlockchainTransaction } from '../../types';

class BlockchainSyncService {
  private isSyncing = false;
  private syncQueue: Array<{
    type: 'folder' | 'file';
    id: string;
    operation: 'create' | 'update' | 'delete';
  }> = [];

  /**
   * Initialize sync service
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing blockchain sync service...');
      
      // Check if we have a wallet
      const hasWallet = await WalletManager.hasWallet();
      if (!hasWallet) {
        console.log('No wallet found - user needs to create account first');
        // Don't create wallet here - let the user create account through the UI
        return;
      } else {
        // Load existing wallet
        const wallet = await WalletManager.getActiveWallet();
        if (wallet) {
          console.log('Wallet loaded:', wallet.accountId);
        }
      }
      
      console.log('Blockchain sync service initialized');
    } catch (error) {
      console.error('Failed to initialize blockchain sync service:', error);
      // Don't throw error - just log it and continue
      console.log('Blockchain sync service initialization failed, but app can continue');
    }
  }

  /**
   * Sync folder to blockchain
   */
  async syncFolderToBlockchain(folderId: string): Promise<{
    success: boolean;
    blockchainTokenId?: string;
    transactionId?: string;
    error?: string;
  }> {
    try {
      const folder = await DatabaseService.getFolderById(folderId);
      if (!folder) {
        throw new Error('Folder not found');
      }

      if (folder.isBlockchain && folder.blockchainTokenId) {
        console.log('Folder already synced to blockchain:', folder.blockchainTokenId);
        return {
          success: true,
          blockchainTokenId: folder.blockchainTokenId,
        };
      }

      console.log('Syncing folder to blockchain:', folder.name);

      // Create folder token on blockchain
      const tokenResult = await HederaService.createFolderToken(
        folder.name,
        folder.description || '',
        {
          type: folder.type,
          fileCount: folder.fileCount,
          createdAt: folder.createdAt.toISOString(),
          isEncrypted: folder.isEncrypted,
        }
      );

      // Update folder with blockchain token ID
      await DatabaseService.updateFolder(folderId, {
        blockchainTokenId: tokenResult.tokenId,
        isBlockchain: true,
      });

      // Record transaction
      await this.recordTransaction({
        entityType: 'folder',
        entityId: folderId,
        operation: 'create',
        transactionId: tokenResult.transactionId,
        status: 'confirmed',
        cost: tokenResult.cost,
      });

      // Update sync status
      await this.updateSyncStatus(folderId, 'folder', 'synced', tokenResult.tokenId);

      console.log('Folder synced to blockchain successfully:', tokenResult.tokenId);

      return {
        success: true,
        blockchainTokenId: tokenResult.tokenId,
        transactionId: tokenResult.transactionId,
      };
    } catch (error) {
      console.error('Failed to sync folder to blockchain:', error);
      
      // Update sync status with error
      await this.updateSyncStatus(folderId, 'folder', 'failed', undefined, error instanceof Error ? error.message : 'Unknown error');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync file to blockchain
   */
  async syncFileToBlockchain(fileId: string): Promise<{
    success: boolean;
    blockchainFileId?: string;
    blockchainTokenId?: string;
    transactionId?: string;
    error?: string;
  }> {
    try {
      const file = await DatabaseService.getFileById(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      if (file.isBlockchain && file.blockchainFileId) {
        console.log('File already synced to blockchain:', file.blockchainFileId);
        return {
          success: true,
          blockchainFileId: file.blockchainFileId,
        };
      }

      console.log('Syncing file to blockchain:', file.name);

      // Get folder to check if it has a blockchain token
      const folder = await DatabaseService.getFolderById(file.folderId);
      if (!folder || !folder.isBlockchain || !folder.blockchainTokenId) {
        throw new Error('Folder must be synced to blockchain first');
      }

      // Read file content (in a real app, this would read from local storage)
      const fileContent = new Uint8Array(0); // Placeholder - would read actual file
      
      // Upload file to Hedera File Service
      const uploadResult = await HederaService.uploadFile(
        fileContent,
        file.name,
        {
          originalName: file.originalName,
          size: file.size,
          type: file.type,
          mimeType: file.mimeType,
          checksum: file.checksum,
          isEncrypted: file.isEncrypted,
          uploadedAt: file.uploadedAt.toISOString(),
        }
      );

      // Mint NFT for the file
      const nftResult = await HederaService.mintFileNFT(
        folder.blockchainTokenId,
        {
          fileId: uploadResult.fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          checksum: file.checksum,
        }
      );

      // Update file with blockchain info
      await DatabaseService.updateFile(fileId, {
        blockchainFileId: uploadResult.fileId,
        blockchainTokenId: folder.blockchainTokenId,
        isBlockchain: true,
      });

      // Record transactions
      await this.recordTransaction({
        entityType: 'file',
        entityId: fileId,
        operation: 'create',
        transactionId: uploadResult.transactionId,
        status: 'confirmed',
        cost: uploadResult.cost,
      });

      await this.recordTransaction({
        entityType: 'file',
        entityId: fileId,
        operation: 'create',
        transactionId: nftResult.transactionId,
        status: 'confirmed',
        cost: nftResult.cost,
      });

      // Update sync status
      await this.updateSyncStatus(fileId, 'file', 'synced', folder.blockchainTokenId);

      console.log('File synced to blockchain successfully:', uploadResult.fileId);

      return {
        success: true,
        blockchainFileId: uploadResult.fileId,
        blockchainTokenId: folder.blockchainTokenId,
        transactionId: uploadResult.transactionId,
      };
    } catch (error) {
      console.error('Failed to sync file to blockchain:', error);
      
      // Update sync status with error
      await this.updateSyncStatus(fileId, 'file', 'failed', undefined, error instanceof Error ? error.message : 'Unknown error');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync all pending items
   */
  async syncAllPending(): Promise<{
    synced: number;
    failed: number;
    errors: string[];
  }> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return { synced: 0, failed: 0, errors: ['Sync already in progress'] };
    }

    this.isSyncing = true;
    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      console.log('Starting full sync...');

      // Get all pending sync items
      const pendingItems = await DatabaseService.getPendingSyncItems();
      
      for (const item of pendingItems) {
        try {
          if (item.entityType === 'folder') {
            const result = await this.syncFolderToBlockchain(item.entityId);
            if (result.success) {
              synced++;
            } else {
              failed++;
              if (result.error) errors.push(result.error);
            }
          } else if (item.entityType === 'file') {
            const result = await this.syncFileToBlockchain(item.entityId);
            if (result.success) {
              synced++;
            } else {
              failed++;
              if (result.error) errors.push(result.error);
            }
          }
        } catch (error) {
          failed++;
          errors.push(error instanceof Error ? error.message : 'Unknown error');
        }
      }

      console.log(`Sync completed: ${synced} synced, ${failed} failed`);
      
      return { synced, failed, errors };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    isOnline: boolean;
    isSyncing: boolean;
    pendingItems: number;
    lastSync?: Date;
  }> {
    try {
      const isOnline = await WalletManager.checkNetworkConnectivity();
      const pendingItems = await DatabaseService.getPendingSyncItemsCount();
      const lastSync = await DatabaseService.getLastSyncTime();

      return {
        isOnline,
        isSyncing: this.isSyncing,
        pendingItems,
        lastSync,
      };
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return {
        isOnline: false,
        isSyncing: false,
        pendingItems: 0,
      };
    }
  }

  // Private Methods

  /**
   * Update sync status
   */
  private async updateSyncStatus(
    entityId: string,
    entityType: 'folder' | 'file',
    status: 'pending' | 'syncing' | 'synced' | 'failed',
    blockchainTokenId?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      await DatabaseService.updateSyncStatus(entityId, entityType, {
        status,
        blockchainTokenId,
        lastAttempt: new Date(),
        errorMessage,
      });
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  }

  /**
   * Record blockchain transaction
   */
  private async recordTransaction(transaction: Omit<BlockchainTransaction, 'id' | 'timestamp'>): Promise<void> {
    try {
      await DatabaseService.createBlockchainTransaction({
        ...transaction,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to record transaction:', error);
    }
  }
}

export default new BlockchainSyncService();
