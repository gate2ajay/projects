import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getUserByIdentifier, verifyOTP } from '../../services/auth/AuthService';

export default function OtpVerification() {
    const { identifier, type } = useLocalSearchParams<{ identifier: string; type: string }>();
    const [code, setCode] = useState('');
    const router = useRouter();
    const { signIn } = useAuth()!;

    const handleVerify = async () => {
        if (!code) {
            Alert.alert('Error', 'Please enter the code');
            return;
        }

        try {
            const isValid = await verifyOTP(identifier, code);
            if (isValid) {
                const user = await getUserByIdentifier(identifier);
                if (user) {
                    signIn(user);
                } else {
                    Alert.alert('Error', 'User not found');
                }
            } else {
                Alert.alert('Error', 'Invalid or expired code');
            }
        } catch (error) {
            Alert.alert('Error', 'Verification failed');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6 justify-center">
            <Text className="text-3xl font-bold text-center mb-4 text-gray-800">Verify OTP</Text>
            <Text className="text-center text-gray-500 mb-8">
                Enter the code sent to your {type === 'email' ? 'email' : 'phone'}
            </Text>

            <TextInput
                className="w-full bg-gray-100 p-4 rounded-xl border border-gray-200 text-center text-2xl tracking-widest mb-6"
                placeholder="123456"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
            />

            <TouchableOpacity
                className="w-full bg-blue-600 p-4 rounded-xl shadow-md"
                onPress={handleVerify}
            >
                <Text className="text-white text-center font-bold text-lg">Verify Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="mt-6"
                onPress={() => router.back()}
            >
                <Text className="text-center text-gray-500">Back to Login</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
