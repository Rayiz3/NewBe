import { colors } from "@/constants/colors";
import { fontSize, scale, space } from "@/constants/sizes";
import { shadowStyle } from "@/constants/typography";
import { StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";


type Props = {
    content: string,
    animatedStyle: any,
}

export default function Content({content, animatedStyle}: Props) {
    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <Text style={[styles.content, shadowStyle]}>{content}</Text>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: colors.light.backgroundOpacity,
        borderRadius: scale(100),
        paddingHorizontal: space.contentPadding,
        zIndex: 10,
    },
    content: {
        color: colors.light.text,
        fontSize: fontSize.mainBody,
        fontWeight: "400",
        lineHeight: fontSize.mainBody * 1.5,
    },
})