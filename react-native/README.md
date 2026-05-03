# Greenovate Mobile - Native Module Setup Guide

This document provides detailed instructions for setting up and configuring native modules for both Android and iOS platforms in this repository.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Android Setup](#android-setup)
- [iOS Setup](#ios-setup)
- [Common Native Modules](#common-native-modules)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up native modules, ensure your environment meets the following requirements:

- **Node.js**: `^20.0.0`
- **Yarn / NPM**: Latest stable version
- **JDK**: `17` (Recommended for latest React Native)
- **Android Studio**: Required for Android development
- **Xcode**: `^15.0` (macOS only, required for iOS)
- **CocoaPods**: `^1.15.0` (macOS only)
- **Ruby**: Version specified in `.ruby-version` or `Gemfile` (usually handled by `rbenv` or `rvm`)

---

## Android Setup

Android native modules are integrated via Gradle.

### 1. Environment Variables
Ensure your `ANDROID_HOME` and `JAVA_HOME` are correctly set in your shell profile (`.zshrc`, `.bash_profile`, etc.):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 2. Local Properties
Create a `local.properties` file in the `android/` directory if it doesn't exist:

```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

### 3. Native Module Linking
React Native 0.60+ uses **Autolinking**. Most libraries are automatically detected.
- If a module requires manual linking (rare now), you must modify `MainApplication.kt` and `settings.gradle`.
- Always run `./gradlew clean` in the `android/` folder after adding a new native dependency.

### 4. Build & Run
```bash
npm run android
```
Or via Android Studio:
1. Open the `android/` folder as a project.
2. Wait for Gradle sync to complete.
3. Select your device/emulator and click "Run".

---

## iOS Setup

iOS native modules are managed via CocoaPods.

### 1. Install Dependencies
Navigate to the `ios/` directory and install pods:

```bash
cd ios
bundle install # If Gemfile is present
bundle exec pod install
```

### 2. Xcode Configuration
1. Open `TemplateRepoMobileReactNative.xcworkspace` in Xcode.
2. Ensure the **Deployment Target** matches the requirements of your native modules (usually iOS 13.4+).
3. Under **Signing & Capabilities**, select your development team.

### 3. Native Module Linking
- iOS uses **CocoaPods** for autolinking.
- If you add a new library with native code, you **must** run `pod install` in the `ios/` folder.
- For libraries with custom native code (e.g., `react-native-gesture-handler`), ensure they are properly initialized in `AppDelegate.mm`.

### 4. Build & Run
```bash
npm run ios
```
Or via Xcode:
1. Select the target and an emulator.
2. Click the "Play" button to build and run.

---

## Common Native Modules

This project utilizes the following core native modules:

| Module | Purpose | Platform Notes |
| :--- | :--- | :--- |
| `react-native-gesture-handler` | Touch interactions | Requires `GestureHandlerRootView` wrapping the app. |
| `react-native-screens` | Native navigation performance | Optimizes view hierarchy on both platforms. |
| `react-native-safe-area-context` | Handle notches/safe areas | Requires `SafeAreaProvider` at root. |

---

## Troubleshooting

### Android Issues
- **Gradle Sync Failed**: Try `cd android && ./gradlew clean`.
- **Duplicate Class Error**: Check for conflicting versions in `build.gradle`.
- **Execution failed for task ':app:installDebug'**: Ensure your emulator is running and detected via `adb devices`.

### iOS Issues
- **Module not found**: Ensure you opened the `.xcworkspace` file, not the `.xcodeproj`.
- **Pod Installation Error**: Try `rm -rf Pods Podfile.lock && pod install`.
- **Linker Errors**: Check if a library requires a specific iOS version or extra configuration in `Info.plist`.

### General
- Clear Metro cache: `npm start -- --reset-cache`
- Reinstall all node modules: `rm -rf node_modules && npm install`
