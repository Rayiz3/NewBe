import { screen } from "@/constants/sizes";
import { colors } from "@/constants/colors";
import { usePersonaStore } from "@/systems/persona";
import { useRequestStore } from "@/systems/request";
import { useScrollStore } from "@/systems/scroll";
import { useEffect } from "react";
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View } from "react-native";
import Page from "./Page";


export default function Body() {
    const isLoading = useRequestStore(s => s.isLoading);
    const summaries = useRequestStore(s => s.summaries);
    const getSummaries = useRequestStore(s => s.getSummaries);
    const feed = usePersonaStore(s => s.feed);
    
    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offset = e.nativeEvent.contentOffset.x;
        const pageIndex = Math.round(offset / screen.width);
        useScrollStore.getState().setCurPage(pageIndex);
    };

    useEffect(() => {
        getSummaries();
    }, [getSummaries]);
   
    return (
        <>{isLoading ? (
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
        onMomentumScrollEnd={handleScroll}>
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
        )}</>
    )
}
const styles = StyleSheet.create({
    loading: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
    },
});
