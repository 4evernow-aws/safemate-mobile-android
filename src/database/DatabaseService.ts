/**
 * SafeMate Database Service
 * SQLite database operations for persistent storage
 */

import SQLite from 'react-native-sqlite-2';
import { Folder, File, User, Wallet } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  /**
   * Initialize database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('💾 Initializing database...');

      this.db = SQLite.openDatabase({
        name: 'SafeMate.db',
        location: 'default',
      });

      await this.createTables();
      this.isInitialized = true;

      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        biometricEnabled INTEGER DEFAULT 0,
        walletAddress TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastLogin DATETIME
      )
    `;

    const createFoldersTable = `
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        isBlockchain INTEGER DEFAULT 0,
        isEncrypted INTEGER DEFAULT 0,
        blockchainFileId TEXT,
        userId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `;

    const createFilesTable = `
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        originalName TEXT NOT NULL,
        size INTEGER NOT NULL,
        type TEXT NOT NULL,
        isBlockchain INTEGER DEFAULT 0,
        isEncrypted INTEGER DEFAULT 0,
        blockchainFileId TEXT,
        folderId TEXT,
        userId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (folderId) REFERENCES folders (id),
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `;

    const createWalletsTable = `
      CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        address TEXT NOT NULL,
        privateKey TEXT NOT NULL,
        publicKey TEXT NOT NULL,
        balance TEXT DEFAULT '0',
        userId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `;

    await this.db.transaction(tx => {
      tx.executeSql(createUsersTable);
      tx.executeSql(createFoldersTable);
      tx.executeSql(createFilesTable);
      tx.executeSql(createWalletsTable);
    });

    console.log('✅ Database tables created successfully');
  }

  /**
   * User Management
   */
  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    if (!this.db) throw new Error('Database not initialized');

    const userId = this.generateId();
    const user: User = {
      id: userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      passwordHash: userData.passwordHash,
      biometricEnabled: false,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    await this.db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO users (id, firstName, lastName, email, passwordHash, createdAt, lastLogin) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, userData.firstName, userData.lastName, userData.email, userData.passwordHash, user.createdAt.toISOString(), user.lastLogin.toISOString()]
      );
    });

    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM users WHERE email = ?',
          [email],
          (_, results) => {
            if (results.rows.length > 0) {
              const row = results.rows.item(0);
              resolve({
                id: row.id,
                firstName: row.firstName,
                lastName: row.lastName,
                email: row.email,
                passwordHash: row.passwordHash,
                biometricEnabled: row.biometricEnabled === 1,
                walletAddress: row.walletAddress,
                createdAt: new Date(row.createdAt),
                lastLogin: new Date(row.lastLogin),
              });
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async hasUser(): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.transaction(tx => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM users',
          [],
          (_, results) => {
            const count = results.rows.item(0).count;
            resolve(count > 0);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.transaction(tx => {
      tx.executeSql(
        'UPDATE users SET lastLogin = ? WHERE id = ?',
        [new Date().toISOString(), userId]
      );
    });
  }

  /**
   * Folder Management
   */
  async createFolder(folderData: {
    name: string;
    type: 'personal' | 'family' | 'business' | 'community';
    description: string;
    isBlockchain: boolean;
    isEncrypted: boolean;
    userId?: string;
  }): Promise<Folder> {
    if (!this.db) throw new Error('Database not initialized');

    const folderId = this.generateId();
    const folder: Folder = {
      id: folderId,
      name: folderData.name,
      type: folderData.type,
      description: folderData.description,
      isBlockchain: folderData.isBlockchain,
      isEncrypted: folderData.isEncrypted,
      blockchainFileId: undefined,
      userId: folderData.userId,
      createdAt: new Date(),
    };

    await this.db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO folders (id, name, type, description, isBlockchain, isEncrypted, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [folderId, folderData.name, folderData.type, folderData.description, folderData.isBlockchain ? 1 : 0, folderData.isEncrypted ? 1 : 0, folderData.userId, folder.createdAt.toISOString()]
      );
    });

    return folder;
  }

  async getFolders(userId?: string): Promise<Folder[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.transaction(tx => {
        const query = userId 
          ? 'SELECT * FROM folders WHERE userId = ? ORDER BY createdAt DESC'
          : 'SELECT * FROM folders ORDER BY createdAt DESC';
        const params = userId ? [userId] : [];

        tx.executeSql(
          query,
          params,
          (_, results) => {
            const folders: Folder[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              const row = results.rows.item(i);
              folders.push({
                id: row.id,
                name: row.name,
                type: row.type,
                description: row.description,
                isBlockchain: row.isBlockchain === 1,
                isEncrypted: row.isEncrypted === 1,
                blockchainFileId: row.blockchainFileId,
                userId: row.userId,
                createdAt: new Date(row.createdAt),
              });
            }
            resolve(folders);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  /**
   * File Management
   */
  async createFile(fileData: {
    name: string;
    originalName: string;
    size: number;
    type: string;
    isBlockchain: boolean;
    isEncrypted: boolean;
    folderId: string;
    userId?: string;
  }): Promise<File> {
    if (!this.db) throw new Error('Database not initialized');

    const fileId = this.generateId();
    const file: File = {
      id: fileId,
      name: fileData.name,
      originalName: fileData.originalName,
      size: fileData.size,
      type: fileData.type,
      isBlockchain: fileData.isBlockchain,
      isEncrypted: fileData.isEncrypted,
      blockchainFileId: undefined,
      folderId: fileData.folderId,
      userId: fileData.userId,
      createdAt: new Date(),
    };

    await this.db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO files (id, name, originalName, size, type, isBlockchain, isEncrypted, folderId, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [fileId, fileData.name, fileData.originalName, fileData.size, fileData.type, fileData.isBlockchain ? 1 : 0, fileData.isEncrypted ? 1 : 0, fileData.folderId, fileData.userId, file.createdAt.toISOString()]
      );
    });

    return file;
  }

  async getFilesByFolderId(folderId: string): Promise<File[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM files WHERE folderId = ? ORDER BY createdAt DESC',
          [folderId],
          (_, results) => {
            const files: File[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              const row = results.rows.item(i);
              files.push({
                id: row.id,
                name: row.name,
                originalName: row.originalName,
                size: row.size,
                type: row.type,
                isBlockchain: row.isBlockchain === 1,
                isEncrypted: row.isEncrypted === 1,
                blockchainFileId: row.blockchainFileId,
                folderId: row.folderId,
                userId: row.userId,
                createdAt: new Date(row.createdAt),
              });
            }
            resolve(files);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  /**
   * Wallet Management
   */
  async createWallet(walletData: {
    accountId: string;
    publicKey: string;
    privateKey: string;
    balance: number;
    isActive: boolean;
    network: string;
  }): Promise<Wallet> {
    if (!this.db) throw new Error('Database not initialized');

    const walletId = this.generateId();
    const wallet: Wallet = {
      id: walletId,
      accountId: walletData.accountId,
      publicKey: walletData.publicKey,
      privateKey: walletData.privateKey,
      balance: walletData.balance,
      isActive: walletData.isActive,
      network: walletData.network,
      createdAt: new Date(),
      lastSynced: new Date(),
    };

    await this.db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO wallets (id, accountId, publicKey, privateKey, balance, isActive, network, createdAt, lastSynced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [walletId, walletData.accountId, walletData.publicKey, walletData.privateKey, walletData.balance, walletData.isActive ? 1 : 0, walletData.network, wallet.createdAt.toISOString(), wallet.lastSynced.toISOString()]
      );
    });

    return wallet;
  }

  async getWallets(userId?: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.transaction(tx => {
        const query = userId 
          ? 'SELECT * FROM wallets WHERE userId = ? ORDER BY createdAt DESC'
          : 'SELECT * FROM wallets ORDER BY createdAt DESC';
        const params = userId ? [userId] : [];

        tx.executeSql(
          query,
          params,
          (_, results) => {
            const wallets: any[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              const row = results.rows.item(i);
              wallets.push({
                id: row.id,
                address: row.address,
                privateKey: row.privateKey,
                publicKey: row.publicKey,
                balance: row.balance,
                userId: row.userId,
                createdAt: new Date(row.createdAt),
              });
            }
            resolve(wallets);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  /**
   * Utility Methods
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.transaction(tx => {
      tx.executeSql('DELETE FROM files');
      tx.executeSql('DELETE FROM folders');
      tx.executeSql('DELETE FROM wallets');
      tx.executeSql('DELETE FROM users');
    });
  }
}

export default new DatabaseService();