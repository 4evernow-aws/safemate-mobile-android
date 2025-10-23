/**
 * SafeMate SyncStatus Component
 * Displays blockchain synchronization status
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';

interface SyncStatusProps {
  status: 'online' | 'offline' | 'syncing';
}

const SyncStatus: React.FC<SyncStatusProps> = ({ status }) => {
  const isDarkMode = useColorScheme() === 'dark';

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: '🌐',
          text: 'Online - Synced',
          color: '#27ae60',
          showSpinner: false,
        };
      case 'syncing':
        return {
          icon: '🔄',
          text: 'Syncing with Blockchain',
          color: '#f39c12',
          showSpinner: true,
        };
      case 'offline':
        return {
          icon: '📱',
          text: 'Offline Mode',
          color: '#95a5a6',
          showSpinner: false,
        };
      default:
        return {
          icon: '❓',
          text: 'Unknown Status',
          color: '#e74c3c',
          showSpinner: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.content}>
        <View style={styles.statusRow}>
          <Text style={styles.statusIcon}>
            {config.icon}
          </Text>
          
          <View style={styles.statusInfo}>
            <Text style={[styles.statusText, isDarkMode && styles.darkText]}>
              {config.text}
            </Text>
            
            <Text style={[styles.statusSubtext, isDarkMode && styles.darkSubtext]}>
              {status === 'online' && 'All files synced with Hedera network'}
              {status === 'syncing' && 'Uploading changes to blockchain...'}
              {status === 'offline' && 'Working offline - changes will sync when online'}
            </Text>
          </View>
          
          {config.showSpinner && (
            <ActivityIndicator 
              size="small" 
              color={config.color}
              style={styles.spinner}
            />
          )}
        </View>
        
        {status === 'syncing' && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, isDarkMode && styles.darkProgressBar]}>
              <View 
                style={[
                  styles.progressFill, 
                  { backgroundColor: config.color, width: '65%' }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, isDarkMode && styles.darkSubtext]}>
              65% complete
            </Text>
          </View>
        )}
        
        {status === 'offline' && (
          <View style={styles.offlineInfo}>
            <Text style={[styles.offlineText, isDarkMode && styles.darkSubtext]}>
              💡 Your files are stored locally and will sync when you're back online
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  darkText: {
    color: '#ffffff',
  },
  statusSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  darkSubtext: {
    color: '#bdc3c7',
  },
  spinner: {
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  darkProgressBar: {
    backgroundColor: '#34495e',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  offlineInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  offlineText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default SyncStatus;
