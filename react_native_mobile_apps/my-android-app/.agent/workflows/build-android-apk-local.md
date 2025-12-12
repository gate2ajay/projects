---
description: Build Android APK Locally (No EAS Account)
---

This workflow allows you to build the APK entirely on your local machine without using EAS Cloud services.

**Prerequisites:**
*   **Java Development Kit (JDK) 17** or newer installed.
*   **Android Studio & Android SDK** installed and configured.
*   `ANDROID_HOME` environment variable set.

1.  **Generate Native Android Project**
    This command creates the `android` folder with all native code.
    ```bash
    npx expo prebuild
    ```
    *   When prompted for the package name, you can press Enter to accept the default or type a new one (e.g., `com.yourname.appname`).

2.  **Navigate to Android Directory**
    ```bash
    cd android
    ```

3.  **Build the APK**
    Run the Gradle wrapper to build the release APK.
    ```bash
    ./gradlew assembleRelease
    ```
    *   *Note: This process can take 10-20 minutes depending on your computer's speed.*

4.  **Locate the APK**
    Once the build finishes successfully, your APK will be located at:
    `android/app/build/outputs/apk/release/app-release.apk`

5.  **Install on Device**
    *   Transfer this file to your Android phone (via USB, Google Drive, etc.).
    *   Tap to install (enable "Unknown Sources" if prompted).
