/**
 * SafeMate Android Mobile Database Service
 * Local SQLite database service for Android platform
 */

import SQLite from 'react-native-sqlite-storage';

export interface FileRecord {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  hash: string;
  createdAt: number;
  updatedAt: number;
}

export interface FolderRecord {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface TransactionRecord {
  id: string;
  type: string;
  amount: string;
  fromAccount: string;
  toAccount: string;
  timestamp: number;
  status: string;
  hash: string;
}

class MobileDatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // Open database connection
      this.db = await SQLite.openDatabase({
        name: 'SafeMateDB.db',
        location: 'default',
      });

      // Create tables
      await this.createTables();
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const createFilesTable = `
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        size INTEGER NOT NULL,
        type TEXT NOT NULL,
        hash TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `;

    const createFoldersTable = `
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parentId TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (parentId) REFERENCES folders (id)
      )
    `;

    const createTransactionsTable = `
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        amount TEXT NOT NULL,
        fromAccount TEXT NOT NULL,
        toAccount TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL,
        hash TEXT NOT NULL
      )
    `;

    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `;

    await this.db.executeSql(createFilesTable);
    await this.db.executeSql(createFoldersTable);
    await this.db.executeSql(createTransactionsTable);
    await this.db.executeSql(createSettingsTable);
  }

  /**
   * File operations
   */
  async saveFile(file: Omit<FileRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const id = this.generateId();
    const now = Date.now();

    const query = `
      INSERT INTO files (id, name, path, size, type, hash, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.executeSql(query, [
      id,
      file.name,
      file.path,
      file.size,
      file.type,
      file.hash,
      now,
      now,
    ]);

    return id;
  }

  async getFiles(): Promise<FileRecord[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const query = 'SELECT * FROM files ORDER BY createdAt DESC';
    const [results] = await this.db.executeSql(query);
    
    const files: FileRecord[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      files.push(results.rows.item(i));
    }

    return files;
  }

  async deleteFile(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const query = 'DELETE FROM files WHERE id = ?';
    await this.db.executeSql(query, [id]);
  }

  /**
   * Folder operations
   */
  async saveFolder(folder: Omit<FolderRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const id = this.generateId();
    const now = Date.now();

    const query = `
      INSERT INTO folders (id, name, parentId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `;

    await this.db.executeSql(query, [
      id,
      folder.name,
      folder.parentId,
      now,
      now,
    ]);

    return id;
  }

  async getFolders(): Promise<FolderRecord[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const query = 'SELECT * FROM folders ORDER BY name ASC';
    const [results] = await this.db.executeSql(query);
    
    const folders: FolderRecord[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      folders.push(results.rows.item(i));
    }

    return folders;
  }

  /**
   * Transaction operations
   */
  async saveTransaction(transaction: Omit<TransactionRecord, 'id'>): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const id = this.generateId();

    const query = `
      INSERT INTO transactions (id, type, amount, fromAccount, toAccount, timestamp, status, hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.executeSql(query, [
      id,
      transaction.type,
      transaction.amount,
      transaction.fromAccount,
      transaction.toAccount,
      transaction.timestamp,
      transaction.status,
      transaction.hash,
    ]);

    return id;
  }

  async getTransactions(): Promise<TransactionRecord[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const query = 'SELECT * FROM transactions ORDER BY timestamp DESC';
    const [results] = await this.db.executeSql(query);
    
    const transactions: TransactionRecord[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      transactions.push(results.rows.item(i));
    }

    return transactions;
  }

  /**
   * Settings operations
   */
  async saveSetting(key: string, value: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const now = Date.now();
    const query = `
      INSERT OR REPLACE INTO settings (key, value, updatedAt)
      VALUES (?, ?, ?)
    `;

    await this.db.executeSql(query, [key, value, now]);
  }

  async getSetting(key: string): Promise<string | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const query = 'SELECT value FROM settings WHERE key = ?';
    const [results] = await this.db.executeSql(query, [key]);
    
    if (results.rows.length > 0) {
      return results.rows.item(0).value;
    }

    return null;
  }

  /**
   * Utility methods
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  async isReady(): Promise<boolean> {
    return this.isInitialized && this.db !== null;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

export default new MobileDatabaseService();
