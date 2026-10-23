import { useEffect } from 'react';
import { initializeAccountSession } from '@/systems/account';
import { Stack } from "expo-router";
import Toast from "@/components/Toast";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  useEffect(initializeAccountSession, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}><Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
      }}
    /><Toast /></GestureHandlerRootView>
  );
}
