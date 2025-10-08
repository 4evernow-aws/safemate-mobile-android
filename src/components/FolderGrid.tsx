/**
 * SafeMate FolderGrid Component
 * Displays folders in a grid layout
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

interface Folder {
  id: string;
  name: string;
  type: 'personal' | 'family' | 'business' | 'community';
  fileCount: number;
  lastModified: Date;
  isBlockchain: boolean;
}

interface FolderGridProps {
  folders: Folder[];
  onFolderPress: (folder: Folder) => void;
}

const FolderGrid: React.FC<FolderGridProps> = ({ folders, onFolderPress }) => {
  const isDarkMode = useColorScheme() === 'dark';

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

  return (
    <View style={styles.container}>
      {folders.map((folder) => (
        <TouchableOpacity
          key={folder.id}
          style={[
            styles.folderCard,
            isDarkMode && styles.darkFolderCard,
            { borderLeftColor: getFolderColor(folder.type) }
          ]}
          onPress={() => onFolderPress(folder)}
        >
          <View style={styles.folderHeader}>
            <Text style={styles.folderIcon}>
              {getFolderIcon(folder.type)}
            </Text>
            {folder.isBlockchain && (
              <View style={styles.blockchainBadge}>
                <Text style={styles.blockchainText}>⛓️</Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.folderName, isDarkMode && styles.darkText]}>
            {folder.name}
          </Text>
          
          <Text style={[styles.fileCount, isDarkMode && styles.darkSubtext]}>
            {folder.fileCount} files
          </Text>
          
          <Text style={[styles.lastModified, isDarkMode && styles.darkSubtext]}>
            {folder.lastModified.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  folderCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkFolderCard: {
    backgroundColor: '#34495e',
  },
  folderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  folderIcon: {
    fontSize: 24,
  },
  blockchainBadge: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockchainText: {
    fontSize: 12,
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
  fileCount: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  darkSubtext: {
    color: '#bdc3c7',
  },
  lastModified: {
    fontSize: 10,
    color: '#95a5a6',
  },
});

export default FolderGrid;
