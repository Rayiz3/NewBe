import { Image as SvgImage } from 'expo-image';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { IMAGES } from '@/constants/data';
import { fontSize, scale, space } from '@/constants/sizes';
import { formatScrapDate, ScrapItem } from '@/systems/scrap';

export default function ItemScrap({ item }: { item: ScrapItem }) {
    return (
        <View style={styles.row} accessible accessibilityLabel={`${formatScrapDate(item.savedAt)}, ${item.summary.content}`}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row', alignItems: 'center', gap: scale(16),
        paddingHorizontal: space.contentPadding, paddingVertical: scale(32),
        borderTopWidth: space.borderWidth, borderTopColor: colors.grayLight,
    },
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
