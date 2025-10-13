/**
 * SafeMate Authentication Screen
 * Landing page with user account creation and sign-in options
 */

import React, { useState, useEffect } from 'react';
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
import WalletManager from '../services/blockchain/WalletManager';
import SelfFundedWalletManager from '../services/blockchain/SelfFundedWalletManager';
import DatabaseService from '../database/DatabaseService';
import CryptoService from '../services/CryptoService';
import { PasswordUtils } from '../utils/PasswordUtils';
import OnboardingFlow from './OnboardingFlow';
import FundingOptionsModal from './FundingOptionsModal';

interface AuthScreenProps {
  onAuthSuccess: (userType: 'existing' | 'new', userData?: any) => void;
  hasExistingUser: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  color: string;
}

const PLANS: Plan[] = [
  {
    id: 'personal',
    name: 'Personal',
    price: 100,
    description: 'Perfect for individuals and families',
    features: ['Up to 10GB storage', 'Personal document encryption', 'Family photo backup'],
    color: '#3498db'
  },
  {
    id: 'community',
    name: 'Community',
    price: 150,
    description: 'Ideal for small groups and communities',
    features: ['Up to 50GB storage', 'Advanced encryption', 'Community collaboration tools'],
    color: '#e74c3c'
  },
  {
    id: 'business',
    name: 'Business',
    price: 200,
    description: 'Complete solution for businesses',
    features: ['Unlimited storage', 'Enterprise-grade security', 'Advanced analytics'],
    color: '#27ae60'
  }
];

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, hasExistingUser }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'options'>(
    hasExistingUser ? 'signin' : 'signup'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Update auth mode based on user existence
  useEffect(() => {
    if (hasExistingUser) {
      setAuthMode('signin');
    } else {
      setAuthMode('signup');
    }
  }, [hasExistingUser]);

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
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // Progress indicator component
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

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      // Initialize database first
      setCurrentStage('Initializing database...');
      console.log('Initializing database for sign-in...');
      try {
        await DatabaseService.initialize();
        console.log('Database initialized successfully for sign-in');
      } catch (dbError) {
        console.warn('Database initialization failed during sign-in, but continuing:', dbError);
      }
      
      // Check if account exists
      setCurrentStage('Checking for existing account...');
      console.log('Checking for existing account...');
      const existingUser = await DatabaseService.getUserByEmail(email);
      if (!existingUser) {
        console.log('No account found - redirecting to sign up');
        Alert.alert(
          'No Account Found', 
          'No SafeMate account found with this email. Please create a new account first.',
          [
            {
              text: 'Create Account',
              onPress: () => setAuthMode('signup')
            }
          ]
        );
        setIsLoading(false);
        return;
      }
      
      // Verify password
      setCurrentStage('Verifying password...');
      console.log('Verifying password...');
      const passwordHash = PasswordUtils.hashPassword(password);
      const isValidPassword = PasswordUtils.verifyPassword(password, passwordHash);
      
      if (!isValidPassword) {
        console.log('Invalid password');
        Alert.alert('Sign In Failed', 'Invalid email or password. Please try again.');
        setIsLoading(false);
        setCurrentStage('');
        return;
      }
      
      // Update last login
      setCurrentStage('Updating login status...');
      await DatabaseService.updateUserLastLogin(existingUser.id);
      
      // Load existing account if available
      setCurrentStage('Loading blockchain account...');
      let wallet = null;
      let hederaAccountId = 'Unknown';
      
      try {
        wallet = await WalletManager.getActiveWallet();
        if (wallet) {
          hederaAccountId = wallet.accountId;
          console.log('Signing in with existing account:', wallet.accountId);
        } else {
          console.log('No existing account found');
        }
      } catch (walletError) {
        console.warn('Error loading account:', walletError);
      }

      // If user has no Hedera account yet, attempt to create it now
      if (!wallet || hederaAccountId === 'Unknown') {
        setCurrentStage('Creating Hedera blockchain account...');
        console.log('No valid Hedera account detected on sign-in. Attempting creation...');
        try {
          const newWallet = await WalletManager.createWallet();
          wallet = newWallet;
          hederaAccountId = newWallet.accountId;
          console.log('Hedera account created on sign-in:', hederaAccountId);
          // Update user record with account info
          try {
            await DatabaseService.updateUserWallet(existingUser.id, newWallet.id);
            console.log('User record updated with new account after sign-in');
          } catch (updateErr) {
            console.warn('Failed to update user account reference after sign-in:', updateErr);
          }
        } catch (createErr) {
          console.warn('Hedera account creation during sign-in failed:', createErr);
          Alert.alert(
            'Blockchain Account Setup Failed',
            'We could not create your Hedera account right now. You are signed in and can try again later.',
            [{ text: 'OK' }]
          );
        }
      }
      
      // Show success message and wait before proceeding
      setCurrentStage('Sign-in successful!');
      Alert.alert(
        'Welcome Back! 👋',
        `Successfully signed in to your SafeMate account, ${existingUser.firstName}!`,
        [
          {
            text: 'Continue',
            onPress: () => {
              setCurrentStage('');
              onAuthSuccess('existing', { 
                id: existingUser.id,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                email: existingUser.email, 
                type: 'email',
                hasWallet: existingUser.hasWallet,
                accountId: hederaAccountId,
                walletId: wallet?.id
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Sign In Failed', 'Unable to access your account. Please try again.');
    } finally {
      setIsLoading(false);
      setCurrentStage('');
    }
  };

  const handleSignUp = async () => {
    // Prevent multiple simultaneous signup attempts
    if (isLoading) {
      console.log('Signup already in progress, ignoring duplicate request');
      return;
    }

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const passwordStrength = getPasswordStrength(password);
    if (passwordStrength.strength === 'Weak') {
      Alert.alert('Weak Password', 'Please choose a stronger password with at least 8 characters, including uppercase, lowercase, and numbers.');
      return;
    }

    setIsLoading(true);
    console.log('Starting signup process...');
    try {
      // Step 1: Initialize database first
      setCurrentStage('Initializing database...');
      console.log('Initializing database...');
      try {
        await DatabaseService.initialize();
        console.log('Database initialized successfully');
      } catch (dbError) {
        console.warn('Database initialization failed, but continuing:', dbError);
      }
      
      // Step 2: Check if account already exists (after database is ready)
      setCurrentStage('Checking for existing account...');
      console.log('Checking for existing account...');
      try {
        const existingUser = await DatabaseService.getUserByEmail(email);
        
        if (existingUser) {
          console.log('Account already exists - redirecting to sign in');
          Alert.alert(
            'Account Already Exists', 
            'You already have a SafeMate account. Please use the Sign In option instead.',
            [
              {
                text: 'Go to Sign In',
                onPress: () => setAuthMode('signin')
              }
            ]
          );
          setIsLoading(false);
          setCurrentStage('');
          return;
        }
        console.log('No existing account found, proceeding with account creation');
      } catch (userCheckError) {
        console.warn('Error checking for existing user, proceeding with account creation:', userCheckError);
        // Continue with account creation even if user check fails
      }
      
      // Step 3: Create user account in database
      setCurrentStage('Creating user account...');
      console.log('Creating user account in database...');
      const passwordHash = PasswordUtils.hashPassword(password);
      
      const newUser = await DatabaseService.createUser({
        firstName,
        lastName,
        email,
        passwordHash
      });
      
      console.log('User created in database:', newUser);
      
      // Step 4: Test crypto functionality
      setCurrentStage('Testing crypto functionality...');
      setIsCreatingWallet(true);
      console.log('Testing crypto functionality...');
      
      try {
        const cryptoTest = CryptoService.testCryptoFunctionality();
        console.log('Crypto test result:', cryptoTest);
        
        const availableMethods = CryptoService.getAvailableMethods();
        console.log('Available crypto methods:', availableMethods);
        
        // Test crypto string generation
        const testString = CryptoService.generateRandomString(16);
        console.log('Test random string generated:', testString);
        
        // Step 5: Create self-funded Hedera account
        setCurrentStage('Setting up blockchain account...');
        console.log('Setting up self-funded Hedera account for new user...');
        
        try {
          // Store user data and show plan selection
          setPendingUser(newUser);
          setShowPlanSelection(true);
          setCurrentStage('');
          setIsLoading(false);
          setIsCreatingWallet(false);
          return; // Exit here, the plan selection will handle the rest
        } catch (planError) {
          console.error('Failed to show plan selection:', planError);
          // Fallback to continue without wallet
          onAuthSuccess('new', { 
            id: newUser.id,
            firstName: newUser.firstName, 
            lastName: newUser.lastName, 
            email: newUser.email, 
            type: 'email',
            hasWallet: false,
            accountId: 'Unknown'
          });
        }
      } catch (error) {
        console.error('Account setup failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        Alert.alert('Account Creation Failed', `Unable to set up your account: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Signup process failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Sign Up Failed', `Failed to create account: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setIsCreatingWallet(false);
      setCurrentStage('');
      console.log('Signup process completed');
    }
  };

  // Handle funding modal success
  const handleFundingSuccess = async (result: any) => {
    try {
      console.log('Funding successful:', result);
      setShowFundingModal(false);
      
      // Create the wallet with the funding result
      const walletResult = await SelfFundedWalletManager.createSelfFundedWallet({
        amount: result.amount,
        provider: result.provider,
        userEmail: pendingUser.email,
        userId: pendingUser.id,
      });

      if (walletResult && walletResult.success) {
        // Update user record with account info
        await DatabaseService.updateUserWallet(pendingUser.id, walletResult.wallet!.id);
        
        // Show success message
        Alert.alert(
          'Account Created Successfully! 🎉',
          `Welcome to SafeMate, ${pendingUser.firstName}! Your account has been created with Hedera blockchain integration.`,
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
                  accountId: walletResult.wallet!.accountId
                });
              }
            }
          ]
        );
      } else {
        throw new Error('Wallet creation failed');
      }
    } catch (error) {
      console.error('Failed to create wallet after funding:', error);
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
    }
  };

  // Handle funding modal cancellation
  const handleFundingCancel = () => {
    setShowFundingModal(false);
    Alert.alert(
      'Account Creation Cancelled',
      'You cancelled the account funding process. You can create a blockchain account later from the app settings.',
      [
        {
          text: 'Continue Without Account',
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
  };

  // Handle plan selection
  const handlePlanSelected = (plan: Plan) => {
    console.log('Plan selected:', plan);
    setSelectedPlan(plan);
    setShowPlanSelection(false);
    setShowFundingModal(true);
  };

  const renderPlanSelection = () => (
    <View style={styles.formContainer}>
      
      <View style={styles.logoContainer}>
        <Text style={[styles.logoTitle, isDarkMode && styles.darkText]}>Choose Your Plan</Text>
      </View>
      
      <Text style={[styles.welcomeSubtitle, isDarkMode && styles.darkSubtext]}>
        Select the plan that best fits your needs
      </Text>

      <ScrollView style={styles.plansContainer} showsVerticalScrollIndicator={false}>
        {PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              isDarkMode && styles.darkPlanCard,
              selectedPlan?.id === plan.id && styles.selectedPlanCard,
            ]}
            onPress={() => handlePlanSelected(plan)}
          >
            
            <View style={styles.planHeader}>
              <Text style={[styles.planName, isDarkMode && styles.darkText]}>{plan.name}</Text>
              <Text style={[styles.price, isDarkMode && styles.darkText]}>${plan.price}</Text>
            </View>
            
            <Text style={[styles.planDescription, isDarkMode && styles.darkSubtext]}>
              {plan.description}
            </Text>
            
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <Text key={index} style={[styles.featureText, isDarkMode && styles.darkSubtext]}>
                  • {feature}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSignInForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoTitle}>SafeMate</Text>
      </View>
      <Text style={[styles.formTitle, isDarkMode && styles.darkText]}>
        Welcome Back
      </Text>
      {renderProgressIndicator()}
      <Text style={[styles.formSubtitle, isDarkMode && styles.darkSubtext]}>
        Sign in to your SafeMate account
      </Text>

      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        placeholder="Email"
        placeholderTextColor={isDarkMode ? '#bdc3c7' : '#7f8c8d'}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.passwordContainer}>
      <TextInput
          style={[styles.input, styles.passwordInput, isDarkMode && styles.darkInput]}
        placeholder="Password"
        placeholderTextColor={isDarkMode ? '#bdc3c7' : '#7f8c8d'}
        value={password}
        onChangeText={setPassword}
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

      <TouchableOpacity
        style={[styles.primaryButton, isDarkMode && styles.darkPrimaryButton]}
        onPress={handleSignIn}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setAuthMode('signup')}
      >
        <Text style={[styles.linkText, isDarkMode && styles.darkText]}>
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSignUpForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoTitle}>SafeMate</Text>
      </View>
      <Text style={[styles.formTitle, isDarkMode && styles.darkText]}>
        Create Account
      </Text>
      {renderProgressIndicator()}
      <Text style={[styles.formSubtitle, isDarkMode && styles.darkSubtext]}>
        Join SafeMate and secure your files
      </Text>

      <View style={styles.nameRow}>
        <TextInput
          style={[styles.input, styles.nameInput, isDarkMode && styles.darkInput]}
          placeholder="First Name"
          placeholderTextColor={isDarkMode ? '#bdc3c7' : '#7f8c8d'}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          autoCorrect={false}
        />
        <TextInput
          style={[styles.input, styles.nameInput, isDarkMode && styles.darkInput]}
          placeholder="Last Name"
          placeholderTextColor={isDarkMode ? '#bdc3c7' : '#7f8c8d'}
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </View>

      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        placeholder="Email"
        placeholderTextColor={isDarkMode ? '#bdc3c7' : '#7f8c8d'}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.passwordContainer}>
      <TextInput
          style={[styles.input, styles.passwordInput, isDarkMode && styles.darkInput]}
        placeholder="Password"
        placeholderTextColor={isDarkMode ? '#bdc3c7' : '#7f8c8d'}
        value={password}
        onChangeText={setPassword}
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
      
      {password.length > 0 && (
        <View style={styles.passwordStrengthContainer}>
          <Text style={[styles.passwordStrengthText, { color: getPasswordStrength(password).color }]}>
            Password Strength: {getPasswordStrength(password).strength}
          </Text>
        </View>
      )}

      <View style={styles.passwordContainer}>
      <TextInput
          style={[
            styles.input, 
            styles.passwordInput,
            isDarkMode && styles.darkInput,
            confirmPassword.length > 0 && (passwordsMatch ? styles.passwordMatchSuccess : styles.passwordMatchError)
          ]}
        placeholder="Confirm Password"
        placeholderTextColor={isDarkMode ? '#bdc3c7' : '#7f8c8d'}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
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
      
      {confirmPassword.length > 0 && (
        <View style={styles.passwordMatchContainer}>
          <Text style={[
            styles.passwordMatchText, 
            passwordsMatch ? styles.passwordMatchSuccessText : styles.passwordMatchErrorText
          ]}>
            {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
          </Text>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            {isCreatingWallet ? 'Creating your blockchain account...' : 'Creating your account, please wait...'}
          </Text>
          {isCreatingWallet && (
            <Text style={[styles.loadingSubtext, isDarkMode && styles.darkSubtext]}>
              This may take a few moments
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.primaryButton, 
          isDarkMode && styles.darkPrimaryButton,
          isLoading && styles.disabledButton
        ]}
        onPress={handleSignUp}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isCreatingWallet ? 'Creating Account...' : isLoading ? 'Creating Account...' : 'Create Account'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setAuthMode('signin')}
      >
        <Text style={[styles.linkText, isDarkMode && styles.darkText]}>
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );


  const renderAuthOptions = () => (
    <View style={styles.optionsContainer}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoTitle}>SafeMate</Text>
      </View>
      <Text style={[styles.welcomeTitle, isDarkMode && styles.darkText]}>
        Welcome to SafeMate
      </Text>
      <Text style={[styles.welcomeSubtitle, isDarkMode && styles.darkSubtext]}>
        Keeping your data and legacy safe
      </Text>

      {!hasExistingUser && (
        <View style={[styles.infoContainer, isDarkMode && styles.darkInfoContainer]}>
          <Text style={[styles.infoText, isDarkMode && styles.darkSubtext]}>
            🆕 No existing account found. Let's create your SafeMate account to get started!
          </Text>
        </View>
      )}

      {hasExistingUser && (
        <View style={[styles.infoContainer, isDarkMode && styles.darkInfoContainer]}>
          <Text style={[styles.infoText, isDarkMode && styles.darkSubtext]}>
            👋 Welcome back! Please sign in to access your SafeMate account.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.optionButton, isDarkMode && styles.darkOptionButton]}
        onPress={() => setAuthMode('signin')}
      >
        <Text style={[styles.optionButtonText, isDarkMode && styles.darkText]}>
          Sign In
        </Text>
        <Text style={[styles.optionButtonSubtext, isDarkMode && styles.darkSubtext]}>
          Access your existing account
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, isDarkMode && styles.darkOptionButton]}
        onPress={() => setShowOnboarding(true)}
      >
        <Text style={[styles.optionButtonText, isDarkMode && styles.darkText]}>
          Create Account
        </Text>
        <Text style={[styles.optionButtonSubtext, isDarkMode && styles.darkSubtext]}>
          New to SafeMate? Get started with our enhanced onboarding
        </Text>
      </TouchableOpacity>

    </View>
  );

  // Show onboarding flow if enabled
  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={(userData) => {
          setShowOnboarding(false);
          onAuthSuccess('new', userData);
        }}
        onCancel={() => {
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {showPlanSelection && renderPlanSelection()}
          {!showPlanSelection && authMode === 'signin' && renderSignInForm()}
          {!showPlanSelection && authMode === 'signup' && renderSignUpForm()}
          {!showPlanSelection && authMode === 'options' && renderAuthOptions()}
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Funding Options Modal */}
      <FundingOptionsModal
        visible={showFundingModal}
        amount={selectedPlan?.price || 10}
        userEmail={pendingUser?.email || ''}
        userId={pendingUser?.id || ''}
        onClose={() => setShowFundingModal(false)}
        onSuccess={handleFundingSuccess}
        onCancel={handleFundingCancel}
      />
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
  optionsContainer: {
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: '#e8f4fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  darkInfoContainer: {
    backgroundColor: '#2c3e50',
    borderLeftColor: '#3498db',
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 20,
  },
  optionButton: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkOptionButton: {
    backgroundColor: '#2c3e50',
    borderColor: '#34495e',
  },
  optionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  optionButtonSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  formContainer: {
    width: '100%',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 32,
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
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
    opacity: 0.7,
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
  loadingSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  linkButton: {
    alignItems: 'center',
    padding: 8,
  },
  linkText: {
    color: '#3498db',
    fontSize: 14,
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
    marginBottom: 16,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
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
    // Add animation effect
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordMatchSuccess: {
    borderColor: '#27ae60',
    borderWidth: 2,
  },
  passwordMatchError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  passwordMatchSuccessText: {
    color: '#27ae60',
  },
  passwordMatchErrorText: {
    color: '#e74c3c',
  },
  plansContainer: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  planCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkPlanCard: {
    backgroundColor: '#2c3e50',
    borderColor: '#34495e',
  },
  selectedPlanCard: {
    borderWidth: 3,
    borderColor: '#3498db',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  price: {
    fontSize: 32,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default AuthScreen;
