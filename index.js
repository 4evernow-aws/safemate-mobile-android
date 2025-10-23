/**
 * SafeMate Android Mobile Application
 * Entry point for React Native Android app
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './package.json';

AppRegistry.registerComponent('SafeMateAndroid', () => App);
