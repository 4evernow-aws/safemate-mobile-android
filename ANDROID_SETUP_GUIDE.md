# 🚀 SafeMate Android Setup Guide

## Quick Start

### Option 1: Use the Automated Script (Recommended)
```powershell
# Run this in PowerShell from the project directory
.\run-android.ps1
```

### Option 2: Manual Setup

## Prerequisites ✅
- ✅ Android Studio installed
- ✅ Android SDK installed
- ✅ Node.js and npm installed
- ✅ React Native CLI installed

## Step-by-Step Setup

### 1. Create Android Emulator
1. Open **Android Studio**
2. Go to **Tools → AVD Manager**
3. Click **Create Virtual Device**
4. Choose **Pixel 6** or **Pixel 7**
5. Select **Android 13** (API 33) or **Android 14** (API 34)
6. Download system image if needed
7. Name it "SafeMate_Emulator"
8. Click **Finish**

### 2. Start the Emulator
1. Click the **▶️ Play button** next to your emulator
2. Wait for it to boot (2-3 minutes first time)

### 3. Run the App
```bash
# Make sure Metro is running (should already be running)
npm start

# In a new terminal, run:
npx react-native run-android
```

## Troubleshooting

### ADB Not Found
```powershell
# Add Android SDK to PATH
$env:PATH += ";C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\platform-tools"
```

### No Devices Found
- Make sure emulator is running
- Check: `adb devices`
- Restart ADB: `adb kill-server && adb start-server`

### Build Errors
```bash
# Clean and rebuild
npx react-native run-android --reset-cache
```

### Metro Issues
```bash
# Reset Metro cache
npx react-native start --reset-cache
```

## App Features 🎉

### Enhanced UI Components
- ✅ Modern header with animations
- ✅ Improved folder grid with progress bars
- ✅ Dark mode support
- ✅ Smooth animations and transitions

### Security Features
- ✅ Advanced password validation
- ✅ Login attempt tracking
- ✅ Account lockout protection
- ✅ Session token management
- ✅ Security audit logging

### Blockchain Integration
- ✅ Hedera Hashgraph SDK
- ✅ Self-funded wallet creation
- ✅ File storage on blockchain
- ✅ NFT folder creation

### Testing & Development
- ✅ Comprehensive test suite
- ✅ Testing utilities
- ✅ Debug configurations
- ✅ Performance monitoring

## Development Commands

```bash
# Start Metro bundler
npm start

# Run on Android
npx react-native run-android

# Run tests
npm test

# Lint code
npm run lint

# Clean build
npx react-native run-android --reset-cache
```

## Project Structure
```
safemate-mobile-android/
├── src/
│   ├── components/          # React Native components
│   │   ├── EnhancedHeader.tsx
│   │   ├── EnhancedFolderGrid.tsx
│   │   └── ...
│   ├── services/           # Business logic
│   │   ├── SecurityService.ts
│   │   ├── CryptoService.ts
│   │   └── blockchain/
│   ├── database/           # SQLite database
│   └── utils/              # Utility functions
├── android/                # Android native code
├── __tests__/              # Test files
└── .vscode/                # VS Code configuration
```

## Next Steps

1. **Run the app** using the script or manual steps
2. **Test the features**:
   - Create an account
   - Create folders
   - Test blockchain integration
   - Try dark mode
3. **Customize** the app for your needs
4. **Deploy** to Google Play Store when ready

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console logs
3. Check Android Studio for build errors
4. Ensure all prerequisites are installed

Happy coding! 🎉
