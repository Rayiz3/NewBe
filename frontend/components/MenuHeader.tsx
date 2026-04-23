import { colors } from "@/constants/colors";
import { fontSize, scale, space } from "@/constants/sizes";
import { useRouter } from "expo-router";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GoBackIcon } from "./Icons";

type Props = {
    name: string
}

export default function MenuHeader({name}: Props) {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    }

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={colors.white}
            />
            <TouchableOpacity
                style={styles.sideButton}
                activeOpacity={0.7}
                onPress={handleBack}
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
        alignItems: "flex-end",
        width: "100%",
        height: space.menuHeaderHeight,
        paddingBottom: scale(32),
        paddingHorizontal: space.contentPadding,
        backgroundColor: colors.white,
        borderBottomColor: colors.grayLight,
        borderBottomWidth: space.borderWidth,
    },
    sideButton: {
        justifyContent: "center",
        alignItems: "center",
        width: scale(58),
        height: scale(58),
        paddingBottom: scale(140),
    },
    title: {
        flex: 1,
        textAlign: "center",
        color: colors.black,
        fontSize: fontSize.menuTitle,
        fontWeight: "600",
    },
});
