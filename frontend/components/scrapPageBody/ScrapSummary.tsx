import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/constants/colors';
import { fontSize, scale, space } from '@/constants/sizes';
import { isNewsUrlValid } from '@/systems/request';
import { ScrapItem, useScrapStore } from '@/systems/scrap';
import { LinkOriginIcon } from '../Icons';
import Animated from 'react-native-reanimated';
import { useScrapExpansion } from '@/systems/scrapMotion';

export default function ScrapSummary({ item }: { item: ScrapItem }) {
    const expanded = useScrapStore(s => s.expandedIds.includes(item.id));
    const { animatedStyle, measureContent } = useScrapExpansion(expanded);
    const openOriginal = useScrapStore(s => s.openOriginal);
    const toggleExpanded = useScrapStore(s => s.toggleExpanded);
    const opening = useScrapStore(s => s.openingId === item.id);
    const hasOriginal = isNewsUrlValid(item.summary.newsUrl);
    return (
        <Animated.View style={[styles.reveal, animatedStyle]} pointerEvents={expanded ? 'auto' : 'none'}
            accessibilityElementsHidden={!expanded} importantForAccessibility={expanded ? 'auto' : 'no-hide-descendants'}>
        <View style={[styles.container, styles.measuredContent]} onLayout={measureContent}>
            <View style={styles.box}>
                <Text style={styles.summary}>{item.summary.content}</Text>
                <Text style={styles.source}>출처: {item.summary.source?.trim() || '출처 미제공'} · AI 요약</Text>
            </View>
            <Pressable style={styles.originRow} accessibilityRole="link" accessibilityLabel="본문 보기"
                accessibilityState={{ disabled: !hasOriginal || opening, busy: opening }}
                disabled={!hasOriginal || opening} onPress={() => openOriginal(item.id)}>
                <LinkOriginIcon color={colors.black} />
                <Text style={styles.summary}>본문 보기</Text>
            </Pressable>
            <Pressable style={styles.handleButton} accessibilityRole="button" accessibilityLabel="요약 접기"
                onPress={() => toggleExpanded(item.id)}>
                <Image source={require('@/assets/images/scrap-collapse.svg')}
                    style={styles.handleImage} contentFit="contain" />
            </Pressable>
        </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    source: { fontSize: 13, lineHeight: 20, color: colors.black, marginTop: 12 },
    reveal: { overflow: 'hidden' },
    measuredContent: { position: 'absolute', top: 0, left: 0, right: 0 },
    container: { paddingHorizontal: space.contentPadding, paddingVertical: scale(32), gap: scale(24),
        borderTopWidth: 0.5, borderTopColor: colors.grayLight },
    box: { padding: space.contentPadding,
        backgroundColor: colors.mainOpacity, borderRadius: scale(24) },
    summary: { color: colors.black, fontFamily: 'Pretendard', fontWeight: '500',
        fontSize: fontSize.menuBody, lineHeight: scale(60) },
    originRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: scale(12) },
    handleButton: { alignItems: 'center', justifyContent: 'center' },
    handleImage: { width: scale(24), height: scale(54), transform: [{ rotate: '-90deg' }] },
});
