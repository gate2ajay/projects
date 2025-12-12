import AppGradient from '@/components/AppGradient';
import GuidedAffirmationsGallery from '@/components/GuidedAffirmationsGallery';
import AFFIRMATION_GALLERY from '@/constants/affirmations-gallery';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View } from 'react-native';

import { Entypo } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Pressable } from 'react-native';

export default function Affirmations() {
    const navigation = useNavigation();

    return (
        <View className="flex-1">
            <AppGradient colors={['#2e1f58', '#54426b', '#a790af']}>
                <View className="flex-row items-center justify-between mb-4">
                    <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                        <Entypo name="menu" size={30} color="white" />
                    </Pressable>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text className="text-zinc-50 text-3xl font-bold">
                        Change your beliefs with affirmations
                    </Text>
                    <View>
                        {AFFIRMATION_GALLERY.map((g) => (
                            <GuidedAffirmationsGallery
                                key={g.title}
                                title={g.title}
                                previews={g.data}
                            />
                        ))}
                    </View>
                </ScrollView>
            </AppGradient>
            <StatusBar style="light" />
        </View>
    );
}
