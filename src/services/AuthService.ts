/**
 * SafeMate Authentication Service
 * Real user management with secure authentication
 */

import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';
import CryptoJS from 'crypto-js';
import { PasswordUtils } from '../utils/PasswordUtils';
import DatabaseService from '../database/DatabaseService';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  biometricEnabled: boolean;
  walletAddress?: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  requiresBiometric?: boolean;
}

class AuthService {
  private rnBiometrics: ReactNativeBiometrics;
  private currentUser: User | null = null;

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
  }

  /**
   * Check if biometric authentication is available
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      return available && (biometryType === BiometryTypes.TouchID || biometryType === BiometryTypes.FaceID || biometryType === BiometryTypes.Biometrics);
    } catch (error) {
      console.error('Biometric check failed:', error);
      return false;
    }
  }

  /**
   * Register a new user with biometric setup
   */
  async registerUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    enableBiometric?: boolean;
  }): Promise<AuthResult> {
    try {
      console.log('🔐 Starting user registration...');

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Validate password strength
      const passwordValidation = PasswordUtils.validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.error };
      }

      // Check if user already exists
      const existingUser = await DatabaseService.getUserByEmail(userData.email);
      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      // Hash password
      const passwordHash = CryptoJS.SHA256(userData.password).toString();
      console.log('🔒 Password hashed successfully');

      // Create user in database
      const newUser = await DatabaseService.createUser({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        passwordHash,
      });

      console.log('👤 User created in database:', newUser.id);

      // Setup biometric authentication if requested
      if (userData.enableBiometric && await this.isBiometricAvailable()) {
        try {
          await this.setupBiometricAuth(newUser.id);
          console.log('🔐 Biometric authentication setup completed');
        } catch (biometricError) {
          console.warn('⚠️ Biometric setup failed:', biometricError);
          // Continue without biometric
        }
      }

      // Store user session
      this.currentUser = newUser;
      await this.storeUserSession(newUser);

      console.log('✅ User registration completed successfully');
      return { success: true, user: newUser };

    } catch (error) {
      console.error('❌ User registration failed:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  /**
   * Authenticate user with email and password
   */
  async loginUser(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('🔐 Starting user authentication...');

      // Get user from database
      const user = await DatabaseService.getUserByEmail(email);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify password
      const passwordHash = CryptoJS.SHA256(password).toString();
      if (passwordHash !== user.passwordHash) {
        return { success: false, error: 'Invalid password' };
      }

      // Update last login
      await DatabaseService.updateUserLastLogin(user.id);

      // Store user session
      this.currentUser = user;
      await this.storeUserSession(user);

      console.log('✅ User authentication successful');
      return { success: true, user };

    } catch (error) {
      console.error('❌ User authentication failed:', error);
      return { success: false, error: 'Authentication failed. Please try again.' };
    }
  }

  /**
   * Authenticate user with biometric
   */
  async loginWithBiometric(): Promise<AuthResult> {
    try {
      console.log('🔐 Starting biometric authentication...');

      if (!await this.isBiometricAvailable()) {
        return { success: false, error: 'Biometric authentication not available' };
      }

      // Get stored biometric key
      const biometricKey = await this.getBiometricKey();
      if (!biometricKey) {
        return { success: false, error: 'Biometric not set up for this device' };
      }

      // Prompt biometric authentication
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate with biometric',
        cancelButtonText: 'Cancel',
      });

      if (!success) {
        return { success: false, error: 'Biometric authentication cancelled' };
      }

      // Get user from stored session
      const user = await this.getStoredUserSession();
      if (!user) {
        return { success: false, error: 'No user session found' };
      }

      this.currentUser = user;
      console.log('✅ Biometric authentication successful');
      return { success: true, user };

    } catch (error) {
      console.error('❌ Biometric authentication failed:', error);
      return { success: false, error: 'Biometric authentication failed' };
    }
  }

  /**
   * Setup biometric authentication for user
   */
  private async setupBiometricAuth(userId: string): Promise<void> {
    const { publicKey } = await this.rnBiometrics.createKeys();
    
    // Store biometric key in keychain
    await Keychain.setInternetCredentials(
      `safemate_biometric_${userId}`,
      userId,
      publicKey,
      {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
      }
    );
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      console.log('🔐 Logging out user...');
      
      // Clear user session
      this.currentUser = null;
      await this.clearUserSession();
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  }

  /**
   * Store user session securely
   */
  private async storeUserSession(user: User): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        'safemate_user_session',
        user.id,
        JSON.stringify(user),
        {
          accessControl: Keychain.ACCESS_CONTROL.WHEN_UNLOCKED,
        }
      );
    } catch (error) {
      console.error('Failed to store user session:', error);
    }
  }

  /**
   * Get stored user session
   */
  private async getStoredUserSession(): Promise<User | null> {
    try {
      const credentials = await Keychain.getInternetCredentials('safemate_user_session');
      if (credentials) {
        return JSON.parse(credentials.password);
      }
      return null;
    } catch (error) {
      console.error('Failed to get stored user session:', error);
      return null;
    }
  }

  /**
   * Clear user session
   */
  private async clearUserSession(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials('safemate_user_session');
    } catch (error) {
      console.error('Failed to clear user session:', error);
    }
  }

  /**
   * Get biometric key for user
   */
  private async getBiometricKey(): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials('safemate_biometric');
      return credentials ? credentials.password : null;
    } catch (error) {
      console.error('Failed to get biometric key:', error);
      return null;
    }
  }
}

export default new AuthService();
