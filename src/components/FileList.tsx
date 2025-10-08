/**
 * SafeMate FileList Component
 * Displays files in a list view
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
} from 'react-native';

interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  isBlockchain: boolean;
}

interface Folder {
  id: string;
  name: string;
  type: 'personal' | 'family' | 'business' | 'community';
  fileCount: number;
  lastModified: Date;
  isBlockchain: boolean;
}

interface FileListProps {
  files: File[];
  folder: Folder | null;
  onFilePress: (file: File) => void;
}

const FileList: React.FC<FileListProps> = ({ files, folder, onFilePress }) => {
  const isDarkMode = useColorScheme() === 'dark';

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('text')) return '📝';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFile = ({ item }: { item: File }) => (
    <TouchableOpacity
      style={[styles.fileItem, isDarkMode && styles.darkFileItem]}
      onPress={() => onFilePress(item)}
    >
      <View style={styles.fileHeader}>
        <Text style={styles.fileIcon}>
          {getFileIcon(item.type)}
        </Text>
        <View style={styles.fileInfo}>
          <Text style={[styles.fileName, isDarkMode && styles.darkText]}>
            {item.name}
          </Text>
          <Text style={[styles.fileDetails, isDarkMode && styles.darkSubtext]}>
            {formatFileSize(item.size)} • {item.uploadedAt.toLocaleDateString()}
          </Text>
        </View>
        {item.isBlockchain && (
          <View style={styles.blockchainBadge}>
            <Text style={styles.blockchainText}>⛓️</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyIcon]}>📁</Text>
      <Text style={[styles.emptyTitle, isDarkMode && styles.darkText]}>
        No files yet
      </Text>
      <Text style={[styles.emptySubtitle, isDarkMode && styles.darkSubtext]}>
        Upload files to this folder to get started
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {files.length > 0 ? (
        <FlatList
          data={files}
          renderItem={renderFile}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fileItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  darkFileItem: {
    backgroundColor: '#34495e',
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  darkText: {
    color: '#ffffff',
  },
  fileDetails: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  darkSubtext: {
    color: '#bdc3c7',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default FileList;
