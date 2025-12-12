import AppGradient from '@/components/AppGradient';
import AFFIRMATION_GALLERY from '@/constants/affirmations-gallery';
import { AntDesign } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ImageBackground, Pressable, ScrollView, Text, View } from 'react-native';

export default function AffirmationPractice() {
    const { itemId } = useLocalSearchParams();
    const router = useRouter();

    const [affirmation] = AFFIRMATION_GALLERY.flatMap((g) => g.data).filter(
        (a) => a.id === Number(itemId)
    );

    if (!affirmation) return <Text>Affirmation not found</Text>;

    return (
        <View className="flex-1">
            <ImageBackground
                source={affirmation.image}
                resizeMode="cover"
                className="flex-1"
            >
                <AppGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']}>
                    <Pressable
                        onPress={() => router.back()}
                        className="absolute top-16 left-6 z-10"
                    >
                        <AntDesign name="leftcircleo" size={50} color="white" />
                    </Pressable>

                    <ScrollView
                        className="mt-20"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="h-full justify-center">
                            <View className="h-4/5 justify-center">
                                <Text className="text-white text-3xl font-bold text-center">
                                    {affirmation.text}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </AppGradient>
            </ImageBackground>
        </View>
    );
}
