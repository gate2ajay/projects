import AppGradient from '@/components/AppGradient';
import { MEDITATION_DATA } from '@/constants/MeditationData';
import MEDITATION_IMAGES from '@/constants/meditation-images';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FlatList, ImageBackground, Pressable, Text, View } from 'react-native';

import { Entypo } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';

export default function Meditate() {
    const router = useRouter();
    const navigation = useNavigation();
    const { user } = useAuth()!;

    return (
        <View className="flex-1">
            <AppGradient colors={['#161b2e', '#0a4d4a', '#766e67']}>
                <View className="flex-row items-center justify-between mb-4">
                    <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                        <Entypo name="menu" size={30} color="white" />
                    </Pressable>
                </View>

                <View className="mb-6">
                    <Text className="text-gray-200 mb-3 font-bold text-4xl text-left">
                        Welcome {user?.name?.split(' ')[0] || 'Friend'}
                    </Text>
                    <Text className="text-indigo-100 text-xl font-medium">
                        Start your meditation practice today
                    </Text>
                </View>

                <View>
                    <FlatList
                        data={MEDITATION_DATA}
                        className="mb-20"
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => router.push(`/meditation/${item.id}`)}
                                className="h-48 my-3 rounded-md overflow-hidden"
                            >
                                <ImageBackground
                                    source={MEDITATION_IMAGES[item.image as keyof typeof MEDITATION_IMAGES]}
                                    resizeMode="cover"
                                    className="flex-1 rounded-lg justify-center"
                                >
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                                        className="flex-1 justify-center items-center"
                                    >
                                        <Text className="text-gray-100 text-3xl font-bold text-center">
                                            {item.title}
                                        </Text>
                                    </LinearGradient>
                                </ImageBackground>
                            </Pressable>
                        )}
                    />
                </View>
            </AppGradient>
            <StatusBar style="light" />
        </View>
    );
}
