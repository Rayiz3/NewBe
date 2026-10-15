import { colors } from "@/constants/colors";
import { fontSize, scale, space } from "@/constants/sizes";
import { shadowStyle } from "@/constants/typography";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { isNewsUrlValid, summaryType, useRequestStore } from "@/systems/request";
import { LinkOriginIcon, ScrapIcon } from "../Icons";
import Animated from "react-native-reanimated";
import { useScrapStore } from "@/systems/scrap";
import { useButtonScale } from "@/systems/buttonMotion";


type Props = {
    session: summaryType,
    animatedStyle: any,
}

const bubbleRadius = scale(100);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Content({session, animatedStyle}: Props) {
    const saveScrap = useScrapStore(s => s.save);
    const isSaving = useScrapStore(s => s.isSaving);
    const isOpening = useRequestStore(s => s.openingPersonaId === session.personaId);
    const openOriginalNews = useRequestStore(s => s.openOriginalNews);
    const hasNewsUrl = isNewsUrlValid(session.newsUrl);
    const originMotion = useButtonScale(!hasNewsUrl || isOpening);
    const scrapDisabled = isSaving;
    const scrapLabel = '스크랩';
    const scrapMotion = useButtonScale(scrapDisabled);
    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}
                nestedScrollEnabled bounces={false}>
                <Text style={[styles.content, shadowStyle]}>{session.content}</Text>
            </ScrollView>
            <View style={styles.actions}>
            <AnimatedPressable style={[styles.originRow, originMotion.animatedStyle]} accessibilityRole="link"
                onPressIn={originMotion.enlarge} onPressOut={originMotion.restore}
                accessibilityLabel="본문 보기"
                accessibilityHint={hasNewsUrl ? '브라우저에서 뉴스 원문을 엽니다.' : '원문 링크가 제공되지 않았습니다.'}
                accessibilityState={{ disabled: !hasNewsUrl || isOpening, busy: isOpening }}
                disabled={!hasNewsUrl || isOpening}
                onPress={() => openOriginalNews(session.personaId)}>
                <LinkOriginIcon />
                <Text style={[styles.content, shadowStyle, styles.originText]}>본문 보기</Text>
            </AnimatedPressable>
            <AnimatedPressable style={[styles.originRow, scrapMotion.animatedStyle, scrapDisabled && { opacity: 0.5 }]} accessibilityRole="button"
                onPressIn={scrapMotion.enlarge} onPressOut={scrapMotion.restore}
                accessibilityLabel={scrapLabel} accessibilityState={{ disabled: scrapDisabled, busy: isSaving }}
                disabled={scrapDisabled} onPress={() => saveScrap(session)}>
                <ScrapIcon />
                <Text style={[styles.content, shadowStyle, styles.originText]}>{scrapLabel}</Text>
            </AnimatedPressable>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 0,
        position: 'relative',
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: colors.light.backgroundOpacity,
        borderRadius: bubbleRadius,
        paddingHorizontal: space.contentPadding,
        paddingVertical: bubbleRadius,
        zIndex: 10,
    },
    body: {
        flex: 1,
        minHeight: 0,
    },
    bodyContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    actions: {
        position: 'absolute',
        bottom: 0,
        left: space.contentPadding,
        right: space.contentPadding,
        height: bubbleRadius,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.contentPadding,
    },
    originRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(16),
    },
    originText: {
        fontSize: fontSize.mainBody * 0.8,
    },
    content: {
        color: colors.light.text,
        fontSize: fontSize.mainBody,
        fontWeight: "400",
        lineHeight: fontSize.mainBody * 1.5,
    },
})
