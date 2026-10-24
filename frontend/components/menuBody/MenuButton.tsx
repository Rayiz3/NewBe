import { colors } from "@/constants/colors";
import { fontSize, scale, space } from "@/constants/sizes";
import { runMenuAction } from "@/systems/navigation";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EditIcon, ScrapIcon, SettingsIcon } from "../Icons";


type Props = {
    name: string,
}

export default function MenuButton({name}: Props) {
    return (
      <TouchableOpacity style={styles.button} activeOpacity={0.7}
        accessibilityRole="button" onPress={() => runMenuAction(name)}>
        {name === "편집"
          ? <EditIcon width={space.menuIconSize} height={space.menuIconSize} />
          : name === '스크랩'
            ? <View style={styles.iconWrapper}>
                <ScrapIcon width={space.menuIconSize} height={space.menuIconSize}
                  color={colors.black} strokeWidth={4.5 * 56 / 96} />
              </View>
            : <SettingsIcon />}
        <Text style={styles.buttonLabel}>{name}</Text>
      </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    iconWrapper: {
        width: scale(88),
        height: scale(88),
        alignItems: 'center',
        justifyContent: 'center',
    },
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
