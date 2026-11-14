import { IMAGES } from "@/constants/data";
import personas from '@/resources/personas.json';
import { summaryType } from "@/systems/request";
import { useScrollStore } from "@/systems/scroll";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { TailImage } from "../Icons";
import { newsLayout } from "@/systems/responsiveLayout";
import Content from "./Content";
import Title from "./Title";


type Props = {
    session: summaryType,
    idx: number,
    width: number,
    height: number,
}

export default function Page({session, idx, width, height}: Props) {
    const curPage = useScrollStore(s => s.curPage);
    const persona = personas.find(p => p.id === session.personaId);
    const progress = useSharedValue(0);
    const progressContent = useSharedValue(0);
    useEffect(() => {
        progress.value = 0;
        progressContent.value = 0;
        if (curPage === idx) {
            progress.value = withTiming(1, { duration: 480 });
            progressContent.value = withDelay(360, withTiming(1, { duration: 480 }));
        }
    }, [curPage, idx, progress, progressContent])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: progress.value,
            transform: [{
                translateY: interpolate(
                    progress.value,
                    [0, 1],
                    [10, 0]
                ),
            }],
        };
    })

    const contentAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: progressContent.value,
            transform: [{
                translateY: interpolate(
                    progressContent.value,
                    [0, 1],
                    [8, 0]
                ),
            }],
        };
    })

    const { split, figureSize } = newsLayout(width, height);
    const viewHeight = split ? Math.max(220, height - 80) : height;
    const unit = width / 1080;
    return (
        <View key={`page-${idx}`} style={[styles.container, { width, height: viewHeight }] }>
            <View style={{ flex: 1, width: split ? '76%' : '100%',
                paddingTop: split ? 64 : 228 * unit, paddingHorizontal: split ? 20 : 60 * unit,
                paddingBottom: split ? 20 : height * .33 }}>
            <Title title={persona?.categoryName || ""} category={session.category} source={session.source} />
            <Content session={session} animatedStyle={contentAnimatedStyle}/>
            {!split && <TailImage animatedStyle={contentAnimatedStyle} />}
            </View>
            <Animated.Image 
                source={IMAGES[session.personaId]["STAND"]} 
                style={[styles.figure, { width: split ? figureSize : width, height: split ? figureSize : width }, animatedStyle]}
                resizeMode="contain" 
            />
            <Image
                source={IMAGES[session.personaId]["BACKGROUND"]} 
                style={[styles.background, { width, height: split ? viewHeight : 2340 * unit }]}
                resizeMode={split ? "cover" : "contain"}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    figure: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        zIndex: 1,
    },
    background: {
        position: 'absolute',
        bottom: 0,
        zIndex: 0,
    }
})
