import { colors } from "@/constants/colors";
import { ActivityIndicator, StyleSheet, View } from "react-native";


export default function MenuLoading() {

    return (
        <View style={styles.container} accessibilityRole="progressbar"
            accessibilityLabel="로그인 중" accessibilityState={{ busy: true }}>
            <ActivityIndicator size="large" color={colors.highlight} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: "100%",
        backgroundColor: colors.white,
    }
})
