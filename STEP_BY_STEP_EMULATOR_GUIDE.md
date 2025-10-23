# Step-by-Step Android Emulator Creation Guide

## 🎯 **Goal**: Create Android Emulator for SafeMate App Testing

### 📱 **Method**: Manual Creation via Android Studio (Recommended)

---

## 🚀 **Step 1: Open Android Studio**

1. **Navigate to**: `C:\Program Files\Android\Android Studio\bin\studio64.exe`
2. **Double-click** to open Android Studio
3. **Wait** for Android Studio to fully load (may take 1-2 minutes)

---

## 🚀 **Step 2: Open AVD Manager**

### **Option A: From Welcome Screen**
- If you see the welcome screen, click **"More Actions"** → **"Virtual Device Manager"**

### **Option B: From Open Project**
- If you have a project open, go to **Tools** → **AVD Manager**

---

## 🚀 **Step 3: Create New Virtual Device**

1. **Click** the **"Create Device"** button (usually a + icon or "Create Virtual Device")
2. **Select Category**: Choose **"Phone"**
3. **Select Device**: Choose **"Pixel 4"** (or any modern phone)
4. **Click** **"Next"**

---

## 🚀 **Step 4: Download and Select System Image**

### **Download Android API 33**
1. **Look for** "API 33" in the System Image list
2. **If not downloaded**:
   - Click **"Download"** next to "API 33"
   - Wait for download to complete (10-15 minutes)
   - You'll see progress bar and download status
3. **Select** "API 33" system image
4. **Click** **"Next"**

---

## 🚀 **Step 5: Configure Virtual Device**

### **AVD Name**
- **Enter**: `SafeMate_Emulator`

### **Advanced Settings** (Click "Show Advanced Settings")
- **RAM**: `4 GB` (4096 MB)
- **Internal Storage**: `8 GB` (8192 MB)
- **SD Card**: `2 GB` (2048 MB)
- **Startup Orientation**: `Portrait`

### **Graphics**
- **Graphics**: `Hardware - GLES 2.0` (default)

### **Click** **"Finish"**

---

## 🚀 **Step 6: Start the Emulator**

1. **In AVD Manager**, you'll see your new emulator listed
2. **Click** the **"Play"** button (▶️) next to "SafeMate_Emulator"
3. **Wait** for emulator to boot (2-3 minutes on first run)

---

## 🚀 **Step 7: Verify Emulator is Running**

### **Check in Android Studio**
- You should see the emulator window open
- Android home screen should appear
- Status should show "Online" or "Running"

### **Check via Command Line**
Open a new terminal and run:
```bash
adb devices
```
You should see:
```
List of devices attached
emulator-5554   device
```

---

## 🚀 **Step 8: Test SafeMate App**

Once emulator is running:

### **Option A: Use the Startup Script**
```powershell
.\start-android-app.ps1
```

### **Option B: Manual Commands**
```powershell
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Run Android app
npm run android
```

---

## 🐛 **Troubleshooting Common Issues**

### **Issue 1: "No system images available"**
**Solution**: 
- Make sure you downloaded API 33
- Try API 32 or 31 if API 33 fails
- Check your internet connection

### **Issue 2: "Emulator won't start"**
**Solutions**:
- **Increase RAM**: Try 6 GB or 8 GB
- **Enable Virtualization**: Check BIOS settings
- **Close other apps**: Free up system resources
- **Restart Android Studio**

### **Issue 3: "API 33 download fails"**
**Solutions**:
- Try API 32 or 31 instead
- Check internet connection
- Clear Android Studio cache
- Restart Android Studio

### **Issue 4: "Emulator starts but is slow"**
**Solutions**:
- Increase RAM allocation
- Enable hardware acceleration
- Close other resource-intensive apps
- Use a faster system image (API 31 instead of 33)

### **Issue 5: "ADB not detecting emulator"**
**Solutions**:
- Wait for emulator to fully boot
- Restart ADB: `adb kill-server && adb start-server`
- Check if emulator is actually running
- Try restarting the emulator

---

## 📋 **Quick Checklist**

- [ ] Android Studio opened
- [ ] AVD Manager opened
- [ ] New device created (Pixel 4)
- [ ] API 33 downloaded and selected
- [ ] AVD configured (4GB RAM, 8GB storage)
- [ ] Emulator named "SafeMate_Emulator"
- [ ] Emulator started and running
- [ ] ADB detects emulator (`adb devices`)
- [ ] Ready to test SafeMate app

---

## 🎯 **Expected Result**

After completing all steps:
- ✅ Android emulator running with virtual device
- ✅ Emulator shows Android home screen
- ✅ `adb devices` shows the emulator
- ✅ Ready to install and test SafeMate app
- ✅ App will install automatically when you run `npm run android`

---

## 🆘 **Need Help?**

If you get stuck at any step:
1. **Take a screenshot** of the issue
2. **Check the error message** carefully
3. **Try the troubleshooting steps** above
4. **Restart Android Studio** if needed
5. **Ask for help** with the specific error message

The most common issue is the API download taking a long time. Be patient - it can take 10-15 minutes depending on your internet connection.
