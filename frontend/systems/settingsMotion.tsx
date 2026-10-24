import { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

export function useSettingsPress() {
    const spread = useSharedValue(0);
    const opacity = useSharedValue(0);
    const pressIn = () => {
        spread.value = 0;
        opacity.value = 1;
        spread.value = withTiming(1, {
            duration: 260, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System,
        });
    };
    const pressOut = () => {
        opacity.value = withDelay(120, withTiming(0, {
            duration: 180, reduceMotion: ReduceMotion.System,
        }));
    };
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scaleX: spread.value }],
    }));
    return { animatedStyle, pressIn, pressOut };
}
