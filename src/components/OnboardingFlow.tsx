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
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PaymentService from '../services/payment/PaymentService';
import SelfFundedWalletManager from '../services/blockchain/SelfFundedWalletManager';
import DatabaseService from '../database/DatabaseService';
import { PasswordUtils } from '../utils/PasswordUtils';

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
  accountType: 'personal' | 'community' | 'business';
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
    confirmPassword: '',
    accountType: 'personal'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Step 1: Account Type Selection
  const [selectedAccountType, setSelectedAccountType] = useState<'personal' | 'community' | 'business' | null>(null);
  
  // Step 2: Payment Options
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'alchemy' | 'banxa'>('alchemy');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [fundingAmount, setFundingAmount] = useState(10);
  
  // Step 3: Funding Process
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  
  // Step 4: Funding Success
  const [fundingSuccess, setFundingSuccess] = useState(false);
  const [hbarPurchaseStatus, setHbarPurchaseStatus] = useState<'pending' | 'purchasing' | 'completed' | 'failed'>('pending');
  const [hbarPurchaseResult, setHbarPurchaseResult] = useState<{
    amount: number;
    cost: number;
    transactionId?: string;
  } | null>(null);
  
  // Step 5: Wallet Creation
  const [walletCreationStatus, setWalletCreationStatus] = useState<'pending' | 'creating' | 'completed' | 'failed'>('pending');
  
  // Settings dropdown state
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showPaymentSettingsDropdown, setShowPaymentSettingsDropdown] = useState(false);
  const [showFundingSuccessSettingsDropdown, setShowFundingSuccessSettingsDropdown] = useState(false);
  const [showWalletCreationSettingsDropdown, setShowWalletCreationSettingsDropdown] = useState(false);
  
  // PayID address state
  const [payIDAddress, setPayIDAddress] = useState<string | null>(null);

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
        <Text style={styles.buttonText}>Continue to Account Type</Text>
      </TouchableOpacity>
    </View>
  );

  // Step 1: Account Type Selection
  const renderAccountTypeStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, isDarkMode && styles.darkText]}>
        Select Account Type
      </Text>
      <Text style={[styles.stepSubtitle, isDarkMode && styles.darkSubtext]}>
        Step 1: Choose the type of account you want to create
      </Text>
      
      <View style={styles.accountTypeContainer}>
        <TouchableOpacity
          style={[
            styles.accountTypeOption, 
            isDarkMode && styles.darkAccountTypeOption,
            selectedAccountType === 'personal' && styles.selectedAccountType
          ]}
          onPress={() => setSelectedAccountType('personal')}
        >
          <View style={styles.accountTypeHeader}>
            <Text style={[styles.accountTypeName, isDarkMode && styles.darkText]}>
              Personal Account
            </Text>
            <Text style={styles.accountTypeIcon}>👤</Text>
          </View>
          <Text style={[styles.accountTypeDescription, isDarkMode && styles.darkSubtext]}>
            Perfect for individuals to store personal files, photos, and documents securely on the blockchain
          </Text>
          <Text style={styles.accountTypeFeatures}>
            • Personal file storage • Private folders • Individual access
          </Text>
          <Text style={[styles.accountTypePrice, isDarkMode && styles.darkText]}>
            To create a Personal Account $100.00
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.accountTypeOption, 
            isDarkMode && styles.darkAccountTypeOption,
            selectedAccountType === 'community' && styles.selectedAccountType
          ]}
          onPress={() => setSelectedAccountType('community')}
        >
          <View style={styles.accountTypeHeader}>
            <Text style={[styles.accountTypeName, isDarkMode && styles.darkText]}>
              Community Account
            </Text>
            <Text style={styles.accountTypeIcon}>👥</Text>
          </View>
          <Text style={[styles.accountTypeDescription, isDarkMode && styles.darkSubtext]}>
            Ideal for groups, clubs, or communities to share and collaborate on files and projects
          </Text>
          <Text style={styles.accountTypeFeatures}>
            • Shared folders • Multi-user access • Collaboration tools
          </Text>
          <Text style={[styles.accountTypePrice, isDarkMode && styles.darkText]}>
            To create a Community Account $150.00
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.accountTypeOption, 
            isDarkMode && styles.darkAccountTypeOption,
            selectedAccountType === 'business' && styles.selectedAccountType
          ]}
          onPress={() => setSelectedAccountType('business')}
        >
          <View style={styles.accountTypeHeader}>
            <Text style={[styles.accountTypeName, isDarkMode && styles.darkText]}>
              Business Account
            </Text>
            <Text style={styles.accountTypeIcon}>🏢</Text>
          </View>
          <Text style={[styles.accountTypeDescription, isDarkMode && styles.darkSubtext]}>
            Designed for businesses and organizations to manage corporate files and team collaboration
          </Text>
          <Text style={styles.accountTypeFeatures}>
            • Team management • Business folders • Advanced security
          </Text>
          <Text style={[styles.accountTypePrice, isDarkMode && styles.darkText]}>
            To create a Business Account $200.00
          </Text>
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
      
      <TouchableOpacity
        style={[
          styles.primaryButton, 
          isDarkMode && styles.darkPrimaryButton,
          !selectedAccountType && styles.disabledButton
        ]}
        onPress={handleAccountTypeSubmit}
        disabled={!selectedAccountType}
      >
        <Text style={styles.buttonText}>Continue to Funding</Text>
      </TouchableOpacity>
    </View>
  );

  // Payment providers configuration
  const paymentProviders = [
    {
      id: 'alchemy',
      name: 'Alchemy Pay',
      fee: fundingAmount * 0.025,
      feePercentage: 2.5,
      methods: [
        { id: 'credit_card', name: 'Credit/Debit Card', icon: '💳', description: 'Visa, Mastercard, American Express', processingTime: 'Instant', cost: '2.5%' },
        { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer', processingTime: '1-3 business days', cost: '1.5%' },
        { id: 'payid', name: 'PayID', icon: '📱', description: 'PayID payment system (address auto-created)', processingTime: 'Instant', cost: 'Free' },
        { id: 'apple_pay', name: 'Apple Pay', icon: '🍎', description: 'Apple Pay integration', processingTime: 'Instant', cost: '2.5%' },
        { id: 'google_pay', name: 'Google Pay', icon: '📱', description: 'Google Pay integration', processingTime: 'Instant', cost: '2.5%' },
        { id: 'crypto', name: 'Cryptocurrency', icon: '₿', description: 'Pay with Bitcoin, Ethereum, etc.', processingTime: '10-30 minutes', cost: '1.0%' },
      ],
    },
    {
      id: 'banxa',
      name: 'Banxa',
      fee: fundingAmount * 0.03,
      feePercentage: 3.0,
      methods: [
        { id: 'credit_card', name: 'Credit/Debit Card', icon: '💳', description: 'Visa, Mastercard, American Express', processingTime: 'Instant', cost: '3.0%' },
        { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer', processingTime: '1-3 business days', cost: '2.0%' },
        { id: 'payid', name: 'PayID', icon: '📱', description: 'PayID payment system (address auto-created)', processingTime: 'Instant', cost: 'Free' },
        { id: 'apple_pay', name: 'Apple Pay', icon: '🍎', description: 'Apple Pay integration', processingTime: 'Instant', cost: '3.0%' },
        { id: 'google_pay', name: 'Google Pay', icon: '📱', description: 'Google Pay integration', processingTime: 'Instant', cost: '3.0%' },
        { id: 'crypto', name: 'Cryptocurrency', icon: '₿', description: 'Pay with Bitcoin, Ethereum, etc.', processingTime: '10-30 minutes', cost: '1.5%' },
        { id: 'bnpl', name: 'Buy Now Pay Later', icon: '📅', description: 'Pay in installments', processingTime: 'Instant approval', cost: '4.5%' },
      ],
    },
  ];

  // Step 2: Payment Options with Tabs
  const renderPaymentOptionsStep = () => {

    const handleTabSelect = (tabId: 'alchemy' | 'banxa') => {
      setActiveTab(tabId);
      setSelectedMethod(null);
    };

    const handleMethodSelect = (methodId: string) => {
      setSelectedMethod(methodId);
    };

    const handleContinue = () => {
      if (!selectedMethod) {
        Alert.alert('Selection Required', 'Please select a payment method.');
        return;
      }

      const provider = paymentProviders.find(p => p.id === activeTab);
      const method = provider?.methods.find(m => m.id === selectedMethod);
      
      if (provider && method) {
        handlePaymentSelection(provider.name, method.name);
      }
    };

    const getTotalAmount = (provider: any) => {
      return (fundingAmount + provider.fee).toFixed(2);
    };

    return (
      <View style={styles.stepContainer}>
        <Text style={[styles.paymentTitle, isDarkMode && styles.darkText]}>
          Choose Payment Method
        </Text>
        <Text style={[styles.stepSubtitle, isDarkMode && styles.darkSubtext]}>
          Step 2: Choose payment method for your {userDetails.accountType} account
        </Text>
        
        {/* Tab Header */}
        <View style={styles.tabContainer}>
          {paymentProviders.map((provider) => {
            const isActive = activeTab === provider.id;
            const totalAmount = getTotalAmount(provider);
            
            return (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.tab,
                  isDarkMode && styles.darkTab,
                  isActive && styles.activeTab,
                ]}
                onPress={() => handleTabSelect(provider.id as 'alchemy' | 'banxa')}
              >
                <View style={styles.tabContent}>
                  <Text style={[
                    styles.tabName,
                    isDarkMode && styles.darkText,
                    isActive && styles.activeTabText
                  ]}>
                    {provider.name}
                  </Text>
                  <Text style={[
                    styles.tabFee,
                    isActive && styles.activeTabFee
                  ]}>
                    {provider.feePercentage}% fee
                  </Text>
                  <Text style={[
                    styles.tabTotal,
                    isDarkMode && styles.darkText,
                    isActive && styles.activeTabTotal
                  ]}>
                    ${totalAmount}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Active Provider Methods */}
        <View style={styles.methodsContainer}>
          <View style={styles.methodsHeader}>
            <Text style={[styles.methodsTitle, isDarkMode && styles.darkText]}>
              {paymentProviders.find(p => p.id === activeTab)?.name}
            </Text>
            <Text style={[styles.methodsSubtitle, isDarkMode && styles.darkSubtext]}>
              Choose your preferred payment method
            </Text>
          </View>
          
          {paymentProviders.find(p => p.id === activeTab)?.methods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                isDarkMode && styles.darkMethodCard,
                selectedMethod === method.id && styles.selectedMethodCard,
              ]}
              onPress={() => handleMethodSelect(method.id)}
            >
              <View style={styles.methodHeader}>
                <Text style={styles.methodIcon}>{method.icon}</Text>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodName, isDarkMode && styles.darkText]}>
                    {method.name}
                  </Text>
                  <Text style={[styles.methodDescription, isDarkMode && styles.darkSubtext]}>
                    {method.description}
                  </Text>
                </View>
                <View style={styles.methodProcessing}>
                  <Text style={[styles.methodCost, isDarkMode && styles.darkText]}>
                    {method.cost}
                  </Text>
                  <Text style={[styles.processingTime, isDarkMode && styles.darkSubtext]}>
                    {method.processingTime}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity
          style={[styles.secondaryButton, isDarkMode && styles.darkSecondaryButton]}
          onPress={() => setCurrentStep(1)}
        >
          <Text style={[styles.secondaryButtonText, isDarkMode && styles.darkText]}>
            Back to Account Type
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            isDarkMode && styles.darkPrimaryButton,
            !selectedMethod && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedMethod}
        >
          <Text style={styles.buttonText}>
            Continue to Payment
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
        Step 3: Processing payment with {selectedPaymentProvider}
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
          
          {/* Display PayID address if PayID payment method is selected */}
          {payIDAddress && selectedMethod?.toLowerCase().includes('payid') && (
            <View style={[styles.payIDContainer, isDarkMode && styles.darkPayIDContainer]}>
              <Text style={[styles.payIDTitle, isDarkMode && styles.darkText]}>
                🆔 Your PayID Address:
              </Text>
              <Text style={[styles.payIDAddress, isDarkMode && styles.darkText]}>
                {payIDAddress}
              </Text>
              <Text style={[styles.payIDDescription, isDarkMode && styles.darkSubtext]}>
                Use this address for free, instant payments!
              </Text>
            </View>
          )}
        </View>
      )}
      
      {paymentStatus === 'failed' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Payment failed. Please try again.</Text>
        </View>
      )}
    </View>
  );

  // Step 4: Funding Success
  const renderFundingSuccessStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, isDarkMode && styles.darkText]}>
        Account Funded Successfully! 🎉
      </Text>
      <Text style={[styles.stepSubtitle, isDarkMode && styles.darkSubtext]}>
        Step 4: Your account has been funded
      </Text>
      
      <View style={[styles.fundingSuccessContainer, isDarkMode && styles.darkFundingSuccessContainer]}>
        <Text style={[styles.fundingSuccessText, isDarkMode && styles.darkText]}>
          ✅ Payment Processed Successfully
        </Text>
        <Text style={[styles.fundingSuccessText, isDarkMode && styles.darkText]}>
          💰 Amount: ${fundingAmount}
        </Text>
        <Text style={[styles.fundingSuccessText, isDarkMode && styles.darkText]}>
          🏦 Provider: {selectedPaymentProvider}
        </Text>
        <Text style={[styles.fundingSuccessText, isDarkMode && styles.darkText]}>
          💳 Method: {selectedMethod}
        </Text>
        
        {payIDAddress && selectedMethod?.toLowerCase().includes('payid') && (
          <View style={[styles.payIDSuccessContainer, isDarkMode && styles.darkPayIDSuccessContainer]}>
            <Text style={[styles.payIDSuccessTitle, isDarkMode && styles.darkText]}>
              🆔 Your PayID Address:
            </Text>
            <Text style={[styles.payIDSuccessAddress, isDarkMode && styles.darkText]}>
              {payIDAddress}
            </Text>
            <Text style={[styles.payIDSuccessDescription, isDarkMode && styles.darkSubtext]}>
              Use this address for free, instant payments!
            </Text>
          </View>
        )}
      </View>
      
      {/* HBAR Purchase Section */}
      <View style={[styles.hbarPurchaseContainer, isDarkMode && styles.darkHbarPurchaseContainer]}>
        <Text style={[styles.hbarPurchaseTitle, isDarkMode && styles.darkText]}>
          🪙 Purchasing HBAR
        </Text>
        
        {hbarPurchaseStatus === 'pending' && (
          <Text style={[styles.hbarPurchaseText, isDarkMode && styles.darkText]}>
            Ready to purchase 100 HBAR for AUD $32.00
          </Text>
        )}
        
        {hbarPurchaseStatus === 'purchasing' && (
          <Text style={[styles.hbarPurchaseText, isDarkMode && styles.darkText]}>
            🔄 Purchasing 100 HBAR at current market rate...
          </Text>
        )}
        
        {hbarPurchaseStatus === 'completed' && hbarPurchaseResult && (
          <View>
            <Text style={[styles.hbarPurchaseText, isDarkMode && styles.darkText]}>
              ✅ HBAR Purchase Completed!
            </Text>
            <Text style={[styles.hbarPurchaseText, isDarkMode && styles.darkText]}>
              🪙 Amount: {hbarPurchaseResult.amount} HBAR
            </Text>
            <Text style={[styles.hbarPurchaseText, isDarkMode && styles.darkText]}>
              💰 Cost: AUD ${hbarPurchaseResult.cost}
            </Text>
            <Text style={[styles.hbarPurchaseText, isDarkMode && styles.darkText]}>
              📝 Transaction: {hbarPurchaseResult.transactionId}
            </Text>
          </View>
        )}
        
        {hbarPurchaseStatus === 'failed' && (
          <Text style={[styles.hbarPurchaseText, isDarkMode && styles.darkText]}>
            ❌ HBAR purchase failed. Please try again.
          </Text>
        )}
      </View>
      
      <TouchableOpacity
        style={[styles.primaryButton, isDarkMode && styles.darkPrimaryButton]}
        onPress={async () => {
          if (hbarPurchaseStatus === 'pending') {
            await purchaseHBAR();
          } else if (hbarPurchaseStatus === 'completed') {
            setCurrentStep(5);
            await createWalletAfterFunding();
          }
        }}
        disabled={hbarPurchaseStatus === 'purchasing'}
      >
        <Text style={styles.buttonText}>
          {hbarPurchaseStatus === 'pending' ? 'Purchase 100 HBAR' : 
           hbarPurchaseStatus === 'purchasing' ? 'Purchasing HBAR...' :
           hbarPurchaseStatus === 'completed' ? 'Continue to Account Creation' :
           'Retry HBAR Purchase'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Step 5: Wallet Creation
  const renderWalletCreationStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, isDarkMode && styles.darkText]}>
        Creating Your Account
      </Text>
      <Text style={[styles.stepSubtitle, isDarkMode && styles.darkSubtext]}>
        Step 5: Setting up your blockchain account
      </Text>
      
      <View style={[styles.walletCreationContainer, isDarkMode && styles.darkWalletCreationContainer]}>
        <Text style={[styles.walletCreationText, isDarkMode && styles.darkText]}>
          🔐 Setting up your secure blockchain account...
        </Text>
        <Text style={[styles.walletCreationText, isDarkMode && styles.darkText]}>
          📱 Creating Hedera wallet and account...
        </Text>
        <Text style={[styles.walletCreationText, isDarkMode && styles.darkText]}>
          🔗 Connecting to Hedera testnet...
        </Text>
        <Text style={[styles.walletCreationText, isDarkMode && styles.darkText]}>
          ⏳ This may take a few moments.
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
      
      // Move to account type selection
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

  // Handle account type selection
  const handleAccountTypeSubmit = () => {
    if (!selectedAccountType) {
      Alert.alert('Error', 'Please select an account type');
      return;
    }
    
    console.log('Account type selected:', selectedAccountType);
    
    // Set funding amount based on account type
    let amount = 10; // Default
    switch (selectedAccountType) {
      case 'personal':
        amount = 100;
        break;
      case 'community':
        amount = 150;
        break;
      case 'business':
        amount = 200;
        break;
    }
    setFundingAmount(amount);
    console.log('Funding amount set to:', amount);
    
    // Update user details with selected account type
    setUserDetails(prev => ({ ...prev, accountType: selectedAccountType }));
    console.log('Moving to step 2 (payment selection)');
    setCurrentStep(2);
  };

  // Handle payment selection
  const handlePaymentSelection = async (provider: string, paymentMethod: string) => {
    console.log('Payment selected:', provider, paymentMethod);
    setSelectedPaymentProvider(provider);
    setSelectedMethod(paymentMethod);
    setCurrentStep(3);
    setPaymentStatus('processing');
    setCurrentStage(`Processing payment with ${provider} via ${paymentMethod}...`);
    
    try {
      // Simulate payment processing
      console.log('Simulating payment processing...');
      
      // Check if this is a PayID payment
      if (paymentMethod.toLowerCase().includes('payid')) {
        console.log('🧪 TESTNET: Processing PayID payment...');
        setCurrentStage('Generating PayID address and processing payment...');
        
        // Generate PayID address for display
        const generatedPayID = `${userDetails.email.toLowerCase().trim()}$safemate-testnet.com`;
        setPayIDAddress(generatedPayID);
        console.log(`Generated PayID address: ${generatedPayID}`);
      }
      
      // Simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      
      // Payment successful, show funding success screen
      setPaymentStatus('completed');
      setFundingSuccess(true);
      setCurrentStep(4);
      
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
              setCurrentStep(2);
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

  // Purchase HBAR using funding
  const purchaseHBAR = async () => {
    try {
      setHbarPurchaseStatus('purchasing');
      setCurrentStage('Purchasing 100 HBAR...');
      
      // Simulate HBAR purchase (in real implementation, this would call HederaService.purchaseHBAR)
      console.log('🧪 TESTNET: Simulating HBAR purchase');
      console.log(`💰 Funding amount: $${fundingAmount}`);
      console.log(`🪙 HBAR to purchase: 100 HBAR`);
      console.log(`💸 HBAR cost: AUD $32.00`);
      
      // Simulate purchase delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const hbarPurchaseResult = {
        amount: 100,
        cost: 32.00,
        transactionId: `hbartx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      setHbarPurchaseResult(hbarPurchaseResult);
      setHbarPurchaseStatus('completed');
      setCurrentStage('HBAR purchase completed!');
      
      console.log(`✅ HBAR purchase completed: ${hbarPurchaseResult.amount} HBAR for AUD $${hbarPurchaseResult.cost}`);
    } catch (error) {
      console.error('HBAR purchase failed:', error);
      setHbarPurchaseStatus('failed');
      setCurrentStage('');
    }
  };

  // Create wallet after funding
  const createWalletAfterFunding = async () => {
    try {
      setCurrentStage('Creating your blockchain account...');
      setWalletCreationStatus('creating');
      
      // Create user in database first
      const newUser = await DatabaseService.createUser({
        id: `user_${Date.now()}`,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        email: userDetails.email,
        passwordHash: PasswordUtils.hashPassword(userDetails.password),
        createdAt: new Date().toISOString(),
        isActive: true,
        hasWallet: false
      });
      
      // Create self-funded wallet
      const fundingResult = await SelfFundedWalletManager.createSelfFundedWallet({
        userId: newUser.id,
        userEmail: userDetails.email,
        amount: fundingAmount,
        provider: (selectedPaymentProvider || 'alchemy').toLowerCase() as 'alchemy' | 'banxa' | 'payid',
        paymentMethod: selectedMethod || 'credit_card'
      });
      
      if (!fundingResult.success) {
        throw new Error(fundingResult.error || 'Wallet creation failed');
      }
      
      // Update user record with wallet info
      await DatabaseService.updateUserWallet(newUser.id, fundingResult.wallet!.id);
      
      setWalletCreationStatus('completed');
      setCurrentStage('Account created successfully!');
      
      // Show success message with PayID address
      const payIDInfo = fundingResult.payIDAddress ? 
        `\n\nPayID Address: ${fundingResult.payIDAddress}\n(Use this for free, instant payments!)` : '';
      
      const successMessage = `Welcome to SafeMate, ${userDetails.firstName}! Your account has been created with Hedera blockchain integration.\n\nBlockchain Account: ${fundingResult.wallet!.accountId}${payIDInfo}`;
      
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
                accountId: fundingResult.wallet!.accountId,
                payIDAddress: fundingResult.payIDAddress
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
              setCurrentStep(2);
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
    console.log('Rendering step:', currentStep);
    switch (currentStep) {
      case 0:
        return renderUserDetailsStep();
      case 1:
        return renderAccountTypeStep();
      case 2:
        return renderPaymentOptionsStep();
      case 3:
        return renderFundingStep();
      case 4:
        return renderFundingSuccessStep();
      case 5:
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
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          onTouchStart={() => {
            // Close dropdown when tapping outside
            if (showSettingsDropdown) {
              setShowSettingsDropdown(false);
            }
            if (showPaymentSettingsDropdown) {
              setShowPaymentSettingsDropdown(false);
            }
            if (showFundingSuccessSettingsDropdown) {
              setShowFundingSuccessSettingsDropdown(false);
            }
            if (showWalletCreationSettingsDropdown) {
              setShowWalletCreationSettingsDropdown(false);
            }
          }}
        >
          <View style={styles.headerContainer}>
            {(currentStep === 1 || currentStep === 2 || currentStep === 4 || currentStep === 5) ? (
              <View style={styles.settingsContainer}>
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={() => {
                    if (currentStep === 1) {
                      setShowSettingsDropdown(!showSettingsDropdown);
                    } else if (currentStep === 2) {
                      setShowPaymentSettingsDropdown(!showPaymentSettingsDropdown);
                    } else if (currentStep === 4) {
                      setShowFundingSuccessSettingsDropdown(!showFundingSuccessSettingsDropdown);
                    } else if (currentStep === 5) {
                      setShowWalletCreationSettingsDropdown(!showWalletCreationSettingsDropdown);
                    }
                  }}
                >
                  <Text style={[styles.settingsButtonText, isDarkMode && styles.darkText]}>⚙️ Settings</Text>
                </TouchableOpacity>
                
                {/* Settings Dropdown for Account Type Step */}
                {currentStep === 1 && showSettingsDropdown && (
                  <View style={[styles.settingsDropdown, isDarkMode && styles.darkSettingsDropdown]}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setShowSettingsDropdown(false);
                        setCurrentStep(0);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, isDarkMode && styles.darkText]}>
                        Back to Details
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setShowSettingsDropdown(false);
                        Alert.alert(
                          'Log Out',
                          'Are you sure you want to log out?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Log Out', 
                              style: 'destructive',
                              onPress: () => onCancel()
                            }
                          ]
                        );
                      }}
                    >
                      <Text style={[styles.dropdownItemText, isDarkMode && styles.darkText]}>
                        Log Out
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setShowSettingsDropdown(false);
                        Alert.alert(
                          'Remove Account',
                          'Are you sure you want to remove your account? This action cannot be undone.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Remove', 
                              style: 'destructive',
                              onPress: () => onCancel()
                            }
                          ]
                        );
                      }}
                    >
                      <Text style={[styles.dropdownItemText, isDarkMode && styles.darkText]}>
                        Remove Account
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Settings Dropdown for Payment Method Step */}
                {currentStep === 2 && showPaymentSettingsDropdown && (
                  <View style={[styles.settingsDropdown, isDarkMode && styles.darkSettingsDropdown]}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setShowPaymentSettingsDropdown(false);
                        setCurrentStep(1);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, isDarkMode && styles.darkText]}>
                        Back to Account Type
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setShowPaymentSettingsDropdown(false);
                        Alert.alert(
                          'Close App',
                          'Are you sure you want to close the app?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Close App', 
                              style: 'destructive',
                              onPress: () => {
                                console.log('Closing SafeMate app...');
                                BackHandler.exitApp();
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <Text style={[styles.dropdownItemText, isDarkMode && styles.darkText]}>
                        Close App
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setShowPaymentSettingsDropdown(false);
                        Alert.alert(
                          'Delete User Account',
                          'Are you sure you want to delete your user account? This action cannot be undone.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Delete Account', 
                              style: 'destructive',
                              onPress: () => onCancel()
                            }
                          ]
                        );
                      }}
                    >
                      <Text style={[styles.dropdownItemText, isDarkMode && styles.darkText]}>
                        Delete User Account
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Settings Dropdown for Funding Success Step */}
                {currentStep === 4 && showFundingSuccessSettingsDropdown && (
                  <View style={[styles.settingsDropdown, isDarkMode && styles.darkSettingsDropdown]}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setShowFundingSuccessSettingsDropdown(false);
                        setCurrentStep(2);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, isDarkMode && styles.darkText]}>
                        Back to Payment Method
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setShowFundingSuccessSettingsDropdown(false);
                        Alert.alert(
                          'Close App',
                          'Are you sure you want to close the app?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Close App', 
                              style: 'destructive',
                              onPress: () => {
                                console.log('Closing SafeMate app...');
                                BackHandler.exitApp();
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <Text style={[styles.dropdownItemText, isDarkMode && styles.darkText]}>
                        Close App
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setShowFundingSuccessSettingsDropdown(false);
                        Alert.alert(
                          'Delete User Account',
                          'Are you sure you want to delete your user account? This action cannot be undone.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Delete Account', 
                              style: 'destructive',
                              onPress: () => onCancel()
                            }
                          ]
                        );
                      }}
                    >
                      <Text style={[styles.dropdownItemText, isDarkMode && styles.darkText]}>
                        Delete User Account
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Settings Dropdown for Wallet Creation Step */}
                {currentStep === 5 && showWalletCreationSettingsDropdown && (
                  <View style={[styles.settingsDropdown, isDarkMode && styles.darkSettingsDropdown]}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setShowWalletCreationSettingsDropdown(false);
                        setCurrentStep(4);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, isDarkMode && styles.darkText]}>
                        Back to Funding Success
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setShowWalletCreationSettingsDropdown(false);
                        Alert.alert(
                          'Close App',
                          'Are you sure you want to close the app?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Close App', 
                              style: 'destructive',
                              onPress: () => {
                                console.log('Closing SafeMate app...');
                                BackHandler.exitApp();
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <Text style={[styles.dropdownItemText, isDarkMode && styles.darkText]}>
                        Close App
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setShowWalletCreationSettingsDropdown(false);
                        Alert.alert(
                          'Delete User Account',
                          'Are you sure you want to delete your user account? This action cannot be undone.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Delete Account', 
                              style: 'destructive',
                              onPress: () => onCancel()
                            }
                          ]
                        );
                      }}
                    >
                      <Text style={[styles.dropdownItemText, isDarkMode && styles.darkText]}>
                        Delete User Account
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onCancel}
              >
                <Text style={[styles.closeButtonText, isDarkMode && styles.darkText]}>✕ Close</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Logo removed from all pages */}
          
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
    justifyContent: 'flex-end',
    flexDirection: 'row',
    width: '100%',
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
  settingsButton: {
    padding: 8,
    backgroundColor: '#3498db',
    borderRadius: 6,
  },
  settingsButtonText: {
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
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  paymentFee: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: '600',
  },
  paymentDescription: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
  },
  paymentTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  darkTab: {
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContent: {
    alignItems: 'center',
  },
  tabName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 3,
  },
  activeTabText: {
    color: '#2c3e50',
  },
  tabFee: {
    fontSize: 10,
    color: '#e74c3c',
    fontWeight: '500',
    marginBottom: 2,
  },
  activeTabFee: {
    color: '#e74c3c',
  },
  tabTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7f8c8d',
  },
  activeTabTotal: {
    color: '#27ae60',
  },
  methodsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodsHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  methodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 3,
  },
  methodsSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  methodCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e1e8ed',
  },
  darkMethodCard: {
    backgroundColor: '#34495e',
    borderColor: '#2c3e50',
  },
  selectedMethodCard: {
    borderColor: '#3498db',
    backgroundColor: '#e3f2fd',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  methodIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 3,
  },
  methodDescription: {
    fontSize: 11,
    color: '#7f8c8d',
    lineHeight: 18,
  },
  methodProcessing: {
    alignItems: 'flex-end',
  },
  processingTime: {
    fontSize: 10,
    color: '#95a5a6',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  methodCost: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27ae60',
    textAlign: 'right',
    marginBottom: 3,
  },
  disabledButton: {
    opacity: 0.5,
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
  // Account Type Selection Styles
  accountTypeContainer: {
    marginVertical: 16,
  },
  accountTypeOption: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e1e8ed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkAccountTypeOption: {
    backgroundColor: '#2c3e50',
    borderColor: '#34495e',
  },
  selectedAccountType: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  accountTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  accountTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  accountTypeIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  accountTypeDescription: {
    fontSize: 11,
    color: '#7f8c8d',
    lineHeight: 18,
    marginBottom: 6,
  },
  accountTypeFeatures: {
    fontSize: 10,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  accountTypePrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#27ae60',
    textAlign: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Settings Dropdown Styles
  settingsContainer: {
    position: 'relative',
  },
  settingsDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 0,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  darkSettingsDropdown: {
    backgroundColor: '#2c3e50',
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
  // PayID Display Styles
  payIDContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  darkPayIDContainer: {
    backgroundColor: '#1e3a1e',
    borderColor: '#2ecc71',
  },
  payIDTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: 8,
  },
  payIDAddress: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    fontFamily: 'monospace',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    marginBottom: 8,
  },
  payIDDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  // Funding Success Styles
  fundingSuccessContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  darkFundingSuccessContainer: {
    backgroundColor: '#1e3a1e',
    borderColor: '#2ecc71',
  },
  fundingSuccessText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: 8,
    textAlign: 'center',
  },
  payIDSuccessContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  darkPayIDSuccessContainer: {
    backgroundColor: '#34495e',
    borderColor: '#7f8c8d',
  },
  payIDSuccessTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: 8,
    textAlign: 'center',
  },
  payIDSuccessAddress: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 8,
  },
  payIDSuccessDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // HBAR Purchase Styles
  hbarPurchaseContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  darkHbarPurchaseContainer: {
    backgroundColor: '#3a2f00',
    borderColor: '#ffc107',
  },
  hbarPurchaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 12,
    textAlign: 'center',
  },
  hbarPurchaseText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default OnboardingFlow;
