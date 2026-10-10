import { colors } from "@/constants/colors";
import { fontSize, scale, space } from "@/constants/sizes";
import { runMenuAction } from "@/systems/navigation";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { EditIcon, LogoutIcon } from "../Icons";


type Props = {
    name: string,
}

export default function MenuButton({name}: Props) {
    return (
      <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={() => runMenuAction(name)}>
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