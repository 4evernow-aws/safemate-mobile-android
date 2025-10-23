<<<<<<< HEAD
/**
 * Metro configuration for SafeMate Android
 * React Native bundler configuration
 */

const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  server: {
    port: 8081,
  },
  resolver: {
    platforms: ['android', 'native', 'web'],
  },
};
=======
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};
>>>>>>> origin/master

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
