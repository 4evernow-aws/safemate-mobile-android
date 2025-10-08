/**
 * SafeMate Data Service
 * High-level data management service
 */

import DatabaseService from '../database/DatabaseService';
import { Folder, File, UserSettings } from '../types';

class DataService {
  private isInitialized = false;

  /**
   * Initialize the data service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await DatabaseService.initialize();
      await this.initializeDefaultData();
      this.isInitialized = true;
      console.log('DataService initialized successfully');
    } catch (error) {
      console.error('DataService initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize default data if needed
   */
  private async initializeDefaultData(): Promise<void> {
    // Check if we have any folders
    const folders = await DatabaseService.getFolders();
    
    if (folders.length === 0) {
      // Create default folders
      await this.createDefaultFolders();
    }
  }

  /**
   * Create default folders for new users
   */
  private async createDefaultFolders(): Promise<void> {
    const defaultFolders = [
      {
        name: 'Personal Documents',
        type: 'personal' as const,
        description: 'Your personal documents and files',
        isBlockchain: true,
        isEncrypted: true,
      },
      {
        name: 'Family Photos',
        type: 'family' as const,
        description: 'Family photos and memories',
        isBlockchain: true,
        isEncrypted: true,
      },
      {
        name: 'Business Files',
        type: 'business' as const,
        description: 'Business documents and files',
        isBlockchain: true,
        isEncrypted: true,
      },
      {
        name: 'Community Projects',
        type: 'community' as const,
        description: 'Community and collaborative projects',
        isBlockchain: true,
        isEncrypted: true,
      },
    ];

    for (const folder of defaultFolders) {
      await DatabaseService.createFolder(folder);
    }
  }

  // Folder Management
  async getFolders(): Promise<Folder[]> {
    await this.ensureInitialized();
    return await DatabaseService.getFolders();
  }

  async getFolderById(id: string): Promise<Folder | null> {
    await this.ensureInitialized();
    return await DatabaseService.getFolderById(id);
  }

  async createFolder(folderData: {
    name: string;
    type: 'personal' | 'family' | 'business' | 'community';
    description?: string;
    isBlockchain?: boolean;
    isEncrypted?: boolean;
  }): Promise<Folder> {
    await this.ensureInitialized();
    
    const folder = await DatabaseService.createFolder({
      name: folderData.name,
      type: folderData.type,
      description: folderData.description,
      isBlockchain: folderData.isBlockchain ?? true,
      isEncrypted: folderData.isEncrypted ?? true,
    });

    return folder;
  }

  async updateFolder(id: string, updates: Partial<Folder>): Promise<void> {
    await this.ensureInitialized();
    await DatabaseService.updateFolder(id, updates);
  }

  async deleteFolder(id: string): Promise<void> {
    await this.ensureInitialized();
    await DatabaseService.deleteFolder(id);
  }

  // File Management
  async getFilesByFolderId(folderId: string): Promise<File[]> {
    await this.ensureInitialized();
    return await DatabaseService.getFilesByFolderId(folderId);
  }

  async getFileById(id: string): Promise<File | null> {
    await this.ensureInitialized();
    return await DatabaseService.getFileById(id);
  }

  async createFile(fileData: {
    name: string;
    originalName: string;
    size: number;
    type: string;
    mimeType: string;
    folderId: string;
    checksum: string;
    localPath: string;
    isBlockchain?: boolean;
    isEncrypted?: boolean;
    metadata?: any;
  }): Promise<File> {
    await this.ensureInitialized();
    
    const file = await DatabaseService.createFile({
      name: fileData.name,
      originalName: fileData.originalName,
      size: fileData.size,
      type: fileData.type,
      mimeType: fileData.mimeType,
      folderId: fileData.folderId,
      isBlockchain: fileData.isBlockchain ?? true,
      blockchainTokenId: undefined,
      blockchainFileId: undefined,
      isEncrypted: fileData.isEncrypted ?? true,
      encryptionKey: undefined,
      checksum: fileData.checksum,
      localPath: fileData.localPath,
      thumbnailPath: undefined,
      metadata: fileData.metadata,
    });

    return file;
  }

