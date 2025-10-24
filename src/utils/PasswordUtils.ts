/**
 * SafeMate Password Utilities
 * Password validation and security features
 */

export interface PasswordValidation {
  isValid: boolean;
  error?: string;
  strength: 'weak' | 'medium' | 'strong';
}

export class PasswordUtils {
  /**
   * Validate password strength
   */
  static validatePassword(password: string): PasswordValidation {
    if (!password) {
      return { isValid: false, error: 'Password is required', strength: 'weak' };
    }

    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long', strength: 'weak' };
    }

    if (password.length > 128) {
      return { isValid: false, error: 'Password is too long (maximum 128 characters)', strength: 'weak' };
    }

    // Check for common passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      return { isValid: false, error: 'Password is too common. Please choose a stronger password', strength: 'weak' };
    }

    // Calculate password strength
    const strength = this.calculatePasswordStrength(password);

    if (strength === 'weak') {
      return { isValid: false, error: 'Password is too weak. Please include uppercase, lowercase, numbers, and special characters', strength: 'weak' };
    }

    return { isValid: true, strength };
  }

  /**
   * Calculate password strength
   */
  static calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1; // lowercase
    if (/[A-Z]/.test(password)) score += 1; // uppercase
    if (/[0-9]/.test(password)) score += 1; // numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // special characters

    // Pattern checks (penalties)
    if (/(.)\1{2,}/.test(password)) score -= 1; // repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 1; // sequential patterns

    if (score <= 3) return 'weak';
    if (score <= 5) return 'medium';
    return 'strong';
  }

  /**
   * Generate secure random password
   */
  static generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  /**
   * Check if password has been compromised (basic check)
   */
  static async checkPasswordBreach(password: string): Promise<boolean> {
    // In a real implementation, you would check against known breach databases
    // For now, we'll do a basic check against common compromised passwords
    const compromisedPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      'dragon', 'master', 'hello', 'login', 'welcome123'
    ];

    return compromisedPasswords.includes(password.toLowerCase());
  }

  /**
   * Get password strength color
   */
  static getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
      case 'weak': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'strong': return '#27ae60';
      default: return '#95a5a6';
    }
  }

  /**
   * Get password strength text
   */
  static getPasswordStrengthText(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return 'Unknown';
    }
  }

  /**
   * Hash password using a simple hash function
   * Note: In production, use a proper cryptographic hash like bcrypt
   */
  static hashPassword(password: string): string {
    // Simple hash function for demo purposes
    // In production, use bcrypt or similar
    let hash = 0;
    if (password.length === 0) return hash.toString();
    
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }
}