import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Attention!", "Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)'); 
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#E2E8F0']} className="flex-1">
      <SafeAreaView className="flex-1 px-6">
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center mb-10 mt-10">
              <Image 
                source={require('../assets/images/SYBAR-Logo.png')} 
                className="w-24 h-24 rounded-2xl shadow-sm mb-4 bg-white"
                resizeMode="contain"
              />
              <Text className="text-3xl font-black text-[#0F172A] tracking-wide">Welcome Back</Text>
              <Text className="text-[#64748B] text-base mt-2">Sign in to sync your routes</Text>
            </View>

            {/* Input Fields */}
            <View className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 mb-6">
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-4">
                <Mail color="#94A3B8" size={20} />
                <TextInput 
                  className="flex-1 ml-3 text-base text-[#0F172A]"
                  placeholder="Email Address"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-2">
                <Lock color="#94A3B8" size={20} />
                <TextInput 
                  className="flex-1 ml-3 text-base text-[#0F172A]"
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity className="self-end mb-6">
                <Text className="text-[#2563EB] font-medium text-sm">Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleLogin}
                disabled={isLoading}
                className="bg-[#2563EB] py-4 rounded-2xl items-center shadow-md flex-row justify-center"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-bold text-lg">Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-4">
              <Text className="text-[#64748B] text-base">Do not have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text className="text-[#2563EB] font-bold text-base">Sign Up</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}