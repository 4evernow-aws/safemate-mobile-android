/**
 * SafeMate AuthScreen with New Alias Wallet System Integration
 * This replaces the old SelfFundedWalletManager with the new AliasWalletIntegrationService
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import DatabaseService from '../database/DatabaseService';
import CryptoService from '../services/CryptoService';
import AliasWalletIntegrationService from '../services/blockchain/AliasWalletIntegrationService';
import FundingOptionsModal from './FundingOptionsModal';

interface AuthScreenProps {
  onAuthSuccess: (type: 'existing' | 'new', user: any) => void;
}

const AuthScreenWithAliasWallet: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const plans = [
    {
      id: 'personal',
      name: 'Personal',
      price: 100,
      description: 'Perfect for individuals and families',
      features: ['5GB Storage', 'Basic Support', 'Mobile Access'],
      color: '#3498db'
    },
    {
      id: 'community',
      name: 'Community',
      price: 150,
      description: 'Great for small groups and teams',
      features: ['25GB Storage', 'Priority Support', 'Team Collaboration'],
      color: '#2ecc71'
    },
    {
      id: 'business',
      name: 'Business',
      price: 200,
      description: 'Ideal for businesses and organizations',
      features: ['100GB Storage', '24/7 Support', 'Advanced Features'],
      color: '#e74c3c'
    }
  ];

  // Handle signup with new Alias Wallet System
  const handleSignup = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setIsCreatingWallet(true);
    setCurrentStage('Starting signup process...');
    console.log('🚀 Starting signup process with NEW Alias Wallet System...');

    try {
      // Step 1: Initialize database
      setCurrentStage('Initializing database...');
      console.log('Initializing database...');
      await DatabaseService.initialize();
      console.log('Database initialized successfully');

      // Step 2: Check for existing account
      setCurrentStage('Checking for existing account...');
      console.log('Checking for existing account...');
      const existingUser = await DatabaseService.getUserByEmail(email);
      
      if (existingUser) {
        console.log('Existing account found:', existingUser.id);
        Alert.alert('Account Exists', 'An account with this email already exists. Please use the login option.');
        return;
      }
      
      console.log('No existing account found, proceeding with account creation');

      // Step 3: Create user account in database
      setCurrentStage('Creating user account in database...');
      console.log('Creating user account in database...');
      
      const newUser = await DatabaseService.createUser({
        email,
        password,
        firstName,
        lastName,
        type: 'email'
      });
      
      console.log('User created in database:', {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      });

      // Step 4: Test crypto functionality
      setCurrentStage('Testing crypto functionality...');
      console.log('Testing crypto functionality...');
      const cryptoWorking = CryptoService.testCryptoFunctionality();
      console.log('Crypto test result:', cryptoWorking);
      
      const availableMethods = CryptoService.getAvailableMethods();
      console.log('Available crypto methods:', availableMethods);
      
      const testString = CryptoService.generateRandomString(32);
      console.log('Test random string generated:', testString);

      // Step 5: Test new Alias Wallet System
      setCurrentStage('Testing Alias Wallet System...');
      console.log('🧪 Testing NEW Alias Wallet System...');
      
      const systemStatus = await AliasWalletIntegrationService.testSystemFunctionality();
      console.log('✅ Alias Wallet System Status:', systemStatus);
      
      if (!systemStatus.overall) {
        throw new Error('Alias Wallet System not ready. Please try again.');
      }

      // Step 6: Show plan selection (wallet creation happens after plan selection)
      setCurrentStage('Setting up account...');
      console.log('✅ Alias Wallet System ready - showing plan selection...');
      
      setPendingUser(newUser);
      setShowPlanSelection(true);
      setCurrentStage('');
      setIsLoading(false);
      setIsCreatingWallet(false);
      
      console.log('✅ Signup process completed - ready for plan selection');
      
    } catch (error) {
      console.error('❌ Signup process failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Sign Up Failed', `Failed to create account: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setIsCreatingWallet(false);
      setCurrentStage('');
    }
  };

  // Handle plan selection
  const handlePlanSelection = (plan: any) => {
    console.log('📋 Plan selected:', plan);
    setSelectedPlan(plan);
    setShowPlanSelection(false);
    setShowFundingModal(true);
  };

  // Handle funding modal success with NEW Alias Wallet System
  const handleFundingSuccess = async (result: any) => {
    try {
      console.log('💰 Funding successful:', result);
      setShowFundingModal(false);
      
      // Create wallet using NEW Alias Wallet System
      setCurrentStage('Creating real Hedera account...');
      console.log('🚀 Creating wallet with NEW Alias Wallet System...');
      
      const walletResult = await AliasWalletIntegrationService.createCompleteWallet({
        userId: pendingUser.id,
        userEmail: pendingUser.email,
        plan: selectedPlan.id,
        fundingAmount: result.amount,
        paymentProvider: result.provider,
        network: 'testnet' // TESTNET for DEV/PREPROD
      });

      if (walletResult.success) {
        console.log('✅ NEW Alias Wallet created successfully!');
        console.log('Account ID:', walletResult.accountId);
        console.log('Alias:', walletResult.alias);
        console.log('Payment URL:', walletResult.paymentUrl);
        
        // Update user record with wallet info
        await DatabaseService.updateUserWallet(pendingUser.id, walletResult.wallet!.id);
        
        // Show success message with real account details
        Alert.alert(
          '🎉 Account Created Successfully!',
          `Welcome to SafeMate, ${pendingUser.firstName}!\n\n` +
          `✅ Real Hedera TESTNET Account: ${walletResult.accountId}\n` +
          `✅ Unique Alias: ${walletResult.alias}\n` +
          `✅ Estimated HBAR: ${walletResult.estimatedHBAR}\n\n` +
          `Your blockchain account is ready!`,
          [
            {
              text: 'Continue',
              onPress: () => {
                onAuthSuccess('new', { 
                  id: pendingUser.id,
                  firstName: pendingUser.firstName, 
                  lastName: pendingUser.lastName, 
                  email: pendingUser.email, 
                  type: 'email',
                  hasWallet: true,
                  accountId: walletResult.accountId, // Real TESTNET account ID
                  alias: walletResult.alias // Unique alias
                });
              }
            }
          ]
        );
      } else {
        throw new Error(walletResult.error || 'Wallet creation failed');
      }
    } catch (error) {
      console.error('❌ Failed to create wallet with NEW system:', error);
      Alert.alert(
        'Wallet Creation Failed',
        'Your payment was successful, but we encountered an issue creating your blockchain account. Please contact support.',
        [
          {
            text: 'Continue Without Wallet',
            onPress: () => {
              onAuthSuccess('new', { 
                id: pendingUser.id,
                firstName: pendingUser.firstName, 
                lastName: pendingUser.lastName, 
                email: pendingUser.email, 
                type: 'email',
                hasWallet: false,
                accountId: 'Unknown'
              });
            }
          }
        ]
      );
    } finally {
      setCurrentStage('');
    }
  };

  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter your email and password');
      return;
    }

    setIsLoading(true);
    setCurrentStage('Logging in...');

    try {
      const user = await DatabaseService.authenticateUser(email, password);
      if (user) {
        console.log('✅ Login successful:', user.id);
        onAuthSuccess('existing', user);
      } else {
        Alert.alert('Login Failed', 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Login Failed', 'An error occurred during login');
    } finally {
      setIsLoading(false);
      setCurrentStage('');
    }
  };

  // Plan Selection Modal
  const renderPlanSelection = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Choose Your Plan</Text>
        <Text style={styles.modalSubtitle}>Select a plan to get started with SafeMate</Text>
        
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[styles.planCard, { borderColor: plan.color }]}
            onPress={() => handlePlanSelection(plan)}
          >
            <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
            <Text style={styles.planPrice}>${plan.price}</Text>
            <Text style={styles.planDescription}>{plan.description}</Text>
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <Text key={index} style={styles.feature}>• {feature}</Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>SafeMate</Text>
          <Text style={styles.subtitle}>Secure Blockchain Storage</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>{currentStage}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, styles.signupButton]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Sign Up with Alias Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>🚀 New Alias Wallet System</Text>
          <Text style={styles.infoText}>• Real Hedera TESTNET accounts</Text>
          <Text style={styles.infoText}>• Unique aliases for each user</Text>
          <Text style={styles.infoText}>• No operator account dependency</Text>
          <Text style={styles.infoText}>• Direct payment provider integration</Text>
        </View>
      </ScrollView>

      {showPlanSelection && renderPlanSelection()}
      
      {showFundingModal && (
        <FundingOptionsModal
          visible={showFundingModal}
          onClose={() => setShowFundingModal(false)}
          onSuccess={handleFundingSuccess}
          plan={selectedPlan}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  signupButton: {
    backgroundColor: '#007AFF',
  },
  loginButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  planCard: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  featuresContainer: {
    marginTop: 10,
  },
  feature: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
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
    color: '#666',
    marginBottom: 5,
  },
});

export default AuthScreenWithAliasWallet;
