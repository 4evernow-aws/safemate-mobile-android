import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { File, Folder } from '../types';

interface FileListProps {
  files: File[];
  folder: Folder;
  onFilePress: (file: File) => void;
}

const FileList: React.FC<FileListProps> = ({
  files,
  folder,
  onFilePress,
}) => {
  const getFileIcon = (type: string) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('text')) return '📝';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View style={styles.container}>
      {files.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No files in this folder</Text>
          <Text style={styles.emptySubtext}>Upload files to get started</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {files.map((file) => (
            <TouchableOpacity
              key={file.id}
              style={styles.fileItem}
              onPress={() => onFilePress(file)}
            >
              <Text style={styles.fileIcon}>{getFileIcon(file.type)}</Text>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{file.originalName}</Text>
                <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
              </View>
              <View style={styles.badges}>
                {file.isBlockchain && <Text style={styles.badge}>⛓️</Text>}
                {file.isEncrypted && <Text style={styles.badge}>🔒</Text>}
              </View>
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
  list: {
    flex: 1,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
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
    color: '#ffffff',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#cccccc',
  },
  badges: {
    flexDirection: 'row',
  },
  badge: {
    fontSize: 16,
    marginLeft: 4,
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

export default FileList;