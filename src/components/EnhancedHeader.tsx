/**
 * SafeMate Enhanced Header Component
 * Modern header with improved design and animations
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Animated,
  Dimensions,
} from 'react-native';

interface EnhancedHeaderProps {
  title: string;
  subtitle: string;
  onMenuPress: () => void;
  onSearchPress?: () => void;
  showSearch?: boolean;
}

const { width } = Dimensions.get('window');

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({ 
  title, 
  subtitle, 
  onMenuPress, 
  onSearchPress,
  showSearch = true 
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[
      styles.container, 
      isDarkMode && styles.darkContainer,
      { opacity: fadeAnim }
    ]}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🛡️</Text>
            <View style={styles.titleTextContainer}>
              <Text style={[styles.title, isDarkMode && styles.darkText]}>
                {title}
              </Text>
              <Text style={[styles.subtitle, isDarkMode && styles.darkSubtext]}>
                {subtitle}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          {showSearch && (
            <TouchableOpacity 
              style={[styles.actionButton, isDarkMode && styles.darkActionButton]}
              onPress={onSearchPress}
            >
              <Text style={[styles.actionIcon, isDarkMode && styles.darkText]}>🔍</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.actionButton, isDarkMode && styles.darkActionButton]}
            onPress={onMenuPress}
          >
            <Text style={[styles.actionIcon, isDarkMode && styles.darkText]}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Gradient overlay for modern look */}
      <View style={[styles.gradientOverlay, isDarkMode && styles.darkGradientOverlay]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingTop: 8,
    paddingBottom: 16,
    position: 'relative',
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
    zIndex: 2,
  },
  titleContainer: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  titleTextContainer: {
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
    fontWeight: '500',
  },
  darkSubtext: {
    color: '#bdc3c7',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkActionButton: {
    backgroundColor: '#34495e',
  },
  actionIcon: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  darkGradientOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default EnhancedHeader;
