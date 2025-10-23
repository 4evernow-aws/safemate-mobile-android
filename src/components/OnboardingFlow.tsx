/**
 * SafeMate Enhanced Onboarding Flow
 * Multi-step process: User Details → Payment Options → Funding → Wallet Creation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PaymentService from '../services/payment/PaymentService';
import SelfFundedWalletManager from '../services/blockchain/SelfFundedWalletManager';
import DatabaseService from '../database/DatabaseService';
import { PasswordUtils } from '../utils/PasswordUtils';
import { showAccountOptions } from './AccountOptions';

interface OnboardingFlowProps {
  onComplete: (userData: any) => void;
  onCancel: () => void;
}

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onCancel }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  
  // Step 0: User Details
  const [userDetails, setUserDetails] = useState<UserDetails>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Step 1: Payment Options
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<'Alchemy Pay' | 'Banxa'>('Alchemy Pay');
  const [fundingAmount] = useState(10);
  
  // Step 2: Funding Process
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  
  // Step 3: Wallet Creation
  const [_walletCreationStatus, setWalletCreationStatus] = useState<'pending' | 'creating' | 'completed' | 'failed'>('pending');

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 2) return { strength: 'Weak', color: '#e74c3c' };
    if (score <= 3) return { strength: 'Medium', color: '#f39c12' };
    return { strength: 'Strong', color: '#27ae60' };
  };

  // Check if passwords match
  const passwordsMatch = userDetails.password && userDetails.confirmPassword && userDetails.password === userDetails.confirmPassword;

  // Progress indicator
  const renderProgressIndicator = () => {
    if (!isLoading && !currentStage) return null;
    
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {isLoading ? currentStage || 'Processing...' : ''}
        </Text>
        {isLoading && (
          <View style={styles.progressBar}>
            <View style={styles.progressBarFill} />
          </View>
        )}
      </View>
    );
  };

  // Step 0: User Details Form
  const renderUserDetailsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, isDarkMode && styles.darkText]}>
        Create Your Account
      </Text>
      <Text style={[styles.stepSubtitle, isDarkMode && styles.darkSubtext]}>
        Step 1: Enter your details
      </Text>
      
      <View style={styles.nameRow}>
        <TextInput
          style={[styles.input, styles.nameInput, isDarkMode && styles.darkInput]}
          placeholder="First Name"
          placeholderTextColor={isDarkMode ? '#bdc3c7' : '#7f8c8d'}
          value={userDetails.firstName}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, firstName: text }))}
          autoCapitalize="words"
          autoCorrect={false}
        />
        <TextInput
          style={[styles.input, styles.nameInput, isDarkMode && styles.darkInput]}
          placeholder="Last Name"
          placeholderTextColor={isDarkMode ? '#bdc3c7' : '#7f8c8d'}
          value={userDetails.lastName}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, lastName: text }))}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </View>

      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        placeholder="Email"
        placeholderTextColor={isDarkMode ? '#bdc3c7' : '#7f8c8d'}
        value={userDetails.email}
        onChangeText={(text) => setUserDetails(prev => ({ ...prev, email: text }))}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput, isDarkMode && styles.darkInput]}
          placeholder="Password"
          placeholderTextColor={isDarkMode ? '#bdc3c7' : '#7f8c8d'}
          value={userDetails.password}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, password: text }))}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.eyeButtonText}>
            {showPassword ? '🙈' : '👁️'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {userDetails.password.length > 0 && (
        <View style={styles.passwordStrengthContainer}>
          <Text style={[styles.passwordStrengthText, { color: getPasswordStrength(userDetails.password).color }]}>
            Password Strength: {getPasswordStrength(userDetails.password).strength}
          </Text>
        </View>
      )}

      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.input, 
            styles.passwordInput,
            isDarkMode && styles.darkInput,
            userDetails.confirmPassword.length > 0 && {
              borderColor: passwordsMatch ? '#27ae60' : '#e74c3c',
              borderWidth: 2
            }
          ]}
          placeholder="Confirm Password"
          placeholderTextColor={isDarkMode ? '#bdc3c7' : '#7f8c8d'}
          value={userDetails.confirmPassword}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, confirmPassword: text }))}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Text style={styles.eyeButtonText}>
            {showConfirmPassword ? '🙈' : '👁️'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {userDetails.confirmPassword.length > 0 && (
        <View style={styles.passwordMatchContainer}>
          <Text style={[
            styles.passwordMatchText, 
            { color: passwordsMatch ? '#27ae60' : '#e74c3c' }
          ]}>
            {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.primaryButton, isDarkMode && styles.darkPrimaryButton]}
        onPress={handleUserDetailsSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Continue to Payment</Text>
      </TouchableOpacity>
    </View>
  );

  // Step 1: Payment Options
  const renderPaymentOptionsStep = () => {
    const provider = selectedPaymentProvider === 'Alchemy Pay' ? 'alchemy' : 'banxa';
    const feePct = selectedPaymentProvider === 'Alchemy Pay' ? 0.025 : 0.03;
    const total = (fundingAmount * (1 + feePct)).toFixed(2);
    const estHBAR = PaymentService.calculateHBARAmount(fundingAmount, provider as 'alchemy' | 'banxa');

    return (
      <View style={styles.stepContainer}>
        <Text style={[styles.stepSubtitle, isDarkMode && styles.darkSubtext]}>
          Step 2: Fund your account
        </Text>

        {/* Tabs */}
        <View style={[styles.tabRow, isDarkMode && styles.darkTabRow]}>
          <TouchableOpacity
            style={[styles.tabButton, selectedPaymentProvider === 'Alchemy Pay' && styles.activeTabButton]}
            onPress={() => setSelectedPaymentProvider('Alchemy Pay')}
          >
            <Text style={[styles.tabText, selectedPaymentProvider === 'Alchemy Pay' && styles.activeTabText]}>Alchemy Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedPaymentProvider === 'Banxa' && styles.activeTabButton]}
            onPress={() => setSelectedPaymentProvider('Banxa')}
          >
            <Text style={[styles.tabText, selectedPaymentProvider === 'Banxa' && styles.activeTabText]}>Banxa</Text>
          </TouchableOpacity>
        </View>

        {/* Details */}
        <View style={[styles.tabPanel, isDarkMode && styles.darkPaymentOption]}>
          <Text style={[styles.paymentDescription, isDarkMode && styles.darkSubtext]}>
            {selectedPaymentProvider === 'Alchemy Pay'
              ? 'Supports cards, bank transfers, and digital wallets'
              : 'Global provider with competitive rates and fast processing'}
          </Text>
          <Text style={styles.paymentFee}>Fee: {feePct * 100}%</Text>
          <Text style={styles.paymentTotal}>Total: ${total}</Text>
          <Text style={styles.paymentTotal}>Est. HBAR: {estHBAR.toFixed(2)}</Text>

          <TouchableOpacity
            style={[styles.primaryButton, isDarkMode && styles.darkPrimaryButton]}
            onPress={() => handlePaymentSelection(selectedPaymentProvider)}
          >
            <Text style={styles.buttonText}>Continue with {selectedPaymentProvider}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.secondaryButton, isDarkMode && styles.darkSecondaryButton]}
          onPress={() => setCurrentStep(0)}
        >
          <Text style={[styles.secondaryButtonText, isDarkMode && styles.darkText]}>
            Back to Details
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Step 2: Funding Process
  const renderFundingStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, isDarkMode && styles.darkText]}>
        Processing Payment
      </Text>
      <Text style={[styles.stepSubtitle, isDarkMode && styles.darkSubtext]}>
        Step 3: Funding your account with {selectedPaymentProvider}
      </Text>
      
      <View style={[styles.fundingStatusContainer, isDarkMode && styles.darkFundingStatusContainer]}>
        <Text style={[styles.fundingStatus, isDarkMode && styles.darkText]}>
          Status: {paymentStatus}
        </Text>
        <Text style={[styles.fundingAmount, isDarkMode && styles.darkSubtext]}>
          Amount: ${fundingAmount}
        </Text>
        <Text style={[styles.fundingProvider, isDarkMode && styles.darkSubtext]}>
          Provider: {selectedPaymentProvider}
        </Text>
      </View>
      
      {paymentStatus === 'processing' && (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            Processing your payment...
          </Text>
        </View>
      )}
      
      {paymentStatus === 'failed' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Payment failed. Please try again.</Text>
        </View>
      )}
    </View>
  );

  // Step 3: Wallet Creation
  const renderWalletCreationStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, isDarkMode && styles.darkText]}>
        Creating Your Account
      </Text>
      <Text style={[styles.stepSubtitle, isDarkMode && styles.darkSubtext]}>
        Step 4: Setting up your blockchain account
      </Text>
      
      <View style={[styles.walletCreationContainer, isDarkMode && styles.darkWalletCreationContainer]}>
        <Text style={[styles.walletCreationText, isDarkMode && styles.darkText]}>
          Payment received successfully!
        </Text>
        <Text style={[styles.walletCreationText, isDarkMode && styles.darkText]}>
          Creating your Hedera blockchain account...
        </Text>
        <Text style={[styles.walletCreationText, isDarkMode && styles.darkText]}>
          This may take a few moments.
        </Text>
      </View>
    </View>
  );

  // Handle user details submission
  const handleUserDetailsSubmit = async () => {
    if (!userDetails.firstName || !userDetails.lastName || !userDetails.email || !userDetails.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    if (userDetails.password !== userDetails.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    const passwordStrength = getPasswordStrength(userDetails.password);
    if (passwordStrength.strength === 'Weak') {
      Alert.alert('Weak Password', 'Please choose a stronger password with at least 8 characters, including uppercase, lowercase, and numbers.');
      return;
    }
    
    setIsLoading(true);
    setCurrentStage('Checking for existing account...');
    
    try {
      // Initialize database
      await DatabaseService.initialize();
      
      // Check if user already exists
      const existingUser = await DatabaseService.getUserByEmail(userDetails.email);
      if (existingUser) {
        Alert.alert(
          'Account Already Exists',
          'An account with this email already exists. Please sign in instead.',
          [
            {
              text: 'OK',
              onPress: () => onCancel()
            }
          ]
        );
        return;
      }
      
      // Move to payment options
      setCurrentStep(1);
      setCurrentStage('');
      
    } catch (error) {
      console.error('User details validation failed:', error);
      Alert.alert('Error', 'Failed to validate user details. Please try again.');
    } finally {
      setIsLoading(false);
      setCurrentStage('');
    }
  };

  // Handle payment selection
  const handlePaymentSelection = async (provider: 'Alchemy Pay' | 'Banxa') => {
    setSelectedPaymentProvider(provider);
    setCurrentStep(2);
    setPaymentStatus('processing');
    setCurrentStage(`Processing payment with ${provider}...`);
    
    try {
      // Skip the payment options dialog and go directly to wallet creation
      setPaymentStatus('completed');
      setCurrentStep(3);
      await createWalletAfterFunding();
      
    } catch (error) {
      console.error('Payment processing failed:', error);
      setPaymentStatus('failed');
      Alert.alert(
        'Payment Failed',
        'Payment could not be processed. Please try again or choose a different payment method.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setCurrentStep(1);
              setCurrentStage('');
              setPaymentStatus('pending');
            }
          },
          {
            text: 'Cancel',
            onPress: () => onCancel()
          }
        ]
      );
    }
  };

  // Create wallet after funding
  const createWalletAfterFunding = async () => {
    try {
      setCurrentStage('Creating your blockchain account...');
      setWalletCreationStatus('creating');
      
      // Create user in database first
      const newUser = await DatabaseService.createUser({
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        email: userDetails.email,
        passwordHash: PasswordUtils.hashPassword(userDetails.password)
      });
      
      // Create self-funded wallet
      const provider = selectedPaymentProvider === 'Alchemy Pay' ? 'alchemy' : 'banxa';
      const fundingResult = await SelfFundedWalletManager.createSelfFundedWallet({
        userId: newUser.id,
        amount: fundingAmount,
        provider: provider,
        userEmail: userDetails.email
      });
      
      if (!fundingResult.success) {
        throw new Error(fundingResult.error || 'Wallet creation failed');
      }
      
      // Update user record with wallet info
      await DatabaseService.updateUserWallet(newUser.id, fundingResult.wallet!.id);
      
      setWalletCreationStatus('completed');
      setCurrentStage('Account created successfully!');
      
      // Show success message
      const successMessage = `Welcome to SafeMate, ${userDetails.firstName}! Your account has been created with Hedera blockchain integration. Blockchain Account: ${fundingResult.wallet!.accountId}`;
      
      Alert.alert(
        'Account Created Successfully! 🎉',
        successMessage,
        [
          {
            text: 'Continue',
            onPress: () => {
              setCurrentStage('');
              onComplete({ 
                id: newUser.id,
                firstName: newUser.firstName, 
                lastName: newUser.lastName, 
                email: newUser.email, 
                type: 'email',
                hasWallet: true,
                accountId: fundingResult.wallet!.accountId
              });
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Wallet creation after funding failed:', error);
      setWalletCreationStatus('failed');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(
        'Account Creation Failed',
        `Unable to create your blockchain account: ${errorMessage}\n\nYou can try again later or contact support if the issue persists.`,
        [
          {
            text: 'Try Again',
            onPress: () => {
              setCurrentStep(1);
              setCurrentStage('');
              setPaymentStatus('pending');
              setWalletCreationStatus('pending');
            }
          },
          {
            text: 'Cancel',
            onPress: () => onCancel()
          }
        ]
      );
    }
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderUserDetailsStep();
      case 1:
        return renderPaymentOptionsStep();
      case 2:
        return renderFundingStep();
      case 3:
        return renderWalletCreationStep();
      default:
        return renderUserDetailsStep();
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onCancel}
            >
              <Text style={[styles.closeButtonText, isDarkMode && styles.darkText]}>✕ Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.closeButton, { alignSelf: 'flex-end' }]}
              onPress={() => showAccountOptions()}
            >
              <Text style={[styles.closeButtonText, isDarkMode && styles.darkText]}>⚙️</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🛡️</Text>
            <Text style={styles.logoTitle}>SafeMate</Text>
          </View>
          
          {renderProgressIndicator()}
          {renderCurrentStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtext: {
    color: '#bdc3c7',
  },
  headerContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 48,
    marginBottom: 8,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  stepContainer: {
    width: '100%',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 32,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  nameInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#2c3e50',
  },
  darkInput: {
    backgroundColor: '#2c3e50',
    borderColor: '#34495e',
    color: '#ffffff',
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  eyeButtonText: {
    fontSize: 18,
  },
  passwordStrengthContainer: {
    marginTop: -8,
    marginBottom: 8,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  passwordMatchContainer: {
    marginTop: -8,
    marginBottom: 8,
  },
  passwordMatchText: {
    fontSize: 12,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  darkPrimaryButton: {
    backgroundColor: '#2980b9',
  },
  secondaryButton: {
    backgroundColor: '#ecf0f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  darkSecondaryButton: {
    backgroundColor: '#34495e',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentOptionsContainer: {
    marginVertical: 20,
  },
  paymentOption: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ecf0f1',
  },
  darkPaymentOption: {
    backgroundColor: '#2c3e50',
    borderColor: '#34495e',
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentProviderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  paymentFee: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  paymentDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  paymentTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  fundingStatusContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
  },
  darkFundingStatusContainer: {
    backgroundColor: '#2c3e50',
  },
  fundingStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  fundingAmount: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  fundingProvider: {
    fontSize: 14,
    color: '#6c757d',
  },
  walletCreationContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
  },
  darkWalletCreationContainer: {
    backgroundColor: '#2c3e50',
  },
  walletCreationText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#3498db',
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    textAlign: 'center',
  },
  progressContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3498db',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 2,
    width: '100%',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  // Tab styles
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    marginBottom: 16,
    padding: 4,
  },
  darkTabRow: {
    backgroundColor: '#34495e',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#3498db',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tabPanel: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
});

export default OnboardingFlow;
