---
description: Build an installable Android APK
---

This workflow will guide you through building a standalone Android APK that you can install on your device.

1.  **Login to Expo**
    If you haven't already, you need to log in to your Expo account.
    ```bash
    eas login
    ```

2.  **Configure Project (One-time setup)**
    If this is your first time building this project with EAS, run this to link it to your Expo account.
    ```bash
    eas build:configure
    ```
    *   Select `Android` when prompted.

3.  **Build the APK**
    Run the build command using the `preview` profile we configured (which creates an APK).
    ```bash
    eas build -p android --profile preview
    ```
    *   This will upload your code to Expo's build servers.
    *   Wait for the build to complete (it may take 10-20 minutes).
    *   Once finished, it will provide a URL to download the `.apk` file.

4.  **Install on Android Device**
    *   **Download**: Open the link provided by the build command on your Android device to download the APK.
    *   **Allow Unknown Sources**: When you try to install it, your phone might warn you about installing from unknown sources. Go to Settings and allow installation from your browser (e.g., Chrome).
    *   **Install**: Proceed with the installation.
    *   **Open**: You can now open "my-android-app" from your app drawer.

5.  **Troubleshooting**
    *   If the build fails, check the error logs provided in the terminal link.
    *   Ensure your `app.json` has a unique `android.package` name (currently `com.ajayraja.myandroidapp`).
