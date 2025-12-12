import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerUser } from '../../services/auth/AuthService';

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cell, setCell] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        if (!name || !email || !cell || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            await registerUser(name, email, cell, password);
            Alert.alert('Success', 'Account created successfully', [
                { text: 'Login', onPress: () => router.replace('/(auth)/login') }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Registration failed. Email or Cell might already be in use.');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <Text className="text-3xl font-bold text-center mb-8 text-gray-800">Create Account</Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-600 mb-1 ml-1">Full Name</Text>
                        <TextInput
                            className="w-full bg-gray-100 p-4 rounded-xl border border-gray-200"
                            placeholder="John Doe"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-600 mb-1 ml-1">Email Address</Text>
                        <TextInput
                            className="w-full bg-gray-100 p-4 rounded-xl border border-gray-200"
                            placeholder="john@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-600 mb-1 ml-1">Cell Number</Text>
                        <TextInput
                            className="w-full bg-gray-100 p-4 rounded-xl border border-gray-200"
                            placeholder="1234567890"
                            value={cell}
                            onChangeText={setCell}
                            keyboardType="phone-pad"
                        />
                    </View>

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

                    <TouchableOpacity
                        className="w-full bg-blue-600 p-4 rounded-xl mt-6 shadow-md"
                        onPress={handleRegister}
                    >
                        <Text className="text-white text-center font-bold text-lg">Register</Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-4">
                        <Text className="text-gray-600">Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text className="text-blue-600 font-bold">Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
