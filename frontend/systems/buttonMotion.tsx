import { useEffect } from 'react';
import { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export function useButtonScale(disabled = false) {
    const scale = useSharedValue(1);
    const restore = () => {
        scale.value = withTiming(1, {
            duration: 160, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System,
        });
    };
    const enlarge = () => {
        if (disabled) return;
        scale.value = withTiming(1.08, {
            duration: 100, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System,
        });
    };
    useEffect(() => {
        if (disabled) scale.value = withTiming(1, { duration: 160, reduceMotion: ReduceMotion.System });
    }, [disabled, scale]);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    return { animatedStyle, enlarge, restore };
}
