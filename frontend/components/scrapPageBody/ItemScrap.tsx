import { Image as SvgImage } from 'expo-image';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Feather } from '@expo/vector-icons';
import { TrashIcon } from '../Icons';
import ScrapSummary from './ScrapSummary';
import { colors } from '@/constants/colors';
import { IMAGES } from '@/constants/data';
import { fontSize, scale, space } from '@/constants/sizes';
import { formatScrapDate, ScrapItem, useScrapStore } from '@/systems/scrap';

export default function ItemScrap({ item }: { item: ScrapItem }) {
    const remove = useScrapStore(s => s.remove);
    const deleting = useScrapStore(s => s.deletingIds.includes(item.id));
    const expanded = useScrapStore(s => s.expandedIds.includes(item.id));
    const toggleExpanded = useScrapStore(s => s.toggleExpanded);
    return (
        <View>
        <ReanimatedSwipeable overshootRight={false} rightThreshold={40}
            renderRightActions={() => (
                <Pressable style={styles.deleteButton} accessibilityRole="button"
                    accessibilityLabel="스크랩 삭제" accessibilityState={{ disabled: deleting, busy: deleting }}
                    disabled={deleting} onPress={() => remove(item.id)}>
                    {deleting ? <ActivityIndicator color={colors.white} /> : <TrashIcon />}
                </Pressable>
            )}>
        <Pressable style={styles.row} accessibilityRole="button"
            accessibilityState={{ expanded }} onPress={() => toggleExpanded(item.id)}
            accessibilityLabel={`${formatScrapDate(item.savedAt)}, ${item.summary.content}`}
            accessibilityHint="누르면 요약 전문을 펼치거나 접습니다. 왼쪽으로 밀면 삭제 버튼이 나타납니다."
            accessibilityActions={[{ name: 'delete', label: '스크랩 삭제' }]}
            onAccessibilityAction={event => { if (event.nativeEvent.actionName === 'delete') remove(item.id); }}>
            <Text style={styles.date}>{formatScrapDate(item.savedAt)}</Text>
            <Image source={IMAGES[item.summary.personaId]?.TOKEN ?? IMAGES.DEFAULT.TOKEN}
                style={styles.token} resizeMode="contain" />
            <View style={styles.message}>
                <SvgImage source={require('@/assets/images/scrap-tail.svg')}
                    style={styles.tail} contentFit="contain" />
                <View style={styles.bubble}>
                    <Text style={styles.summary} numberOfLines={1} ellipsizeMode="tail">
                        {`“${item.summary.content}”`}
                    </Text>
                </View>
            </View>
            <Feather name="more-vertical" size={scale(48)} color={colors.black} />
        </Pressable>
        </ReanimatedSwipeable>
        <ScrapSummary item={item} />
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        backgroundColor: colors.white,
        flexDirection: 'row', alignItems: 'center', gap: scale(16),
        paddingHorizontal: space.contentPadding, paddingVertical: scale(32),
        borderTopWidth: 2, borderTopColor: colors.grayLight,
    },
    deleteButton: { height: '100%', aspectRatio: 1, backgroundColor: '#C62828', alignItems: 'center', justifyContent: 'center' },
    date: { color: colors.black, fontSize: fontSize.menu, fontFamily: 'Pretendard',
        fontWeight: '500', textAlign: 'right', lineHeight: scale(60) },
    token: { width: scale(120), height: scale(120) },
    message: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center' },
    tail: { width: scale(35.25), height: scale(41.569) },
    bubble: { flex: 1, minWidth: 0, minHeight: scale(120), justifyContent: 'center',
        paddingHorizontal: scale(24), paddingVertical: scale(10),
        backgroundColor: colors.mainOpacity, borderRadius: scale(20) },
    summary: { color: colors.black, fontFamily: 'Pretendard', fontWeight: '500',
        fontSize: fontSize.menuBody, lineHeight: scale(60) },
});
