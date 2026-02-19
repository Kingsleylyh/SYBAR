import { View, Text, ScrollView } from 'react-native';

export default function HomeScreen() {
  const posts = [
    { id: 1, title: 'Route Deployed', desc: 'New algorithm active downtown.', color: 'bg-[#FF7A00]' },
    { id: 2, title: 'Traffic Alert', desc: 'Heavy congestion on highway 4.', color: 'bg-[#412048]' },
    { id: 3, title: 'System Update', desc: 'App maintenance scheduled at 2 AM.', color: 'bg-[#FF7A00]' },
  ];

  return (
    <View className="flex-1 bg-white">
       <View className="bg-[#FF7A00] pt-16 pb-6 px-6 rounded-b-[30px]">
        <Text className="text-white text-2xl font-bold">Updates Feed</Text>
        <Text className="text-orange-100">Latest route optimization news</Text>
      </View>

      <ScrollView className="px-6 pt-6" contentContainerStyle={{ paddingBottom: 120 }}>
        {posts.map((item) => (
          <View key={item.id} className={`${item.color} p-5 mb-4 rounded-[20px] shadow-sm`}>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white font-bold text-lg">{item.title}</Text>
              <Text className="text-white opacity-70 text-xs">Just now</Text>
            </View>
            <View className="border-t border-white/20 pt-3">
               <Text className="text-white/90 leading-5">{item.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}