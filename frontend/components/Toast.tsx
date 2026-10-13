import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { useToastStore } from '@/systems/toast';

export default function Toast() {
    const message = useToastStore(s => s.message);
    const insets = useSafeAreaInsets();
    if (!message) return null;
    return (
        <View pointerEvents="none" style={[styles.container, { bottom: insets.bottom + 112 }]}>
            <Text style={styles.text}>{message}</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { position: 'absolute', alignSelf: 'center', maxWidth: '90%',
        backgroundColor: colors.black, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    text: { color: colors.white, fontSize: 14, textAlign: 'center' },
});
