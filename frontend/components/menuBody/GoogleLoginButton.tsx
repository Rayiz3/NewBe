import { useAccountStore } from "@/systems/account";
import { Pressable, StyleSheet, Text } from "react-native";
import { GoogleIcon } from "../Icons";


export default function GoogleLoginButton() {
    const login = useAccountStore(s => s.login);

    return (
        <Pressable style={styles.container} onPress={login}>
            <GoogleIcon />
            <Text style={styles.text}>Google 계정으로 계속하기</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        height: 40,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 20,
        borderColor: "#747775",
        borderWidth: 1,
        backgroundColor: "#fff",
    },
    text: {
        color: "#1f1f1f",
        fontFamily: "Roboto",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "500",
        lineHeight: 20,
    }
})