  async deleteFile(id: string): Promise<void> {
    await this.ensureInitialized();
    await DatabaseService.deleteFile(id);
  }

  // Search and Filter
  async searchFolders(query: string): Promise<Folder[]> {
    await this.ensureInitialized();
    const folders = await DatabaseService.getFolders();
    
    return folders.filter(folder =>
      folder.name.toLowerCase().includes(query.toLowerCase()) ||
      (folder.description && folder.description.toLowerCase().includes(query.toLowerCase()))
    );
  }

  async searchFiles(query: string, folderId?: string): Promise<File[]> {
    await this.ensureInitialized();
    
    let files: File[] = [];
    if (folderId) {
      files = await DatabaseService.getFilesByFolderId(folderId);
    } else {
      // Search across all folders
      const folders = await DatabaseService.getFolders();
      for (const folder of folders) {
        const folderFiles = await DatabaseService.getFilesByFolderId(folder.id);
        files = files.concat(folderFiles);
      }
    }
    
    return files.filter(file =>
      file.name.toLowerCase().includes(query.toLowerCase()) ||
      file.originalName.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getFoldersByType(type: 'personal' | 'family' | 'business' | 'community'): Promise<Folder[]> {
    await this.ensureInitialized();
    const folders = await DatabaseService.getFolders();
    return folders.filter(folder => folder.type === type);
  }

  async getBlockchainFolders(): Promise<Folder[]> {
    await this.ensureInitialized();
    const folders = await DatabaseService.getFolders();
    return folders.filter(folder => folder.isBlockchain);
  }

  async getBlockchainFiles(): Promise<File[]> {
    await this.ensureInitialized();
    const folders = await DatabaseService.getFolders();
    let allFiles: File[] = [];
    
    for (const folder of folders) {
      const files = await DatabaseService.getFilesByFolderId(folder.id);
      allFiles = allFiles.concat(files.filter(file => file.isBlockchain));
    }
    
    return allFiles;
  }

  // Wallet Management
  async getWallets(): Promise<any[]> {
    await this.ensureInitialized();
    return await DatabaseService.getWallets();
  }

  // Statistics
  async getStorageStats(): Promise<{
    totalFolders: number;
    totalFiles: number;
    totalSize: number;
    blockchainFolders: number;
    blockchainFiles: number;
    encryptedFiles: number;
  }> {
    await this.ensureInitialized();
    
    const folders = await DatabaseService.getFolders();
    let totalFiles = 0;
    let totalSize = 0;
    let blockchainFiles = 0;
    let encryptedFiles = 0;
    
    for (const folder of folders) {
      const files = await DatabaseService.getFilesByFolderId(folder.id);
      totalFiles += files.length;
      
      for (const file of files) {
        totalSize += file.size;
        if (file.isBlockchain) blockchainFiles++;
        if (file.isEncrypted) encryptedFiles++;
      }
    }
    
    return {
      totalFolders: folders.length,
      totalFiles,
      totalSize,
      blockchainFolders: folders.filter(f => f.isBlockchain).length,
      blockchainFiles,
      encryptedFiles,
    };
  }

  // Utility Methods
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Clear all data (for testing/reset)
   */
  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    console.log('Clearing all user data...');
    
    try {
      // Clear all tables
      await DatabaseService.clearAllTables();
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }

  /**
   * Export data for backup
   */
  async exportData(): Promise<{
    folders: Folder[];
    files: File[];
    exportDate: Date;
  }> {
    await this.ensureInitialized();
    
    const folders = await DatabaseService.getFolders();
    let allFiles: File[] = [];
    
    for (const folder of folders) {
      const files = await DatabaseService.getFilesByFolderId(folder.id);
      allFiles = allFiles.concat(files);
    }
    
    return {
      folders,
      files: allFiles,
      exportDate: new Date(),
    };
  }
}

export default new DataService();
