/**
 * Create Folder Modal Component
 * Allows users to create parent folders or subfolders
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  useColorScheme,
  Alert,
} from 'react-native';

interface CreateFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateFolder: (folderData: {
    name: string;
    type: 'parent' | 'subfolder';
    parentId?: string;
    description?: string;
  }) => void;
  parentFolders?: Array<{
    id: string;
    name: string;
  }>;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  visible,
  onClose,
  onCreateFolder,
  parentFolders = [],
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [folderName, setFolderName] = useState('');
  const [folderType, setFolderType] = useState<'parent' | 'subfolder'>('parent');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!folderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    if (folderType === 'subfolder' && !selectedParentId) {
      Alert.alert('Error', 'Please select a parent folder for the subfolder');
      return;
    }

    onCreateFolder({
      name: folderName.trim(),
      type: folderType,
      parentId: folderType === 'subfolder' ? selectedParentId : undefined,
      description: description.trim() || undefined,
    });

    // Reset form
    setFolderName('');
    setDescription('');
    setFolderType('parent');
    setSelectedParentId('');
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setFolderName('');
    setDescription('');
    setFolderType('parent');
    setSelectedParentId('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
          <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
            Create New Folder
          </Text>

          {/* Folder Type Selection */}
          <View style={styles.typeSelection}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>
              Folder Type:
            </Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  folderType === 'parent' && styles.selectedTypeButton,
                  isDarkMode && styles.darkTypeButton,
                ]}
                onPress={() => setFolderType('parent')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    folderType === 'parent' && styles.selectedTypeButtonText,
                    isDarkMode && styles.darkText,
                  ]}
                >
                  📁 Parent Folder
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  folderType === 'subfolder' && styles.selectedTypeButton,
                  isDarkMode && styles.darkTypeButton,
                ]}
                onPress={() => setFolderType('subfolder')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    folderType === 'subfolder' && styles.selectedTypeButtonText,
                    isDarkMode && styles.darkText,
                  ]}
                >
                  📂 Subfolder
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Parent Folder Selection (only for subfolders) */}
          {folderType === 'subfolder' && parentFolders.length > 0 && (
            <View style={styles.parentSelection}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>
                Parent Folder:
              </Text>
              <View style={styles.parentList}>
                {parentFolders.map((parent) => (
                  <TouchableOpacity
                    key={parent.id}
                    style={[
                      styles.parentItem,
                      selectedParentId === parent.id && styles.selectedParentItem,
                      isDarkMode && styles.darkParentItem,
                    ]}
                    onPress={() => setSelectedParentId(parent.id)}
                  >
                    <Text
                      style={[
                        styles.parentItemText,
                        selectedParentId === parent.id && styles.selectedParentItemText,
                        isDarkMode && styles.darkText,
                      ]}
                    >
                      📁 {parent.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Folder Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>
              Folder Name:
            </Text>
            <TextInput
              style={[
                styles.textInput,
                isDarkMode && styles.darkTextInput,
              ]}
              value={folderName}
              onChangeText={setFolderName}
              placeholder="Enter folder name"
              placeholderTextColor={isDarkMode ? '#bdc3c7' : '#7f8c8d'}
              maxLength={50}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>
              Description (Optional):
            </Text>
            <TextInput
              style={[
                styles.textInput,
                styles.descriptionInput,
                isDarkMode && styles.darkTextInput,
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter folder description"
              placeholderTextColor={isDarkMode ? '#bdc3c7' : '#7f8c8d'}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, isDarkMode && styles.darkCancelButton]}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={handleCreate}
            >
              <Text style={[styles.buttonText, styles.createButtonText]}>
                Create Folder
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  darkModalContent: {
    backgroundColor: '#2c3e50',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  darkText: {
    color: '#ffffff',
  },
  typeSelection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ecf0f1',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  darkTypeButton: {
    backgroundColor: '#34495e',
    borderColor: '#4a5f7a',
  },
  selectedTypeButton: {
    borderColor: '#3498db',
    backgroundColor: '#e3f2fd',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  parentSelection: {
    marginBottom: 20,
  },
  parentList: {
    maxHeight: 120,
  },
  parentItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  darkParentItem: {
    backgroundColor: '#34495e',
    borderColor: '#4a5f7a',
  },
  selectedParentItem: {
    borderColor: '#3498db',
    backgroundColor: '#e3f2fd',
  },
  parentItemText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  selectedParentItemText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#ffffff',
  },
  darkTextInput: {
    backgroundColor: '#34495e',
    borderColor: '#4a5f7a',
    color: '#ffffff',
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  darkCancelButton: {
    backgroundColor: '#34495e',
    borderColor: '#4a5f7a',
  },
  createButton: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#2c3e50',
  },
  createButtonText: {
    color: '#ffffff',
  },
});

export default CreateFolderModal;
