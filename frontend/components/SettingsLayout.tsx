import { Children, cloneElement, Fragment, isValidElement, ReactElement, ReactNode } from 'react';
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import MenuHeader from './MenuHeader';
import { useAccountStore } from '@/systems/account';
import Animated from 'react-native-reanimated';
import { useSettingsPress } from '@/systems/settingsMotion';

export function SettingsLayout({ title, children }: { title: string; children: ReactNode }) {
    return <SafeAreaView style={styles.page} edges={['left', 'right', 'bottom']}>
        <MenuHeader name={title} />
        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>;
}

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
    const flatten = (nodes: ReactNode): ReactNode[] => Children.toArray(nodes).flatMap(node =>
        isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment
            ? flatten(node.props.children) : [node]);
    const content = flatten(children);
    const lastRow = content.findLastIndex(node => isValidElement(node) && node.type === SettingsRow);
    return <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionContent}>
            {content.map((node, index) => isValidElement(node) && node.type === SettingsRow
                ? cloneElement(node as ReactElement<SettingsRowProps>, { last: index === lastRow })
                : <View key={isValidElement(node) ? node.key : index} style={styles.sectionText}>{node}</View>)}
        </View>
    </View>;
}

type SettingsRowProps = {
    title: string; description?: string; onPress: () => void; danger?: boolean; disabled?: boolean; accountAction?: boolean;
    last?: boolean;
};

export function SettingsRow({ title, description, onPress, danger, disabled, accountAction, last }: SettingsRowProps) {
    const busy = useAccountStore(s => !!accountAction && s.isLoading);
    const isDisabled = disabled || busy;
    const { animatedStyle, pressIn, pressOut } = useSettingsPress();
    return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!isDisabled, busy }}
        disabled={isDisabled} onPress={onPress}
        onPressIn={pressIn} onPressOut={pressOut}
        style={[styles.row, last && styles.lastRow, isDisabled && styles.disabled]}>
        <Animated.View pointerEvents="none" style={[styles.pressFeedback, animatedStyle]} />
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
    content: { paddingBottom: 32, width: '100%', maxWidth: 720, alignSelf: 'center' },
    section: { width: '100%' },
    sectionHeader: { backgroundColor: colors.grayLight, paddingHorizontal: 22, paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: colors.grayLight },
    sectionTitle: { fontSize: 14, lineHeight: 22, fontWeight: '500', color: '#625C53' },
    sectionContent: { paddingVertical: 8 },
    sectionText: { paddingHorizontal: 22 },
    row: { minHeight: 64, paddingHorizontal: 22, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', gap: 16, overflow: 'hidden',
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.grayLight },
    rowText: { flex: 1 },
    lastRow: { borderBottomWidth: 0 },
    rowTitle: { fontSize: 18, lineHeight: 26, color: colors.black },
    description: { fontSize: 14, lineHeight: 22, color: '#625C53', marginTop: 5 },
    danger: { color: '#AD3028' },
    pressFeedback: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.grayLight },
    disabled: { opacity: 0.55 },
});
