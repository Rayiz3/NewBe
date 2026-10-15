import { LayoutChangeEvent } from 'react-native';
import { Easing, ReduceMotion, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';

export function useScrapExpansion(expanded: boolean) {
    const contentHeight = useSharedValue(0);
    const height = useDerivedValue(() => withTiming(expanded ? contentHeight.value : 0, {
        duration: 200,
        easing: Easing.inOut(Easing.cubic),
        reduceMotion: ReduceMotion.System,
    }), [expanded]);
    const animatedStyle = useAnimatedStyle(() => ({ height: height.value }));
    const measureContent = (event: LayoutChangeEvent) => {
        contentHeight.value = event.nativeEvent.layout.height;
    };
    return { animatedStyle, measureContent };
}
