/**
 * Blockchain Verification Service
 * Verifies folder and file authenticity on the Hedera blockchain
 */

import HederaService from './HederaService';
import DatabaseService from '../../database/DatabaseService';
import { Folder, File } from '../../types';

interface VerificationResult {
  isVerified: boolean;
  blockchainTokenId?: string;
  lastVerified?: Date;
  error?: string;
}

interface BlockchainStatus {
  totalFolders: number;
  verifiedFolders: number;
  pendingFolders: number;
  failedFolders: number;
  verifiedSubfolders: number;
  verifiedFiles: number;
  totalBlockchainItems: number;
}

class BlockchainVerificationService {
  private static instance: BlockchainVerificationService;

  static getInstance(): BlockchainVerificationService {
    if (!BlockchainVerificationService.instance) {
      BlockchainVerificationService.instance = new BlockchainVerificationService();
    }
    return BlockchainVerificationService.instance;
  }

  /**
   * Verify a folder exists on the blockchain
   */
  async verifyFolder(folderId: string): Promise<VerificationResult> {
    try {
      const folder = await DatabaseService.getFolderById(folderId);
      if (!folder) {
        return { isVerified: false, error: 'Folder not found in database' };
      }

      if (!folder.blockchainTokenId) {
        return { isVerified: false, error: 'No blockchain token ID' };
      }

      // Check if the token exists on Hedera
      const tokenInfo = await HederaService.getTokenInfo(folder.blockchainTokenId);
      
      if (tokenInfo) {
        // Update last verified timestamp
        await DatabaseService.updateFolder(folderId, {
          lastVerified: new Date(),
        });

        return {
          isVerified: true,
          blockchainTokenId: folder.blockchainTokenId,
          lastVerified: new Date(),
        };
      } else {
        return { isVerified: false, error: 'Token not found on blockchain' };
      }
    } catch (error) {
      console.error('Failed to verify folder:', error);
      return { 
        isVerified: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get only verified folders (blockchain authenticated)
   */
  async getVerifiedFolders(): Promise<Folder[]> {
    try {
      const allFolders = await DatabaseService.getFolders();
      const verifiedFolders: Folder[] = [];

      for (const folder of allFolders) {
        if (folder.blockchainTokenId && folder.isBlockchain) {
          const verification = await this.verifyFolder(folder.id);
          if (verification.isVerified) {
            verifiedFolders.push(folder);
          }
        }
      }

      return verifiedFolders;
    } catch (error) {
      console.error('Failed to get verified folders:', error);
      return [];
    }
  }

  /**
   * Get pending folders (not yet synced to blockchain)
   */
  async getPendingFolders(): Promise<Folder[]> {
    try {
      const allFolders = await DatabaseService.getFolders();
      return allFolders.filter(folder => 
        folder.isBlockchain && !folder.blockchainTokenId
      );
    } catch (error) {
      console.error('Failed to get pending folders:', error);
      return [];
    }
  }

  /**
   * Get failed folders (sync attempted but failed)
   */
  async getFailedFolders(): Promise<Folder[]> {
    try {
      const allFolders = await DatabaseService.getFolders();
      return allFolders.filter(folder => 
        folder.isBlockchain && 
        folder.blockchainTokenId && 
        folder.lastVerified === null
      );
    } catch (error) {
      console.error('Failed to get failed folders:', error);
      return [];
    }
  }

  /**
   * Get blockchain status summary
   */
  async getBlockchainStatus(): Promise<BlockchainStatus> {
    try {
      const allFolders = await DatabaseService.getFolders();
      const blockchainFolders = allFolders.filter(f => f.isBlockchain);
      
      const verifiedFolders = await this.getVerifiedFolders();
      const pendingFolders = await this.getPendingFolders();
      const failedFolders = await this.getFailedFolders();

      // Count verified subfolders (folders with parentId that are verified)
      const verifiedSubfolders = verifiedFolders.filter(f => f.parentId !== null && f.parentId !== undefined);
      
      // Count verified parent folders (folders without parentId that are verified)
      const verifiedParentFolders = verifiedFolders.filter(f => f.parentId === null || f.parentId === undefined);

      // Get all files and count verified ones
      const allFiles = await DatabaseService.getAllFiles();
      const verifiedFiles = allFiles.filter(f => f.isBlockchain && f.blockchainTokenId);

      // Calculate total blockchain items
      const totalBlockchainItems = verifiedParentFolders.length + verifiedSubfolders.length + verifiedFiles.length;

      return {
        totalFolders: blockchainFolders.length,
        verifiedFolders: verifiedParentFolders.length, // Only parent folders
        pendingFolders: pendingFolders.length,
        failedFolders: failedFolders.length,
        verifiedSubfolders: verifiedSubfolders.length,
        verifiedFiles: verifiedFiles.length,
        totalBlockchainItems: totalBlockchainItems,
      };
    } catch (error) {
      console.error('Failed to get blockchain status:', error);
      return {
        totalFolders: 0,
        verifiedFolders: 0,
        pendingFolders: 0,
        failedFolders: 0,
        verifiedSubfolders: 0,
        verifiedFiles: 0,
        totalBlockchainItems: 0,
      };
    }
  }

  /**
   * Retry blockchain sync for failed folders
   */
  async retryFailedFolders(): Promise<{ success: number; failed: number }> {
    try {
      const failedFolders = await this.getFailedFolders();
      let successCount = 0;
      let failedCount = 0;

      for (const folder of failedFolders) {
        try {
          // Attempt to sync to blockchain again
          const syncResult = await HederaService.createFolderToken(
            folder.name,
            folder.description || '',
            {
              type: folder.parentId ? 'subfolder' : 'parent',
              parentId: folder.parentId,
              hierarchical: true,
              canContain: ['subfolders', 'files'],
              maxChildren: 10000
            }
          );

          // Update folder with blockchain token ID
          await DatabaseService.updateFolder(folder.id, {
            blockchainTokenId: syncResult.tokenId,
            lastVerified: new Date(),
          });

          successCount++;
        } catch (error) {
          console.error(`Failed to retry sync for folder ${folder.id}:`, error);
          failedCount++;
        }
      }

      return { success: successCount, failed: failedCount };
    } catch (error) {
      console.error('Failed to retry failed folders:', error);
      return { success: 0, failed: 0 };
    }
  }

  /**
   * Verify all folders and update their status
   */
  async verifyAllFolders(): Promise<BlockchainStatus> {
    try {
      const allFolders = await DatabaseService.getFolders();
      const blockchainFolders = allFolders.filter(f => f.isBlockchain);

      for (const folder of blockchainFolders) {
        if (folder.blockchainTokenId) {
          await this.verifyFolder(folder.id);
        }
      }

      return await this.getBlockchainStatus();
    } catch (error) {
      console.error('Failed to verify all folders:', error);
      return {
        totalFolders: 0,
        verifiedFolders: 0,
        pendingFolders: 0,
        failedFolders: 0,
      };
    }
  }
}

export default BlockchainVerificationService.getInstance();
