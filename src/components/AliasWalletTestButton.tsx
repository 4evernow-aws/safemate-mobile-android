/**
 * Simple Test Button for Alias Wallet System
 * Add this to your existing app to test the new system without changing the login
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AliasWalletIntegrationService from '../services/blockchain/AliasWalletIntegrationService';

const AliasWalletTestButton: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);

  const testAliasWalletSystem = async () => {
    setIsTesting(true);
    
    try {
      console.log('🧪 Testing NEW Alias Wallet System...');
      
      // Test 1: System functionality
      const systemStatus = await AliasWalletIntegrationService.testSystemFunctionality();
      console.log('✅ System Status:', systemStatus);
      
      if (!systemStatus.overall) {
        Alert.alert('System Test Failed', 'Alias Wallet System not ready');
        return;
      }

      // Test 2: Create a test wallet
      console.log('🚀 Creating test wallet with NEW system...');
      
      const walletResult = await AliasWalletIntegrationService.createCompleteWallet({
        userId: 'test_user_' + Date.now(),
        userEmail: 'test@example.com',
        plan: 'personal',
        fundingAmount: 100,
        paymentProvider: 'banxa',
        network: 'testnet'
      });

      if (walletResult.success) {
        console.log('✅ NEW Alias Wallet created successfully!');
        console.log('Account ID:', walletResult.accountId);
        console.log('Alias:', walletResult.alias);
        
        Alert.alert(
          '🎉 NEW Alias Wallet System Working!',
          `✅ Real Account ID: ${walletResult.accountId}\n` +
          `✅ Unique Alias: ${walletResult.alias}\n` +
          `✅ Estimated HBAR: ${walletResult.estimatedHBAR}\n\n` +
          `The new system is working perfectly!`,
          [{ text: 'Awesome!' }]
        );
      } else {
        Alert.alert('Test Failed', walletResult.error || 'Unknown error');
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      Alert.alert('Test Failed', 'Error testing Alias Wallet System');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isTesting && styles.buttonDisabled]}
        onPress={testAliasWalletSystem}
        disabled={isTesting}
      >
        {isTesting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>🧪 Test NEW Alias Wallet System</Text>
        )}
      </TouchableOpacity>
      
      <Text style={styles.description}>
        This will test the new Alias Wallet System and create a real Hedera TESTNET account
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    margin: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AliasWalletTestButton;
