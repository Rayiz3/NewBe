import MenuBody from "@/components/menuBody/MenuBody";
import MenuDefault from "@/components/menuBody/MenuDefault";
import MenuLoading from "@/components/menuBody/MenuLoading";
import MenuHeader from "@/components/MenuHeader";
import { colors } from "@/constants/colors";
import { useAccountStore } from "@/systems/account";
import { StyleSheet, View } from "react-native";


export default function MenuPage() {
    const isLogin = useAccountStore(s => s.isLogin);
    const isLoading = useAccountStore(s => s.isLoading);

    return (
        <View style={styles.container}>
            <MenuHeader name="더보기" />
            {isLoading
                ? <MenuLoading />
                : isLogin
                    ? <MenuBody />
                    : <MenuDefault />}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: "100%",
        height: "100%",
        backgroundColor: colors.white,
    }
})