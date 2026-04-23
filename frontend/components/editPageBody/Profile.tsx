import { colors } from "@/constants/colors";
import { fontSize, scale, screen, space } from "@/constants/sizes";
import { shadowStyle } from "@/constants/typography";
import { Image, StyleSheet, Text, View } from "react-native";

import { IMAGES } from "@/constants/data";
import personas from '@/resources/personas.json';
import { usePersonaStore } from "@/systems/persona";


export default function Profile() {
    const curPersona = usePersonaStore(s => s.curPersona);
    const persona = personas.find(p => p.id === curPersona);

    return (
        <View style={styles.container}>
            <View style={styles.textBlock}>
                <View style={styles.titleRow}>
                    <Text style={[styles.name, shadowStyle]}>{persona?.name || ""}</Text>
                    <Text style={[styles.field, shadowStyle]}>{persona?.categoryName || ""}</Text>
                </View>
                <Text style={styles.description}>{persona?.description || ""}</Text>
            </View>
            <View style={styles.placeHolder} />
            <Image
                source={IMAGES[curPersona]["PROFILE"]}
                style={styles.image}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        width: screen.width,
        height: scale(740),
        borderBottomColor: colors.grayLight,
        borderBottomWidth: space.borderWidth,
        paddingHorizontal: space.mainPadding,
    },
    textBlock: {
        flex: 1,
        flexDirection: "column",
        paddingVertical: scale(188),
        zIndex: 1,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: space.contentPadding,
    },
    name: {
        color: colors.black,
        fontSize: fontSize.mainTitle,
        fontWeight: "700",
        marginRight: scale(28),
    },
    field: {
        color: colors.black,
        fontSize: scale(40),
        fontWeight: "600",
        marginBottom: scale(16),
    },
    description: {
        color: colors.black,
        fontSize: fontSize.menuBody,
        lineHeight: fontSize.menuBody * 1.5,
    },
    placeHolder: {
        width: "45%",
    },
    image: {
        position: "absolute",
        top: 0,
        zIndex: 0,
        width: scale(1080),
        height: scale(740),
    },
});
