import { Stack } from "expo-router";
import Toast from "@/components/Toast";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}><Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
      }}
    /><Toast /></GestureHandlerRootView>
  );
}
