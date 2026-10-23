import { colors } from "@/constants/colors";
import { fontSize, space } from "@/constants/sizes";
import { StyleSheet, Text, View } from "react-native";
import GoogleLoginButton from "./GoogleLoginButton";
import MenuButton from './MenuButton';


export default function MenuDefault() {

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                <Text style={styles.highlight}>로그인</Text>해서 맞춤 설정을 이용하세요!
            </Text>
            <GoogleLoginButton />
            <MenuButton name="설정" />
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
    },
    highlight: {
        color: colors.highlight,
        fontFamily: "Pretendard",
        fontWeight: "700",
    },
})
