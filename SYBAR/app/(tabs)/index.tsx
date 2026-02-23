import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Bell, MoreVertical, AlertCircle, AlertTriangle, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const updates = [
    { id: 1, type: 'critical', title: 'Traffic Accident on Highway 101', desc: 'Major accident reported near Exit 45. Expect delays of 30+ minutes.', time: '15 mins ago' },
    { id: 2, type: 'warning', title: 'Road Construction on Main Street', desc: 'Lane closure from 9 AM to 5 PM. Use alternate routes.', time: '1 hour ago' },
    { id: 3, type: 'warning', title: 'Heavy Traffic on Downtown Bridge', desc: 'Congestion due to rush hour. Consider taking Route 5.', time: '2 hours ago' },
    { id: 4, type: 'info', title: 'New Traffic Signal Installed', desc: 'Traffic light now operational at Oak & Pine intersection.', time: '5 hours ago' },
    { id: 5, type: 'critical', title: 'Vehicle Breakdown on Interstate 90', desc: 'Right lane blocked. Tow truck en route.', time: '6 hours ago' }
  ];

  const getCardStyle = (type: string) => {
    switch(type) {
      case 'critical': return { color: '#E11D48', icon: AlertCircle, borderColorClass: 'border-[#E11D48]' };
      case 'warning': return { color: '#D97706', icon: AlertTriangle, borderColorClass: 'border-[#F59E0B]' };
      case 'info': return { color: '#2563EB', icon: Info, borderColorClass: 'border-[#3B82F6]' };
      default: return { color: '#64748B', icon: Info, borderColorClass: 'border-[#94A3B8]' };
    }
  };

  return (
    <View className="flex-1 bg-white">
      
      <LinearGradient 
        colors={['#FFFFFF', '#E2E8F0']}
        className="pt-16 pb-10 px-6 rounded-b-[40px] flex-row justify-between items-center z-10 shadow-sm border-b border-gray-200"
      >
        <View className="flex-row items-center">
          <Image 
            source={require('../../assets/images/SYBAR-Logo.png')} 
            className="w-10 h-10 mr-3 rounded-lg bg-white shadow-sm"
            resizeMode="contain"
          />
          <View>
            <Text className="text-2xl font-black text-[#0F172A] tracking-wide">SYBAR</Text>
            <Text className="text-[#64748B] text-xs font-small">Search Your Best Available Route</Text>
          </View>
        </View>
        
        <View className="flex-row items-center gap-1">
          <TouchableOpacity className="bg-white p-2.5 rounded-full shadow-sm">
            <Bell color="#0F172A" size={20} />
          </TouchableOpacity>
          <TouchableOpacity className="bg-white p-2.5 rounded-full shadow-sm">
            <MoreVertical color="#0F172A" size={20} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {updates.map((update) => {
          const { color, icon: Icon, borderColorClass } = getCardStyle(update.type);
          return (
            <View key={update.id} className={`flex-row bg-white border-[1.5px] rounded-2xl p-4 mb-4 shadow-sm ${borderColorClass}`}>
              <Icon color={color} size={24} className="mr-3 mt-0.5" />
              <View className="flex-1">
                <Text className="text-[17px] font-bold text-[#0F172A] mb-1">{update.title}</Text>
                <Text className="text-[14px] text-gray-600 leading-5 mb-3">{update.desc}</Text>
                <Text className="text-[12px] font-medium text-gray-400">{update.time}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}