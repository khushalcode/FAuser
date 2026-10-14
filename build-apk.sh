#!/usr/bin/env bash
# Food Munch Customer App — APK Build Script
# Run this on your machine to build a debug APK.
#
# Prerequisites:
#   - Node.js 18+ : https://nodejs.org/
#   - Java JDK 17+ : https://adoptium.net/
#   - Android Studio (for Android SDK + NDK): https://developer.android.com/studio
#
# On macOS: brew install node openjdk@17
# On Ubuntu: sudo apt install nodejs npm openjdk-17-jdk
#
# Then run: bash build-apk.sh

set -e

echo "=========================================="
echo "  Food Munch Customer App — APK Builder"
echo "=========================================="

# Check prerequisites
echo ""
echo "[1/8] Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed. Install from https://nodejs.org/"
  exit 1
fi
echo "  ✓ Node.js: $(node --version)"

if ! command -v java &> /dev/null; then
  echo "ERROR: Java is not installed. Install JDK 17+ from https://adoptium.net/"
  exit 1
fi
echo "  ✓ Java: $(java -version 2>&1 | head -1)"

if [ -z "$ANDROID_HOME" ]; then
  echo "ERROR: ANDROID_HOME is not set."
  echo "  Set it in your ~/.bashrc or ~/.zshrc:"
  echo "    export ANDROID_HOME=\$HOME/Android/Sdk"
  echo "    export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
  echo "  (macOS: \$HOME/Library/Android/sdk)"
  exit 1
fi
echo "  ✓ ANDROID_HOME: $ANDROID_HOME"

if [ ! -d "$ANDROID_HOME/ndk" ]; then
  echo "ERROR: Android NDK not found in $ANDROID_HOME/ndk"
  echo "  Install via Android Studio → SDK Manager → SDK Tools → NDK (side by side)"
  echo "  Required version: 26.1.10909125 (or 26.x)"
  exit 1
fi
echo "  ✓ NDK: $(ls $ANDROID_HOME/ndk | head -1)"

# Install dependencies
echo ""
echo "[2/8] Installing npm dependencies..."
npm install --legacy-peer-deps

# Install react-native-svg (if not present)
if [ ! -d "node_modules/react-native-svg" ]; then
  echo ""
  echo "[3/8] Installing react-native-svg..."
  npm install react-native-svg --legacy-peer-deps
else
  echo ""
  echo "[3/8] react-native-svg already installed ✓"
fi

# Pin @babel/core to a compatible version
echo ""
echo "[4/8] Pinning @babel/core to 7.24.7 (Expo SDK 52 compatible)..."
npm install @babel/core@7.24.7 --legacy-peer-deps --save-exact

# Generate native Android project
echo ""
echo "[5/8] Generating native Android project (expo prebuild)..."
npx expo prebuild --platform android --no-install

# Patch known Gradle issues with expo-modules
echo ""
echo "[6/8] Patching expo-modules build.gradle files..."

# Patch 1: components.release issue
find node_modules/expo-*/android/build.gradle -exec sed -i 's|from components.release|try { from components.release } catch (Exception ignored) {}|g' {} \; 2>/dev/null

# Patch 2: compileSdkVersion -> compileSdk, minSdkVersion -> minSdk, targetSdkVersion -> targetSdk
find node_modules/expo-*/android/build.gradle -exec sed -i 's|compileSdkVersion safeExtGet|compileSdk safeExtGet|g; s|minSdkVersion safeExtGet|minSdk safeExtGet|g; s|targetSdkVersion safeExtGet|targetSdk safeExtGet|g' {} \; 2>/dev/null
find node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle -exec sed -i 's|compileSdkVersion project.ext.safeExtGet|compileSdk project.ext.safeExtGet|g; s|minSdkVersion project.ext.safeExtGet|minSdk project.ext.safeExtGet|g; s|targetSdkVersion project.ext.safeExtGet|targetSdk project.ext.safeExtGet|g' {} \; 2>/dev/null

# Patch 3: Add top-level ext block to android/build.gradle
if ! grep -q "^ext {" android/build.gradle; then
  python3 -c "
with open('android/build.gradle') as f: c = f.read()
ext_block = '''// Top-level ext (needed for expo-modules which use safeExtGet)
ext {
    buildToolsVersion = findProperty('android.buildToolsVersion') ?: '35.0.0'
    minSdkVersion = Integer.parseInt(findProperty('android.minSdkVersion') ?: '24')
    compileSdkVersion = Integer.parseInt(findProperty('android.compileSdkVersion') ?: '35')
    targetSdkVersion = Integer.parseInt(findProperty('android.targetSdkVersion') ?: '34')
    kotlinVersion = findProperty('android.kotlinVersion') ?: '1.9.25'
    ndkVersion = '26.1.10909125'
}

'''
c = c.replace('// Top-level build file', ext_block + '// Top-level build file')
with open('android/build.gradle','w') as f: f.write(c)
"
fi

# Patch 4: Force compileSdk in expo modules (bypass expoProvidesDefaultConfig check)
python3 -c "
import re, glob
for f in glob.glob('node_modules/expo-*/android/build.gradle'):
    with open(f) as fh: c = fh.read()
    pat = r'(android \{)\s*// Remove this if[^\n]*\n  if \(!safeExtGet\(\"expoProvidesDefaultConfig\", false\)\) \{\s*compileSdk safeExtGet\(\"compileSdkVersion\", 34\)\s*defaultConfig \{\s*minSdk safeExtGet\(\"minSdkVersion\", 23\)\s*targetSdk safeExtGet\(\"targetSdkVersion\", 34\)\s*\}\s*publishing \{\s*singleVariant\(\"release\"\) \{\s*withSourcesJar\(\)\s*\}\s*\}\s*lintOptions \{\s*abortOnError false\s*\}\s*\}'
    rep = r'\1\n  compileSdk 35\n  defaultConfig {\n    minSdk 24\n    targetSdk 34\n  }'
    new = re.sub(pat, rep, c, flags=re.DOTALL)
    if new != c:
        with open(f,'w') as fh: fh.write(new)
        print(f'Fixed: {f}')
"

# Add SDK versions to gradle.properties
if ! grep -q "android.compileSdkVersion" android/gradle.properties; then
  cat >> android/gradle.properties << 'EOF'

# Android SDK versions (needed for expo-modules)
android.compileSdkVersion=35
android.targetSdkVersion=34
android.minSdkVersion=24
android.buildToolsVersion=35.0.0
android.kotlinVersion=1.9.25
EOF
fi

echo "  ✓ Patches applied"

# Build the APK
echo ""
echo "[7/8] Building debug APK (this takes 5-10 minutes)..."
cd android
./gradlew :app:assembleDebug --no-daemon

# Copy APK to project root
echo ""
echo "[8/8] Copying APK to project root..."
cd ..
mkdir -p apk
cp android/app/build/outputs/apk/debug/app-debug.apk apk/foodmunch-customer-debug.apk

# Verify
echo ""
if [ -f "apk/foodmunch-customer-debug.apk" ]; then
  SIZE=$(du -h apk/foodmunch-customer-debug.apk | cut -f1)
  echo "=========================================="
  echo "  ✅ APK BUILD SUCCESSFUL!"
  echo "=========================================="
  echo "  📦 APK location: apk/foodmunch-customer-debug.apk"
  echo "  📏 Size: $SIZE"
  echo ""
  echo "  To install on a device:"
  echo "    adb install apk/foodmunch-customer-debug.apk"
  echo ""
  echo "  Or share the APK file directly to your phone."
  echo "=========================================="
else
  echo "❌ APK build failed. Check the logs above."
  exit 1
fi
