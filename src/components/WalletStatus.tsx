/**
 * SafeMate AccountDetails Component
 * Displays user account details with Hedera account information
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

interface AccountDetailsProps {
  connected: boolean;
  userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    accountId?: string;
    walletId?: string;
  };
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ connected, userData }) => {
  const isDarkMode = useColorScheme() === 'dark';

  // Get display name from user data
  const displayName = userData?.firstName && userData?.lastName 
    ? `${userData.firstName} ${userData.lastName}`
    : userData?.email || 'User';

  // Get Hedera account number - only show if we have a real account ID
  const hederaAccountNumber = userData?.accountId && userData.accountId !== 'Unknown' 
    ? userData.accountId 
    : 'Unknown';

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.content}>
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusIcon]}>
              👤
            </Text>
            <Text style={[styles.statusTitle, isDarkMode && styles.darkText]}>
              Account Details
            </Text>
          </View>
          
          <Text style={[styles.statusText, isDarkMode && styles.darkSubtext]}>
            Welcome, {displayName}
          </Text>
          
          <View style={styles.accountInfoContainer}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtext]}>
                Username:
              </Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                {userData?.email || 'Unknown'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtext]}>
                Password:
              </Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                ••••••••
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtext]}>
                Account Number:
              </Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                {hederaAccountNumber}
              </Text>
            </View>
          </View>
        </View>
        
        
        {connected && (
          <View style={styles.connectedInfo}>
            <Text style={[styles.networkInfo, isDarkMode && styles.darkSubtext]}>
              Network: Hedera Testnet
            </Text>
            <Text style={[styles.networkInfo, isDarkMode && styles.darkSubtext]}>
              Status: Connected
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  darkContainer: {
    backgroundColor: '#2c3e50',
    borderColor: '#34495e',
  },
  content: {
    padding: 16,
  },
  statusSection: {
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  darkText: {
    color: '#ffffff',
  },
  statusText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  darkSubtext: {
    color: '#bdc3c7',
  },
  accountInfoContainer: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
  },
  connectedInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  networkInfo: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
});

export default AccountDetails;
