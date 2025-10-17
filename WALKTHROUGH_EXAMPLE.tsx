/**
 * SafeMate Alias Wallet Walkthrough Example
 * This shows how to integrate the Alias Wallet System into your app
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import AliasWalletIntegrationService from './src/services/blockchain/AliasWalletIntegrationService';
import AliasWalletTestComponent from './src/components/AliasWalletTestComponent';

const WalkthroughExample: React.FC = () => {
  const [showTestComponent, setShowTestComponent] = useState(false);

  // Example 1: Create a complete wallet
  const createWalletExample = async () => {
    try {
      console.log('🚀 Step 1: Creating Alias Wallet...');
      
      const result = await AliasWalletIntegrationService.createCompleteWallet({
        userId: 'demo_user_123',
        userEmail: 'demo@example.com',
        plan: 'personal',
        fundingAmount: 100,
        paymentProvider: 'banxa',
        network: 'testnet' // TESTNET for DEV/PREPROD
      });

      if (result.success) {
        console.log('✅ Wallet Created Successfully!');
        console.log('Account ID:', result.accountId);
        console.log('Alias:', result.alias);
        console.log('Payment URL:', result.paymentUrl);
        
        Alert.alert(
          'Wallet Created!',
          `Account: ${result.accountId}\nAlias: ${result.alias}\nEstimated HBAR: ${result.estimatedHBAR}`
        );
      } else {
        console.error('❌ Wallet Creation Failed:', result.error);
        Alert.alert('Error', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', 'Failed to create wallet');
    }
  };

  // Example 2: Check wallet status
  const checkWalletStatusExample = async (walletId: string) => {
    try {
      console.log('🔍 Step 2: Checking Wallet Status...');
      
      const status = await AliasWalletIntegrationService.getWalletStatus(walletId);
      
      if (status) {
        console.log('✅ Wallet Status Retrieved!');
        console.log('Balance:', status.balanceInHBAR, 'HBAR');
        console.log('Account:', status.accountId);
        console.log('Network:', status.network);
        
        Alert.alert(
          'Wallet Status',
          `Balance: ${status.balanceInHBAR} HBAR\nAccount: ${status.accountId}\nNetwork: ${status.network}`
        );
      } else {
        console.log('❌ No wallet found');
        Alert.alert('Error', 'No wallet found');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', 'Failed to check wallet status');
    }
  };

  // Example 3: Test payment providers
  const testPaymentProvidersExample = async () => {
    try {
      console.log('💰 Step 3: Testing Payment Providers...');
      
      const providers = await AliasWalletIntegrationService.getPaymentProvidersWithPricing(100);
      
      console.log('✅ Payment Providers Retrieved!');
      providers.forEach(provider => {
        console.log(`${provider.name}: ${provider.estimatedHBAR} HBAR (${provider.fees.total} fees)`);
      });
      
      const providerList = providers.map(p => 
        `${p.name}: ${p.estimatedHBAR} HBAR`
      ).join('\n');
      
      Alert.alert('Payment Providers', providerList);
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', 'Failed to get payment providers');
    }
  };

  // Example 4: System functionality test
  const testSystemExample = async () => {
    try {
      console.log('🧪 Step 4: Testing System Functionality...');
      
      const status = await AliasWalletIntegrationService.testSystemFunctionality();
      
      console.log('✅ System Test Complete!');
      console.log('Overall Status:', status.overall ? '✅ All Systems OK' : '❌ Some Systems Failed');
      console.log('AliasWalletManager:', status.aliasWalletManager ? '✅' : '❌');
      console.log('PaymentService:', status.enhancedPaymentService ? '✅' : '❌');
      console.log('HederaService:', status.enhancedHederaService ? '✅' : '❌');
      
      Alert.alert(
        'System Test',
        `Overall: ${status.overall ? '✅ All Systems OK' : '❌ Some Systems Failed'}\n\n` +
        `AliasWalletManager: ${status.aliasWalletManager ? '✅' : '❌'}\n` +
        `PaymentService: ${status.enhancedPaymentService ? '✅' : '❌'}\n` +
        `HederaService: ${status.enhancedHederaService ? '✅' : '❌'}`
      );
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', 'Failed to test system');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🚀 Alias Wallet Walkthrough</Text>
      <Text style={styles.subtitle}>Step-by-Step Examples</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={createWalletExample}
        >
          <Text style={styles.buttonText}>1. Create Wallet Example</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => checkWalletStatusExample('demo_wallet_id')}
        >
          <Text style={styles.buttonText}>2. Check Wallet Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={testPaymentProvidersExample}
        >
          <Text style={styles.buttonText}>3. Test Payment Providers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={testSystemExample}
        >
          <Text style={styles.buttonText}>4. Test System Functionality</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={() => setShowTestComponent(!showTestComponent)}
        >
          <Text style={styles.buttonText}>
            {showTestComponent ? 'Hide' : 'Show'} Full Test Component
          </Text>
        </TouchableOpacity>
      </View>

      {showTestComponent && (
        <View style={styles.testComponentContainer}>
          <AliasWalletTestComponent
            userId="demo_user_123"
            userEmail="demo@example.com"
          />
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>📋 Walkthrough Steps:</Text>
        <Text style={styles.infoText}>1. Create Wallet - Creates real Hedera TESTNET account</Text>
        <Text style={styles.infoText}>2. Check Status - Verifies account and balance</Text>
        <Text style={styles.infoText}>3. Test Providers - Shows payment options and fees</Text>
        <Text style={styles.infoText}>4. System Test - Validates all components</Text>
        <Text style={styles.infoText}>5. Full Test - Complete testing interface</Text>
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
  testButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testComponentContainer: {
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 10,
    padding: 10,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
});

export default WalkthroughExample;
