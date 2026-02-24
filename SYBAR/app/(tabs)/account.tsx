import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ChevronRight, LogOut, Info, Edit3, Shield } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function AccountScreen() {
  const menuItems = [
    { icon: Info, label: "About Us" },
    { icon: Edit3, label: "Edit Profile" },
    { icon: Shield, label: "Privacy & Security" },
  ];

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <LinearGradient
        colors={["#FFFFFF", "#E2E8F0"]}
        className="pt-16 pb-24 rounded-b-[40px] items-center border-b border-gray-200"
      >
        <Text className="text-[#0F172A] text-xl font-bold mb-4">Profile</Text>
      </LinearGradient>

      <View className="-mt-16 items-center mb-6">
        <View className="w-28 h-28 bg-[#2563EB] rounded-full items-center justify-center shadow-lg border-4 border-white mb-3">
          <Text className="text-white text-4xl font-bold">JD</Text>
        </View>
        <Text className="text-2xl font-bold text-[#0F172A]">John Doe</Text>
        <Text className="text-gray-500 text-sm mt-1">john.doe@example.com</Text>
      </View>

      <View className="px-5">
        <View className="flex-row justify-between mb-4 gap-x-4">
          <View className="flex-1 bg-white border border-[#2563EB] p-4 rounded-2xl items-center shadow-sm">
            <Text className="text-gray-500 text-xs mb-1">Member Since</Text>
            <Text className="text-[#2563EB] font-bold text-lg">Jan 2024</Text>
          </View>
          <View className="flex-1 bg-white border border-[#0F172A] p-4 rounded-2xl items-center shadow-sm">
            <Text className="text-gray-500 text-xs mb-1">Total Trips</Text>
            <Text className="text-[#0F172A] font-bold text-lg">147</Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-8 gap-x-4">
          <View className="flex-1 bg-white border border-gray-200 p-4 rounded-2xl items-center shadow-sm">
            <Text className="text-gray-500 text-xs mb-2">
              Distance Traveled
            </Text>
            <Text className="text-[#0F172A] font-black text-2xl">1,247</Text>
            <Text className="text-gray-400 text-xs">miles</Text>
          </View>
          <View className="flex-1 bg-white border border-gray-200 p-4 rounded-2xl items-center shadow-sm">
            <Text className="text-gray-500 text-xs mb-2">Time Saved</Text>
            <Text className="text-[#0F172A] font-black text-2xl">32</Text>
            <Text className="text-gray-400 text-xs">hours</Text>
          </View>
        </View>

        <Text className="text-xl font-bold text-[#0F172A] mb-4">Settings</Text>

        <View className="gap-y-3">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100"
            >
              <View className="flex-row items-center">
                <View className="bg-[#2563EB] p-2 rounded-full mr-4">
                  <item.icon color="white" size={20} />
                </View>
                <Text className="text-base font-bold text-[#0F172A]">
                  {item.label}
                </Text>
              </View>
              <ChevronRight color="#2563EB" size={20} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity className="flex-row items-center justify-center bg-[#0F172A] py-4 rounded-full mt-6">
            <LogOut color="white" size={20} className="mr-2" />
            <Text className="text-white font-bold">LOGOUT</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-center text-gray-400 text-sm mt-10">
          SYBAR App Version 1.1.0
        </Text>
      </View>
    </ScrollView>
  );
}
