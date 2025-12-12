# Mobile DB Integration - React Native App

This is a React Native application built with [Expo](https://expo.dev) and styled with [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native). It uses Expo Router for file-based navigation.

## 🚀 Tech Stack

- **Framework:** [React Native](https://reactnative.dev/)
- **Platform:** [Expo SDK 53](https://expo.dev/)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/)
- **Styling:** [NativeWind v2](https://www.nativewind.dev/) & [Tailwind CSS](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

---

## 📋 Prerequisites

Before you begin, ensure you have the following tools installed on your development machine.

1.  **Node.js & npm:**
    -   Install [Node.js](https://nodejs.org/) (LTS version recommended). npm is included with Node.js.
    -   Verify the installation:
        ```bash
        node -v
        npm -v
        ```

2.  **Watchman (for macOS/Linux):**
    -   A file-watching service. Recommended for better performance.
    -   Install via [Homebrew](https://brew.sh/) on macOS:
        ```bash
        brew install watchman
        ```

3.  **Expo CLI:**
    -   The command-line tool for Expo.
    -   Install it globally:
        ```bash
        npm install -g expo-cli
        ```

4.  **Development Environment for Native Code:**
    -   **For Android:** Install [Android Studio](https://developer.android.com/studio). Set up an Android Virtual Device (AVD) or connect a physical device with USB debugging enabled.
    -   **For iOS (macOS only):** Install [Xcode](https://developer.apple.com/xcode/) from the Mac App Store. Set up an iOS Simulator or connect a physical device.

5.  **Git:**
    -   You'll need Git to clone the repository.

---

## ⚙️ Getting Started

Follow these steps to get your development environment set up.

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd my-android-app
    ```

2.  **Install Dependencies**
    -   This will install all the necessary packages defined in `package.json`.
    ```bash
    npm install
    ```

3.  **Start the Development Server**
    -   This command starts the Metro bundler, which is the development server for React Native.
    ```bash
    npx expo start
    ```

---

## 📱 Running the App

Once the development server is running, you will see a QR code in your terminal and a command-line interface with several options:

-   **To run on Android:**
    -   Press `a` in the terminal.
    -   This will open the app on a connected Android device or a running Android emulator.

-   **To run on iOS (macOS only):**
    -   Press `i` in the terminal.
    -   This will open the app on a connected iOS device or a running iOS Simulator.

-   **To run on the Web:**
    -   Press `w` in the terminal.
    -   This will open the app in your default web browser.

-   **Using the Expo Go App:**
    -   Install the [Expo Go app](https://expo.dev/go) on your physical Android or iOS device.
    -   Scan the QR code from your terminal with the Expo Go app to open the project.

---

## 🔧 Troubleshooting

-   **If the app fails to start or styles are not applied:**
    -   Try clearing the cache and restarting the server:
        ```bash
        npx expo start -c
        ```
-   **If you encounter dependency issues:**
    -   Remove `node_modules` and `package-lock.json`, then reinstall:
        ```bash
        rm -rf node_modules package-lock.json
        npm install
        ```

---

This project uses [file-based routing](https://docs.expo.dev/router/introduction). You can start developing by editing the files inside the `app` directory.

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
