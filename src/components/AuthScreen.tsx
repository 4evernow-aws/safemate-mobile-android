/**
 * SafeMate Authentication Screen
 * Landing page with user account creation and sign-in options
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WalletManager from '../services/blockchain/WalletManager';
import DatabaseService from '../database/DatabaseService';
import CryptoService from '../services/CryptoService';
import { PasswordUtils } from '../utils/PasswordUtils';

interface AuthScreenProps {
  onAuthSuccess: (userType: 'existing' | 'new', userData?: any) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'options'>('options');
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
      
      // Load existing wallet if available
      setCurrentStage('Loading blockchain wallet...');
      let wallet = null;
      let hederaAccountId = 'Unknown';
      
      try {
        wallet = await WalletManager.getActiveWallet();
        if (wallet) {
          hederaAccountId = wallet.accountId;
          console.log('Signing in with existing wallet:', wallet.accountId);
        } else {
          console.log('No existing wallet found');
        }
      } catch (walletError) {
        console.warn('Error loading wallet:', walletError);
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
        
        // Step 5: Create Hedera account
        setCurrentStage('Creating Hedera blockchain account...');
        console.log('Creating Hedera account for new user...');
        
        let hederaAccountId = 'Unknown';
        let hasWallet = false;
        
        try {
          const wallet = await WalletManager.createWallet();
          hederaAccountId = wallet.accountId;
          hasWallet = true;
          console.log('Hedera account created successfully:', hederaAccountId);
          
          // Update user record with wallet info
          await DatabaseService.updateUserWallet(newUser.id, wallet.id);
          console.log('User record updated with wallet information');
          
        } catch (hederaError) {
          console.error('Hedera account creation failed:', hederaError);
          const errorMessage = hederaError instanceof Error ? hederaError.message : 'Unknown error occurred';
          
          // Show error to user and don't proceed with account creation
          Alert.alert(
            'Blockchain Account Creation Failed',
            `Unable to create Hedera blockchain account: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  setIsLoading(false);
                  setIsCreatingWallet(false);
                  setCurrentStage('');
                }
              }
            ]
          );
          return; // Exit the function without creating the account
        }
        
        // Only proceed if we have a real Hedera account
        if (hasWallet && hederaAccountId !== 'Unknown') {
          console.log('Account created successfully with database storage');
          
          // Show success message
          setCurrentStage('Account created successfully!');
          const successMessage = `Welcome to SafeMate, ${firstName}! Your account has been created with Hedera blockchain integration. Account: ${hederaAccountId}`;
          
          Alert.alert(
            'Account Created Successfully! 🎉',
            successMessage,
            [
              {
                text: 'Continue',
                onPress: () => {
                  setCurrentStage('');
                  onAuthSuccess('new', { 
                    id: newUser.id,
                    firstName: newUser.firstName, 
                    lastName: newUser.lastName, 
                    email: newUser.email, 
                    type: 'email',
                    hasWallet: hasWallet,
                    accountId: hederaAccountId
                  });
                }
              }
            ]
          );
        } else {
          // This should not happen since we return early on Hedera failure
          console.error('Account creation completed but no valid Hedera account was created');
          Alert.alert(
            'Account Creation Error',
            'Account creation completed but no valid blockchain account was created. Please try again.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setIsLoading(false);
                  setIsCreatingWallet(false);
                  setCurrentStage('');
                }
              }
            ]
          );
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


  const renderSignInForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            // Close the app
            BackHandler.exitApp();
          }}
        >
          <Text style={[styles.closeButtonText, isDarkMode && styles.darkText]}>✕ Close</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>🛡️</Text>
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
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            // Close the app
            BackHandler.exitApp();
          }}
        >
          <Text style={[styles.closeButtonText, isDarkMode && styles.darkText]}>✕ Close</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>🛡️</Text>
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
            confirmPassword.length > 0 && {
              borderColor: passwordsMatch ? '#27ae60' : '#e74c3c',
              borderWidth: 2
            }
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
            { color: passwordsMatch ? '#27ae60' : '#e74c3c' }
          ]}>
            {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
          </Text>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            {isCreatingWallet ? 'Creating your blockchain wallet...' : 'Creating your account, please wait...'}
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
          {isCreatingWallet ? 'Creating Wallet...' : isLoading ? 'Creating Account...' : 'Create Account'}
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
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            // Close the app
            BackHandler.exitApp();
          }}
        >
          <Text style={[styles.closeButtonText, isDarkMode && styles.darkText]}>✕ Close</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>🛡️</Text>
        <Text style={styles.logoTitle}>SafeMate</Text>
      </View>
      <Text style={[styles.welcomeTitle, isDarkMode && styles.darkText]}>
        Welcome to SafeMate
      </Text>
      <Text style={[styles.welcomeSubtitle, isDarkMode && styles.darkSubtext]}>
        Keeping your data and legacy safe
      </Text>

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
        onPress={() => setAuthMode('signup')}
      >
        <Text style={[styles.optionButtonText, isDarkMode && styles.darkText]}>
          Create Account
        </Text>
        <Text style={[styles.optionButtonSubtext, isDarkMode && styles.darkSubtext]}>
          New to SafeMate? Get started
        </Text>
      </TouchableOpacity>

    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {authMode === 'signin' && renderSignInForm()}
          {authMode === 'signup' && renderSignUpForm()}
          {authMode === 'options' && renderAuthOptions()}
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
    marginBottom: 32,
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
    alignItems: 'flex-end',
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
  logoText: {
    fontSize: 48,
    marginBottom: 8,
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
});

export default AuthScreen;
