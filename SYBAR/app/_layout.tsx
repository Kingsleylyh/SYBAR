import React, { useState, useEffect } from "react";
import { View, Text, Image } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { LinearGradient } from "expo-linear-gradient";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <LinearGradient
        colors={["#FFFFFF", "#E2E8F0"]}
        className="flex-1 items-center justify-center relative"
      >
        <Image
          source={require("../assets/images/SYBAR-Logo.png")}
          className="w-32 h-32 rounded-3xl bg-white shadow-lg"
          resizeMode="contain"
        />
        <View className="absolute bottom-16 items-center w-full">
          <Text className="text-[#2563EB] text-4xl font-black tracking-widest mb-1 shadow-sm">
            SYBAR
          </Text>
          <Text className="text-[#64748B] text-sm font-medium tracking-wide">
            Search Your Best Available Route
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
