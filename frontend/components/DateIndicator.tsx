import { fontSize, scale } from "@/constants/sizes";
import { shadowStyle } from "@/constants/typography";
import { Text } from "@react-navigation/elements";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useDateStore } from "@/systems/date";
import { colors } from "../constants/colors";

export default function DateIndicator() {
    const currentDate = useDateStore(s => s.currentDate);
    const refreshDate = useDateStore(s => s.refreshDate);
    useEffect(refreshDate, [refreshDate]);

    return (
        <Text style={[styles.dateText, shadowStyle]}>{currentDate || "2026.mm.dd (w)"}</Text>
    );
}

const styles = StyleSheet.create({
    dateText: {
        position: "absolute",
        top: scale(140),
        zIndex: 10,
        fontFamily: "Pretendard",
        fontSize: fontSize.mainBody,
        fontWeight: 500,
        color: colors.light.text,
    },
});