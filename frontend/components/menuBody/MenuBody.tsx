import { colors } from "@/constants/colors";
import { fontSize, scale } from "@/constants/sizes";
import { useAccountStore } from "@/systems/account";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import MenuButton from "./MenuButton";


const menus = ["편집", "스크랩", "설정"];

export default function MenuBody() {
    const userName = useAccountStore(s => s.userName);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            <View style={styles.menu}>
            <Text style={styles.title}>
                <Text style={styles.highlight}>{userName}</Text>님, 안녕하세요!
            </Text>
            <View style={styles.buttons}>
                {menus.map((item, index) => <MenuButton key={`menu-${index}`} name={item}/>)}
            </View>
            </View>
            <View style={styles.hero} pointerEvents="none" accessible={false}
                accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <Image source={require('@/assets/images/heroshot.png')}
                    style={styles.heroImage} resizeMode="contain" />
                <Svg width="100%" height="40%" style={styles.fade}>
                    <Defs>
                        <LinearGradient id="menuHeroFade" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={colors.white} stopOpacity={1} />
                            <Stop offset="0.2" stopColor={colors.white} stopOpacity={0.95} />
                            <Stop offset="0.6" stopColor={colors.white} stopOpacity={0.4} />
                            <Stop offset="1" stopColor={colors.white} stopOpacity={0} />
                        </LinearGradient>
                    </Defs>
                    <Rect width="100%" height="100%" fill="url(#menuHeroFade)" />
                </Svg>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: colors.white,
    },
    content: {
        flexGrow: 1,
    },
    menu: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingBottom: scale(120),
    },
    hero: {
        width: "100%",
        aspectRatio: 1,
        flexShrink: 0,
        marginTop: 'auto',
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    fade: {
        position: 'absolute',
        top: 0,
    },
    title: {
        color: colors.black,
        textAlign: "center",
        fontFamily: "Pretendard",
        fontSize: fontSize.menuTitle2,
        fontWeight: "600",
        marginTop: scale(80),
        marginBottom: scale(100),
    },
    highlight: {
        fontWeight: "700",
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: scale(96),
        marginVertical: scale(72),
    }
})
