/**
 * SafeMate Android Dashboard Screen
 * Main dashboard for Android platform
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  FAB,
  IconButton,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';

type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

const DashboardScreen: React.FC<Props> = ({navigation}) => {
  const handleNavigateToWallet = () => {
    navigation.navigate('Wallet');
  };

  const handleNavigateToFiles = () => {
    navigation.navigate('Files');
  };

  const handleNavigateToSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Title style={styles.welcomeTitle}>Welcome to SafeMate</Title>
          <Paragraph style={styles.welcomeSubtitle}>
            Your secure blockchain file management platform
          </Paragraph>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity onPress={handleNavigateToWallet}>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <IconButton
                    icon="wallet"
                    size={24}
                    iconColor="#1976d2"
                  />
                  <Title style={styles.cardTitle}>Wallet</Title>
                </View>
                <Paragraph style={styles.cardDescription}>
                  Manage your blockchain wallet and HBAR balance
                </Paragraph>
              </Card.Content>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNavigateToFiles}>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <IconButton
                    icon="folder"
                    size={24}
                    iconColor="#4caf50"
                  />
                  <Title style={styles.cardTitle}>Files</Title>
                </View>
                <Paragraph style={styles.cardDescription}>
                  Secure file storage and management
                </Paragraph>
              </Card.Content>
            </Card>
          </TouchableOpacity>

          <Card style={styles.statsCard}>
            <Card.Content>
              <Title style={styles.statsTitle}>Quick Stats</Title>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Files</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>HBAR</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Folders</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.featuresCard}>
            <Card.Content>
              <Title style={styles.featuresTitle}>Recent Activity</Title>
              <Paragraph style={styles.noActivity}>
                No recent activity
              </Paragraph>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          // TODO: Implement quick action
        }}
      />
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
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  cardsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardDescription: {
    color: '#666',
    marginTop: 4,
  },
  statsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  featuresCard: {
    marginBottom: 16,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noActivity: {
    color: '#666',
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

export default DashboardScreen;
