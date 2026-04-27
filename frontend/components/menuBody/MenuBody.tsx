import { colors } from "@/constants/colors";
import { fontSize, scale } from "@/constants/sizes";
import { useAccountStore } from "@/systems/account";
import { StyleSheet, Text, View } from "react-native";
import MenuButton from "./MenuButton";


const menus = ["편집", "로그아웃"];

export default function MenuBody() {
    const userName = useAccountStore(s => s.userName);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                <Text style={styles.highlight}>{userName}</Text>님, 안녕하세요!
            </Text>
            <View style={styles.buttons}>
                {menus.map((item, index) => <MenuButton key={`menu-${index}`} name={item}/>)}
            </View>
            
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: "100%",
        height: "100%",
    },
    title: {
        color: colors.black,
        textAlign: "center",
        fontFamily: "Pretendard",
        fontSize: fontSize.menuTitle2,
        fontWeight: "600",
        marginVertical: scale(172),
    },
    highlight: {
        fontWeight: "700",
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: scale(96),
        marginVertical: scale(72),
    }
})