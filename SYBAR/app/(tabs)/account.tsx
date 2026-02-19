import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight, Settings, Bell, Shield, LogOut } from 'lucide-react-native';

export default function AccountScreen() {
  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Large Orange Header */}
      <View className="bg-[#FF7A00] pt-20 pb-20 rounded-b-[40px] items-center">
        <Text className="text-white text-xl font-bold mb-4">Profile</Text>
      </View>

      {/* Floating Profile Picture overlapping the header */}
      <View className="-mt-14 items-center mb-6">
        <View className="w-28 h-28 bg-white rounded-full items-center justify-center shadow-lg border-4 border-white">
          {/* Replace text with <Image source={{uri: '...'}} /> */}
          <Text className="text-4xl">👤</Text>
        </View>
        <Text className="text-2xl font-bold text-[#412048] mt-3">Alex Rider</Text>
        <Text className="text-gray-500">ID: 8829-XJ-22</Text>
      </View>

      {/* Pill-shaped menu items */}
      <View className="px-6 gap-y-3 mt-4">
        {[
          { icon: Settings, label: 'Account Settings' },
          { icon: Bell, label: 'Notifications' },
          { icon: Shield, label: 'Privacy & Security' },
        ].map((item, index) => (
          <TouchableOpacity 
            key={index} 
            className="flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="bg-[#FF7A00] p-2 rounded-full mr-4">
                <item.icon color="white" size={20} />
              </View>
              <Text className="text-base font-bold text-[#412048]">{item.label}</Text>
            </View>
            <ChevronRight color="#FF7A00" size={20} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity className="flex-row items-center justify-center bg-[#412048] py-4 rounded-full mt-6">
          <LogOut color="white" size={20} className="mr-2" />
          <Text className="text-white font-bold">LOGOUT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}