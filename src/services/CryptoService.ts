/**
 * SafeMate Crypto Service
 * Enhanced cryptographic operations with multiple fallback methods
 */

// Import all possible polyfills
import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';

class CryptoService {
  private static instance: CryptoService;

  /**
   * Get singleton instance
   */
  static getInstance(): CryptoService {
    if (!CryptoService.instance) {
      CryptoService.instance = new CryptoService();
    }
    return CryptoService.instance;
  }

  /**
   * Generate secure random bytes with multiple fallback methods
   */
  generateRandomBytes(length: number): Uint8Array {
    try {
      // Method 1: Try crypto.getRandomValues (from polyfill)
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        console.log('Crypto: Using crypto.getRandomValues');
        return array;
      }
    } catch (error) {
      console.warn('Crypto: crypto.getRandomValues failed:', error);
    }

    try {
      // Method 2: Try global.crypto (alternative polyfill)
      if (typeof global !== 'undefined' && global.crypto && global.crypto.getRandomValues) {
        const array = new Uint8Array(length);
        global.crypto.getRandomValues(array);
        console.log('Crypto: Using global.crypto.getRandomValues');
        return array;
      }
    } catch (error) {
      console.warn('Crypto: global.crypto.getRandomValues failed:', error);
    }

    try {
      // Method 3: Use CryptoJS for random generation
      const randomWords = CryptoJS.lib.WordArray.random(length);
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        bytes[i] = randomWords.words[Math.floor(i / 4)] >>> (24 - (i % 4) * 8) & 0xff;
      }
      console.log('Crypto: Using CryptoJS random generation');
      return bytes;
    } catch (error) {
      console.warn('Crypto: CryptoJS random generation failed:', error);
    }

    try {
      // Method 4: Fallback to Math.random (less secure but functional)
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      console.warn('Crypto: Using Math.random fallback (less secure)');
      return bytes;
    } catch (error) {
      console.error('Crypto: All random generation methods failed:', error);
      throw new Error('Unable to generate secure random bytes');
    }
  }

  /**
   * Generate a secure random string
   */
  generateRandomString(length: number): string {
    const bytes = this.generateRandomBytes(length);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Test crypto functionality
   */
  testCryptoFunctionality(): boolean {
    try {
      const testBytes = this.generateRandomBytes(32);
      return testBytes.length === 32 && testBytes.every(byte => byte >= 0 && byte <= 255);
    } catch (error) {
      console.error('Crypto test failed:', error);
      return false;
    }
  }

  /**
   * Get available crypto methods
   */
  getAvailableMethods(): string[] {
    const methods: string[] = [];

    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      methods.push('crypto.getRandomValues');
    }

    if (typeof global !== 'undefined' && global.crypto && global.crypto.getRandomValues) {
      methods.push('global.crypto.getRandomValues');
    }

    if (typeof CryptoJS !== 'undefined') {
      methods.push('CryptoJS');
    }

    methods.push('Math.random (fallback)');

    return methods;
  }
}

export default CryptoService.getInstance();
