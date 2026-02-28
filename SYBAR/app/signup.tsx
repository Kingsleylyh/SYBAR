import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { auth } from '../firebaseConfig'
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
  if (!email || !password || !confirmPassword || !name) {
    Alert.alert("Attention!", "Please fill in all fields.");
    return;
  }
  if (password !== confirmPassword) {
    Alert.alert("Ouh Oh!", "Passwords do not match.");
    return;
  }

  setIsLoading(true);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(userCredential.user, {
      displayName: name.trim()
    });

    Alert.alert("Success", "Account created successfully!");
    router.replace('/(tabs)');
  } catch (error: any) {
    Alert.alert("Sign Up Failed", error.message);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <LinearGradient colors={['#FFFFFF', '#E2E8F0']} className="flex-1">
      <SafeAreaView className="flex-1 px-6">
        
        <TouchableOpacity onPress={() => router.back()} className="absolute top-16 left-6 z-20 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>

        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center mb-10 mt-10">
              <Text className="text-3xl font-black text-[#0F172A] tracking-wide">Create Account</Text>
              <Text className="text-[#64748B] text-base mt-2">Join SYBAR today</Text>
            </View>

            <View className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 mb-6">
              
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-4">
                <User color="#94A3B8" size={20} />
                <TextInput 
                  className="flex-1 ml-3 text-base text-[#0F172A]"
                  placeholder="Full Name"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />
              </View>

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

              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-4">
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

              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-6">
                <Lock color="#94A3B8" size={20} />
                <TextInput 
                  className="flex-1 ml-3 text-base text-[#0F172A]"
                  placeholder="Confirm Password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <TouchableOpacity 
                onPress={handleSignUp}
                disabled={isLoading}
                className="bg-[#0F172A] py-4 rounded-2xl items-center shadow-md flex-row justify-center"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-bold text-lg">Sign Up</Text>
                )}
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}