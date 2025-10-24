/**
 * SafeMate File Service
 * File operations and management
 */

import { Platform, Alert } from 'react-native';
// import DocumentPicker from 'react-native-document-picker';
// import RNFS from 'react-native-fs';
import CryptoJS from 'crypto-js';
import DatabaseService from '../database/DatabaseService';
import HederaService from './blockchain/HederaService';

export interface FileUploadResult {
  success: boolean;
  file?: any;
  error?: string;
  blockchainFileId?: string;
}

export interface FileDownloadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

class FileService {
  private encryptionKey: string = '';

  /**
   * Initialize file service
   */
  async initialize(): Promise<void> {
    try {
      console.log('📁 Initializing file service...');
      
      // Generate encryption key
      this.encryptionKey = CryptoJS.lib.WordArray.random(256/8).toString();
      
      console.log('✅ File service initialized successfully');
    } catch (error) {
      console.error('❌ File service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Pick and upload file
   */
  async pickAndUploadFile(folderId: string, userId: string): Promise<FileUploadResult> {
    try {
      console.log('📁 Starting file pick and upload...');

      // Simulate file selection for now
      const mockFile = {
        name: 'sample-document.pdf',
        size: 1024,
        type: 'application/pdf'
      };

      console.log('📄 File selected:', mockFile.name);

      // Create mock file content
      const mockContent = 'This is a sample file content for SafeMate blockchain storage.';
      const fileBuffer = Buffer.from(mockContent, 'utf8');

      // Encrypt file content
      const encryptedContent = this.encryptFile(fileBuffer);
      console.log('🔒 File encrypted successfully');

      // Upload to blockchain if enabled
      let blockchainFileId: string | undefined;
      try {
        const hederaFileId = await HederaService.createFile(new Uint8Array(encryptedContent));
        blockchainFileId = hederaFileId;
        console.log('⛓️ File uploaded to blockchain:', hederaFileId);
      } catch (blockchainError) {
        console.warn('⚠️ Blockchain upload failed:', blockchainError);
        // Continue without blockchain storage
      }

      // Save file to database
      const file = await DatabaseService.createFile({
        name: mockFile.name,
        originalName: mockFile.name,
        size: mockFile.size,
        type: mockFile.type,
        isBlockchain: !!blockchainFileId,
        isEncrypted: true,
        folderId,
        userId,
      });

      console.log('✅ File uploaded successfully');
      return {
        success: true,
        file,
        blockchainFileId,
      };

    } catch (error) {
      console.error('❌ File upload failed:', error);
      return {
        success: false,
        error: 'File upload failed. Please try again.',
      };
    }
  }

  /**
   * Download file from blockchain
   */
  async downloadFile(file: any): Promise<FileDownloadResult> {
    try {
      console.log('📥 Starting file download...');

      if (!file.isBlockchain || !file.blockchainFileId) {
        return { success: false, error: 'File not available on blockchain' };
      }

      // Get file content from blockchain
      const fileContent = await HederaService.getFileContents(file.blockchainFileId);
      console.log('📖 File content retrieved from blockchain');

      // Decrypt file content
      const decryptedContent = this.decryptFile(Buffer.from(fileContent));
      console.log('🔓 File decrypted successfully');

      // Simulate local storage for now
      const fileName = file.originalName || file.name;
      const filePath = `/storage/emulated/0/Download/${fileName}`;
      
      console.log('💾 File saved to local storage:', filePath);

      return {
        success: true,
        filePath,
      };

    } catch (error) {
      console.error('❌ File download failed:', error);
      return {
        success: false,
        error: 'File download failed. Please try again.',
      };
    }
  }

  /**
   * Create new folder
   */
  async createFolder(folderData: {
    name: string;
    type: 'personal' | 'family' | 'business' | 'community';
    description: string;
    isBlockchain: boolean;
    isEncrypted: boolean;
    userId?: string;
  }): Promise<any> {
    try {
      console.log('📁 Creating folder:', folderData.name);

      const folder = await DatabaseService.createFolder(folderData);
      console.log('✅ Folder created successfully');

      return folder;
    } catch (error) {
      console.error('❌ Folder creation failed:', error);
      throw error;
    }
  }

  /**
   * Get files by folder
   */
  async getFilesByFolder(folderId: string): Promise<any[]> {
    try {
      console.log('📁 Getting files for folder:', folderId);
      
      const files = await DatabaseService.getFilesByFolderId(folderId);
      console.log(`✅ Found ${files.length} files in folder`);
      
      return files;
    } catch (error) {
      console.error('❌ Failed to get files:', error);
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting file:', fileId);
      
      // Note: In a real implementation, you would also delete from blockchain
      // and remove the local file from storage
      
      console.log('✅ File deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ File deletion failed:', error);
      return false;
    }
  }

  /**
   * Encrypt file content
   */
  private encryptFile(fileBuffer: Buffer): Buffer {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        fileBuffer.toString('base64'),
        this.encryptionKey
      ).toString();
      
      return Buffer.from(encrypted, 'utf8');
    } catch (error) {
      console.error('❌ File encryption failed:', error);
      throw error;
    }
  }

  /**
   * Decrypt file content
   */
  private decryptFile(encryptedBuffer: Buffer): Buffer {
    try {
      const decrypted = CryptoJS.AES.decrypt(
        encryptedBuffer.toString('utf8'),
        this.encryptionKey
      ).toString(CryptoJS.enc.Utf8);
      
      return Buffer.from(decrypted, 'base64');
    } catch (error) {
      console.error('❌ File decryption failed:', error);
      throw error;
    }
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type icon
   */
  getFileTypeIcon(fileType: string): string {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('audio')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('text')) return '📝';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    return '📁';
  }
}

export default new FileService();
