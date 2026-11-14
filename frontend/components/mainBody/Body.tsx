import { colors } from "@/constants/colors";
import { usePersonaStore } from "@/systems/persona";
import { useRequestStore } from "@/systems/request";
import { handlePageScroll, useScrollStore } from "@/systems/scroll";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useNewsRefresh } from "@/systems/newsRefresh";
import Page from "./Page";


export default function Body() {
    const isLoading = useRequestStore(s => s.isLoading);
    const summaries = useRequestStore(s => s.summaries);
    const getSummaries = useRequestStore(s => s.getSummaries);
    const feed = usePersonaStore(s => s.feed);
    
    const pages = feed.filter(id => summaries[id]);
    const pager = useRef<ScrollView>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const pageCount = pages.length;
    useNewsRefresh();
    useEffect(() => {
        if (!size.width || !pageCount) return;
        const state = useScrollStore.getState();
        const index = Math.min(state.curPage, pageCount - 1);
        if (index !== state.curPage) state.setCurPage(index);
        pager.current?.scrollTo({ x: index * size.width, animated: false });
    }, [size.width, pageCount]);
   
    return (
        <ScrollView style={styles.container} onLayout={({ nativeEvent: { layout } }) =>
            setSize({ width: layout.width, height: layout.height })} contentContainerStyle={styles.content}
            nestedScrollEnabled alwaysBounceVertical showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isLoading && Object.keys(summaries).length > 0}
                onRefresh={getSummaries} tintColor={colors.highlight} colors={[colors.highlight]} />}>
        {isLoading && Object.keys(summaries).length === 0 ? (
            <View style={styles.loading} accessibilityRole="progressbar"
                accessibilityLabel="뉴스를 불러오는 중" accessibilityState={{ busy: true }}>
                <ActivityIndicator size="large" color={colors.highlight} />
            </View>
        ) : size.width > 0 && size.height > 0 ? (
        <ScrollView ref={pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={true}
        onMomentumScrollEnd={handlePageScroll}>
            {pages.map((personaId, idx) => {
                const session = summaries[personaId];
                if (!session) return null;

                return (
                    <Page
                        key={personaId}
                        session={session}
                        idx={idx}
                        width={size.width}
                        height={size.height}
                    />
                );
            })}
        </ScrollView>
        ) : null}
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: { flex: 1, width: '100%' },
    content: { flexGrow: 1 },
    loading: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
    },
});
