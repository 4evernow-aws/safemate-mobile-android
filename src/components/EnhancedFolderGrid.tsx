import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Folder } from '../types';

interface EnhancedFolderGridProps {
  folders: Folder[];
  onFolderPress: (folder: Folder) => void;
}

const EnhancedFolderGrid: React.FC<EnhancedFolderGridProps> = ({
  folders,
  onFolderPress,
}) => {
  const getFolderIcon = (type: string) => {
    switch (type) {
      case 'personal': return '👤';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'business': return '💼';
      case 'community': return '🌍';
      default: return '📁';
    }
  };

  return (
    <View style={styles.container}>
      {folders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No folders yet</Text>
          <Text style={styles.emptySubtext}>Create your first folder to get started</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {folders.map((folder) => (
            <TouchableOpacity
              key={folder.id}
              style={styles.folderItem}
              onPress={() => onFolderPress(folder)}
            >
              <Text style={styles.folderIcon}>{getFolderIcon(folder.type)}</Text>
              <Text style={styles.folderName}>{folder.name}</Text>
              <Text style={styles.folderType}>{folder.type}</Text>
              {folder.isBlockchain && <Text style={styles.blockchainBadge}>⛓️</Text>}
              {folder.isEncrypted && <Text style={styles.encryptedBadge}>🔒</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  folderItem: {
    width: '48%',
    backgroundColor: '#333333',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative',
  },
  folderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  folderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  folderType: {
    fontSize: 12,
    color: '#cccccc',
    textAlign: 'center',
  },
  blockchainBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 16,
  },
  encryptedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
  },
});

export default EnhancedFolderGrid;