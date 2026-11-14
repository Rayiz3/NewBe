import { colors } from "@/constants/colors";
import { fontSize, scale, space } from "@/constants/sizes";
import { goBack } from "@/systems/navigation";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GoBackIcon } from "./Icons";

import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    name: string
}

export default function MenuHeader({name}: Props) {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.container, { paddingTop: insets.top, minHeight: 64 + insets.top }]}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={colors.white}
            />
            <TouchableOpacity
                style={styles.sideButton}
                activeOpacity={0.7}
                onPress={goBack}
                hitSlop={{ top: scale(12), bottom: scale(12), left: scale(12), right: scale(12) }}>
                <GoBackIcon />
            </TouchableOpacity>

            <Text style={styles.title}>{name}</Text>

            <View style={styles.sideButton} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",

        paddingBottom: 8,
        paddingHorizontal: space.contentPadding,
        backgroundColor: colors.white,
        borderBottomColor: colors.grayLight,
        borderBottomWidth: space.borderWidth,
    },
    sideButton: {
        justifyContent: "center",
        alignItems: "center",
        width: 48,
        height: 48,

    },
    title: {
        flex: 1,
        textAlign: "center",
        color: colors.black,
        fontSize: fontSize.menuTitle,
        fontWeight: "600",
    },
});
