# Cursor + Android Studio Integration Guide

## 🚀 Quick Start

### 1. Development Environment
- **Cursor**: Primary IDE for React Native development
- **Android Studio**: For Android-specific debugging and emulator management
- **Terminal**: For React Native CLI commands

### 2. Project Structure
```
SafeMateAndroid/
├── android/                 # Android Studio project
├── ios/                     # iOS project (if needed)
├── src/                     # React Native source code
├── App.tsx                  # Main app component
└── package.json            # Dependencies
```

### 3. Development Commands

#### Start Metro Bundler
```bash
npx react-native start
```

#### Run on Android
```bash
npx react-native run-android
```

#### Run on Android Emulator
```bash
npx react-native run-android --variant=debug
```

#### Debug Commands
```bash
# Open Android Studio
npx react-native run-android --variant=debug

# Open Chrome DevTools
npx react-native start --reset-cache
```

### 4. Cursor Configuration

#### VS Code Settings (Cursor uses same config)
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "typescriptreact"
  },
  "react-native-tools.showUserTips": false,
  "react-native-tools.projectRoot": "./",
  "react-native-tools.androidProjectPath": "./android"
}
```

#### Launch Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Android",
      "cwd": "${workspaceFolder}",
      "type": "reactnative",
      "request": "launch",
      "platform": "android"
    },
    {
      "name": "Attach to packager",
      "cwd": "${workspaceFolder}",
      "type": "reactnative",
      "request": "attach"
    }
  ]
}
```

### 5. Android Studio Integration

#### Open Android Project
1. Open Android Studio
2. File > Open
3. Navigate to `D:\SafeMateAndroid\SafeMateAndroid\android`
4. Click "OK"

#### Configure Emulator
1. Tools > AVD Manager
2. Create Virtual Device
3. Choose Pixel 6 (or similar)
4. Select Android 13/14
5. Start emulator

### 6. Development Workflow

#### Daily Development
1. **Start Cursor**: Open the project
2. **Start Metro**: `npx react-native start`
3. **Start Android Studio**: Open android folder
4. **Run Emulator**: From Android Studio AVD Manager
5. **Run App**: `npx react-native run-android`

#### Debugging
- **React Native**: Use Cursor debugger
- **Android Native**: Use Android Studio debugger
- **Network**: Use Chrome DevTools
- **Performance**: Use Flipper

### 7. Useful Commands

```bash
# Clean and rebuild
npx react-native run-android --reset-cache

# Install new dependencies
npm install package-name

# Link native dependencies
npx react-native link

# Generate Android APK
cd android && ./gradlew assembleRelease
```

### 8. Troubleshooting

#### Common Issues
- **Metro bundler issues**: `npx react-native start --reset-cache`
- **Android build issues**: Clean Android Studio project
- **Emulator issues**: Restart emulator from Android Studio
- **Dependencies issues**: Delete node_modules and reinstall

#### Performance Tips
- Use Android Studio for native debugging
- Use Cursor for React Native development
- Keep both tools open for full-stack debugging
- Use Chrome DevTools for network debugging

## 🎯 Best Practices

1. **Code in Cursor**: Primary development environment
2. **Debug in Android Studio**: For native Android issues
3. **Test on Real Device**: For performance testing
4. **Use Emulator**: For development and testing
5. **Version Control**: Git integration in Cursor
6. **Hot Reload**: Enable for faster development

## 📱 Mobile Development Features

- **Local-First Architecture**: SQLite + Keychain/Keystore
- **Direct Hedera SDK**: No API Gateway needed
- **Platform Security**: Android Keystore integration
- **Offline Capability**: Full offline functionality
- **Real-time Sync**: When online, sync with blockchain
