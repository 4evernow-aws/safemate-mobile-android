/**
 * SafeMate Security Service
 * Enhanced security features and validation
 */

import CryptoService from './CryptoService';
import { PasswordUtils } from '../utils/PasswordUtils';

interface SecurityConfig {
  minPasswordLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  requireUppercase: boolean;
  requireLowercase: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  sessionTimeout: number; // in minutes
}

interface SecurityAudit {
  timestamp: Date;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  userId?: string;
  ipAddress?: string;
}

class SecurityService {
  private static instance: SecurityService;
  private config: SecurityConfig;
  private auditLog: SecurityAudit[] = [];
  private loginAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private lockedAccounts: Map<string, Date> = new Map();

  constructor() {
    this.config = {
      minPasswordLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      requireLowercase: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      sessionTimeout: 30,
    };
  }

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): {
    isValid: boolean;
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Length check
    if (password.length < this.config.minPasswordLength) {
      issues.push(`Password must be at least ${this.config.minPasswordLength} characters long`);
      suggestions.push('Use a longer password for better security');
    } else {
      score += 2;
    }

    // Character type checks
    if (this.config.requireUppercase && !/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter');
      suggestions.push('Add uppercase letters (A-Z)');
    } else if (/[A-Z]/.test(password)) {
      score += 1;
    }

    if (this.config.requireLowercase && !/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter');
      suggestions.push('Add lowercase letters (a-z)');
    } else if (/[a-z]/.test(password)) {
      score += 1;
    }

    if (this.config.requireNumbers && !/[0-9]/.test(password)) {
      issues.push('Password must contain at least one number');
      suggestions.push('Add numbers (0-9)');
    } else if (/[0-9]/.test(password)) {
      score += 1;
    }

    if (this.config.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
      issues.push('Password must contain at least one special character');
      suggestions.push('Add special characters (!@#$%^&*)');
    } else if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    }

    // Common password check
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      issues.push('Password is too common and easily guessable');
      suggestions.push('Use a unique password that is not commonly used');
      score = Math.max(0, score - 2);
    }

    // Sequential characters check
    if (this.hasSequentialChars(password)) {
      issues.push('Password contains sequential characters');
      suggestions.push('Avoid sequential characters like "123" or "abc"');
      score = Math.max(0, score - 1);
    }

    // Repeated characters check
    if (this.hasRepeatedChars(password)) {
      issues.push('Password contains repeated characters');
      suggestions.push('Avoid repeated characters like "aaa" or "111"');
      score = Math.max(0, score - 1);
    }

    return {
      isValid: issues.length === 0,
      score: Math.min(score, 10),
      issues,
      suggestions,
    };
  }

  /**
   * Check for sequential characters
   */
  private hasSequentialChars(password: string): boolean {
    const sequences = ['123', '234', '345', '456', '567', '678', '789', '890'];
    const alphaSequences = ['abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz'];
    
    const lowerPassword = password.toLowerCase();
    
    for (const seq of [...sequences, ...alphaSequences]) {
      if (lowerPassword.includes(seq)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check for repeated characters
   */
  private hasRepeatedChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
        return true;
      }
    }
    return false;
  }

  /**
   * Track login attempts
   */
  trackLoginAttempt(email: string, success: boolean): boolean {
    const now = new Date();
    const key = email.toLowerCase();
    
    // Check if account is locked
    const lockoutTime = this.lockedAccounts.get(key);
    if (lockoutTime && now.getTime() - lockoutTime.getTime() < this.config.lockoutDuration * 60 * 1000) {
      this.logSecurityEvent('login_attempt_blocked', 'medium', `Login attempt blocked for locked account: ${email}`, email);
      return false;
    }

    if (success) {
      // Reset attempts on successful login
      this.loginAttempts.delete(key);
      this.lockedAccounts.delete(key);
      this.logSecurityEvent('login_success', 'low', `Successful login: ${email}`, email);
      return true;
    } else {
      // Increment failed attempts
      const attempts = this.loginAttempts.get(key) || { count: 0, lastAttempt: now };
      attempts.count += 1;
      attempts.lastAttempt = now;
      this.loginAttempts.set(key, attempts);

      this.logSecurityEvent('login_failed', 'medium', `Failed login attempt ${attempts.count} for: ${email}`, email);

      // Lock account if max attempts reached
      if (attempts.count >= this.config.maxLoginAttempts) {
        this.lockedAccounts.set(key, now);
        this.logSecurityEvent('account_locked', 'high', `Account locked due to ${attempts.count} failed attempts: ${email}`, email);
        return false;
      }

      return true;
    }
  }

  /**
   * Check if account is locked
   */
  isAccountLocked(email: string): boolean {
    const key = email.toLowerCase();
    const lockoutTime = this.lockedAccounts.get(key);
    
    if (!lockoutTime) return false;
    
    const now = new Date();
    const timeDiff = now.getTime() - lockoutTime.getTime();
    
    // Remove lock if time has expired
    if (timeDiff >= this.config.lockoutDuration * 60 * 1000) {
      this.lockedAccounts.delete(key);
      this.loginAttempts.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Get remaining lockout time
   */
  getRemainingLockoutTime(email: string): number {
    const key = email.toLowerCase();
    const lockoutTime = this.lockedAccounts.get(key);
    
    if (!lockoutTime) return 0;
    
    const now = new Date();
    const timeDiff = now.getTime() - lockoutTime.getTime();
    const remaining = this.config.lockoutDuration * 60 * 1000 - timeDiff;
    
    return Math.max(0, Math.ceil(remaining / 1000 / 60)); // Return minutes
  }

  /**
   * Generate secure session token
   */
  generateSessionToken(): string {
    const randomBytes = CryptoService.generateRandomBytes(32);
    const timestamp = Date.now().toString();
    const combined = randomBytes.toString() + timestamp;
    
    // Hash the combined data
    const hash = PasswordUtils.hashPassword(combined);
    return hash.substring(0, 64); // Return first 64 characters
  }

  /**
   * Validate session token
   */
  validateSessionToken(token: string): boolean {
    // Basic validation - in production, you'd store and validate against database
    return token && token.length === 64 && /^[a-f0-9]+$/i.test(token);
  }

  /**
   * Log security events
   */
  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', details: string, userId?: string): void {
    const audit: SecurityAudit = {
      timestamp: new Date(),
      event,
      severity,
      details,
      userId,
    };

    this.auditLog.push(audit);
    
    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }

    // Log to console in development
    if (__DEV__) {
      console.log(`[SECURITY ${severity.toUpperCase()}] ${event}: ${details}`);
    }
  }

  /**
   * Get security audit log
   */
  getAuditLog(severity?: 'low' | 'medium' | 'high' | 'critical'): SecurityAudit[] {
    if (severity) {
      return this.auditLog.filter(audit => audit.severity === severity);
    }
    return [...this.auditLog];
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalEvents: number;
    eventsBySeverity: Record<string, number>;
    recentFailures: number;
    lockedAccounts: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const eventsBySeverity = this.auditLog.reduce((acc, audit) => {
      acc[audit.severity] = (acc[audit.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentFailures = this.auditLog.filter(
      audit => audit.event === 'login_failed' && audit.timestamp > oneHourAgo
    ).length;

    return {
      totalEvents: this.auditLog.length,
      eventsBySeverity,
      recentFailures,
      lockedAccounts: this.lockedAccounts.size,
    };
  }

  /**
   * Update security configuration
   */
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logSecurityEvent('config_updated', 'medium', 'Security configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Clear all security data (for testing)
   */
  clearSecurityData(): void {
    this.auditLog = [];
    this.loginAttempts.clear();
    this.lockedAccounts.clear();
  }
}

export default SecurityService.getInstance();
