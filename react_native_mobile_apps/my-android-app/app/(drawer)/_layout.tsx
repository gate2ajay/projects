import Colors from '@/constants/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../../context/AuthContext';

function CustomDrawerContent(props: any) {
    const { signOut, user } = useAuth()!;

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
            <View className="p-6 border-b border-gray-100 mb-2 bg-white">
                <View className="h-20 w-20 bg-blue-100 rounded-full mb-4 items-center justify-center border-2 border-blue-500">
                    <Text className="text-3xl font-bold text-blue-600">{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                </View>
                <Text className="text-xl font-bold text-gray-800">{user?.name || 'User'}</Text>
                <Text className="text-gray-500 text-sm">{user?.email || ''}</Text>
            </View>

            <View className="flex-1 pt-2">
                <DrawerItemList {...props} />
            </View>

            <View className="p-4 border-t border-gray-100 mb-4">
                <DrawerItem
                    label="Logout"
                    icon={({ color, size }) => <MaterialIcons name="logout" size={size} color={color} />}
                    onPress={() => {
                        signOut();
                    }}
                    labelStyle={{ marginLeft: -16, fontSize: 16 }}
                    activeTintColor={Colors.primary}
                    inactiveTintColor="#4b5563"
                />
            </View>
        </DrawerContentScrollView>
    );
}

export default function DrawerLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerShown: false,
                    drawerActiveTintColor: Colors.primary,
                    drawerInactiveTintColor: '#4b5563',
                    drawerLabelStyle: { marginLeft: -16, fontSize: 16 },
                    drawerStyle: { width: '80%' },
                }}
            >
                <Drawer.Screen
                    name="(tabs)"
                    options={{
                        drawerLabel: 'Home',
                        title: 'Home',
                        drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
                    }}
                />
                <Drawer.Screen
                    name="profile"
                    options={{
                        drawerLabel: 'Profile',
                        title: 'Profile',
                        drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
                    }}
                />
                <Drawer.Screen
                    name="about"
                    options={{
                        drawerLabel: 'About',
                        title: 'About',
                        drawerIcon: ({ color, size }) => <Ionicons name="information-circle-outline" size={size} color={color} />,
                    }}
                />
                <Drawer.Screen
                    name="license"
                    options={{
                        drawerLabel: 'License',
                        title: 'License',
                        drawerIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}
