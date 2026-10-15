import { useEffect } from 'react';
import { Easing, ReduceMotion, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useToastStore } from './toast';

export function useToastMotion(id: number | undefined, visible: boolean) {
    const progress = useSharedValue(0);
    const finishExit = useToastStore(s => s.finishExit);
    useEffect(() => {
        if (id === undefined) return;
        progress.value = withTiming(visible ? 1 : 0, {
            duration: 180, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System,
        }, finished => {
            if (finished && !visible) runOnJS(finishExit)(id);
        });
    }, [id, visible, progress, finishExit]);
    return useAnimatedStyle(() => ({ opacity: progress.value,
        transform: [{ translateY: (1 - progress.value) * 16 }] }));
}
