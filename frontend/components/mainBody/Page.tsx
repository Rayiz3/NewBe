import { scale, screen, space } from "@/constants/sizes";
import personas from '@/resources/personas.json';
import { summaryType } from "@/systems/request";
import { useScrollStore } from "@/systems/scroll";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { TailImage } from "../Icons";
import Content from "./Content";
import Title from "./Title";


type Props = {
    session: summaryType,
    idx: number,
}

export default function Page({session, idx}: Props) {
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

    return (
        <View key={`page-${idx}`} style={styles.container}>
            <Title title={persona?.categoryName || ""} category={session.category}/>
            <Content content={session.content} animatedStyle={contentAnimatedStyle}/>
            <TailImage animatedStyle={contentAnimatedStyle} />
            <Animated.Image 
                source={require('../../assets/images/sample_figure.png')} 
                style={[styles.figure, animatedStyle]} 
                resizeMode="contain" 
            />
            <Image
                source={require('../../assets/images/sample_background.png')} 
                style={styles.background} 
                resizeMode="contain" 
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        width: screen.width,
        height: screen.height,
        paddingTop: scale(228),
        paddingHorizontal: space.mainPadding,
        paddingBottom: screen.height * 0.33,
    },
    figure: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: scale(1080),
        height: scale(1080),
        zIndex: 1,
    },
    background: {
        position: 'absolute',
        bottom: 0,
        width: scale(1080),
        height: scale(2340),
        zIndex: 0,
    }
})