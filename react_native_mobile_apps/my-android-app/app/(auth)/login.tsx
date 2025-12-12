import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { generateAndSendOTP, getUserByIdentifier, loginWithPassword } from '../../services/auth/AuthService';

export default function Login() {
    const router = useRouter();
    const { signIn } = useAuth()!;
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

    const handleLogin = async () => {
        if (!identifier) {
            Alert.alert('Error', 'Please enter Email or Cell Number');
            return;
        }

        if (loginMethod === 'password') {
            if (!password) {
                Alert.alert('Error', 'Please enter password');
                return;
            }
            try {
                const user = await loginWithPassword(identifier, password);
                if (user) {
                    signIn(user);
                } else {
                    Alert.alert('Error', 'Invalid credentials');
                }
            } catch (error) {
                Alert.alert('Error', 'Login failed');
            }
        } else {
            // OTP Flow
            try {
                // Check if user exists first
                const user = await getUserByIdentifier(identifier);
                if (!user) {
                    Alert.alert('Error', 'User not found. Please register first.');
                    return;
                }

                const type = identifier.includes('@') ? 'email' : 'sms';
                const code = await generateAndSendOTP(identifier, type);

                // In a real app, we wouldn't show the code in alert, but for testing we do.
                Alert.alert('OTP Sent', `Your code is: ${code}`, [
                    {
                        text: 'OK',
                        onPress: () => router.push({
                            pathname: '/(auth)/otp-verification',
                            params: { identifier, type }
                        })
                    }
                ]);
            } catch (error) {
                Alert.alert('Error', 'Failed to send OTP');
            }
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
                <Text className="text-3xl font-bold text-center mb-2 text-gray-800">Welcome Back</Text>
                <Text className="text-center text-gray-500 mb-8">Sign in to continue</Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-600 mb-1 ml-1">Email or Cell Number</Text>
                        <TextInput
                            className="w-full bg-gray-100 p-4 rounded-xl border border-gray-200"
                            placeholder="Enter email or phone"
                            value={identifier}
                            onChangeText={setIdentifier}
                            autoCapitalize="none"
                        />
                    </View>

                    {loginMethod === 'password' && (
                        <View>
                            <Text className="text-gray-600 mb-1 ml-1">Password</Text>
                            <TextInput
                                className="w-full bg-gray-100 p-4 rounded-xl border border-gray-200"
                                placeholder="********"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    )}

                    <TouchableOpacity
                        className="w-full bg-blue-600 p-4 rounded-xl mt-4 shadow-md"
                        onPress={handleLogin}
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            {loginMethod === 'password' ? 'Login' : 'Send OTP'}
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-4 space-x-4">
                        <TouchableOpacity
                            onPress={() => setLoginMethod('password')}
                            className={`px-4 py-2 rounded-lg ${loginMethod === 'password' ? 'bg-gray-200' : ''}`}
                        >
                            <Text className={`text-sm ${loginMethod === 'password' ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                                Password Login
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setLoginMethod('otp')}
                            className={`px-4 py-2 rounded-lg ${loginMethod === 'otp' ? 'bg-gray-200' : ''}`}
                        >
                            <Text className={`text-sm ${loginMethod === 'otp' ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                                OTP Login
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-center mt-8">
                        <Text className="text-gray-600">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                            <Text className="text-blue-600 font-bold">Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
