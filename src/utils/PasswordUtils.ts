/**
 * Password Utilities
 * Simple password hashing for SafeMate
 */

import CryptoJS from 'crypto-js';

export class PasswordUtils {
  /**
   * Hash a password using SHA-256
   * Note: In production, use bcrypt or similar
   */
  static hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  /**
   * Verify a password against its hash
   */
  static verifyPassword(password: string, hash: string): boolean {
    const passwordHash = this.hashPassword(password);
    return passwordHash === hash;
  }
}
