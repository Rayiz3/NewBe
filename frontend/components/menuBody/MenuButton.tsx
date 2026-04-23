import { colors } from "@/constants/colors";
import { fontSize, scale, space } from "@/constants/sizes";
import { useAccountStore } from "@/systems/account";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { EditIcon, LogoutIcon } from "../Icons";


type Props = {
    name: string,
}

export default function MenuButton({name}: Props) {
    const router = useRouter();
    const setIsLogin = useAccountStore(s => s.setIsLogin);

    const handlePress = () => {
        if (name === "편집") {
            router.push(`/edit-page`);
        } else if (name == "로그아웃"){
            setIsLogin(false);
        }
    };

    return (
      <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={handlePress}>
        {name === "편집"
          ? <EditIcon width={space.menuIconSize} height={space.menuIconSize} />
          : <LogoutIcon />}
        <Text style={styles.buttonLabel}>{name}</Text>
      </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'column',
        justifyContent: "flex-start",
        alignItems: "center",
        gap: scale(40),
    },
    buttonLabel: {
        color: colors.black,
        fontSize: fontSize.menuBody,
        fontWeight: 600,
    },
})