import { Alert } from 'react-native';

export interface AccountOptionsHandlers {
  onSignOut?: () => void;
  onDeleteAccount?: () => void;
  onCloseApp?: () => void;
}

export function showAccountOptions(handlers: AccountOptionsHandlers = {}): void {
  const actions: Array<{ text: string; onPress?: () => void; style?: 'cancel' | 'destructive' | 'default' }> = [
    { text: 'Close', style: 'cancel' },
  ];

  if (handlers.onSignOut) {
    actions.push({ text: 'Sign Out', onPress: handlers.onSignOut });
  }

  if (handlers.onDeleteAccount) {
    actions.push({
      text: 'Delete Account',
      style: 'destructive',
      onPress: handlers.onDeleteAccount,
    });
  }

  if (handlers.onCloseApp) {
    actions.push({ text: 'Close App', onPress: handlers.onCloseApp });
  }

  Alert.alert('Account Options', 'Choose an action', actions);
}
