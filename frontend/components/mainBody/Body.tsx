import { colors } from "@/constants/colors";
import { usePersonaStore } from "@/systems/persona";
import { useRequestStore } from "@/systems/request";
import { handlePageScroll } from "@/systems/scroll";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useNewsRefresh } from "@/systems/newsRefresh";
import Page from "./Page";


export default function Body() {
    const isLoading = useRequestStore(s => s.isLoading);
    const summaries = useRequestStore(s => s.summaries);
    const getSummaries = useRequestStore(s => s.getSummaries);
    const feed = usePersonaStore(s => s.feed);
    
    useNewsRefresh();
   
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}
            nestedScrollEnabled alwaysBounceVertical showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isLoading && Object.keys(summaries).length > 0}
                onRefresh={getSummaries} tintColor={colors.highlight} colors={[colors.highlight]} />}>
        {isLoading && Object.keys(summaries).length === 0 ? (
            <View style={styles.loading} accessibilityRole="progressbar"
                accessibilityLabel="뉴스를 불러오는 중" accessibilityState={{ busy: true }}>
                <ActivityIndicator size="large" color={colors.highlight} />
            </View>
        ) : (
        <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={true}
        onMomentumScrollEnd={handlePageScroll}>
            {feed.map((personaId, idx) => {
                const session = summaries[personaId];
                if (!session) return null;

                return (
                    <Page
                        key={personaId}
                        session={session}
                        idx={idx}
                    />
                );
            })}
        </ScrollView>
        )}
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
