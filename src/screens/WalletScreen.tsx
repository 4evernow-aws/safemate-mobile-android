/**
 * SafeMate Android Wallet Screen
 * Wallet management screen for Android platform
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';

type WalletScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Wallet'
>;

interface Props {
  navigation: WalletScreenNavigationProp;
}

const WalletScreen: React.FC<Props> = ({navigation}) => {
  const [balance, setBalance] = useState('0.00000000');
  const [accountId, setAccountId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [recipientId, setRecipientId] = useState('');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement wallet data loading
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAccountId('0.0.1234567');
      setBalance('10.50000000');
    } catch (error) {
      Alert.alert('Error', 'Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendHBAR = () => {
    if (!sendAmount || !recipientId) {
      Alert.alert('Error', 'Please enter amount and recipient ID');
      return;
    }
    Alert.alert('Send HBAR', `Send ${sendAmount} HBAR to ${recipientId}`);
  };

  const handleReceiveHBAR = () => {
    Alert.alert('Receive HBAR', `Your account ID: ${accountId}`);
  };

  const handleRefresh = () => {
    loadWalletData();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Title style={styles.title}>Wallet</Title>
          <Paragraph style={styles.subtitle}>
            Manage your HBAR balance and transactions
          </Paragraph>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Loading wallet data...</Text>
          </View>
        ) : (
          <>
            <Card style={styles.balanceCard}>
              <Card.Content>
                <Title style={styles.balanceTitle}>HBAR Balance</Title>
                <Text style={styles.balanceAmount}>{balance} HBAR</Text>
                <Text style={styles.accountId}>Account: {accountId}</Text>
              </Card.Content>
            </Card>

            <Card style={styles.actionsCard}>
              <Card.Content>
                <Title style={styles.actionsTitle}>Quick Actions</Title>
                
                <Button
                  mode="contained"
                  onPress={handleSendHBAR}
                  style={styles.actionButton}
                  icon="send">
                  Send HBAR
                </Button>

                <Button
                  mode="outlined"
                  onPress={handleReceiveHBAR}
                  style={styles.actionButton}
                  icon="download">
                  Receive HBAR
                </Button>

                <Button
                  mode="text"
                  onPress={handleRefresh}
                  style={styles.actionButton}
                  icon="refresh">
                  Refresh Balance
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.sendCard}>
              <Card.Content>
                <Title style={styles.sendTitle}>Send HBAR</Title>
                
                <TextInput
                  label="Amount (HBAR)"
                  value={sendAmount}
                  onChangeText={setSendAmount}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />

                <TextInput
                  label="Recipient Account ID"
                  value={recipientId}
                  onChangeText={setRecipientId}
                  mode="outlined"
                  style={styles.input}
                />

                <Button
                  mode="contained"
                  onPress={handleSendHBAR}
                  style={styles.sendButton}
                  disabled={!sendAmount || !recipientId}>
                  Send Transaction
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.transactionsCard}>
              <Card.Content>
                <Title style={styles.transactionsTitle}>Recent Transactions</Title>
                <Paragraph style={styles.noTransactions}>
                  No recent transactions
                </Paragraph>
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
  balanceCard: {
    margin: 20,
    marginBottom: 16,
    elevation: 4,
    backgroundColor: '#1976d2',
  },
  balanceTitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 8,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  accountId: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  actionsCard: {
    margin: 20,
    marginBottom: 16,
    elevation: 2,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  sendCard: {
    margin: 20,
    marginBottom: 16,
    elevation: 2,
  },
  sendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  sendButton: {
    marginTop: 8,
  },
  transactionsCard: {
    margin: 20,
    marginBottom: 16,
    elevation: 2,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noTransactions: {
    color: '#666',
    fontStyle: 'italic',
  },
});

export default WalletScreen;
