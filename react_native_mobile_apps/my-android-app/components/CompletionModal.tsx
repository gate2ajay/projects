import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';

interface CompletionModalProps {
    visible: boolean;
    onClose: () => void;
    duration: number;
    meditationTitle: string;
}

const CompletionModal = ({ visible, onClose, duration, meditationTitle }: CompletionModalProps) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/70">
                <View className="bg-white rounded-3xl p-8 mx-6 items-center max-w-sm">
                    <View className="bg-green-100 rounded-full p-4 mb-4">
                        <MaterialCommunityIcons name="check-circle" size={64} color="#22c55e" />
                    </View>

                    <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                        Meditation Complete!
                    </Text>

                    <Text className="text-gray-600 text-center mb-6">
                        You've completed {duration} minutes of {meditationTitle} meditation.
                    </Text>

                    <Text className="text-gray-500 text-sm text-center mb-6">
                        Great job! Keep up your practice for a healthier mind and body.
                    </Text>

                    <Pressable
                        onPress={onClose}
                        className="bg-blue-600 rounded-xl px-8 py-4 w-full"
                    >
                        <Text className="text-white text-center font-semibold text-lg">
                            Continue
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

export default CompletionModal;
