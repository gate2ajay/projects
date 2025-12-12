import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';

import AppGradient from '@/components/AppGradient';
import CompletionModal from '@/components/CompletionModal';
import CustomButton from '@/components/CustomButton';
import { AUDIO_FILES, MEDITATION_DATA } from '@/constants/MeditationData';
import MEDITATION_IMAGES from '@/constants/meditation-images';

const DURATION_OPTIONS = [5, 10, 15, 20, 30];

export default function MeditationDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [durationIndex, setDurationIndex] = useState(1);
    const [secondsRemaining, setSecondsRemaining] = useState(DURATION_OPTIONS[1] * 60);
    const [audioProgress, setAudioProgress] = useState(0);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    const meditation = MEDITATION_DATA.find((m) => m.id === Number(id));

    useEffect(() => {
        let timerId: any;

        if (isPlaying && secondsRemaining > 0) {
            timerId = setTimeout(() => {
                setSecondsRemaining(secondsRemaining - 1);
            }, 1000);
        } else if (secondsRemaining === 0 && isPlaying) {
            setIsPlaying(false);
            if (sound) {
                sound.stopAsync();
                sound.setPositionAsync(0);
            }
            setShowCompletionModal(true);
        }

        return () => clearTimeout(timerId);
    }, [isPlaying, secondsRemaining]);

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    useEffect(() => {
        if (!sound) return;

        const updateProgress = async () => {
            const status = await sound.getStatusAsync();
            if (status.isLoaded && status.durationMillis) {
                const progress = (status.positionMillis / status.durationMillis) * 100;
                setAudioProgress(progress);
            }
        };

        const interval = setInterval(updateProgress, 500);
        return () => clearInterval(interval);
    }, [sound, isPlaying]);

    const initializeSound = async () => {
        const { sound: newSound } = await Audio.Sound.createAsync(
            AUDIO_FILES[meditation?.audio || ''],
            { shouldPlay: false, isLooping: true }
        );
        setSound(newSound);
        return newSound;
    };

    const toggleSound = async () => {
        if (!sound) {
            const newSound = await initializeSound();
            await newSound.playAsync();
            setIsPlaying(true);
        } else {
            if (isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
            } else {
                await sound.playAsync();
                setIsPlaying(true);
            }
        }
    };

    const adjustDuration = (direction: 'increase' | 'decrease') => {
        if (isPlaying) return;

        let newIndex = durationIndex;
        if (direction === 'increase' && durationIndex < DURATION_OPTIONS.length - 1) {
            newIndex = durationIndex + 1;
        } else if (direction === 'decrease' && durationIndex > 0) {
            newIndex = durationIndex - 1;
        }

        setDurationIndex(newIndex);
        setSecondsRemaining(DURATION_OPTIONS[newIndex] * 60);
    };

    const resetMeditation = async () => {
        if (sound) {
            await sound.stopAsync();
            await sound.setPositionAsync(0);
        }
        setIsPlaying(false);
        setSecondsRemaining(DURATION_OPTIONS[durationIndex] * 60);
        setAudioProgress(0);
    };

    if (!meditation) return <Text>Meditation not found</Text>;

    const formattedTimeMinutes = Math.floor(secondsRemaining / 60);
    const formattedTimeSeconds = secondsRemaining % 60;
    const totalSeconds = DURATION_OPTIONS[durationIndex] * 60;
    const progressPercentage = ((totalSeconds - secondsRemaining) / totalSeconds) * 100;

    return (
        <View className="flex-1">
            <ImageBackground
                source={MEDITATION_IMAGES[meditation.image as keyof typeof MEDITATION_IMAGES]}
                resizeMode="cover"
                className="flex-1"
            >
                <AppGradient colors={['transparent', 'rgba(0,0,0,0.8)']}>
                    <Pressable onPress={() => router.back()} className="absolute top-16 left-6 z-10">
                        <AntDesign name="left" size={50} color="white" />
                    </Pressable>

                    <View className="flex-1 justify-center">
                        <View className="mx-auto bg-neutral-200 rounded-full w-44 h-44 justify-center items-center relative">
                            {/* Progress ring */}
                            <View
                                className="absolute inset-0 rounded-full border-4 border-blue-500"
                                style={{
                                    borderTopColor: progressPercentage > 0 ? '#3b82f6' : 'transparent',
                                    borderRightColor: progressPercentage > 25 ? '#3b82f6' : 'transparent',
                                    borderBottomColor: progressPercentage > 50 ? '#3b82f6' : 'transparent',
                                    borderLeftColor: progressPercentage > 75 ? '#3b82f6' : 'transparent',
                                }}
                            />
                            <Text className="text-4xl text-blue-800 font-rmono font-bold">
                                {formattedTimeMinutes.toString().padStart(2, '0')}:
                                {formattedTimeSeconds.toString().padStart(2, '0')}
                            </Text>
                        </View>

                        {/* Duration Adjustment Controls */}
                        <View className="flex-row justify-center items-center mt-8 gap-6">
                            <Pressable
                                onPress={() => adjustDuration('decrease')}
                                disabled={isPlaying || durationIndex === 0}
                                className="bg-white/20 rounded-full p-3"
                            >
                                <MaterialIcons name="remove" size={32} color="white" />
                            </Pressable>

                            <View className="bg-white/30 px-6 py-3 rounded-2xl">
                                <Text className="text-white text-lg font-semibold">
                                    {DURATION_OPTIONS[durationIndex]} min
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => adjustDuration('increase')}
                                disabled={isPlaying || durationIndex === DURATION_OPTIONS.length - 1}
                                className="bg-white/20 rounded-full p-3"
                            >
                                <MaterialIcons name="add" size={32} color="white" />
                            </Pressable>
                        </View>

                        {/* Audio Progress Bar */}
                        {sound && (
                            <View className="mt-8 mx-8">
                                <View className="bg-white/20 h-2 rounded-full overflow-hidden">
                                    <View
                                        className="bg-white h-full rounded-full"
                                        style={{ width: `${audioProgress}%` }}
                                    />
                                </View>
                                <Text className="text-white/70 text-center mt-2 text-sm">
                                    Audio: {Math.round(audioProgress)}%
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="mb-5 gap-4">
                        <CustomButton
                            title={isPlaying ? 'Pause' : 'Start Meditation'}
                            onPress={toggleSound}
                        />
                        {sound && (
                            <CustomButton
                                title="Reset"
                                onPress={resetMeditation}
                                containerStyles="bg-white/20"
                                textStyles="text-white"
                            />
                        )}
                    </View>
                </AppGradient>
            </ImageBackground>

            <CompletionModal
                visible={showCompletionModal}
                onClose={() => {
                    setShowCompletionModal(false);
                    router.back();
                }}
                duration={DURATION_OPTIONS[durationIndex]}
                meditationTitle={meditation.title}
            />
        </View>
    );
}
