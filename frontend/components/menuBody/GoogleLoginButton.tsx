import { GOOGLE_WEB_CLIENT_ID } from "@/constants/data";
import { signInWithGoogle, useAccountStore } from "@/systems/account";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Pressable, StyleSheet, Text } from "react-native";
import { GoogleIcon } from "../Icons";


// google client id config
GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
});

export default function GoogleLoginButton() {
    const setIsLogin = useAccountStore(s => s.setIsLogin);
    const setIsLoading = useAccountStore(s => s.setIsLoading);
    const setUserName = useAccountStore(s => s.setUserName);

    const handlePress = async () => {
        setIsLoading(true);
        const res = await signInWithGoogle();
        setIsLoading(false);
        setIsLogin(true);
        setUserName(res.profile?.name ?? "사용자");
        console.log(`${res.profile?.email ?? "none"}, idToken: ${res.idToken.slice(0, 50)}...`)
    }

    return (
        <Pressable style={styles.container} onPress={handlePress}>
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