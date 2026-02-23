import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CreditCard, ChevronLeft, Wallet, Landmark, DollarSign, Smartphone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PaymentScreen() {
  const [showCardDetails, setShowCardDetails] = useState(false);

  if (showCardDetails) {
    return (
      <View className="flex-1 bg-white">
        <LinearGradient 
          colors={['#FFFFFF', '#E2E8F0']}
          className="pt-16 pb-24 px-6 rounded-b-[40px] flex-row justify-center items-center relative z-10 border-b border-gray-200"
        >
          <TouchableOpacity 
            className="absolute left-6 top-16 p-2 bg-white rounded-full shadow-sm" 
            onPress={() => setShowCardDetails(false)}
          >
            <ChevronLeft color="#0F172A" size={24} />
          </TouchableOpacity>
          <Text className="text-[#0F172A] text-xl font-bold mt-2">Card Details</Text>
        </LinearGradient>
        
        <View className="-mt-16 px-6 z-20">
          <View className="bg-[#1E3A8A] rounded-3xl p-6 shadow-lg h-52 justify-between">
            <View className="flex-row justify-between items-center">
              <CreditCard color="#94A3B8" size={32} />
              <View className="bg-[#2563EB] px-3 py-1 rounded-full">
                 <Text className="text-white text-xs font-bold tracking-wider">PRIMARY</Text>
              </View>
            </View>
            <View>
              <Text className="text-[#94A3B8] text-xs mb-1 font-medium">CARD NUMBER</Text>
              <Text className="text-white text-xl tracking-widest font-mono font-bold">**** **** **** 7550</Text>
            </View>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-[#94A3B8] text-[10px] font-medium">CARDHOLDER</Text>
                <Text className="text-white font-bold text-sm tracking-widest">ALEX RIDER</Text>
              </View>
              <View>
                <Text className="text-[#94A3B8] text-[10px] font-medium">VALID THRU</Text>
                <Text className="text-white font-bold text-sm">12/28</Text>
              </View>
            </View>
          </View>
        </View>
  
        <View className="flex-1 px-6 mt-8 justify-between pb-28">
          <View>
            <Text className="text-gray-500 text-center px-4 leading-6">
              Link your third-party payment gateways securely for route tolls and premium features.
            </Text>
          </View>
  
          {/* Pill Shaped Buttons */}
          <View className="gap-y-4">
            <TouchableOpacity className="bg-[#0F172A] py-4 rounded-full items-center shadow-sm">
              <Text className="text-white font-bold text-sm">ADD NEW CARD</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#2563EB] py-4 rounded-full items-center shadow-sm">
              <Text className="text-white font-bold text-sm">PROCEED TO PAY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <LinearGradient 
        colors={['#FFFFFF', '#E2E8F0']}
        className="pt-16 pb-6 px-6 rounded-b-[40px] flex-row justify-center items-center z-10 shadow-sm border-b border-gray-200"
      >
        <Text className="text-[#0F172A] text-xl font-bold mt-2">Payment</Text>
      </LinearGradient>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        
        <Text className="text-xl font-bold text-[#0F172A] mb-4">Payment Summary</Text>
        
        <View className="bg-white border border-gray-200 rounded-3xl p-5 mb-6 shadow-sm">
          <Text className="text-base font-bold text-[#0F172A] mb-4">Monthly Spending</Text>
          
          <View className="flex-row justify-between mb-6">
            <View className="flex-1 border-2 border-[#2563EB] rounded-xl p-3 items-center mr-2 bg-blue-50">
              <Text className="text-gray-500 text-xs mb-1">Total</Text>
              <Text className="text-[#2563EB] font-bold text-base">RM3,610.50</Text>
            </View>
            <View className="flex-1 border-2 border-[#94A3B8] rounded-xl p-3 items-center mr-2 bg-slate-50">
              <Text className="text-gray-500 text-xs mb-1">Avg/Month</Text>
              <Text className="text-[#10B981] font-bold text-base">RM601.75</Text>
            </View>
            <View className="flex-1 border-2 border-[#FBBF24] rounded-xl p-3 items-center bg-yellow-50">
              <Text className="text-gray-500 text-xs mb-1">Highest</Text>
              <Text className="text-[#D97706] font-bold text-base">Apr - RM890</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-end h-32 px-2 border-l border-b border-gray-200 pb-1">
            <View className="w-8 h-[45%] bg-[#94A3B8] rounded-t-md"><Text className="absolute -bottom-5 text-[10px] text-gray-500 w-8 text-center">Jan</Text></View>
            <View className="w-8 h-[60%] bg-[#2563EB] rounded-t-md"><Text className="absolute -bottom-5 text-[10px] text-gray-500 w-8 text-center">Feb</Text></View>
            <View className="w-8 h-[35%] bg-[#94A3B8] rounded-t-md"><Text className="absolute -bottom-5 text-[10px] text-gray-500 w-8 text-center">Mar</Text></View>
            <View className="w-8 h-[90%] bg-[#EF4444] rounded-t-md"><Text className="absolute -bottom-5 text-[10px] text-[#0F172A] font-bold w-8 text-center">Apr</Text></View>
            <View className="w-8 h-[75%] bg-[#EF4444] rounded-t-md"><Text className="absolute -bottom-5 text-[10px] text-gray-500 w-8 text-center">May</Text></View>
            <View className="w-8 h-[50%] bg-[#2563EB] rounded-t-md"><Text className="absolute -bottom-5 text-[10px] text-gray-500 w-8 text-center">Jun</Text></View>
          </View>
        </View>

        <Text className="text-xl font-bold text-[#0F172A] mb-4">Payment Methods</Text>
        
        <View className="gap-y-3 mb-8">
          <TouchableOpacity 
            onPress={() => setShowCardDetails(true)}
            className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm"
          >
            <View className="flex-row items-center">
              <View className="bg-[#2563EB] p-3 rounded-xl mr-4">
                <CreditCard color="white" size={24} />
              </View>
              <View>
                <Text className="text-base font-bold text-[#0F172A]">Credit Card</Text>
                <Text className="text-xs text-gray-500">**** **** **** 4532</Text>
              </View>
            </View>
            <Text className="font-bold text-lg text-[#0F172A]">RM1,240.50</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <View className="flex-row items-center">
              <View className="bg-[#2563EB] p-3 rounded-xl mr-4">
                <Wallet color="white" size={24} />
              </View>
              <View>
                <Text className="text-base font-bold text-[#0F172A]">Digital Wallet</Text>
                <Text className="text-xs text-gray-500">PayPal Account</Text>
              </View>
            </View>
            <Text className="font-bold text-lg text-[#0F172A]">RM856.30</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <View className="flex-row items-center">
              <View className="bg-[#2563EB] p-3 rounded-xl mr-4">
                <Landmark color="white" size={24} />
              </View>
              <View>
                <Text className="text-base font-bold text-[#0F172A]">Bank Account</Text>
                <Text className="text-xs text-gray-500">Chase **** 7890</Text>
              </View>
            </View>
            <Text className="font-bold text-lg text-[#0F172A]">RM3,420.75</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <View className="flex-row items-center">
              <View className="bg-[#2563EB] p-3 rounded-xl mr-4">
                <Smartphone color="white" size={24} />
              </View>
              <View>
                <Text className="text-base font-bold text-[#0F172A]">Mobile Payment</Text>
                <Text className="text-xs text-gray-500">Apple Pay</Text>
              </View>
            </View>
            <Text className="font-bold text-lg text-[#0F172A]">RM124.00</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xl font-bold text-[#0F172A] mb-4">Recent Transactions</Text>
        
        <View className="gap-y-3 mb-4">
          <View className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <View className="flex-row items-center">
              <View className="border border-red-500 p-2 rounded-lg mr-4 bg-red-50">
                <DollarSign color="#EF4444" size={20} />
              </View>
              <View>
                <Text className="text-sm font-bold text-[#0F172A]">Highway Toll - Route 101</Text>
                <Text className="text-xs text-gray-400">Feb 20</Text>
              </View>
            </View>
            <Text className="font-bold text-base text-red-500">RM12.50</Text>
          </View>

          <View className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <View className="flex-row items-center">
              <View className="border border-red-500 p-2 rounded-lg mr-4 bg-red-50">
                <DollarSign color="#EF4444" size={20} />
              </View>
              <View>
                <Text className="text-sm font-bold text-[#0F172A]">Parking Fee</Text>
                <Text className="text-xs text-gray-400">Feb 19</Text>
              </View>
            </View>
            <Text className="font-bold text-base text-red-500">RM8.00</Text>
          </View>

          <View className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <View className="flex-row items-center">
              <View className="border border-red-500 p-2 rounded-lg mr-4 bg-red-50">
                <DollarSign color="#EF4444" size={20} />
              </View>
              <View>
                <Text className="text-sm font-bold text-[#0F172A]">Gas Station</Text>
                <Text className="text-xs text-gray-400">Feb 19</Text>
              </View>
            </View>
            <Text className="font-bold text-base text-red-500">RM45.00</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}