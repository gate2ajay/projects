import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function About() {
    const router = useRouter();
    return (
        <SafeAreaView className="flex-1 bg-white">
            <Drawer.Screen options={{ headerShown: false }} />
            <View className="flex-row items-center p-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">About Us</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <Text className="text-2xl font-bold mb-4 text-gray-800">Simple Meditation</Text>
                <Text className="text-gray-600 leading-6 mb-4">
                    Welcome to Simple Meditation, your daily companion for mindfulness and peace.
                    Our mission is to make meditation accessible to everyone, regardless of their experience level.
                </Text>
                <Text className="text-gray-600 leading-6 mb-4">
                    We believe that taking just a few minutes each day to breathe and center yourself can have a profound impact on your mental well-being.
                </Text>
                <Text className="text-gray-600 leading-6">
                    Version 1.0.0
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
