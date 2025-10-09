import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import BlockchainVerificationService from '../services/blockchain/BlockchainVerificationService';

interface BlockchainStatusProps {
  onRefresh?: () => void;
}

interface BlockchainStatusData {
  totalFolders: number;
  verifiedFolders: number;
  pendingFolders: number;
  failedFolders: number;
  verifiedSubfolders: number;
  verifiedFiles: number;
  totalBlockchainItems: number;
}

const BlockchainStatus: React.FC<BlockchainStatusProps> = ({ onRefresh }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [status, setStatus] = useState<BlockchainStatusData>({
    totalFolders: 0,
    verifiedFolders: 0,
    pendingFolders: 0,
    failedFolders: 0,
    verifiedSubfolders: 0,
    verifiedFiles: 0,
    totalBlockchainItems: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStatus = async () => {
    try {
      const blockchainStatus = await BlockchainVerificationService.getBlockchainStatus();
      setStatus(blockchainStatus);
    } catch (error) {
      console.error('Failed to load blockchain status:', error);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadStatus();
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to refresh blockchain status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRetryFailed = async () => {
    try {
      const result = await BlockchainVerificationService.retryFailedFolders();
      Alert.alert(
        'Retry Complete',
        `Successfully synced: ${result.success}\nFailed: ${result.failed}`,
        [{ text: 'OK', onPress: handleRefresh }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to retry failed folders');
    }
  };

  const handleVerifyAll = async () => {
    try {
      const newStatus = await BlockchainVerificationService.verifyAllFolders();
      setStatus(newStatus);
      Alert.alert(
        'Verification Complete',
        `Verified: ${newStatus.verifiedFolders}\nPending: ${newStatus.pendingFolders}\nFailed: ${newStatus.failedFolders}`,
        [{ text: 'OK', onPress: handleRefresh }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to verify all folders');
    }
  };

  const getStatusColor = () => {
    if (status.failedFolders > 0) return '#ff4444';
    if (status.pendingFolders > 0) return '#ffaa00';
    if (status.verifiedFolders > 0) return '#44ff44';
    return '#888888';
  };

  const getStatusText = () => {
    if (status.failedFolders > 0) return '⚠️ Some items failed blockchain sync';
    if (status.pendingFolders > 0) return '⏳ Some items pending blockchain sync';
    if (status.totalBlockchainItems > 0) return `✅ ${status.totalBlockchainItems} items verified on blockchain`;
    return '📁 No blockchain items found';
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          🔗 Blockchain Status
        </Text>
        <TouchableOpacity
          style={[styles.refreshButton, isDarkMode && styles.darkRefreshButton]}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          <Text style={[styles.refreshText, isDarkMode && styles.darkText]}>
            {isRefreshing ? '🔄' : '↻'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.statusCard, isDarkMode && styles.darkStatusCard]}>
        <View style={styles.statusRow}>
          <Text style={[styles.statusText, isDarkMode && styles.darkText]}>
            {getStatusText()}
          </Text>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, isDarkMode && styles.darkText]}>
              {status.verifiedFolders}
            </Text>
            <Text style={[styles.statLabel, isDarkMode && styles.darkText]}>
              Parent Folders
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, isDarkMode && styles.darkText]}>
              {status.verifiedSubfolders}
            </Text>
            <Text style={[styles.statLabel, isDarkMode && styles.darkText]}>
              Subfolders
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, isDarkMode && styles.darkText]}>
              {status.verifiedFiles}
            </Text>
            <Text style={[styles.statLabel, isDarkMode && styles.darkText]}>
              Files
            </Text>
          </View>
        </View>

        {(status.pendingFolders > 0 || status.failedFolders > 0) && (
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, isDarkMode && styles.darkText]}>
              {status.pendingFolders > 0 && `⏳ ${status.pendingFolders} pending`}
              {status.pendingFolders > 0 && status.failedFolders > 0 && ' • '}
              {status.failedFolders > 0 && `❌ ${status.failedFolders} failed`}
            </Text>
          </View>
        )}

        {(status.failedFolders > 0 || status.pendingFolders > 0) && (
          <View style={styles.actionButtons}>
            {status.failedFolders > 0 && (
              <TouchableOpacity
                style={[styles.actionButton, styles.retryButton]}
                onPress={handleRetryFailed}
              >
                <Text style={styles.actionButtonText}>Retry Failed</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.verifyButton]}
              onPress={handleVerifyAll}
            >
              <Text style={styles.actionButtonText}>Verify All</Text>
            </TouchableOpacity>
          </View>
        )}

        {status.totalBlockchainItems === 0 && status.pendingFolders === 0 && status.failedFolders === 0 && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.verifyButton]}
              onPress={handleVerifyAll}
            >
              <Text style={styles.actionButtonText}>Check Blockchain</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginBottom: 8,
  },
  darkContainer: {
    // Dark mode styles if needed
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  darkRefreshButton: {
    backgroundColor: '#333',
  },
  refreshText: {
    fontSize: 16,
    color: '#333',
  },
  statusCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  darkStatusCard: {
    backgroundColor: '#2d2d2d',
    borderColor: '#444',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
  },
  verifyButton: {
    backgroundColor: '#4ecdc4',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BlockchainStatus;
