import { Stack } from "expo-router";
import Toast from "@/components/Toast";

export default function RootLayout() {
  return (
    <><Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
      }}
    /><Toast /></>
  );
}
