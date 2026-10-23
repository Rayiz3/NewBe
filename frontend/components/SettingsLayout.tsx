import { ReactNode } from 'react';
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { goBack } from '@/systems/navigation';

export function SettingsLayout({ title, children }: { title: string; children: ReactNode }) {
    return <SafeAreaView style={styles.page}>
        <View style={styles.header}>
            <Pressable onPress={goBack} style={styles.back} accessibilityRole="button" accessibilityLabel="뒤로 가기">
                <Feather name="arrow-left" size={26} color={colors.black} />
            </Pressable>
            <Text accessibilityRole="header" style={styles.title}>{title}</Text>
            <View style={styles.back} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>;
}

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
    return <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>;
}

export function SettingsRow({ title, description, onPress, danger, disabled, busy }: {
    title: string; description?: string; onPress: () => void; danger?: boolean; disabled?: boolean; busy?: boolean;
}) {
    return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled, busy: !!busy }}
        disabled={disabled} onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.disabled]}>
        <View style={styles.rowText}>
            <Text style={[styles.rowTitle, danger && styles.danger]}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
        {busy ? <ActivityIndicator color={colors.black} /> : <Feather name="chevron-right" size={20} color={colors.black} />}
    </Pressable>;
}

export const settingsStyles = StyleSheet.create({
    body: { fontSize: 16, lineHeight: 26, color: colors.black },
    note: { fontSize: 14, lineHeight: 22, color: '#625C53', paddingTop: 12 },
});
const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.white },
    header: { minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
        borderBottomWidth: 1, borderBottomColor: colors.grayLight },
    back: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
    title: { flex: 1, textAlign: 'center', fontSize: 21, fontWeight: '700', color: colors.black },
    content: { paddingBottom: 32, width: '100%', maxWidth: 720, alignSelf: 'center' },
    section: { paddingHorizontal: 22, paddingTop: 30, paddingBottom: 24,
        borderBottomWidth: 10, borderBottomColor: colors.main },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.black, marginBottom: 10 },
    row: { minHeight: 64, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', gap: 16,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.grayLight },
    rowText: { flex: 1 },
    rowTitle: { fontSize: 18, lineHeight: 26, color: colors.black },
    description: { fontSize: 14, lineHeight: 22, color: '#625C53', marginTop: 5 },
    danger: { color: '#AD3028' },
    pressed: { backgroundColor: colors.main },
    disabled: { opacity: 0.55 },
});
