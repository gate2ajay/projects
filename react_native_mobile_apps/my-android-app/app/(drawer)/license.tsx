import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function License() {
    const router = useRouter();
    return (
        <SafeAreaView className="flex-1 bg-white">
            <Drawer.Screen options={{ headerShown: false }} />
            <View className="flex-row items-center p-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">Licenses</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <Text className="text-lg font-bold mb-2">MIT License</Text>
                <Text className="text-gray-600 mb-6">
                    Copyright (c) 2024 Simple Meditation
                </Text>
                <Text className="text-gray-600 leading-6 mb-4">
                    Permission is hereby granted, free of charge, to any person obtaining a copy
                    of this software and associated documentation files (the "Software"), to deal
                    in the Software without restriction, including without limitation the rights
                    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                    copies of the Software, and to permit persons to whom the Software is
                    furnished to do so, subject to the following conditions:
                </Text>
                <Text className="text-gray-600 leading-6 mb-4">
                    The above copyright notice and this permission notice shall be included in all
                    copies or substantial portions of the Software.
                </Text>
                <Text className="text-gray-600 leading-6">
                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                    SOFTWARE.
                </Text>

                <Text className="text-lg font-bold mt-8 mb-2">Open Source Libraries</Text>
                <Text className="text-gray-600 leading-6">
                    - React Native
                    - Expo
                    - NativeWind
                    - React Navigation
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
