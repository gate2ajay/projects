import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { initializeDatabase } from '../services/database/DatabaseService';
import './global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Roboto-Mono": require("../assets/fonts/RobotoMono-Regular.ttf"),
  });

  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initializeDatabase();
        setDbInitialized(true);
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded && dbInitialized) SplashScreen.hideAsync();
  }, [fontsLoaded, error, dbInitialized]);

  if (!fontsLoaded || !dbInitialized) return null;

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="meditation/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="affirmations/[itemId]" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
