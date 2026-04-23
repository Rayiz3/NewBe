import { colors } from "@/constants/colors";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";


type Props = {
    active: boolean
}

export function Dot({ active }: Props) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 220 });
  }, [active, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const size = 8 + progress.value * 2;

    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: interpolateColor(
        progress.value,  // input
        [0, 1],  // input range
        [colors.gray, colors.black]  // output range
      ),
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.gray,
    },
})