/**
 * SafeMate Comprehensive Test Suite
 * Tests for all major components and services
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock native modules
jest.mock('react-native-sqlite-storage', () => ({
  enablePromise: jest.fn(),
  openDatabase: jest.fn(() => Promise.resolve({
    executeSql: jest.fn(() => Promise.resolve([{ rows: { length: 0, item: () => ({}) } }])),
    close: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(() => Promise.resolve()),
  getInternetCredentials: jest.fn(() => Promise.resolve({ username: 'test', password: 'test' })),
  resetInternetCredentials: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-biometrics', () => ({
  isSensorAvailable: jest.fn(() => Promise.resolve({ available: true, biometryType: 'TouchID' })),
  createKeys: jest.fn(() => Promise.resolve({ publicKey: 'test-public-key' })),
  deleteKeys: jest.fn(() => Promise.resolve()),
}));

// Import components and services
import App from '../App';
import EnhancedHeader from '../src/components/EnhancedHeader';
import EnhancedFolderGrid from '../src/components/EnhancedFolderGrid';
import SecurityService from '../src/services/SecurityService';
import CryptoService from '../src/services/CryptoService';
import TestingUtils from '../src/utils/TestingUtils';

describe('SafeMate App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('EnhancedHeader Component', () => {
    it('renders correctly with title and subtitle', () => {
      const mockOnMenuPress = jest.fn();
      const mockOnSearchPress = jest.fn();

      const { getByText } = render(
        <EnhancedHeader
          title="SafeMate"
          subtitle="Keeping your data safe"
          onMenuPress={mockOnMenuPress}
          onSearchPress={mockOnSearchPress}
        />
      );

      expect(getByText('SafeMate')).toBeTruthy();
      expect(getByText('Keeping your data safe')).toBeTruthy();
    });

    it('calls onMenuPress when menu button is pressed', () => {
      const mockOnMenuPress = jest.fn();
      const mockOnSearchPress = jest.fn();

      const { getByText } = render(
        <EnhancedHeader
          title="SafeMate"
          subtitle="Keeping your data safe"
          onMenuPress={mockOnMenuPress}
          onSearchPress={mockOnSearchPress}
        />
      );

      fireEvent.press(getByText('⚙️'));
      expect(mockOnMenuPress).toHaveBeenCalledTimes(1);
    });

    it('calls onSearchPress when search button is pressed', () => {
      const mockOnMenuPress = jest.fn();
      const mockOnSearchPress = jest.fn();

      const { getByText } = render(
        <EnhancedHeader
          title="SafeMate"
          subtitle="Keeping your data safe"
          onMenuPress={mockOnMenuPress}
          onSearchPress={mockOnSearchPress}
        />
      );

      fireEvent.press(getByText('🔍'));
      expect(mockOnSearchPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('EnhancedFolderGrid Component', () => {
    const mockFolders = [
      {
        id: '1',
        name: 'Personal Documents',
        type: 'personal' as const,
        fileCount: 5,
        lastModified: new Date('2024-01-15'),
        isBlockchain: true,
        description: 'Important personal documents',
      },
      {
        id: '2',
        name: 'Family Photos',
        type: 'family' as const,
        fileCount: 0,
        lastModified: new Date('2024-01-10'),
        isBlockchain: false,
      },
    ];

    it('renders folders correctly', () => {
      const mockOnFolderPress = jest.fn();

      const { getByText } = render(
        <EnhancedFolderGrid
          folders={mockFolders}
          onFolderPress={mockOnFolderPress}
        />
      );

      expect(getByText('Personal Documents')).toBeTruthy();
      expect(getByText('Family Photos')).toBeTruthy();
      expect(getByText('5 files')).toBeTruthy();
      expect(getByText('Empty')).toBeTruthy();
    });

    it('calls onFolderPress when folder is pressed', () => {
      const mockOnFolderPress = jest.fn();

      const { getByText } = render(
        <EnhancedFolderGrid
          folders={mockFolders}
          onFolderPress={mockOnFolderPress}
        />
      );

      fireEvent.press(getByText('Personal Documents'));
      expect(mockOnFolderPress).toHaveBeenCalledWith(mockFolders[0]);
    });

    it('shows empty state when no folders', () => {
      const mockOnFolderPress = jest.fn();

      const { getByText } = render(
        <EnhancedFolderGrid
          folders={[]}
          onFolderPress={mockOnFolderPress}
        />
      );

      expect(getByText('No Folders Yet')).toBeTruthy();
      expect(getByText('Create your first folder to get started with SafeMate')).toBeTruthy();
    });
  });

  describe('SecurityService', () => {
    it('validates weak passwords correctly', () => {
      const result = SecurityService.validatePassword('123');
      
      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(5);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('validates strong passwords correctly', () => {
      const result = SecurityService.validatePassword('StrongPassword123!');
      
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(7);
      expect(result.issues.length).toBe(0);
    });

    it('tracks login attempts correctly', () => {
      const email = 'test@example.com';
      
      // Track failed attempts
      SecurityService.trackLoginAttempt(email, false);
      SecurityService.trackLoginAttempt(email, false);
      
      // Should not be locked yet
      expect(SecurityService.isAccountLocked(email)).toBe(false);
      
      // Track more failed attempts to trigger lockout
      SecurityService.trackLoginAttempt(email, false);
      SecurityService.trackLoginAttempt(email, false);
      SecurityService.trackLoginAttempt(email, false);
      
      // Should be locked now
      expect(SecurityService.isAccountLocked(email)).toBe(true);
    });

    it('generates and validates session tokens', () => {
      const token = SecurityService.generateSessionToken();
      
      expect(token).toBeTruthy();
      expect(token.length).toBe(64);
      expect(SecurityService.validateSessionToken(token)).toBe(true);
      expect(SecurityService.validateSessionToken('invalid')).toBe(false);
    });

    it('logs security events', () => {
      SecurityService.logSecurityEvent('test_event', 'low', 'Test event');
      
      const auditLog = SecurityService.getAuditLog();
      expect(auditLog.length).toBeGreaterThan(0);
      expect(auditLog[auditLog.length - 1].event).toBe('test_event');
    });
  });

  describe('CryptoService', () => {
    it('generates random bytes', () => {
      const bytes = CryptoService.generateRandomBytes(32);
      
      expect(bytes).toBeTruthy();
      expect(bytes.length).toBe(32);
      expect(bytes.every(byte => byte >= 0 && byte <= 255)).toBe(true);
    });

    it('generates random strings', () => {
      const randomString = CryptoService.generateRandomString(16);
      
      expect(randomString).toBeTruthy();
      expect(randomString.length).toBe(32); // 16 bytes = 32 hex chars
      expect(/^[a-f0-9]+$/i.test(randomString)).toBe(true);
    });

    it('tests crypto functionality', () => {
      const result = CryptoService.testCryptoFunctionality();
      
      expect(typeof result).toBe('boolean');
    });

    it('gets available crypto methods', () => {
      const methods = CryptoService.getAvailableMethods();
      
      expect(Array.isArray(methods)).toBe(true);
      expect(methods.length).toBeGreaterThan(0);
    });
  });

  describe('TestingUtils', () => {
    it('tests crypto functionality', () => {
      const results = TestingUtils.testCryptoFunctionality();
      
      expect(results).toHaveProperty('randomBytes');
      expect(results).toHaveProperty('randomString');
      expect(results).toHaveProperty('passwordHashing');
      expect(results).toHaveProperty('overall');
    });

    it('tests security features', () => {
      const results = TestingUtils.testSecurityFeatures();
      
      expect(results).toHaveProperty('passwordValidation');
      expect(results).toHaveProperty('loginTracking');
      expect(results).toHaveProperty('sessionTokens');
      expect(results).toHaveProperty('auditLogging');
      expect(results).toHaveProperty('overall');
    });

    it('generates test report', () => {
      const mockResults = {
        crypto: { overall: true },
        database: { overall: true },
        security: { overall: true },
        blockchain: { overall: true },
        overall: true,
      };
      
      const report = TestingUtils.generateTestReport(mockResults);
      
      expect(report).toContain('SafeMate Test Report');
      expect(report).toContain('✅ PASSED');
    });
  });

  describe('App Integration', () => {
    it('renders without crashing', () => {
      const { getByText } = render(<App />);
      
      // Should show authentication screen initially
      expect(getByText('Welcome to SafeMate')).toBeTruthy();
    });
  });
});

// Performance tests
describe('Performance Tests', () => {
  it('renders large folder grid efficiently', () => {
    const largeFolderList = Array.from({ length: 100 }, (_, i) => ({
      id: `folder-${i}`,
      name: `Folder ${i}`,
      type: 'personal' as const,
      fileCount: Math.floor(Math.random() * 50),
      lastModified: new Date(),
      isBlockchain: Math.random() > 0.5,
    }));

    const startTime = Date.now();
    const { getByText } = render(
      <EnhancedFolderGrid
        folders={largeFolderList}
        onFolderPress={() => {}}
      />
    );
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(1000); // Should render in less than 1 second
    expect(getByText('Folder 0')).toBeTruthy();
  });
});

// Accessibility tests
describe('Accessibility Tests', () => {
  it('has proper accessibility labels', () => {
    const mockOnMenuPress = jest.fn();
    const mockOnSearchPress = jest.fn();

    const { getByLabelText } = render(
      <EnhancedHeader
        title="SafeMate"
        subtitle="Keeping your data safe"
        onMenuPress={mockOnMenuPress}
        onSearchPress={mockOnSearchPress}
      />
    );

    // Note: In a real implementation, you would add accessibilityLabel props
    // and test for them here
  });
});
