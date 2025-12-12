import CustomButton from '@/components/CustomButton';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ImageBackground, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import beachImage from '@/assets/meditation-images/beach.webp';

export default function App() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <ImageBackground
        source={beachImage}
        resizeMode="cover"
        className="flex-1"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
          className="flex-1"
        >
          <SafeAreaView className="flex-1 px-1 justify-between">
            <View>
              <Text className="text-center text-white font-bold text-4xl mt-10">
                Simple Meditation
              </Text>
              <Text className="text-center text-white text-xl mt-3">
                Simplifying Meditation for Everyone
              </Text>
            </View>

            <View>
              <CustomButton
                onPress={() => router.replace('/meditate')}
                title="Get Started"
                containerStyles="mb-5 mx-5"
              />
              <CustomButton
                onPress={() => router.push('/db-test')}
                title="Test Database"
                containerStyles="mb-10 mx-5 bg-secondary-500"
              />
            </View>

            <StatusBar style="light" />
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}
