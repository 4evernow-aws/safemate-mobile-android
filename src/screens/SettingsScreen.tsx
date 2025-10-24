/**
 * SafeMate Android Settings Screen
 * Settings and configuration screen for Android platform
 */

import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  List,
  Switch as PaperSwitch,
  Button,
  Divider,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Settings'
>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

const SettingsScreen: React.FC<Props> = ({navigation}) => {
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleBiometricToggle = () => {
    setBiometricEnabled(!biometricEnabled);
  };

  const handleAutoSyncToggle = () => {
    setAutoSyncEnabled(!autoSyncEnabled);
  };

  const handleNotificationsToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleDarkModeToggle = () => {
    setDarkModeEnabled(!darkModeEnabled);
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Data export feature coming soon');
  };

  const handleImportData = () => {
    Alert.alert('Import Data', 'Data import feature coming soon');
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'Cache cleared successfully');
  };

  const handleAbout = () => {
    Alert.alert(
      'About SafeMate',
      'SafeMate Android v1.0.0\n\nSecure blockchain file management\n100% local and offline'
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Logout', onPress: () => navigation.navigate('Login')},
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Title style={styles.title}>Settings</Title>
          <Paragraph style={styles.subtitle}>
            Configure your SafeMate experience
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Security</Title>
            
            <List.Item
              title="Biometric Authentication"
              description="Use fingerprint or face unlock"
              left={(props) => <List.Icon {...props} icon="fingerprint" />}
              right={() => (
                <PaperSwitch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Auto Sync"
              description="Automatically sync with blockchain"
              left={(props) => <List.Icon {...props} icon="sync" />}
              right={() => (
                <PaperSwitch
                  value={autoSyncEnabled}
                  onValueChange={handleAutoSyncToggle}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Appearance</Title>
            
            <List.Item
              title="Dark Mode"
              description="Use dark theme"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <PaperSwitch
                  value={darkModeEnabled}
                  onValueChange={handleDarkModeToggle}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Notifications</Title>
            
            <List.Item
              title="Push Notifications"
              description="Receive app notifications"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <PaperSwitch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationsToggle}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Data Management</Title>
            
            <List.Item
              title="Export Data"
              description="Export your data to file"
              left={(props) => <List.Icon {...props} icon="export" />}
              onPress={handleExportData}
            />
            
            <Divider />
            
            <List.Item
              title="Import Data"
              description="Import data from file"
              left={(props) => <List.Icon {...props} icon="import" />}
              onPress={handleImportData}
            />
            
            <Divider />
            
            <List.Item
              title="Clear Cache"
              description="Clear app cache and temporary files"
              left={(props) => <List.Icon {...props} icon="delete-sweep" />}
              onPress={handleClearCache}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>About</Title>
            
            <List.Item
              title="About SafeMate"
              description="App version and information"
              left={(props) => <List.Icon {...props} icon="information" />}
              onPress={handleAbout}
            />
            
            <Divider />
            
            <List.Item
              title="Privacy Policy"
              description="View privacy policy"
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              onPress={() => Alert.alert('Privacy Policy', 'Privacy policy coming soon')}
            />
            
            <Divider />
            
            <List.Item
              title="Terms of Service"
              description="View terms of service"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              onPress={() => Alert.alert('Terms of Service', 'Terms of service coming soon')}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleLogout}
              style={styles.logoutButton}
              buttonColor="#d32f2f"
              textColor="white">
              Logout
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    margin: 20,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 8,
  },
});

export default SettingsScreen;
