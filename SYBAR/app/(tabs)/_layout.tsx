import { Tabs } from 'expo-router';
import { Home, Map as MapIcon, CreditCard, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF7A00', // Vibrant Orange
        tabBarInactiveTintColor: '#A0A0A0', // Muted Gray
        tabBarShowLabel: false, // Hides text to match the design's clean look
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#F4F4F5',
          borderRadius: 40,
          marginHorizontal: 20,
          marginBottom: 20,
          height: 65,
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Home size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ color }) => <MapIcon size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          tabBarIcon: ({ color }) => <CreditCard size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          tabBarIcon: ({ color }) => <User size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}