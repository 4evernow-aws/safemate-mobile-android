/**
 * SafeMate Alias Wallet Test Component
 * Demonstrates the new alias-based wallet functionality
 * Shows real Hedera account creation and payment integration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AliasWalletIntegrationService from '../services/blockchain/AliasWalletIntegrationService';
import { WalletStatus } from '../services/blockchain/AliasWalletIntegrationService';

interface AliasWalletTestComponentProps {
  userId: string;
  userEmail: string;
}

const AliasWalletTestComponent: React.FC<AliasWalletTestComponentProps> = ({
  userId,
  userEmail,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    testSystemFunctionality();
  }, []);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testSystemFunctionality = async () => {
    setIsLoading(true);
    addTestResult('Testing system functionality...');
    
    try {
      const status = await AliasWalletIntegrationService.testSystemFunctionality();
      setSystemStatus(status);
      
      if (status.overall) {
        addTestResult('✅ All systems operational');
      } else {
        addTestResult('❌ Some systems failed');
      }
    } catch (error) {
      addTestResult(`❌ System test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createAliasWallet = async () => {
    setIsLoading(true);
    addTestResult('Creating alias-based wallet...');
    
    try {
      const result = await AliasWalletIntegrationService.createCompleteWallet({
        userId,
        userEmail,
        plan: 'personal',
        fundingAmount: 100,
        paymentProvider: 'banxa',
        network: 'testnet',
      });

      if (result.success) {
        addTestResult(`✅ Wallet created: ${result.accountId}`);
        addTestResult(`✅ Alias: ${result.alias}`);
        addTestResult(`✅ Estimated HBAR: ${result.estimatedHBAR}`);
        
        if (result.paymentUrl) {
          addTestResult(`✅ Payment URL: ${result.paymentUrl}`);
        }
        
        // Get wallet status
        if (result.wallet) {
          const status = await AliasWalletIntegrationService.getWalletStatus(result.wallet.id);
          setWalletStatus(status);
        }
      } else {
        addTestResult(`❌ Wallet creation failed: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Wallet creation error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testPaymentProviders = async () => {
    setIsLoading(true);
    addTestResult('Testing payment providers...');
    
    try {
      const providers = await AliasWalletIntegrationService.getPaymentProvidersWithPricing(100);
      
      providers.forEach(provider => {
        addTestResult(`💰 ${provider.name}: ${provider.estimatedHBAR} HBAR (${provider.fees.total} fees)`);
      });
    } catch (error) {
      addTestResult(`❌ Payment provider test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const syncWalletBalance = async () => {
    if (!walletStatus) {
      addTestResult('❌ No wallet to sync');
      return;
    }

    setIsLoading(true);
    addTestResult('Syncing wallet balance...');
    
    try {
      const success = await AliasWalletIntegrationService.syncWalletBalance(walletStatus.wallet.id);
      
      if (success) {
        addTestResult('✅ Wallet balance synced');
        // Refresh wallet status
        const status = await AliasWalletIntegrationService.getWalletStatus(walletStatus.wallet.id);
        setWalletStatus(status);
      } else {
        addTestResult('❌ Wallet balance sync failed');
      }
    } catch (error) {
      addTestResult(`❌ Balance sync error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyWalletAccount = async () => {
    if (!walletStatus) {
      addTestResult('❌ No wallet to verify');
      return;
    }

    setIsLoading(true);
    addTestResult('Verifying wallet account...');
    
    try {
      const isValid = await AliasWalletIntegrationService.verifyWalletAccount(walletStatus.wallet.id);
      
      if (isValid) {
        addTestResult('✅ Wallet account verified on Hedera');
      } else {
        addTestResult('❌ Wallet account verification failed');
      }
    } catch (error) {
      addTestResult(`❌ Account verification error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🚀 Alias Wallet Test</Text>
      <Text style={styles.subtitle}>Real Hedera Account Creation & Payment Integration</Text>

      {/* System Status */}
      {systemStatus && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>System Status:</Text>
          <Text style={[styles.statusText, systemStatus.overall ? styles.success : styles.error]}>
            {systemStatus.overall ? '✅ All Systems Operational' : '❌ Some Systems Failed'}
          </Text>
          <Text style={styles.statusDetail}>
            AliasWalletManager: {systemStatus.aliasWalletManager ? '✅' : '❌'}
          </Text>
          <Text style={styles.statusDetail}>
            PaymentService: {systemStatus.enhancedPaymentService ? '✅' : '❌'}
          </Text>
          <Text style={styles.statusDetail}>
            HederaService: {systemStatus.enhancedHederaService ? '✅' : '❌'}
          </Text>
          <Text style={styles.statusDetail}>
            DatabaseService: {systemStatus.databaseService ? '✅' : '❌'}
          </Text>
        </View>
      )}

      {/* Wallet Status */}
      {walletStatus && (
        <View style={styles.walletContainer}>
          <Text style={styles.walletTitle}>Wallet Status:</Text>
          <Text style={styles.walletDetail}>Account: {walletStatus.accountId}</Text>
          <Text style={styles.walletDetail}>Alias: {walletStatus.alias}</Text>
          <Text style={styles.walletDetail}>Balance: {walletStatus.balanceInHBAR} HBAR</Text>
          <Text style={styles.walletDetail}>Network: {walletStatus.network}</Text>
          <Text style={styles.walletDetail}>Active: {walletStatus.isActive ? '✅' : '❌'}</Text>
        </View>
      )}

      {/* Test Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={createAliasWallet}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Create Alias Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={testPaymentProviders}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Payment Providers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={syncWalletBalance}
          disabled={isLoading || !walletStatus}
        >
          <Text style={styles.buttonText}>Sync Wallet Balance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={verifyWalletAccount}
          disabled={isLoading || !walletStatus}
        >
          <Text style={styles.buttonText}>Verify Wallet Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearTestResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {/* Test Results */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  success: {
    color: '#4CAF50',
  },
  error: {
    color: '#F44336',
  },
  statusDetail: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  walletContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  walletDetail: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 12,
    marginBottom: 4,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default AliasWalletTestComponent;
