import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface EnhancedHeaderProps {
  title: string;
  subtitle: string;
  walletConnected: boolean;
  syncStatus: 'online' | 'offline' | 'syncing';
  onMenuPress: () => void;
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  title,
  subtitle,
  walletConnected,
  syncStatus,
  onMenuPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
          <Text style={styles.menuText}>☰</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Wallet: {walletConnected ? '✅ Connected' : '❌ Disconnected'}
        </Text>
        <Text style={styles.statusText}>
          Sync: {syncStatus === 'online' ? '🟢 Online' : syncStatus === 'syncing' ? '🟡 Syncing' : '🔴 Offline'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  subtitle: {
    fontSize: 14,
    color: '#cccccc',
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  menuText: {
    fontSize: 20,
    color: '#ffffff',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
  },
});

export default EnhancedHeader;