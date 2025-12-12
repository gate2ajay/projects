import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { updateUser } from '../../services/auth/AuthService';

export default function Profile() {
    const { user, signIn } = useAuth()!;
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [cell, setCell] = useState(user?.cell_number || '');
    const router = useRouter();

    const handleUpdate = async () => {
        if (!user) return;
        try {
            const updatedUser = await updateUser(user.user_id, name, email, cell);
            signIn(updatedUser); // Update context and persist
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Drawer.Screen options={{ headerShown: false }} />
            <View className="flex-row items-center p-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">Edit Profile</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <View className="items-center mb-8">
                    <View className="h-24 w-24 bg-blue-100 rounded-full items-center justify-center mb-4 border-2 border-blue-500">
                        <Text className="text-4xl font-bold text-blue-600">{name.charAt(0).toUpperCase()}</Text>
                    </View>
                </View>

                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-600 mb-1 ml-1">Full Name</Text>
                        <TextInput
                            className="w-full bg-gray-100 p-4 rounded-xl border border-gray-200"
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-600 mb-1 ml-1">Email Address</Text>
                        <TextInput
                            className="w-full bg-gray-100 p-4 rounded-xl border border-gray-200"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-600 mb-1 ml-1">Cell Number</Text>
                        <TextInput
                            className="w-full bg-gray-100 p-4 rounded-xl border border-gray-200"
                            value={cell}
                            onChangeText={setCell}
                            placeholder="Enter cell number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <TouchableOpacity
                        className="w-full bg-blue-600 p-4 rounded-xl mt-6 shadow-md"
                        onPress={handleUpdate}
                    >
                        <Text className="text-white text-center font-bold text-lg">Update Profile</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
