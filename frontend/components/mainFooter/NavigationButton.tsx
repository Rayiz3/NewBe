import { colors } from "@/constants/colors";
import { fontSize, scale } from "@/constants/sizes";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { EditIcon, MenuIcon } from "../Icons";


type Props = {
    name: string,
    side: string,
}

export default function NavigationButton({name, side}: Props) {
    const router = useRouter();

    const handlePress = () => {
        if (name === "편집") {
            router.push(`/edit-page`);
        } else {
            router.push(`/menu-page`);
        }
    };

    return (
      <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={handlePress}>
        {side === "L"
          ? <EditIcon />
          : <MenuIcon />}
        <Text style={styles.buttonLabel}>{name}</Text>
      </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'column',
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: scale(12),
    },
    buttonLabel: {
        color: colors.black,
        fontSize: fontSize.menu,
        fontWeight: 500,
    },
})