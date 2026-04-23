import { colors } from "@/constants/colors";
import { fontSize, space } from "@/constants/sizes";
import { StyleSheet, Text, View } from "react-native";


export default function MenuLoading() {

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                불러오는 중...
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: space.contentPadding,
        width: "100%",
        height: "100%",
    },
    title: {
        color: colors.black,
        fontSize: fontSize.menuTitle2,
        fontFamily: "Pretendard",
        fontWeight: "500",
        textAlign: "center",
    }
})