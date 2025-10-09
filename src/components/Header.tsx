/**
 * SafeMate Header Component
 * Displays app branding and navigation with settings menu
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Modal,
  Alert,
} from 'react-native';

interface HeaderProps {
  title: string;
  subtitle: string;
  onSignOut: () => void;
  onDeleteAccount: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onSignOut, onDeleteAccount }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [showSettings, setShowSettings] = useState(false);

  const handleSettingsPress = () => {
    setShowSettings(true);
  };

  const handleSignOut = () => {
    setShowSettings(false);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: onSignOut, style: 'destructive' }
      ]
    );
  };

  const handleDeleteAccount = () => {
    setShowSettings(false);
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: onDeleteAccount, style: 'destructive' }
      ]
    );
  };

  return (
    <>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, isDarkMode && styles.darkText]}>
              {title}
            </Text>
            <Text style={[styles.subtitle, isDarkMode && styles.darkSubtext]}>
              {subtitle}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.menuButton, isDarkMode && styles.darkMenuButton]}
            onPress={handleSettingsPress}
          >
            <Text style={[styles.menuIcon, isDarkMode && styles.darkText]}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSettings(false)}
        >
          <View style={[styles.settingsMenu, isDarkMode && styles.darkSettingsMenu]}>
            <TouchableOpacity 
              style={[styles.settingsItem, isDarkMode && styles.darkSettingsItem]}
              onPress={handleSignOut}
            >
              <Text style={[styles.settingsItemText, isDarkMode && styles.darkText]}>
                Sign Out
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingsItem, styles.dangerItem, isDarkMode && styles.darkSettingsItem]}
              onPress={handleDeleteAccount}
            >
              <Text style={[styles.settingsItemText, styles.dangerText]}>
                Delete Account
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingsItem, styles.cancelItem, isDarkMode && styles.darkSettingsItem]}
              onPress={() => setShowSettings(false)}
            >
              <Text style={[styles.settingsItemText, isDarkMode && styles.darkText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingTop: 8,
    paddingBottom: 16,
  },
  darkContainer: {
    backgroundColor: '#2c3e50',
    borderBottomColor: '#34495e',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  darkText: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  darkSubtext: {
    color: '#bdc3c7',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  darkMenuButton: {
    backgroundColor: '#34495e',
  },
  menuIcon: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkSettingsMenu: {
    backgroundColor: '#2c3e50',
  },
  settingsItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#f8f9fa',
  },
  darkSettingsItem: {
    backgroundColor: '#34495e',
  },
  dangerItem: {
    backgroundColor: '#ffeaea',
  },
  cancelItem: {
    backgroundColor: '#e8f4fd',
    marginTop: 6,
  },
  settingsItemText: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
    fontWeight: '500',
  },
  dangerText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
});

export default Header;
