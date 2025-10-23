/**
 * SafeMate Android Login Screen
 * Authentication screen for Android platform
 */

import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement authentication logic
      // For now, simulate login
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to dashboard on successful login
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    // TODO: Implement registration flow
    Alert.alert('Registration', 'Registration feature coming soon');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>SafeMate</Title>
              <Paragraph style={styles.subtitle}>
                Secure Blockchain File Management
              </Paragraph>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  'Login'
                )}
              </Button>

              <Button
                mode="text"
                onPress={handleRegister}
                style={styles.registerButton}>
                Don't have an account? Register
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.featuresCard}>
            <Card.Content>
              <Title style={styles.featuresTitle}>Features</Title>
              <Paragraph>• 100% Local & Offline</Paragraph>
              <Paragraph>• Blockchain Integration</Paragraph>
              <Paragraph>• Biometric Security</Paragraph>
              <Paragraph>• Zero Cloud Dependencies</Paragraph>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    marginBottom: 20,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  registerButton: {
    marginTop: 8,
  },
  featuresCard: {
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
});

export default LoginScreen;
