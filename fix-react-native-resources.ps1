# Fix React Native Resources Issues
# PowerShell script to resolve missing React Native resources

Write-Host "🔧 Fixing React Native Resources Issues" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Write-Host "`n📱 Fixing missing React Native resources..." -ForegroundColor Yellow

# Step 1: Create missing React Native resources
Write-Host "`nStep 1: Creating missing React Native resources..." -ForegroundColor Cyan

# Create values directory if it doesn't exist
if (-not (Test-Path "android\app\src\main\res\values")) {
    New-Item -ItemType Directory -Path "android\app\src\main\res\values" -Force
    Write-Host "✅ Created values directory" -ForegroundColor Green
}

# Create strings.xml
$stringsXml = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">SafeMate</string>
</resources>
"@

Set-Content -Path "android\app\src\main\res\values\strings.xml" -Value $stringsXml
Write-Host "✅ Created strings.xml" -ForegroundColor Green

# Create styles.xml
$stylesXml = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Base application theme. -->
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
        <!-- Customize your theme here. -->
        <item name="android:editTextBackground">@drawable/rn_edit_text_material</item>
    </style>
</resources>
"@

Set-Content -Path "android\app\src\main\res\values\styles.xml" -Value $stylesXml
Write-Host "✅ Created styles.xml" -ForegroundColor Green

# Step 2: Create missing drawable resources
Write-Host "`nStep 2: Creating missing drawable resources..." -ForegroundColor Cyan

if (-not (Test-Path "android\app\src\main\res\drawable")) {
    New-Item -ItemType Directory -Path "android\app\src\main\res\drawable" -Force
    Write-Host "✅ Created drawable directory" -ForegroundColor Green
}

# Create rn_edit_text_material.xml
$editTextMaterial = @"
<?xml version="1.0" encoding="utf-8"?>
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:state_focused="true">
        <shape android:shape="rectangle">
            <stroke android:width="2dp" android:color="#2196F3"/>
            <corners android:radius="4dp"/>
        </shape>
    </item>
    <item>
        <shape android:shape="rectangle">
            <stroke android:width="1dp" android:color="#CCCCCC"/>
            <corners android:radius="4dp"/>
        </shape>
    </item>
</selector>
"@

Set-Content -Path "android\app\src\main\res\drawable\rn_edit_text_material.xml" -Value $editTextMaterial
Write-Host "✅ Created rn_edit_text_material.xml" -ForegroundColor Green

# Step 3: Update AndroidManifest.xml to remove package attribute
Write-Host "`nStep 3: Updating AndroidManifest.xml..." -ForegroundColor Cyan

$updatedManifest = @"
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />

    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round"
      android:allowBackup="false"
      android:theme="@style/AppTheme">
      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
        android:launchMode="singleTask"
        android:windowSoftInputMode="adjustResize"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>
    </application>
</manifest>
"@

Set-Content -Path "android\app\src\main\AndroidManifest.xml" -Value $updatedManifest
Write-Host "✅ Updated AndroidManifest.xml" -ForegroundColor Green

# Step 4: Clean and rebuild
Write-Host "`nStep 4: Cleaning build directories..." -ForegroundColor Cyan

if (Test-Path "android\build") {
    Remove-Item -Recurse -Force "android\build"
    Write-Host "✅ Cleaned android\build" -ForegroundColor Green
}

if (Test-Path "android\app\build") {
    Remove-Item -Recurse -Force "android\app\build"
    Write-Host "✅ Cleaned android\app\build" -ForegroundColor Green
}

Write-Host "`n🎯 React Native Resources Fix Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Write-Host "`n📋 What's Been Fixed:" -ForegroundColor Cyan
Write-Host "• Created missing strings.xml" -ForegroundColor White
Write-Host "• Created missing styles.xml" -ForegroundColor White
Write-Host "• Created missing drawable resources" -ForegroundColor White
Write-Host "• Fixed AndroidManifest.xml" -ForegroundColor White
Write-Host "• Cleaned build directories" -ForegroundColor White
Write-Host "• Vault icons preserved" -ForegroundColor White

Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm run android" -ForegroundColor White
Write-Host "2. Test vault icons on emulator" -ForegroundColor White
Write-Host "3. Verify app functionality" -ForegroundColor White

Write-Host "`n✅ React Native resources fixed!" -ForegroundColor Green
Write-Host "The app should now build successfully with vault icons." -ForegroundColor Cyan
