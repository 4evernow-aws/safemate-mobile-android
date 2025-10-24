/**
 * SafeMate Android Mobile Authentication Service
 * Local authentication service for Android platform
 */

import Keychain from 'react-native-keychain';
import {TouchID, isSupported} from 'react-native-touch-id';

export interface AuthCredentials {
  email: string;
  password: string;
  biometricEnabled: boolean;
}

export interface BiometricConfig {
  title: string;
  subtitle: string;
  description: string;
  fallbackLabel: string;
}

class MobileAuthService {
  private isBiometricSupported: boolean = false;
  private biometricConfig: BiometricConfig = {
    title: 'SafeMate Authentication',
    subtitle: 'Use your fingerprint to authenticate',
    description: 'Touch the fingerprint sensor to continue',
    fallbackLabel: 'Use Password',
  };

  constructor() {
    this.checkBiometricSupport();
  }

  private async checkBiometricSupport(): Promise<void> {
    try {
      this.isBiometricSupported = await isSupported();
      console.log('Biometric support:', this.isBiometricSupported);
    } catch (error) {
      console.error('Failed to check biometric support:', error);
      this.isBiometricSupported = false;
    }
  }

  /**
   * Authenticate user with email and password
   */
  async authenticate(email: string, password: string): Promise<boolean> {
    try {
      // TODO: Implement actual authentication logic
      // For now, simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store credentials securely
      await this.storeCredentials(email, password);
      
      return true;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticateWithBiometric(): Promise<boolean> {
    if (!this.isBiometricSupported) {
      throw new Error('Biometric authentication not supported');
    }

    try {
      const result = await TouchID.authenticate(
        this.biometricConfig.description,
        this.biometricConfig
      );
      
      return result === true;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  /**
   * Register new user
   */
  async register(email: string, password: string): Promise<boolean> {
    try {
      // TODO: Implement actual registration logic
      // For now, simulate registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store credentials securely
      await this.storeCredentials(email, password);
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  }

  /**
   * Store credentials securely
   */
  private async storeCredentials(email: string, password: string): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        'safemate_credentials',
        email,
        password
      );
      console.log('Credentials stored securely');
    } catch (error) {
      console.error('Failed to store credentials:', error);
      throw error;
    }
  }

  /**
   * Retrieve stored credentials
   */
  async getStoredCredentials(): Promise<AuthCredentials | null> {
    try {
      const credentials = await Keychain.getInternetCredentials('safemate_credentials');
      
      if (credentials) {
        return {
          email: credentials.username,
          password: credentials.password,
          biometricEnabled: await this.isBiometricEnabled(),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to retrieve credentials:', error);
      return null;
    }
  }

  /**
   * Clear stored credentials
   */
  async clearCredentials(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials('safemate_credentials');
      console.log('Credentials cleared');
    } catch (error) {
      console.error('Failed to clear credentials:', error);
      throw error;
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const setting = await Keychain.getInternetCredentials('safemate_biometric_enabled');
      return setting !== null;
    } catch (error) {
      console.error('Failed to check biometric setting:', error);
      return false;
    }
  }

  /**
   * Enable biometric authentication
   */
  async enableBiometric(): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        'safemate_biometric_enabled',
        'true',
        'enabled'
      );
      console.log('Biometric authentication enabled');
    } catch (error) {
      console.error('Failed to enable biometric:', error);
      throw error;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometric(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials('safemate_biometric_enabled');
      console.log('Biometric authentication disabled');
    } catch (error) {
      console.error('Failed to disable biometric:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const credentials = await this.getStoredCredentials();
      return credentials !== null;
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return false;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.clearCredentials();
      console.log('User logged out');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * Get biometric support status
   */
  isBiometricSupported(): boolean {
    return this.isBiometricSupported;
  }

  /**
   * Update biometric configuration
   */
  updateBiometricConfig(config: Partial<BiometricConfig>): void {
    this.biometricConfig = {
      ...this.biometricConfig,
      ...config,
    };
  }
}

export default new MobileAuthService();
