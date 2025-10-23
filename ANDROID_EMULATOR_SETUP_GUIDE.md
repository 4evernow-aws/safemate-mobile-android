# Android Emulator Setup Guide

## 🎯 **Current Status**
- ✅ **ANDROID_HOME**: Fixed and configured
- ✅ **ADB**: Working properly
- ✅ **Android Studio**: Found and ready
- ❌ **Android Emulator**: Needs to be created
- ❌ **Android SDK**: Needs API 33 installation

---

## 📱 **Step-by-Step Android Emulator Setup**

### **Step 1: Open Android Studio**
1. Open Android Studio from: `C:\Program Files\Android\Android Studio\bin\studio64.exe`
2. Wait for Android Studio to fully load

### **Step 2: Open AVD Manager**
1. In Android Studio, go to **Tools** → **AVD Manager**
2. Or click **More Actions** → **Virtual Device Manager**
3. This will open the Android Virtual Device Manager

### **Step 3: Create New Virtual Device**
1. Click **"Create Device"** button
2. Select **"Phone"** category
3. Choose **"Pixel 4"** (or any modern device)
4. Click **"Next"**

### **Step 4: Download Android API 33**
1. In the **System Image** screen:
   - Look for **"API 33"** (Android 13)
   - If not downloaded, click **"Download"** next to it
   - Wait for download to complete (this may take 10-15 minutes)
2. Select **"API 33"** system image
3. Click **"Next"**

### **Step 5: Configure Virtual Device**
1. **AVD Name**: `SafeMate_Emulator`
2. **Startup Orientation**: Portrait
3. **Advanced Settings**:
   - **RAM**: 4 GB (recommended)
   - **Internal Storage**: 8 GB
   - **SD Card**: 2 GB
4. Click **"Finish"**

### **Step 6: Start the Emulator**
1. In AVD Manager, find your new emulator
2. Click the **"Play"** button (▶️) to start it
3. Wait for the emulator to boot (2-3 minutes first time)

---

## 🔧 **Alternative: Command Line Setup**

If you prefer command line, you can also create the emulator using:

```bash
# List available system images
sdkmanager --list | findstr "system-images"

# Install Android API 33 system image
sdkmanager "system-images;android-33;google_apis;x86_64"

# Create AVD
avdmanager create avd -n SafeMate_Emulator -k "system-images;android-33;google_apis;x86_64"
```

---

## 🚀 **Testing the Setup**

### **Step 1: Verify Emulator is Running**
```bash
# Check if emulator is detected
adb devices
```
You should see something like:
```
List of devices attached
emulator-5554   device
```

### **Step 2: Test React Native App**
```bash
# Start Metro bundler (in one terminal)
npm start

# Run Android app (in another terminal)
npm run android
```

---

## 🐛 **Troubleshooting Common Issues**

### **Issue 1: "No devices found"**
**Solution**: Make sure emulator is running and visible in `adb devices`

### **Issue 2: "Android SDK not found"**
**Solution**: 
1. Restart your terminal
2. Run the fix script again: `.\fix-android-environment.ps1`

### **Issue 3: "Build failed"**
**Solution**:
1. Clean the project: `npm run clean:android`
2. Rebuild: `npm run android`

### **Issue 4: "Metro bundler not starting"**
**Solution**:
1. Clear Metro cache: `npx react-native start --reset-cache`
2. Restart Metro: `npm start`

---

## 📋 **Quick Checklist**

- [ ] Android Studio installed
- - [ ] Android SDK API 33 downloaded
- - [ ] Virtual Device created
- - [ ] Emulator running
- - [ ] ADB detecting device
- - [ ] Metro bundler running
- - [ ] App building successfully

---

## 🎯 **Next Steps After Emulator Setup**

1. **Start the emulator** (if not already running)
2. **Open a new terminal** in the project directory
3. **Start Metro bundler**: `npm start`
4. **In another terminal, run**: `npm run android`
5. **Watch the app install and launch** on the emulator

---

## 📱 **Expected Result**

After successful setup, you should see:
- Android emulator running with a virtual device
- SafeMate app installing on the emulator
- App launching with the login screen
- All 5 screens (Login, Dashboard, Wallet, Files, Settings) working

---

## 🆘 **Need Help?**

If you encounter issues:
1. **Check the console output** for specific error messages
2. **Restart the emulator** if it's not responding
3. **Clear Metro cache**: `npx react-native start --reset-cache`
4. **Clean and rebuild**: `npm run clean:android && npm run android`

The most common issue is the emulator not being detected. Make sure:
- Emulator is fully booted (not just starting)
- ADB is working: `adb devices` shows the emulator
- No other Android development tools are interfering
