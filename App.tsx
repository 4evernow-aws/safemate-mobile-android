/**
 * SafeMate Mobile App
 * Local-First Blockchain File Management for Android
 * 
 * @format
 */

// Import polyfill for crypto random number generation (required for Hedera SDK)
import 'react-native-get-random-values';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  useColorScheme,
  Alert,
  Dimensions,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

// SafeMate Components
import Header from './src/components/Header';
import FolderGrid from './src/components/FolderGrid';
import FileList from './src/components/FileList';
import AccountDetails from './src/components/WalletStatus';
import SyncStatus from './src/components/SyncStatus';
import AuthScreen from './src/components/AuthScreen';
import CreateFolderModal from './src/components/CreateFolderModal';
import BlockchainStatus from './src/components/BlockchainStatus';

// Services
import DataService from './src/services/DataService';
import BlockchainSyncService from './src/services/blockchain/BlockchainSyncService';
import BlockchainVerificationService from './src/services/blockchain/BlockchainVerificationService';
import WalletManager from './src/services/blockchain/WalletManager';

// Types
import { Folder, File } from './src/types';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentView, setCurrentView] = useState<'home' | 'folder' | 'file'>('home');
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline' | 'syncing'>('offline');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Database state
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);

  useEffect(() => {
    // Only initialize app after authentication
    if (isAuthenticated) {
      initializeApp();
    }
  }, [isAuthenticated]);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      console.log('SafeMate app initializing...');
      
      // Initialize database and load data
      await DataService.initialize();
      
      // Only load verified folders (authenticated on blockchain)
      const verifiedFolders = await BlockchainVerificationService.getVerifiedFolders();
      setFolders(verifiedFolders);
      console.log(`Loaded ${verifiedFolders.length} verified folders from blockchain`);
      
      // Initialize blockchain services (with error handling)
      try {
        await BlockchainSyncService.initialize();
        console.log('Blockchain services initialized');
      } catch (blockchainError) {
        console.warn('Blockchain services failed to initialize:', blockchainError);
        // Continue without blockchain services for now
      }
      
      // Check wallet status (with error handling)
      try {
        const hasWallet = await WalletManager.hasWallet();
        setWalletConnected(hasWallet);
      } catch (walletError) {
        console.warn('Wallet check failed:', walletError);
        setWalletConnected(false);
      }
      
      // Check network connectivity (with error handling)
      try {
        const isOnline = await WalletManager.checkNetworkConnectivity();
        setSyncStatus(isOnline ? 'online' : 'offline');
      } catch (networkError) {
        console.warn('Network check failed:', networkError);
        setSyncStatus('offline');
      }
      
      console.log('SafeMate app initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SafeMate app:', error);
      Alert.alert('Initialization Error', 'Some services failed to initialize, but the app will continue to work.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    console.log('Resetting app state...');
    setIsAuthenticated(false);
    setUserData(null);
    setCurrentView('home');
    setSelectedFolder(null);
    setWalletConnected(false);
    setSyncStatus('offline');
    setFolders([]);
    setFiles([]);
    setIsLoading(true);
  };

  const deleteUserAccount = async () => {
    try {
      console.log('Deleting user account and all data...');
      
      // Clear any stored wallets first
      try {
        const wallets = await DataService.getWallets();
        console.log(`Found ${wallets.length} wallets to delete`);
        for (const wallet of wallets) {
          try {
            await WalletManager.deleteWalletFromKeychain(wallet.id);
            console.log(`Deleted wallet ${wallet.id} from keychain`);
          } catch (error) {
            console.warn('Failed to delete wallet from keychain:', error);
          }
        }
      } catch (walletError) {
        console.warn('Failed to get wallets for deletion:', walletError);
      }
      
      // Clear database
      await DataService.clearAllData();
      
      // Reset app state
      resetApp();
      
      Alert.alert('Account Deleted', 'Your account and all data have been deleted successfully.');
    } catch (error) {
      console.error('Failed to delete user account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    }
  };

          const handleAuthSuccess = async (userType: 'existing' | 'new', userData?: any) => {
            console.log('Authentication successful:', userType, userData);
            setUserData(userData);
            setIsAuthenticated(true);
            setIsLoading(false); // Set loading to false since we're authenticated
            
            if (userType === 'new' && userData?.type === 'wallet') {
              setWalletConnected(true);
              Alert.alert('Success', 'Blockchain wallet created successfully!');
            } else if (userType === 'new') {
              // Handle new user with wallet creation
              if (userData?.hasWallet) {
                setWalletConnected(true);
                console.log('New account created with Hedera wallet:', userData.wallet);
              } else if (userData?.walletError) {
                console.warn('Account created but wallet creation failed:', userData.walletError);
                setWalletConnected(false);
                
                // Test crypto functionality to help debug
                try {
                  const cryptoTest = await WalletManager.testCryptoFunctionality();
                  console.log('Crypto test after wallet creation failure:', cryptoTest);
                } catch (testError) {
                  console.error('Crypto test failed:', testError);
                }
              } else {
                console.log('New account created without wallet');
                setWalletConnected(false);
              }
            } else {
              Alert.alert('Welcome Back!', 'You have been signed in successfully.');
            }
          };

  const handleFolderPress = async (folder: Folder) => {
    try {
      setSelectedFolder(folder);
      setCurrentView('folder');
      
      // Load files for this folder from database
      const folderFiles = await DataService.getFilesByFolderId(folder.id);
      setFiles(folderFiles);
    } catch (error) {
      console.error('Failed to load folder files:', error);
      Alert.alert('Error', 'Failed to load folder contents');
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedFolder(null);
  };

  const handleCreateFolder = () => {
    setShowCreateFolderModal(true);
  };

  const handleCreateFolderSubmit = async (folderData: {
    name: string;
    type: 'parent' | 'subfolder';
    parentId?: string;
    description?: string;
  }) => {
    try {
      console.log('Creating folder:', folderData);
      
      // Create folder in database
      const newFolder = await DataService.createFolder({
        name: folderData.name,
        type: 'personal', // All folders use 'personal' type for database constraint
        description: folderData.description || 'User created folder',
        isBlockchain: true,
        isEncrypted: true,
        parentId: folderData.parentId,
      });
      
      console.log('Folder created in database:', newFolder.id);
      
      // Sync folder to blockchain to create NFT
      if (walletConnected && newFolder.isBlockchain) {
        console.log('Syncing folder to blockchain...');
        try {
          const syncResult = await BlockchainSyncService.syncFolderToBlockchain(newFolder.id);
          if (syncResult.success) {
            console.log('Folder synced to blockchain successfully:', syncResult.blockchainTokenId);
            Alert.alert(
              'Success! 🎉', 
              `${folderData.type === 'parent' ? 'Parent folder' : 'Subfolder'} "${folderData.name}" created successfully!\n\nBlockchain NFT: ${syncResult.blockchainTokenId}`
            );
          } else {
            console.warn('Blockchain sync failed:', syncResult.error);
            Alert.alert(
              'Folder Created (Offline)', 
              `${folderData.type === 'parent' ? 'Parent folder' : 'Subfolder'} "${folderData.name}" created locally. It will sync to blockchain when online.`
            );
          }
        } catch (syncError) {
          console.error('Blockchain sync error:', syncError);
          Alert.alert(
            'Folder Created (Offline)', 
            `${folderData.type === 'parent' ? 'Parent folder' : 'Subfolder'} "${folderData.name}" created locally. It will sync to blockchain when online.`
          );
        }
      } else {
        console.log('Wallet not connected or folder not set for blockchain');
        Alert.alert('Success', `${folderData.type === 'parent' ? 'Parent folder' : 'Subfolder'} "${folderData.name}" created successfully!`);
      }
      
          // Refresh verified folders list (only show blockchain-verified folders)
          const verifiedFolders = await BlockchainVerificationService.getVerifiedFolders();
          setFolders(verifiedFolders);
      
    } catch (error) {
      console.error('Failed to create folder:', error);
      Alert.alert('Error', 'Failed to create folder');
    }
  };

  const handleUploadFile = () => {
    Alert.alert(
      'Upload File',
      'Select a file to upload to the blockchain',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose File', onPress: () => console.log('Opening file picker...') },
      ]
    );
  };

  const handleRefresh = async () => {
    try {
      // Refresh verified folders (only show blockchain-verified folders)
      const verifiedFolders = await BlockchainVerificationService.getVerifiedFolders();
      setFolders(verifiedFolders);
      console.log(`Refreshed: ${verifiedFolders.length} verified folders`);
    } catch (error) {
      console.error('Failed to refresh verified folders:', error);
    }
  };

  const renderHomeView = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            Loading SafeMate...
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.content}>
        <AccountDetails 
          connected={walletConnected}
          userData={userData}
        />
        <SyncStatus status={syncStatus} />
        <BlockchainStatus 
          onRefresh={handleRefresh}
        />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Your Folders ({folders.length})
          </Text>
          <FolderGrid 
            folders={folders}
            onFolderPress={handleFolderPress}
          />
        </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={handleCreateFolder}
                  >
                    <Text style={styles.buttonText}>Create Folder</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={handleUploadFile}
                  >
                    <Text style={styles.buttonText}>Upload File</Text>
                  </TouchableOpacity>
                </View>

      </ScrollView>
    );
  };

  const renderFolderView = () => (
    <View style={styles.content}>
      <View style={styles.folderHeader}>
        <TouchableOpacity onPress={handleBackToHome} style={styles.backButton}>
          <Text style={[styles.backButtonText, isDarkMode && styles.darkText]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.folderTitle, isDarkMode && styles.darkText]}>
          {selectedFolder?.name}
        </Text>
      </View>
      
      <FileList 
        files={files}
        folder={selectedFolder}
        onFilePress={(file) => console.log('File pressed:', file)}
      />
    </View>
  );

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Header 
          title="SafeMate"
          subtitle="Keeping your data and legacy safe"
          onSignOut={resetApp}
          onDeleteAccount={deleteUserAccount}
        />
        
        {currentView === 'home' && renderHomeView()}
        {currentView === 'folder' && renderFolderView()}
        
        {/* Create Folder Modal */}
        <CreateFolderModal
          visible={showCreateFolderModal}
          onClose={() => setShowCreateFolderModal(false)}
          onCreateFolder={handleCreateFolderSubmit}
          parentFolders={folders.filter(f => f.type === 'personal')}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  darkText: {
    color: '#ffffff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  secondaryButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3498db',
  },
  folderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 18,
    color: '#2c3e50',
    textAlign: 'center',
  },
});

export default App;
