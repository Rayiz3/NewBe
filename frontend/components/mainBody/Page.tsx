import { IMAGES } from "@/constants/data";
import { colors } from "@/constants/colors";
import { fontSize, scale, screen, space } from "@/constants/sizes";
import personas from '@/resources/personas.json';
import { isNewsUrlValid, useRequestStore, summaryType } from "@/systems/request";
import { useScrollStore } from "@/systems/scroll";
import { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
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
    const isOpening = useRequestStore(s => s.openingPersonaId === session.personaId);
    const openOriginalNews = useRequestStore(s => s.openOriginalNews);
    const hasNewsUrl = isNewsUrlValid(session.newsUrl);

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
                source={IMAGES[session.personaId]["STAND"]} 
                style={[styles.figure, animatedStyle]} 
                resizeMode="contain" 
            />
            <Image
                source={IMAGES[session.personaId]["BACKGROUND"]} 
                style={styles.background} 
                resizeMode="contain" 
            />
            <Pressable
                accessibilityRole="link"
                accessibilityLabel="원문 보기"
                accessibilityHint={hasNewsUrl ? '브라우저에서 이 뉴스의 원문을 엽니다.' : '원문 링크가 제공되지 않았습니다.'}
                accessibilityState={{ disabled: !hasNewsUrl || isOpening, busy: isOpening }}
                disabled={!hasNewsUrl || isOpening}
                onPress={() => openOriginalNews(session.personaId)}
                style={({ pressed }) => [styles.sourceButton, pressed && styles.sourceButtonPressed,
                    (!hasNewsUrl || isOpening) && styles.sourceButtonDisabled]}>
                <Text style={styles.sourceButtonText}>원문 보기</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    sourceButton: {
        position: 'absolute',
        left: space.mainPadding,
        bottom: scale(302),
        width: scale(340),
        minHeight: 48,
        paddingHorizontal: scale(32),
        paddingVertical: scale(28),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: scale(100),
        backgroundColor: colors.light.backgroundOpacity,
        zIndex: 2,
    },
    sourceButtonText: {
        flexShrink: 1,
        color: colors.main,
        fontSize: fontSize.menuBody,
        lineHeight: fontSize.menuBody * 1.45,
        fontWeight: '700',
        textAlign: 'center',
    },
    sourceButtonPressed: { opacity: 0.85 },
    sourceButtonDisabled: { opacity: 0.6 },
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
