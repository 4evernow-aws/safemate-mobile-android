/**
 * SafeMate Enhanced FolderGrid Component
 * Modern grid layout with improved animations and interactions
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
  ScrollView,
} from 'react-native';

interface Folder {
  id: string;
  name: string;
  type: 'personal' | 'family' | 'business' | 'community';
  fileCount: number;
  lastModified: Date;
  isBlockchain: boolean;
  description?: string;
}

interface EnhancedFolderGridProps {
  folders: Folder[];
  onFolderPress: (folder: Folder) => void;
  onFolderLongPress?: (folder: Folder) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

const EnhancedFolderGrid: React.FC<EnhancedFolderGridProps> = ({ 
  folders, 
  onFolderPress,
  onFolderLongPress 
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const getFolderIcon = (type: string) => {
    switch (type) {
      case 'personal': return '👤';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'business': return '💼';
      case 'community': return '🌍';
      default: return '📁';
    }
  };

  const getFolderColor = (type: string) => {
    switch (type) {
      case 'personal': return '#3498db';
      case 'family': return '#e74c3c';
      case 'business': return '#f39c12';
      case 'community': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getFolderGradient = (type: string) => {
    switch (type) {
      case 'personal': return ['#3498db', '#2980b9'];
      case 'family': return ['#e74c3c', '#c0392b'];
      case 'business': return ['#f39c12', '#e67e22'];
      case 'community': return ['#27ae60', '#229954'];
      default: return ['#95a5a6', '#7f8c8d'];
    }
  };

  const formatFileCount = (count: number) => {
    if (count === 0) return 'Empty';
    if (count === 1) return '1 file';
    return `${count} files`;
  };

  const formatLastModified = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (folders.length === 0) {
    return (
      <Animated.View style={[
        styles.emptyContainer,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}>
        <Text style={styles.emptyIcon}>📁</Text>
        <Text style={[styles.emptyTitle, isDarkMode && styles.darkText]}>
          No Folders Yet
        </Text>
        <Text style={[styles.emptySubtitle, isDarkMode && styles.darkSubtext]}>
          Create your first folder to get started with SafeMate
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[
      styles.container,
      { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
    ]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>
          {folders.map((folder, index) => (
            <Animated.View
              key={folder.id}
              style={[
                styles.folderCard,
                isDarkMode && styles.darkFolderCard,
                { 
                  borderLeftColor: getFolderColor(folder.type),
                  transform: [{ 
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })
                  }]
                }
              ]}
            >
              <TouchableOpacity
                style={styles.folderTouchable}
                onPress={() => onFolderPress(folder)}
                onLongPress={() => onFolderLongPress?.(folder)}
                activeOpacity={0.7}
              >
                <View style={styles.folderHeader}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.folderIcon}>
                      {getFolderIcon(folder.type)}
                    </Text>
                    {folder.isBlockchain && (
                      <View style={styles.blockchainBadge}>
                        <Text style={styles.blockchainText}>⛓️</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.folderInfo}>
                    <Text 
                      style={[styles.folderName, isDarkMode && styles.darkText]}
                      numberOfLines={1}
                    >
                      {folder.name}
                    </Text>
                    
                    {folder.description && (
                      <Text 
                        style={[styles.folderDescription, isDarkMode && styles.darkSubtext]}
                        numberOfLines={2}
                      >
                        {folder.description}
                      </Text>
                    )}
                    
                    <View style={styles.folderStats}>
                      <Text style={[styles.fileCount, isDarkMode && styles.darkSubtext]}>
                        {formatFileCount(folder.fileCount)}
                      </Text>
                      <Text style={[styles.lastModified, isDarkMode && styles.darkSubtext]}>
                        {formatLastModified(folder.lastModified)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Progress bar for visual appeal */}
                <View style={[styles.progressBar, isDarkMode && styles.darkProgressBar]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        backgroundColor: getFolderColor(folder.type),
                        width: `${Math.min((folder.fileCount / 10) * 100, 100)}%`
                      }
                    ]} 
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  folderCard: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  darkFolderCard: {
    backgroundColor: '#34495e',
  },
  folderTouchable: {
    padding: 16,
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  folderIcon: {
    fontSize: 28,
  },
  blockchainBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#27ae60',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  blockchainText: {
    fontSize: 10,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  darkText: {
    color: '#ffffff',
  },
  folderDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
    lineHeight: 16,
  },
  darkSubtext: {
    color: '#bdc3c7',
  },
  folderStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileCount: {
    fontSize: 11,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  lastModified: {
    fontSize: 10,
    color: '#95a5a6',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#ecf0f1',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  darkProgressBar: {
    backgroundColor: '#2c3e50',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});

export default EnhancedFolderGrid;
