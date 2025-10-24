export interface Folder {
  id: string;
  name: string;
  type: 'personal' | 'family' | 'business' | 'community';
  description: string;
  isBlockchain: boolean;
  isEncrypted: boolean;
  blockchainFileId?: string;
  userId?: string;
  createdAt: Date;
}

export interface File {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  isBlockchain: boolean;
  isEncrypted: boolean;
  blockchainFileId?: string;
  folderId: string;
  userId?: string;
  createdAt: Date;
}