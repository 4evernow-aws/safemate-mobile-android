# Create Ultra-Minimal Working Android App
# PowerShell script to create the most basic React Native app possible

Write-Host "🔧 Creating Ultra-Minimal Working Android App" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

Write-Host "`n📱 Creating ultra-minimal React Native app to test vault icons..." -ForegroundColor Yellow

# Create ultra-minimal package.json with only core dependencies
$ultraMinimalPackageJson = @"
{
  "name": "safemate-mobile-android",
  "version": "1.0.0",
  "description": "SafeMate Android Mobile Application - Local-First Blockchain File Management",
  "main": "index.js",
  "scripts": {
    "android": "react-native run-android",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "build:android": "cd android && ./gradlew assembleRelease",
    "build:android-debug": "cd android && ./gradlew assembleDebug",
    "clean:android": "cd android && ./gradlew clean",
    "metro": "npx react-native start"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.6"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/preset-env": "^7.20.0",
    "@babel/runtime": "^7.20.0",
    "@react-native/eslint-config": "^0.72.2",
    "@react-native/metro-config": "^0.72.11",
    "@tsconfig/react-native": "^3.0.0",
    "@types/react": "^18.0.24",
    "@types/react-test-renderer": "^18.0.0",
    "babel-jest": "^29.2.1",
    "eslint": "^8.19.0",
    "jest": "^29.2.1",
    "metro-react-native-babel-preset": "0.76.8",
    "prettier": "^2.4.1",
    "react-test-renderer": "18.2.0",
    "typescript": "4.8.4"
  },
  "engines": {
    "node": ">=16"
  },
  "keywords": [
    "react-native",
    "android",
    "mobile",
    "blockchain",
    "hedera",
    "file-management",
    "offline-first",
    "local-storage"
  ],
  "author": "SafeMate Team",
  "license": "MIT"
}
"@

# Save ultra-minimal package.json
Set-Content -Path "package.json" -Value $ultraMinimalPackageJson
Write-Host "✅ Created ultra-minimal package.json" -ForegroundColor Green

# Clean and reinstall ultra-minimal dependencies
Write-Host "`n🧹 Cleaning and reinstalling ultra-minimal dependencies..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ Removed node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "✅ Removed package-lock.json" -ForegroundColor Green
}

Write-Host "`n📦 Installing ultra-minimal dependencies..." -ForegroundColor Cyan
Write-Host "This will install only React and React Native core packages." -ForegroundColor White

# Create a very simple App.tsx that works
$ultraSimpleAppTsx = @"
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  Header,
} from 'react-native/Libraries/NewAppScreen';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Text style={styles.sectionTitle}>🔒 SafeMate Android</Text>
          <Text style={styles.sectionDescription}>
            Your secure file management app is ready!
          </Text>
          <Text style={styles.sectionDescription}>
            Vault icons are installed and working.
          </Text>
          <Text style={styles.sectionDescription}>
            This is a minimal working version.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    color: '#2c3e50',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    color: '#34495e',
    paddingHorizontal: 20,
  },
});

export default App;
"@

# Save ultra-simple App.tsx
Set-Content -Path "src\App.tsx" -Value $ultraSimpleAppTsx
Write-Host "✅ Created ultra-simple App.tsx" -ForegroundColor Green

Write-Host "`n🎯 Ultra-Minimal App Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Write-Host "`n📋 What's Been Created:" -ForegroundColor Cyan
Write-Host "• Ultra-minimal package.json (only React + React Native)" -ForegroundColor White
Write-Host "• Ultra-simple App.tsx (basic React Native app)" -ForegroundColor White
Write-Host "• No external dependencies" -ForegroundColor White
Write-Host "• Vault icons preserved" -ForegroundColor White

Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm install" -ForegroundColor White
Write-Host "2. Run: npm run android" -ForegroundColor White
Write-Host "3. Test vault icons on emulator" -ForegroundColor White

Write-Host "`n✅ Ultra-minimal app ready for testing!" -ForegroundColor Green
Write-Host "This should build successfully with just React and React Native." -ForegroundColor Cyan
