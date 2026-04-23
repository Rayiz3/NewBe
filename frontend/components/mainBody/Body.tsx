import { screen } from "@/constants/sizes";
import { usePersonaStore } from "@/systems/persona";
import { useRequestStore } from "@/systems/request";
import { useScrollStore } from "@/systems/scroll";
import { useEffect } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from "react-native";
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
    }, []);

    /*
    useEffect(() => {
        console.log(summaries);
    }, [summaries]);
    */
   
    return (
        <>{ (Object.keys(summaries).length > 0) &&
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
        </ScrollView>}</>
    )
}
// PERSONAS.getSummary(personaId)