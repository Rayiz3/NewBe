import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { useToastStore } from '@/systems/toast';
import { useToastMotion } from '@/systems/toastMotion';

export default function Toast() {
    const current = useToastStore(s => s.current);
    const visible = useToastStore(s => s.visible);
    const animatedStyle = useToastMotion(current?.id, visible);
    const insets = useSafeAreaInsets();
    if (!current) return null;
    return (
        <Animated.View pointerEvents="none" style={[styles.container, { bottom: insets.bottom + 112 }, animatedStyle]}>
            {current.loading
                ? <ActivityIndicator color={colors.highlight} accessibilityLabel={current.message} />
                : <Text style={styles.text}>{current.message}</Text>}
        </Animated.View>
    );
}
const styles = StyleSheet.create({
    container: { position: 'absolute', alignSelf: 'center', maxWidth: '90%',
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: colors.black, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    text: { color: colors.white, fontSize: 14, textAlign: 'center' },
});
