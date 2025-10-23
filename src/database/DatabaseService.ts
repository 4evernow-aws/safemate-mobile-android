/**
 * SafeMate Database Service
 * SQLite database management for local-first storage
 */

import SQLite from 'react-native-sqlite-2';
import { 
  Folder, 
  File, 
  Wallet, 
  SyncStatus, 
  BlockchainTransaction 
} from '../types';

class DatabaseService {
  private db: any | null = null;
  private readonly DB_NAME = 'SafeMate.db';

  /**
   * Initialize the database
   */
  async initialize(): Promise<void> {
    try {
      this.db = SQLite.openDatabase(this.DB_NAME);

      await this.createTables();
      console.log('SafeMate database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  // Execute a SQL statement using a transaction and return a Promise with the ResultSet
  private runSql(query: string, params: any[] = []): Promise<any> {
    if (!this.db) return Promise.reject(new Error('Database not initialized'));
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          query,
          params,
          (_tx: any, result: any) => resolve(result),
          (_tx: any, error: any) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  /**
   * Create all database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      this.createUsersTable(),
      this.createFoldersTable(),
      this.createFilesTable(),
      this.createWalletsTable(),
      this.createSyncStatusTable(),
      this.createUserSettingsTable(),
      this.createBlockchainTransactionsTable(),
    ];

    await Promise.all(tables);
  }

  /**
   * Create users table
   */
  private async createUsersTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        createdAt DATETIME NOT NULL,
        lastLogin DATETIME,
        isActive BOOLEAN DEFAULT 1,
        hasWallet BOOLEAN DEFAULT 0,
        walletId TEXT
      )
    `;
    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(query, [], () => resolve(), (_, error) => reject(error));
      });
    });
  }

  /**
   * Create folders table
   */
  private async createFoldersTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('personal', 'family', 'business', 'community')),
        description TEXT,
        fileCount INTEGER DEFAULT 0,
        lastModified DATETIME NOT NULL,
        createdAt DATETIME NOT NULL,
        isBlockchain BOOLEAN DEFAULT 0,
        blockchainTokenId TEXT,
        parentFolderId TEXT,
        isEncrypted BOOLEAN DEFAULT 0,
        encryptionKey TEXT,
        FOREIGN KEY (parentFolderId) REFERENCES folders (id)
      )
    `;
    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(query, [], () => resolve(), (_, error) => reject(error));
      });
    });
  }

  /**
   * Create files table
   */
  private async createFilesTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        originalName TEXT NOT NULL,
        size INTEGER NOT NULL,
        type TEXT NOT NULL,
        mimeType TEXT NOT NULL,
        uploadedAt DATETIME NOT NULL,
        modifiedAt DATETIME NOT NULL,
        folderId TEXT NOT NULL,
        isBlockchain BOOLEAN DEFAULT 0,
        blockchainTokenId TEXT,
        blockchainFileId TEXT,
        isEncrypted BOOLEAN DEFAULT 0,
        encryptionKey TEXT,
        checksum TEXT NOT NULL,
        localPath TEXT NOT NULL,
        thumbnailPath TEXT,
        metadata TEXT,
        FOREIGN KEY (folderId) REFERENCES folders (id)
      )
    `;
    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(query, [], () => resolve(), (_, error) => reject(error));
      });
    });
  }

  /**
   * Create wallets table
   */
  private async createWalletsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        accountId TEXT NOT NULL UNIQUE,
        publicKey TEXT NOT NULL,
        privateKey TEXT NOT NULL,
        balance REAL DEFAULT 0,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME NOT NULL,
        lastSynced DATETIME NOT NULL,
        network TEXT NOT NULL CHECK (network IN ('testnet', 'mainnet'))
      )
    `;
    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(query, [], () => resolve(), (_, error) => reject(error));
      });
    });
  }

  /**
   * Create sync status table
   */
  private async createSyncStatusTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS syncStatus (
        id TEXT PRIMARY KEY,
        entityType TEXT NOT NULL CHECK (entityType IN ('folder', 'file')),
        entityId TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'syncing', 'synced', 'failed')),
        blockchainTokenId TEXT,
        lastAttempt DATETIME NOT NULL,
        retryCount INTEGER DEFAULT 0,
        errorMessage TEXT
      )
    `;
    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(query, [], () => resolve(), (_, error) => reject(error));
      });
    });
  }

  /**
   * Create user settings table
   */
  private async createUserSettingsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS userSettings (
        id TEXT PRIMARY KEY,
        autoSync BOOLEAN DEFAULT 1,
        syncInterval INTEGER DEFAULT 60,
        encryptionEnabled BOOLEAN DEFAULT 1,
        biometricAuth BOOLEAN DEFAULT 0,
        darkMode BOOLEAN DEFAULT 0,
        networkPreference TEXT DEFAULT 'wifi' CHECK (networkPreference IN ('wifi', 'cellular', 'both')),
        storageLocation TEXT DEFAULT 'internal' CHECK (storageLocation IN ('internal', 'external')),
        maxFileSize INTEGER DEFAULT 104857600,
        compressionEnabled BOOLEAN DEFAULT 1
      )
    `;
    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(query, [], () => resolve(), (_, error) => reject(error));
      });
    });
  }

  /**
   * Create blockchain transactions table
   */
  private async createBlockchainTransactionsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS blockchainTransactions (
        id TEXT PRIMARY KEY,
        transactionId TEXT NOT NULL UNIQUE,
        entityType TEXT NOT NULL CHECK (entityType IN ('folder', 'file')),
        entityId TEXT NOT NULL,
        operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete', 'transfer')),
        status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'failed')),
        gasUsed INTEGER DEFAULT 0,
        cost REAL DEFAULT 0,
        timestamp DATETIME NOT NULL,
        blockNumber INTEGER,
        errorMessage TEXT
      )
    `;
    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(query, [], () => resolve(), (_, error) => reject(error));
      });
    });
  }

  // Folder Operations
  async createFolder(folder: Omit<Folder, 'id' | 'createdAt' | 'lastModified' | 'fileCount'>): Promise<Folder> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date();
    
    const newFolder: Folder = {
      ...folder,
      id,
      createdAt: now,
      lastModified: now,
      fileCount: 0,
    };

    const query = `
      INSERT INTO folders (
        id, name, type, description, fileCount, lastModified, createdAt,
        isBlockchain, blockchainTokenId, parentFolderId, isEncrypted, encryptionKey
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.runSql(query, [
      newFolder.id,
      newFolder.name,
      newFolder.type,
      newFolder.description || null,
      newFolder.fileCount,
      newFolder.lastModified.toISOString(),
      newFolder.createdAt.toISOString(),
      newFolder.isBlockchain ? 1 : 0,
      newFolder.blockchainTokenId || null,
      newFolder.parentFolderId || null,
      newFolder.isEncrypted ? 1 : 0,
      newFolder.encryptionKey || null,
    ]);

    return newFolder;
  }

  async getFolders(): Promise<Folder[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.runSql('SELECT * FROM folders ORDER BY lastModified DESC');
    return this.mapFoldersFromResults(results);
  }

  async getFolderById(id: string): Promise<Folder | null> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.runSql('SELECT * FROM folders WHERE id = ?', [id]);
    const folders = this.mapFoldersFromResults(results);
    return folders.length > 0 ? folders[0] : null;
  }

  async updateFolder(id: string, updates: Partial<Folder>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const setClause = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(updates).filter(value => value !== undefined);
    values.push(id);

    const query = `UPDATE folders SET ${setClause} WHERE id = ?`;
    await this.runSql(query, values);
  }

  async deleteFolder(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Delete all files in the folder first
    await this.runSql('DELETE FROM files WHERE folderId = ?', [id]);
    
    // Delete the folder
    await this.runSql('DELETE FROM folders WHERE id = ?', [id]);
  }

  // File Operations
  async createFile(file: Omit<File, 'id' | 'uploadedAt' | 'modifiedAt'>): Promise<File> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date();
    
    const newFile: File = {
      ...file,
      id,
      uploadedAt: now,
      modifiedAt: now,
    };

    const query = `
      INSERT INTO files (
        id, name, originalName, size, type, mimeType, uploadedAt, modifiedAt,
        folderId, isBlockchain, blockchainTokenId, blockchainFileId, isEncrypted,
        encryptionKey, checksum, localPath, thumbnailPath, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.runSql(query, [
      newFile.id,
      newFile.name,
      newFile.originalName,
      newFile.size,
      newFile.type,
      newFile.mimeType,
      newFile.uploadedAt.toISOString(),
      newFile.modifiedAt.toISOString(),
      newFile.folderId,
      newFile.isBlockchain ? 1 : 0,
      newFile.blockchainTokenId || null,
      newFile.blockchainFileId || null,
      newFile.isEncrypted ? 1 : 0,
      newFile.encryptionKey || null,
      newFile.checksum,
      newFile.localPath,
      newFile.thumbnailPath || null,
      newFile.metadata ? JSON.stringify(newFile.metadata) : null,
    ]);

    // Update folder file count
    await this.updateFolderFileCount(newFile.folderId);

    return newFile;
  }

  async getFilesByFolderId(folderId: string): Promise<File[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.runSql(
      'SELECT * FROM files WHERE folderId = ? ORDER BY uploadedAt DESC',
      [folderId]
    );
    return this.mapFilesFromResults(results);
  }

  async getFileById(id: string): Promise<File | null> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.runSql('SELECT * FROM files WHERE id = ?', [id]);
    const files = this.mapFilesFromResults(results);
    return files.length > 0 ? files[0] : null;
  }

  async updateFile(id: string, updates: Partial<File>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const setClause = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(updates).filter(value => value !== undefined);
    values.push(id);

    const query = `UPDATE files SET ${setClause} WHERE id = ?`;
    await this.runSql(query, values);
  }

  async deleteFile(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Get file to update folder count
    const file = await this.getFileById(id);
    if (!file) return;

    await this.runSql('DELETE FROM files WHERE id = ?', [id]);
    
    // Update folder file count
    await this.updateFolderFileCount(file.folderId);
  }

  // Helper Methods
  private async updateFolderFileCount(folderId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.runSql(
      'SELECT COUNT(*) as count FROM files WHERE folderId = ?',
      [folderId]
    );
    
    const count = results.rows.item(0).count;
    await this.runSql(
      'UPDATE folders SET fileCount = ?, lastModified = ? WHERE id = ?',
      [count, new Date().toISOString(), folderId]
    );
  }

  private mapFoldersFromResults(results: any): Folder[] {
    const folders: Folder[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      folders.push({
        id: row.id,
        name: row.name,
        type: row.type,
        description: row.description,
        fileCount: row.fileCount,
        lastModified: new Date(row.lastModified),
        createdAt: new Date(row.createdAt),
        isBlockchain: Boolean(row.isBlockchain),
        blockchainTokenId: row.blockchainTokenId,
        parentFolderId: row.parentFolderId,
        isEncrypted: Boolean(row.isEncrypted),
        encryptionKey: row.encryptionKey,
      });
    }
    return folders;
  }

  private mapFilesFromResults(results: any): File[] {
    const files: File[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      files.push({
        id: row.id,
        name: row.name,
        originalName: row.originalName,
        size: row.size,
        type: row.type,
        mimeType: row.mimeType,
        uploadedAt: new Date(row.uploadedAt),
        modifiedAt: new Date(row.modifiedAt),
        folderId: row.folderId,
        isBlockchain: Boolean(row.isBlockchain),
        blockchainTokenId: row.blockchainTokenId,
        blockchainFileId: row.blockchainFileId,
        isEncrypted: Boolean(row.isEncrypted),
        encryptionKey: row.encryptionKey,
        checksum: row.checksum,
        localPath: row.localPath,
        thumbnailPath: row.thumbnailPath,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      });
    }
    return files;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Wallet Operations
  async createWallet(wallet: Omit<Wallet, 'id' | 'createdAt' | 'lastSynced'>): Promise<Wallet> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date();
    
    const newWallet: Wallet = {
      ...wallet,
      id,
      createdAt: now,
      lastSynced: now,
    };

    const query = `
      INSERT INTO wallets (
        id, accountId, publicKey, privateKey, balance, isActive, createdAt, lastSynced, network
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.runSql(query, [
      newWallet.id,
      newWallet.accountId,
      newWallet.publicKey,
      newWallet.privateKey,
      newWallet.balance,
      newWallet.isActive ? 1 : 0,
      newWallet.createdAt.toISOString(),
      newWallet.lastSynced.toISOString(),
      newWallet.network,
    ]);

    return newWallet;
  }

  async getWallets(): Promise<Wallet[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.runSql('SELECT * FROM wallets ORDER BY createdAt DESC');
    return this.mapWalletsFromResults(results);
  }

  async getWalletById(id: string): Promise<Wallet | null> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.runSql('SELECT * FROM wallets WHERE id = ?', [id]);
    const wallets = this.mapWalletsFromResults(results);
    return wallets.length > 0 ? wallets[0] : null;
  }

  async updateWallet(id: string, updates: Partial<Wallet>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const setClause = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(updates).filter(value => value !== undefined);
    values.push(id);

    const query = `UPDATE wallets SET ${setClause} WHERE id = ?`;
    await this.runSql(query, values);
  }

  // Sync Status Operations
  async updateSyncStatus(entityId: string, entityType: 'folder' | 'file', updates: Partial<SyncStatus>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const setClause = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(updates).filter(value => value !== undefined);
    values.push(entityId, entityType);

    const query = `UPDATE syncStatus SET ${setClause} WHERE entityId = ? AND entityType = ?`;
    await this.runSql(query, values);
  }

  async getPendingSyncItems(): Promise<SyncStatus[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.runSql(
      'SELECT * FROM syncStatus WHERE status IN (?, ?) ORDER BY lastAttempt ASC',
      ['pending', 'failed']
    );
    return this.mapSyncStatusFromResults(results);
  }

  async getPendingSyncItemsCount(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.runSql(
      'SELECT COUNT(*) as count FROM syncStatus WHERE status IN (?, ?)',
      ['pending', 'failed']
    );
    return results.rows.item(0).count;
  }

  async getLastSyncTime(): Promise<Date | undefined> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.runSql(
      'SELECT MAX(lastAttempt) as lastSync FROM syncStatus WHERE status = ?',
      ['synced']
    );
    const lastSync = results.rows.item(0).lastSync;
    return lastSync ? new Date(lastSync) : undefined;
  }

  // Blockchain Transaction Operations
  async createBlockchainTransaction(transaction: Omit<BlockchainTransaction, 'id' | 'timestamp'>): Promise<BlockchainTransaction> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date();
    
    const newTransaction: BlockchainTransaction = {
      ...transaction,
      id,
      timestamp: now,
    };

    const query = `
      INSERT INTO blockchainTransactions (
        id, transactionId, entityType, entityId, operation, status, gasUsed, cost, timestamp, blockNumber, errorMessage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.runSql(query, [
      newTransaction.id,
      newTransaction.transactionId,
      newTransaction.entityType,
      newTransaction.entityId,
      newTransaction.operation,
      newTransaction.status,
      newTransaction.gasUsed,
      newTransaction.cost,
      newTransaction.timestamp.toISOString(),
      newTransaction.blockNumber || null,
      newTransaction.errorMessage || null,
    ]);

    return newTransaction;
  }

  // Helper Methods
  private mapWalletsFromResults(results: any): Wallet[] {
    const wallets: Wallet[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      wallets.push({
        id: row.id,
        accountId: row.accountId,
        publicKey: row.publicKey,
        privateKey: row.privateKey,
        balance: row.balance,
        isActive: Boolean(row.isActive),
        createdAt: new Date(row.createdAt),
        lastSynced: new Date(row.lastSynced),
        network: row.network,
      });
    }
    return wallets;
  }

  private mapSyncStatusFromResults(results: any): SyncStatus[] {
    const syncStatuses: SyncStatus[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      syncStatuses.push({
        id: row.id,
        entityType: row.entityType,
        entityId: row.entityId,
        status: row.status,
        blockchainTokenId: row.blockchainTokenId,
        lastAttempt: new Date(row.lastAttempt),
        retryCount: row.retryCount,
        errorMessage: row.errorMessage,
      });
    }
    return syncStatuses;
  }

  // User Operations
  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
  }): Promise<{ id: string; email: string; firstName: string; lastName: string }> {
    if (!this.db) throw new Error('Database not initialized');

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.runSql(
      `INSERT INTO users (id, firstName, lastName, email, passwordHash, createdAt, isActive, hasWallet) 
       VALUES (?, ?, ?, ?, ?, ?, 1, 0)`,
      [userId, userData.firstName, userData.lastName, userData.email, userData.passwordHash, now]
    );

    console.log('User created successfully:', { id: userId, email: userData.email });
    return {
      id: userId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName
    };
  }

  async getUserByEmail(email: string): Promise<{ id: string; email: string; firstName: string; lastName: string; hasWallet: boolean } | null> {
    if (!this.db) throw new Error('Database not initialized');

    const results: any = await this.runSql(
      'SELECT id, email, firstName, lastName, hasWallet FROM users WHERE email = ? AND isActive = 1',
      [email]
    );

    if (results.rows.length === 0) {
      return null;
    }

    const row = results.rows.item(0);
    return {
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      hasWallet: Boolean(row.hasWallet)
    };
  }

  async hasUser(): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const results: any = await this.runSql(
      'SELECT COUNT(*) as count FROM users WHERE isActive = 1'
    );

    return results.rows.item(0).count > 0;
  }

  async updateUserWallet(userId: string, walletId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.runSql(
      'UPDATE users SET hasWallet = 1, walletId = ? WHERE id = ?',
      [walletId, userId]
    );

    console.log('User wallet updated:', { userId, walletId });
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.runSql(
      'UPDATE users SET lastLogin = ? WHERE id = ?',
      [new Date().toISOString(), userId]
    );
  }

  /**
   * Clear all tables (for account deletion)
   */
  async clearAllTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      console.log('Clearing all database tables...');
      
      // Delete all data from all tables
      await this.runSql('DELETE FROM blockchainTransactions');
      await this.runSql('DELETE FROM userSettings');
      await this.runSql('DELETE FROM syncStatus');
      await this.runSql('DELETE FROM wallets');
      await this.runSql('DELETE FROM files');
      await this.runSql('DELETE FROM folders');
      await this.runSql('DELETE FROM users');
      
      console.log('All database tables cleared successfully');
    } catch (error) {
      console.error('Failed to clear database tables:', error);
      throw error;
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export default new DatabaseService();
