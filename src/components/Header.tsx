/**
 * SafeMate Header Component
 * Displays app branding and navigation
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

interface HeaderProps {
  title: string;
  subtitle: string;
  onMenuPress: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onMenuPress }) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
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
          onPress={onMenuPress}
        >
          <Text style={[styles.menuIcon, isDarkMode && styles.darkText]}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
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
});

export default Header;
