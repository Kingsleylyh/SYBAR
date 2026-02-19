import { View, Text, TouchableOpacity } from 'react-native';
import { CreditCard, ChevronLeft } from 'lucide-react-native';

export default function PaymentScreen() {
  return (
    <View className="flex-1 bg-white">
      {/* Curved Orange Header */}
      <View className="bg-[#FF7A00] pt-16 pb-24 px-6 rounded-b-[40px] flex-row justify-center items-center relative">
        <TouchableOpacity className="absolute left-6 top-16">
          <ChevronLeft color="white" size={28} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Payment Methods</Text>
      </View>
      
      {/* Overlapping Dark Purple Card */}
      <View className="-mt-16 px-6">
        <View className="bg-[#412048] rounded-2xl p-6 shadow-lg h-52 justify-between">
          <View className="flex-row justify-between items-center">
            <CreditCard color="#FF7A00" size={32} />
            <View className="bg-[#6B3E75] px-3 py-1 rounded-full">
               <Text className="text-white text-xs">Primary</Text>
            </View>
          </View>
          <View>
            <Text className="text-gray-300 text-xs mb-1">CARD NUMBER</Text>
            <Text className="text-white text-lg tracking-widest font-mono">**** **** **** 7550</Text>
          </View>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-gray-300 text-[10px]">CARDHOLDER</Text>
              <Text className="text-white font-bold text-sm">ALEX RIDER</Text>
            </View>
            <View>
              <Text className="text-gray-300 text-[10px]">VALID THRU</Text>
              <Text className="text-white font-bold text-sm">12/28</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Area */}
      <View className="flex-1 px-6 mt-8 justify-between pb-28">
        <View>
          <Text className="text-gray-500 text-center px-4 leading-5">
            Link your third-party payment gateways (e.g., Stripe, PayPal) securely for route tolls and premium features.
          </Text>
        </View>

        {/* Pill Shaped Buttons matching the design */}
        <View className="gap-y-4">
          <TouchableOpacity className="bg-[#412048] py-4 rounded-full items-center">
            <Text className="text-white font-bold text-sm">ADD NEW CARD</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#FF7A00] py-4 rounded-full items-center">
            <Text className="text-white font-bold text-sm">PROCEED TO PAY</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}