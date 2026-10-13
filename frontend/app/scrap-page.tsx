import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MenuHeader from '@/components/MenuHeader';
import ItemScrap from '@/components/scrapPageBody/ItemScrap';
import { colors } from '@/constants/colors';
import { fontSize, scale, space } from '@/constants/sizes';
import { useScrapStore } from '@/systems/scrap';

export default function ScrapPage() {
    const items = useScrapStore(s => s.items);
    const load = useScrapStore(s => s.load);
    const isLoading = useScrapStore(s => s.isLoading);
    const error = useScrapStore(s => s.error);
    useEffect(() => { load(); }, [load]);
    const insets = useSafeAreaInsets();
    return (
        <View style={styles.container}>
            <MenuHeader name="스크랩" />
            <Text style={styles.count}>
                <Text style={styles.highlight}>{items.length}개</Text>의 스크랩이 있습니다.
            </Text>
            <FlatList style={styles.list} data={items} keyExtractor={item => item.id}
                refreshing={isLoading} onRefresh={load}
                ListHeaderComponent={error ? <Pressable onPress={load} accessibilityRole="button"><Text style={styles.empty}>{error} 눌러서 다시 시도</Text></Pressable> : null}
                renderItem={({ item }) => <ItemScrap item={item} />}
                contentContainerStyle={{ paddingBottom: insets.bottom }}
                ListFooterComponent={items.length ? <View style={styles.bottomBorder} /> : null}
                ListEmptyComponent={!isLoading && !error ? <Text style={styles.empty}>아직 스크랩한 뉴스가 없습니다.</Text> : null} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    count: { paddingHorizontal: space.contentPadding, paddingTop: scale(48),
        paddingBottom: scale(45), color: colors.black, fontFamily: 'Pretendard',
        fontSize: fontSize.menuBody, fontWeight: '500', lineHeight: scale(80) },
    highlight: { color: colors.highlight, fontWeight: '700' },
    list: { flex: 1 },
    bottomBorder: { borderBottomWidth: space.borderWidth, borderBottomColor: colors.grayLight },
    empty: { color: colors.black, fontSize: fontSize.menuBody, textAlign: 'center',
        paddingVertical: scale(120), paddingHorizontal: space.contentPadding },
});
