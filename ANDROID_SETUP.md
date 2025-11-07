# Android Development Build - Quick Setup Guide

## Prerequisites ✅

- Node.js v20+
- npm v10+
- Java JDK 17
- Android SDK (via Android Studio)
- Android Emulator or physical device

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Native Android Folder (if not exists)

```bash
npx expo prebuild --platform android
```

### 3. Start Development Server

```bash
npx expo start
```

Then press `a` to run on Android emulator.

## Alternative: Direct Android Run

```bash
npm run android
# or
npx expo run:android
```

## Common Issues

### Issue: Android folder not found

**Solution**: Run `npx expo prebuild --platform android`

### Issue: Metro bundler connection error

**Solution**:

```bash
adb reverse tcp:8081 tcp:8081
npx expo start -c
```

### Issue: Gradle build fails

**Solution**:

```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
```

## Configuration Files

- `app.json` - Expo configuration
- `android/gradle.properties` - Android build settings
- `android/app/src/main/AndroidManifest.xml` - App permissions and settings

## Resources

- Full Vietnamese guide: `/hd.md` in root directory
- Expo docs: https://docs.expo.dev
- Project instructions: `.github/copilot-instructions.md`

## Package Information

- **Package Name**: com.anonymous.FE
- **Deep Link Scheme**: fe://
- **Permissions**: Camera, Internet, Storage, Audio
- **Architecture**: New Architecture Enabled
- **JS Engine**: Hermes Enabled
