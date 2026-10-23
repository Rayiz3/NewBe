import { colors } from "@/constants/colors";
import { fontSize, scale, screen, space } from "@/constants/sizes";
import { shadowStyle } from "@/constants/typography";
import { StyleSheet, Text, View } from "react-native";
import { CatBusinessIcon, CatEntertainmentIcon, CatNationIcon, CatScienceIcon, CatSportsIcon, CatTechnologyIcon, CatWorldIcon } from "../Icons";


type Props = {
    title: string,
    category: string,
    source: string,
}

const iconMap: Record<string, React.ComponentType> = {
    "NATION": (props) => <CatNationIcon style={shadowStyle} color={colors.light.text} />,
    "BUSINESS": (props) => <CatBusinessIcon style={shadowStyle} color={colors.light.text} />,
    "SCIENCE": (props) => <CatScienceIcon style={shadowStyle} color={colors.light.text} />,
    "TECHNOLOGY": (props) => <CatTechnologyIcon style={shadowStyle} color={colors.light.text} />,
    "ENTERTAINMENT": (props) => <CatEntertainmentIcon style={shadowStyle} color={colors.light.text} />,
    "SPORTS": (props) => <CatSportsIcon style={shadowStyle} color={colors.light.text} />,
    "WORLD": (props) => <CatWorldIcon style={shadowStyle} color={colors.light.text} />,
}

export default function Title({title, category, source}: Props) {

    const IconComponent = iconMap[category]
    return (
        <View style={styles.container}>
            <IconComponent />
            <View style={styles.textRow}>
                <Text style={[styles.title, shadowStyle]}>{title}</Text>
                {!!source && <Text style={[styles.source, shadowStyle]}>{source}</Text>}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: scale(24),
        width: screen.width,
        paddingLeft: space.contentPadding,
        marginBottom: scale(36),
        zIndex: 10,
    },
    textRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: scale(24),
        flexShrink: 1,
    },
    source: {
        fontSize: fontSize.menuBody,
        fontWeight: '500',
        color: colors.light.text,
        flexShrink: 1,
        paddingBottom: scale(12),
    },
    title: {
        fontSize: fontSize.mainTitle,
        fontWeight: "600",
        color: colors.light.text,
    },
})
