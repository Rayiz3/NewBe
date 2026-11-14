import { colors } from "@/constants/colors";
import { fontSize, space } from "@/constants/sizes";
import { ScrollView, StyleSheet, Text } from "react-native";
import GoogleLoginButton from "./GoogleLoginButton";


export default function MenuDefault() {

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>
                <Text style={styles.highlight}>로그인</Text>해서 맞춤 설정을 이용하세요!
            </Text>
            <GoogleLoginButton />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: space.contentPadding,
        width: "100%",

    },
    title: {
        color: colors.black,
        fontSize: fontSize.menuTitle2,
        fontFamily: "Pretendard",
        fontWeight: "500",
        textAlign: "center",
    },
    highlight: {
        color: colors.highlight,
        fontFamily: "Pretendard",
        fontWeight: "700",
    },
})
