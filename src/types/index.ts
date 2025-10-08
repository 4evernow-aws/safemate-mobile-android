/**
 * SafeMate TypeScript Types
 * Core data structures for the SafeMate mobile app
 */

export interface Folder {
  id: string;
  name: string;
  type: 'personal' | 'family' | 'business' | 'community';
  description?: string;
  fileCount: number;
  lastModified: Date;
  createdAt: Date;
  isBlockchain: boolean;
  blockchainTokenId?: string;
  parentFolderId?: string;
  isEncrypted: boolean;
  encryptionKey?: string;
}

export interface File {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  mimeType: string;
  uploadedAt: Date;
  modifiedAt: Date;
  folderId: string;
  isBlockchain: boolean;
  blockchainTokenId?: string;
  blockchainFileId?: string;
  isEncrypted: boolean;
  encryptionKey?: string;
  checksum: string;
  localPath: string;
  thumbnailPath?: string;
  metadata?: FileMetadata;
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  tags?: string[];
  description?: string;
  author?: string;
  createdDate?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Wallet {
  id: string;
  accountId: string;
  publicKey: string;
  privateKey: string; // Encrypted
  balance: number;
  isActive: boolean;
  createdAt: Date;
  lastSynced: Date;
  network: 'testnet' | 'mainnet';
}

export interface SyncStatus {
  id: string;
  entityType: 'folder' | 'file';
  entityId: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  blockchainTokenId?: string;
  lastAttempt: Date;
  retryCount: number;
  errorMessage?: string;
}

export interface UserSettings {
  id: string;
  autoSync: boolean;
  syncInterval: number; // minutes
  encryptionEnabled: boolean;
  biometricAuth: boolean;
  darkMode: boolean;
  networkPreference: 'wifi' | 'cellular' | 'both';
  storageLocation: 'internal' | 'external';
  maxFileSize: number; // bytes
  compressionEnabled: boolean;
}

export interface BlockchainTransaction {
  id: string;
  transactionId: string;
  entityType: 'folder' | 'file';
  entityId: string;
  operation: 'create' | 'update' | 'delete' | 'transfer';
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed: number;
  cost: number; // HBAR
  timestamp: Date;
  blockNumber?: number;
  errorMessage?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Folder: { folderId: string; folderName: string };
  File: { fileId: string; fileName: string };
  Settings: undefined;
  Wallet: undefined;
};

// Component Props Types
export interface FolderGridProps {
  folders: Folder[];
  onFolderPress: (folder: Folder) => void;
  onFolderLongPress?: (folder: Folder) => void;
}

export interface FileListProps {
  files: File[];
  folder: Folder | null;
  onFilePress: (file: File) => void;
  onFileLongPress?: (file: File) => void;
}

export interface WalletStatusProps {
  connected: boolean;
  balance?: number;
  onConnect: () => void;
  onDisconnect?: () => void;
}

export interface SyncStatusProps {
  status: 'online' | 'offline' | 'syncing';
  progress?: number;
  lastSync?: Date;
}

// Database Schema Types
export interface DatabaseSchema {
  folders: Folder;
  files: File;
  wallets: Wallet;
  syncStatus: SyncStatus;
  userSettings: UserSettings;
  blockchainTransactions: BlockchainTransaction;
}

// Utility Types
export type FolderType = 'personal' | 'family' | 'business' | 'community';
export type SyncStatusType = 'pending' | 'syncing' | 'synced' | 'failed';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';
export type NetworkType = 'testnet' | 'mainnet';
