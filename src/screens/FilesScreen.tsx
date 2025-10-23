/**
 * SafeMate Android Files Screen
 * File management screen for Android platform
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  List,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';

type FilesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Files'
>;

interface Props {
  navigation: FilesScreenNavigationProp;
}

interface FileItem {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
}

const FilesScreen: React.FC<Props> = ({navigation}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement file loading from local storage
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockFiles: FileItem[] = [
        {
          id: '1',
          name: 'document.pdf',
          size: '2.5 MB',
          type: 'PDF',
          date: '2025-01-22',
        },
        {
          id: '2',
          name: 'image.jpg',
          size: '1.2 MB',
          type: 'Image',
          date: '2025-01-21',
        },
      ];
      
      setFiles(mockFiles);
    } catch (error) {
      Alert.alert('Error', 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFile = () => {
    Alert.alert('Upload File', 'File upload feature coming soon');
  };

  const handleFilePress = (file: FileItem) => {
    setSelectedFile(selectedFile === file.id ? null : file.id);
  };

  const handleFileAction = (action: string, file: FileItem) => {
    Alert.alert(action, `${action} ${file.name}`);
  };

  const handleCreateFolder = () => {
    Alert.alert('Create Folder', 'Folder creation feature coming soon');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Files</Title>
        <Paragraph style={styles.subtitle}>
          Secure file storage and management
        </Paragraph>
      </View>

      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handleUploadFile}
          style={styles.actionButton}
          icon="upload">
          Upload File
        </Button>
        <Button
          mode="outlined"
          onPress={handleCreateFolder}
          style={styles.actionButton}
          icon="folder-plus">
          Create Folder
        </Button>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading files...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {files.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Title style={styles.emptyTitle}>No Files</Title>
                <Paragraph style={styles.emptyDescription}>
                  Upload your first file to get started
                </Paragraph>
                <Button
                  mode="contained"
                  onPress={handleUploadFile}
                  style={styles.uploadButton}>
                  Upload File
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <View style={styles.filesContainer}>
              {files.map((file) => (
                <Card key={file.id} style={styles.fileCard}>
                  <TouchableOpacity onPress={() => handleFilePress(file)}>
                    <List.Item
                      title={file.name}
                      description={`${file.size} • ${file.type} • ${file.date}`}
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon={
                            file.type === 'PDF'
                              ? 'file-pdf-box'
                              : file.type === 'Image'
                              ? 'file-image'
                              : 'file'
                          }
                        />
                      )}
                      right={(props) => (
                        <IconButton
                          {...props}
                          icon="dots-vertical"
                          onPress={() => handleFilePress(file)}
                        />
                      )}
                    />
                  </TouchableOpacity>

                  {selectedFile === file.id && (
                    <View style={styles.fileActions}>
                      <Button
                        mode="text"
                        onPress={() => handleFileAction('Download', file)}
                        icon="download">
                        Download
                      </Button>
                      <Button
                        mode="text"
                        onPress={() => handleFileAction('Share', file)}
                        icon="share">
                        Share
                      </Button>
                      <Button
                        mode="text"
                        onPress={() => handleFileAction('Delete', file)}
                        icon="delete"
                        textColor="red">
                        Delete
                      </Button>
                    </View>
                  )}
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleUploadFile}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  emptyCard: {
    margin: 20,
    elevation: 2,
  },
  emptyTitle: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  uploadButton: {
    alignSelf: 'center',
  },
  filesContainer: {
    padding: 20,
    paddingTop: 0,
  },
  fileCard: {
    marginBottom: 8,
    elevation: 1,
  },
  fileActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

export default FilesScreen;
