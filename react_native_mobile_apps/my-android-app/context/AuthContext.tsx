import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
    user_id: number;
    name: string;
    email: string;
    cell_number: string;
}

interface AuthContextType {
    user: User | null;
    signIn: (user: User) => void;
    signOut: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await SecureStore.getItemAsync('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Failed to load user', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const signIn = async (userData: User) => {
        try {
            await SecureStore.setItemAsync('user', JSON.stringify(userData));
            setUser(userData);
            router.replace('/');
        } catch (error) {
            console.error('Failed to save user', error);
        }
    };

    const signOut = async () => {
        try {
            await SecureStore.deleteItemAsync('user');
            setUser(null);
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Failed to remove user', error);
        }
    };

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = (segments[0] as string) === '(auth)';

        if (!user && !inAuthGroup) {
            // Redirect to login if not authenticated
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            // Redirect to home if authenticated
            router.replace('/');
        }
    }, [user, segments, isLoading]);

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
